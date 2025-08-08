'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../useAuth';
import { useCart } from '../CartContext';
import Image from 'next/image';
import styles from './home.module.css';
import CartComponent from '../components/CartComponent';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface Order {
  id: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  total: number;
  items: Product[];
}

export default function HomePage() {
  const { user, loading } = useAuth({ redirectToLogin: true });
  const { cart, removeFromCart, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'cart' | 'history'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);

  // Simular historial de compras (en producción vendría de la API)
  useEffect(() => {
    if (user) {
      // Simular datos de historial
      const mockOrders: Order[] = [
        {
          id: '1',
          date: '2024-01-15',
          status: 'completed',
          total: 25000,
          items: [
            { id: '1', name: 'Hamburguesa Clásica', description: 'Hamburguesa con carne de res', price: 8500, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58e9?w=400&h=400&fit=crop', category: 'Hamburguesas' },
            { id: '2', name: 'Pizza Margherita', description: 'Pizza tradicional', price: 12000, image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop', category: 'Pizzas' },
            { id: '3', name: 'Ensalada César', description: 'Lechuga romana con crutones', price: 4500, image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop', category: 'Ensaladas' }
          ]
        },
        {
          id: '2',
          date: '2024-01-10',
          status: 'completed',
          total: 15000,
          items: [
            { id: '5', name: 'Sushi Roll California', description: 'Roll de sushi con aguacate', price: 15000, image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop', category: 'Sushi' }
          ]
        }
      ];
      setOrders(mockOrders);
    }
  }, [user]);

  // Detectar parámetro de URL para abrir directamente el carrito
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'cart') {
      setActiveTab('cart');
    }
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#38a169';
      case 'pending': return '#d69e2e';
      case 'cancelled': return '#e53e3e';
      default: return '#718096';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null; // useAuth ya redirige al login
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mi Cuenta</h1>
          <p className={styles.subtitle}>Bienvenido, {user.full_name || user.email}</p>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Perfil
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'cart' ? styles.active : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          🛒 Carrito ({cart.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Historial
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.profileSection}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className={styles.profileInfo}>
                  <h2>{user.full_name || 'Usuario'}</h2>
                  <p>{user.email}</p>
                  <span className={styles.memberSince}>
                    Miembro desde {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
              
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{orders.length}</span>
                  <span className={styles.statLabel}>Pedidos</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{formatPrice(orders.reduce((total, order) => total + order.total, 0))}</span>
                  <span className={styles.statLabel}>Total Gastado</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{cart.length}</span>
                  <span className={styles.statLabel}>En Carrito</span>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={() => router.push('/productos')}>
                  🍽️ Ver Menú
                </button>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <CartComponent showHeader={false} />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={styles.historySection}>
            {orders.length === 0 ? (
              <div className={styles.emptyHistory}>
                <div className={styles.emptyIcon}>📋</div>
                <h3>No hay pedidos aún</h3>
                <p>Realiza tu primer pedido para ver tu historial</p>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => router.push('/productos')}
                >
                  Hacer Pedido
                </button>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <h4>Pedido #{order.id}</h4>
                        <p>{formatDate(order.date)}</p>
                      </div>
                      <div className={styles.orderStatus}>
                        <span 
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </span>
                        <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    
                    <div className={styles.orderItems}>
                      {order.items.map(item => (
                        <div key={item.id} className={styles.orderItem}>
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={60}
                            height={60}
                            className={styles.orderItemImage}
                          />
                          <div className={styles.orderItemInfo}>
                            <h5>{item.name}</h5>
                            <p>{item.description}</p>
                          </div>
                          <span className={styles.orderItemPrice}>{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 