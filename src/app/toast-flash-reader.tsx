"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./toast-context";

const MESSAGES: Record<string, string> = {
  login: "Logged in",
  logout: "Logged out",
  signup: "Account created",
  "period-created": "Period created",
  "expense-created": "Expense added",
};

export function ToastFlashReader() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const flash = searchParams.get("toast");

  useEffect(() => {
    if (!flash) return;
    const message = MESSAGES[flash];
    if (message) {
      showToast(message);
    }
    const params = new URLSearchParams(searchParams);
    params.delete("toast");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    // Only re-run when the flash value itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash]);

  return null;
}
