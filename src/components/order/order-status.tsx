type OrderStatusProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  PAID: "bg-[var(--color-success-soft)] text-[var(--color-success-strong)]",
  COMPLETED:
    "bg-[var(--color-success-soft)] text-[var(--color-success-strong)]",
  PENDING_PAYMENT:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning-strong)]",
  CANCELLED: "bg-[var(--color-danger-soft)] text-[var(--color-danger-strong)]",
  FAILED: "bg-[var(--color-danger-soft)] text-[var(--color-danger-strong)]",
};

const statusLabels: Record<string, string> = {
  PAID: "Sudah dibayar",
  COMPLETED: "Selesai",
  PENDING: "Menunggu pembayaran",
  PENDING_PAYMENT: "Menunggu pembayaran",
  FAILED: "Pembayaran gagal",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

export function OrderStatus({ status }: OrderStatusProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ??
        "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
      }`}
    >
      {statusLabels[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}
