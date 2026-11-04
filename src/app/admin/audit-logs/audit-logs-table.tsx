"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAllAuditLogsAction } from "./actions";

type AuditLogItem = {
  id: string;
  createdAt: Date | string;
  action: string;
  entityType: string;
  ipAddress: string | null;
  actor: {
    name: string | null;
    email: string | null;
  };
};

type AuditLogsTableProps = {
  initialLogs: AuditLogItem[];
  isEn: boolean;
};

export function AuditLogsTable({ initialLogs, isEn }: AuditLogsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State untuk penundaan penghapusan permanen (Staged / Undoable Deletion)
  const [isStagedDeleted, setIsStagedDeleted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(8);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Bersihkan timer jika komponen unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // 1. Eksekusi Hapus Permanen ke Database (saat 'X' diklik atau timer habis)
  const executePermanentDelete = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setShowNotification(false);

    startTransition(async () => {
      await clearAllAuditLogsAction();
      setIsStagedDeleted(false);
      router.refresh();
    });
  };

  // 2. Klik tombol "Hapus Semua Log" (Masuk ke mode tunggu dengan notif Urungkan)
  const handleStageDelete = () => {
    if (initialLogs.length === 0) return;

    setIsStagedDeleted(true);
    setShowNotification(true);
    setSecondsLeft(8);

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          executePermanentDelete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 3. Klik tombol "Urungkan" (Kembalikan data log seperti semula)
  const handleUndo = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setIsStagedDeleted(false);
    setShowNotification(false);
  };

  const displayedLogs = isStagedDeleted ? [] : initialLogs;

  return (
    <div className="mt-8 space-y-4">
      {/* Header Aksi: Info Baris & Tombol Hapus Semua */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
          {isEn
            ? `Showing ${displayedLogs.length} entries`
            : `Menampilkan ${displayedLogs.length} riwayat log`}
        </span>

        {initialLogs.length > 0 && !isStagedDeleted && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleStageDelete}
            className="inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-control)] border border-red-200 bg-red-50/60 px-3.5 text-xs font-semibold text-red-700 transition-all hover:bg-red-100 hover:border-red-300 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>{isEn ? "Clear All Logs" : "Hapus Semua Log"}</span>
          </button>
        )}
      </div>

      {/* Tabel Data Audit Logs */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">{isEn ? "Timestamp" : "Waktu"}</th>
                <th className="px-4 py-3">{isEn ? "Actor" : "Aktor"}</th>
                <th className="px-4 py-3">{isEn ? "Action" : "Aksi"}</th>
                <th className="px-4 py-3">
                  {isEn ? "Entity Type" : "Tipe Entitas"}
                </th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {displayedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--color-canvas)]">
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-muted)]">
                    {new Date(log.createdAt).toLocaleString(
                      isEn ? "en-US" : "id-ID",
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                    {log.actor.name || log.actor.email || "System"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-accent-strong)]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {log.entityType}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-[11px]">
                    {log.ipAddress || "-"}
                  </td>
                </tr>
              ))}
              {displayedLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[var(--color-text-muted)]"
                  >
                    {isStagedDeleted
                      ? isEn
                        ? "All logs staged for deletion. Click Undo to restore or 'X' to delete permanently."
                        : "Seluruh log siap dihapus. Klik Urungkan untuk membatalkan atau klik 'X' untuk menghapus permanen."
                      : isEn
                        ? "No audit log history recorded."
                        : "Belum ada riwayat audit log."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Notification Bar (Urungkan & Tombol 'X') */}
      {showNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <span className="text-xs font-medium">
            {isEn
              ? `All logs cleared (${secondsLeft}s)`
              : `Semua log dihapus (${secondsLeft}d)`}
          </span>

          {/* Tombol Urungkan */}
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-full bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {isEn ? "Undo" : "Urungkan"}
          </button>

          {/* Tombol 'X' (Hapus Permanen Sekarang) */}
          <button
            type="button"
            onClick={executePermanentDelete}
            title={isEn ? "Delete permanently now" : "Hapus permanen sekarang"}
            className="ml-1 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
