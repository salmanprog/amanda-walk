"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard(redirectTo = "/") {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      //router.replace(redirectTo);
      window.location.href = "/";
    }
  }, [router, redirectTo]);
}
