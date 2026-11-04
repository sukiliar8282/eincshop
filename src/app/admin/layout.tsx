import { requireAdmin } from "@/lib/auth/require-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Seluruh sub-halaman di bawah /admin wajib lolos verifikasi admin
  await requireAdmin();

  return <>{children}</>;
}
