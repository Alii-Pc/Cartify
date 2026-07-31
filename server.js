const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // Internal interceptor for broadcasting Socket.IO events from Next.js API routes
      if (req.method === "POST" && parsedUrl.pathname === "/api/internal/socket") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const { event, room, data } = JSON.parse(body);
            if (room) {
              io.to(room).emit(event, data);
            } else {
              io.emit(event, data);
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
        return;
      }

      // Let Socket.IO handle its own requests
      if (parsedUrl.pathname.startsWith("/socket.io")) {
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket client connected:", socket.id);

    // Clients can join specific rooms (e.g., 'admin', 'order_<id>')
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("leave_room", (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket client disconnected:", socket.id);
    });
  });

  server.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
