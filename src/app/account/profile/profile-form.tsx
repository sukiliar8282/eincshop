"use client";

import { useActionState, useEffect } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import { useToast } from "@/components/ui/toast-provider";
import { updateProfileAction, type ProfileActionState } from "./actions";
import { useI18n } from "@/lib/i18n/client";

type ProfileFormProps = {
  name: string;
  email: string;
};

const initialState: ProfileActionState = {};

export function ProfileForm({ name, email }: ProfileFormProps) {
  const { dict } = useI18n();
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast("success", state.success);
    }

    if (state.error) {
      showToast("error", state.error);
    }
  }, [state.success, state.error, showToast]);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6"
    >
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {dict.profile.nameLabel}
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          defaultValue={name}
          className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm outline-none focus:border-[var(--color-ink)]"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
        >
          {dict.profile.emailLabel}
        </label>

        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="min-h-11 w-full cursor-not-allowed rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 text-sm text-[var(--color-text-muted)]"
        />

        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {dict.profile.emailReadOnly}
        </p>
      </div>

      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}

      {state.success && (
        <StatusMessage tone="success">{state.success}</StatusMessage>
      )}

      <LoadingButton type="submit" loading={isPending}>
        {isPending
          ? dict.profile.savingProfileBtn
          : dict.profile.saveProfileBtn}
      </LoadingButton>
    </form>
  );
}
