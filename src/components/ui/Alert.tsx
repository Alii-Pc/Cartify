import { CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

interface AlertProps {
  type: "success" | "error";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className={clsx(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        isSuccess
          ? "border-olive-300 bg-olive-50 text-olive-800"
          : "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
