"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/modules/catalog/actions";

type DeleteProductButtonProps = {
  productId: string;
  isEn: boolean;
};

export function DeleteProductButton({
  productId,
  isEn,
}: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    const confirmMessage = isEn
      ? "Are you sure you want to permanently delete this product? All photos and files will be removed. This action cannot be undone."
      : "Apakah Anda yakin ingin menghapus permanen produk ini? Seluruh foto dan berkas digital akan dihapus dari server. Tindakan ini tidak dapat dibatalkan.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      const result = await deleteProductAction(formData);

      if (result?.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-control)] border border-rose-300 bg-rose-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
    >
      {isPending
        ? isEn
          ? "Deleting..."
          : "Menghapus..."
        : isEn
          ? "Delete"
          : "Hapus Permanen"}
    </button>
  );
}
