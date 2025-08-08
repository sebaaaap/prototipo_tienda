'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Bienvenido a <span className={styles.highlight}>Deliciosa Comida</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Descubre los mejores sabores de la ciudad en un ambiente acogedor y moderno
          </p>
          <div className={styles.heroButtons}>
            <button 
              className={styles.primaryBtn}
              onClick={() => router.push('/productos')}
            >
              {user ? '🍽️ Ver Menú' : 'Ver Menú'}
            </button>
            {!user ? (
              <button 
                className={styles.secondaryBtn}
                onClick={() => router.push('/login')}
              >
                Iniciar Sesión
              </button>
            ) : (
              <button 
                className={styles.secondaryBtn}
                onClick={() => router.push('/home')}
              >
                👤 Mi Cuenta
              </button>
            )}
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
            alt="Restaurante elegante"
            width={600}
            height={400}
            className={styles.image}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🍽️</div>
          <h3>Menú Variado</h3>
          <p>Desde hamburguesas gourmet hasta sushi fresco, tenemos algo para todos los gustos</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🚀</div>
          <h3>Preparaciones Rapidas</h3>
          <p>Tu pedido esta listo en 30 minutos o menos</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⭐</div>
          <h3>Calidad Premium</h3>
          <p>Usamos solo ingredientes frescos y de la mejor calidad</p>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about}>
        <div className={styles.aboutContent}>
          <h2>Nuestra Historia</h2>
          <p>
            Desde 2018, Deliciosa Comida ha estado sirviendo los mejores platos de la ciudad. 
            Nuestro chef ejecutivo, con más de 15 años de experiencia en restaurantes de clase mundial, 
            crea cada plato con pasión y dedicación.
          </p>
          <p>
            Nos enorgullece ofrecer una experiencia culinaria única que combina técnicas tradicionales 
            con innovación moderna, todo en un ambiente acogedor y familiar.
          </p>
        </div>
        <div className={styles.aboutImage}>
          <Image
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop"
            alt="Chef preparando comida"
            width={500}
            height={350}
            className={styles.image}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <h2>Lo que dicen nuestros clientes</h2>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonial}>
            <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
            <p>"La mejor hamburguesa que he probado en mi vida. Definitivamente volveré!"</p>
            <span className={styles.author}>- María González</span>
          </div>
          <div className={styles.testimonial}>
            <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
            <p>"Excelente servicio y comida deliciosa. El ambiente es perfecto para una cena romántica."</p>
            <span className={styles.author}>- Carlos Rodríguez</span>
          </div>
          <div className={styles.testimonial}>
            <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
            <p>"Estaba weno weno weno, aaa un mannjaaaar"</p>
            <span className={styles.author}>- Ana Martínez</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact}>
        <div className={styles.contactInfo}>
          <h2>Visítanos</h2>
          <div className={styles.contactDetails}>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📍</span>
              <div>
                <h4>Dirección</h4>
                <p>Av. Providencia 1234, Santiago</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📞</span>
              <div>
                <h4>Teléfono</h4>
                <p>+56 9 1234 5678</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>🕒</span>
              <div>
                <h4>Horarios</h4>
                <p>Lun-Dom: 11:00 - 23:00</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contactImage}>
          <Image
            src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop"
            alt="Interior del restaurante"
            width={500}
            height={350}
            className={styles.image}
          />
        </div>
      </section>
    </div>
  );
}
