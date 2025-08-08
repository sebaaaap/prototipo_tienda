'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from './CartContext';
import styles from './ClientNavbar.module.css';

export default function ClientNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, clearCart, userAuthenticated } = useCart();

  useEffect(() => {
    checkAuthStatus();
    
    // Verificar autenticación cada 2 segundos para mayor responsividad
    const interval = setInterval(checkAuthStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Mostrar estado de carga inmediatamente
      setUser(null);
      setLoading(true);
      
      await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Limpiar el carrito cuando el usuario cierre sesión
      clearCart();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      // Si hay error, verificar el estado real
      checkAuthStatus();
    }
  };

  // No mostrar navbar en páginas de login/register
  if (pathname === '/login' || pathname === '/register' || pathname === '/auth/callback') {
    return null;
  }

  // Usar el estado de autenticación del contexto del carrito como respaldo
  const isAuthenticated = user || userAuthenticated;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          🍕 Deliciosa Comida
        </Link>
        
        <div className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
          <Link href="/" className={styles.navLink}>
            Inicio
          </Link>
          <Link href="/productos" className={`${styles.navLink} ${isAuthenticated ? styles.primaryLink : ''}`}>
            {isAuthenticated ? '🍽️ Ver Menú' : 'Productos'}
          </Link>
          {!loading && isAuthenticated ? (
            <>
              <Link href="/home" className={styles.navLink}>
                Mi Cuenta
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Cerrar Sesión
              </button>
            </>
          ) : !loading && !isAuthenticated ? (
            <>
              <Link href="/login" className={styles.navLink}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className={styles.navLink}>
                Registrarse
              </Link>
            </>
          ) : (
            // Mostrar loading state mientras verifica autenticación
            <div className={styles.authLoading}>
              <div className={styles.loadingSpinner}></div>
            </div>
          )}
        </div>
        
        {isAuthenticated && (
          <Link href="/home?tab=cart" className={styles.cartIcon}>
            🛒 <span className={styles.cartCount}>{cartCount}</span>
          </Link>
        )}
        
        <button 
          className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
} 