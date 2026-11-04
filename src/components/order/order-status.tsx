type OrderStatusProps = {
  status: string;
  locale?: string;
};

const statusStyles: Record<string, string> = {
  PAID: "bg-[var(--color-success-soft)] text-[var(--color-success-strong)]",
  COMPLETED:
    "bg-[var(--color-success-soft)] text-[var(--color-success-strong)]",
  PENDING: "bg-[var(--color-warning-soft)] text-[var(--color-warning-strong)]",
  PENDING_PAYMENT:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning-strong)]",
  CANCELLED: "bg-[var(--color-danger-soft)] text-[var(--color-danger-strong)]",
  FAILED: "bg-[var(--color-danger-soft)] text-[var(--color-danger-strong)]",
  EXPIRED: "bg-[var(--color-danger-soft)] text-[var(--color-danger-strong)]",
};

const statusLabelsId: Record<string, string> = {
  PAID: "Sudah dibayar",
  COMPLETED: "Selesai",
  PENDING: "Menunggu pembayaran",
  PENDING_PAYMENT: "Menunggu pembayaran",
  FAILED: "Pembayaran gagal",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

const statusLabelsEn: Record<string, string> = {
  PAID: "Paid",
  COMPLETED: "Completed",
  PENDING: "Pending payment",
  PENDING_PAYMENT: "Pending payment",
  FAILED: "Payment failed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export function OrderStatus({ status, locale = "id" }: OrderStatusProps) {
  const isEn = locale === "en";
  const labels = isEn ? statusLabelsEn : statusLabelsId;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ??
        "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
      }`}
    >
      {labels[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}
