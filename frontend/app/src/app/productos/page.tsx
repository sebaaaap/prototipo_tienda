'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../CartContext';
import styles from '../page.module.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/products/categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      // Si no está logueado, redirigir al login
      router.push('/login');
    } else {
      // Si está logueado, agregar al carrito
      addToCart(product);
      alert(`¡${product.name} agregado al carrito!`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header con información de la tienda */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🍕 Deliciosa Comida</h1>
          <p className={styles.subtitle}>Los mejores sabores de la ciudad</p>
          <div className={styles.storeInfo}>
            <span>📍 Av. Providencia 1234, Santiago</span>
            <span>📞 +56 9 1234 5678</span>
            <span>🕒 Abierto de 11:00 - 23:00</span>
          </div>
        </div>
      </header>

      {/* Filtros de categorías */}
      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Todos
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`${styles.filterBtn} ${selectedCategory === category ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      <main className={styles.productsGrid}>
        {filteredProducts.map(product => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <Image
                src={product.image_url}
                alt={product.name}
                width={300}
                height={200}
                className={styles.image}
              />
              <div className={styles.categoryTag}>{product.category}</div>
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productDescription}>{product.description}</p>
              <div className={styles.productFooter}>
                <span className={styles.price}>{formatPrice(product.price)}</span>
                <button 
                  className={styles.addToCartBtn}
                  onClick={() => handleAddToCart(product)}
                >
                  {user ? '🛒 Agregar' : 'Lo Quiero❗️'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2024 Deliciosa Comida - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}