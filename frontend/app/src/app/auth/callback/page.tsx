"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        fetch("http://localhost:8000/auth/set-cookie", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token }),
        }).then(() => {
          router.replace("/home");
        });
      } else {
        router.replace("/login");
      }
    }
  }, [router]);

  return <div>Procesando login con Google...</div>;
};

export default CallbackPage; 