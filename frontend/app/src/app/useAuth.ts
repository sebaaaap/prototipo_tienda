import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth({ redirectToLogin = true } = {}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8000/me", {
          credentials: "include",
        });
        
        if (isMounted) {
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            setUser(null);
            if (redirectToLogin) {
              router.replace("/login");
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          if (redirectToLogin) {
            router.replace("/login");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    // Verificar autenticación cada 2 segundos para mantener sincronizado
    const interval = setInterval(checkAuth, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router, redirectToLogin]);

  return { user, loading };
} 