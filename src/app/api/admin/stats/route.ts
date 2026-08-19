import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    await connectDB();

    const [
      totalOrders,
      totalUsers,
      totalProducts,
      statusCounts,
      recentOrders,
      topSellingResult,
      paymentStatusResult
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name email")
        .lean(),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { 
            _id: "$items.productId", 
            name: { $first: "$items.name" }, 
            image: { $first: "$items.image" }, 
            quantity: { $sum: "$items.quantity" }, 
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } 
          } 
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 }
      ]),
      Order.aggregate([
        { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
      ])
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueByDay = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid",
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const last7Days: { day: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push({
        day: d.toISOString().split('T')[0] || "",
        total: 0
      });
    }

    revenueByDay.forEach(day => {
      const match = last7Days.find(d => d.day === day._id);
      if (match) match.total = day.revenue;
    });

    const formattedRevenue = last7Days;

    const ordersByStatus = statusCounts.map((curr: any) => ({
      status: curr._id,
      count: curr.count
    }));

    const paymentStatus = paymentStatusResult.map((curr: any) => ({
      status: curr._id,
      count: curr.count
    }));

    const topSellingProducts = topSellingResult.map((curr: any) => ({
      productId: curr._id,
      name: curr.name,
      image: curr.image,
      quantity: curr.quantity,
      revenue: curr.revenue
    }));

    return successResponse({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      ordersByStatus,
      paymentStatus,
      topSellingProducts,
      revenueLast7Days: formattedRevenue,
      recentOrders
    });
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin stats error:", error);
    return errorResponse("Failed to fetch admin stats", 500);
  }
}
