"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard(redirectTo = "/") {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        window.location.href = redirectTo;
        return;
      }

      try {
        // Call API endpoint to verify token and get user
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const response = await fetch(`${baseUrl}/api/currentuser`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403 || data.code !== 200 || !data.data) {
          // Token invalid or user not found
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          window.location.href = redirectTo;
          return;
        }
      } catch (error) {
        // Network error or other issues
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = redirectTo;
      }
    };

    checkAuth();
  }, [router, redirectTo]);
}
