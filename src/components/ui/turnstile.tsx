"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type TurnstileProps = {
  className?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({ className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState("");

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  useEffect(() => {
    function initTurnstile() {
      if (
        window.turnstile &&
        containerRef.current &&
        !widgetIdRef.current &&
        siteKey
      ) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (newToken: string) => setToken(newToken),
          "error-callback": () => setToken(""),
          "expired-callback": () => setToken(""),
          theme: "light",
          size: "flexible",
        });
      }
    }

    if (window.turnstile) {
      initTurnstile();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          if (
            window.turnstile &&
            containerRef.current &&
            !widgetIdRef.current &&
            siteKey
          ) {
            widgetIdRef.current = window.turnstile.render(
              containerRef.current,
              {
                sitekey: siteKey,
                callback: (newToken: string) => setToken(newToken),
                "error-callback": () => setToken(""),
                "expired-callback": () => setToken(""),
                theme: "light",
                size: "flexible",
              },
            );
          }
        }}
      />
      <div ref={containerRef} className="my-2 min-h-[65px] w-full" />
      <input type="hidden" name="cf-turnstile-response" value={token} />
    </div>
  );
}
