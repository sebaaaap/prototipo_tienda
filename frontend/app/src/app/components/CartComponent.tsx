'use client';

import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartComponentProps {
  showHeader?: boolean;
  onClose?: () => void;
}

const CartComponent: React.FC<CartComponentProps> = ({ showHeader = true, onClose }) => {
  const { cart, removeFromCart, clearCart, totalPrice, userAuthenticated } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleWebPayPayment = async () => {
    if (!userAuthenticated) {
      setError('Debes iniciar sesión para realizar el pago');
      return;
    }

    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: totalPrice,
          buy_order: `ORDER${Date.now()}`,
          session_id: `SESS${Date.now()}`
        }),
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        // Crear formulario para redirigir a WebPay
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payment_url;

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = data.token;
        form.appendChild(tokenInput);

        document.body.appendChild(form);
        form.submit();
      } else {
        setError(data.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error en WebPay:', error);
      setError('Error de conexión al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (!userAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Acceso Requerido</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tu carrito</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {showHeader && (
            <div style={{
              background: 'linear-gradient(90deg, #374151 0%, #4b5563 100%)',
              color: 'white',
              padding: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h1 style={{
                  fontSize: '2.25rem',
                  fontWeight: 'bold',
                  margin: 0
                }}>🛒 Carrito de Compras</h1>
                {onClose && (
                  <button 
                    onClick={onClose}
                    style={{
                      color: 'white',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '1.5rem'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
          
          {!showHeader && (
            <div style={{
              background: 'linear-gradient(90deg, #374151 0%, #4b5563 100%)',
              color: 'white',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0
                }}>🛒 Carrito ({cart.length})</h2>
                {onClose && (
                  <button 
                    onClick={onClose}
                    style={{
                      color: 'white',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '1.5rem'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '5rem 1.5rem'
            }}>
              <div style={{
                fontSize: '6rem',
                marginBottom: '1.5rem'
              }}>🛒</div>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem',
                margin: '0 0 1rem 0'
              }}>Tu carrito está vacío</h2>
              <p style={{
                color: '#4b5563',
                fontSize: '1.125rem',
                marginBottom: '2rem',
                margin: '0 0 2rem 0'
              }}>Agrega algunos productos deliciosos para comenzar</p>
              <button 
                onClick={() => router.push('/productos')}
                style={{
                  background: '#374151',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                🍽️ Ir a la tienda
              </button>
            </div>
          ) : (
            <div style={{ padding: '2rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                {/* Lista de productos */}
                <div style={{ gridColumn: 'span 2' }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '0.75rem' }}>📦</span>
                    Productos en el carrito ({cart.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${index}`} style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5rem'
                        }}>
                          {item.image_url && (
                            <div style={{ position: 'relative' }}>
                              <Image 
                                src={item.image_url} 
                                alt={item.name}
                                width={120}
                                height={120}
                                style={{
                                  width: '7rem',
                                  height: '7rem',
                                  objectFit: 'cover',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '-0.5rem',
                                right: '-0.5rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontSize: '0.75rem',
                                borderRadius: '50%',
                                width: '1.5rem',
                                height: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {index + 1}
                              </div>
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '1.25rem',
                              fontWeight: 'bold',
                              color: '#1f2937',
                              marginBottom: '0.5rem'
                            }}>{item.name}</h3>
                            <p style={{
                              color: '#6b7280',
                              fontSize: '0.875rem',
                              marginBottom: '0.75rem',
                              lineHeight: '1.5'
                            }}>{item.description}</p>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                                                             <span style={{
                                 fontSize: '1.5rem',
                                 fontWeight: 'bold',
                                 color: '#374151'
                               }}>
                                {formatPrice(item.price)}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                style={{
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  border: 'none',
                                  padding: '0.75rem',
                                  borderRadius: '50%',
                                  cursor: 'pointer',
                                  fontSize: '1.25rem'
                                }}
                                title="Eliminar del carrito"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen de compra */}
                <div style={{ gridColumn: 'span 1' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    position: 'sticky',
                    top: '2rem'
                  }}>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '0.75rem' }}>📋</span>
                      Resumen
                    </h2>
                    
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <span style={{
                          color: '#374151',
                          fontWeight: '600'
                        }}>Subtotal:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: 'bold',
                          fontSize: '1.125rem'
                        }}>{formatPrice(totalPrice)}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <span style={{
                          color: '#374151',
                          fontWeight: '600'
                        }}>Envío:</span>
                                                 <span style={{
                           color: '#6b7280',
                           fontWeight: 'bold'
                         }}>🎉 Gratis</span>
                      </div>
                      <div style={{ paddingTop: '1rem' }}>
                                                 <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           fontSize: '1.25rem',
                           fontWeight: 'bold',
                           backgroundColor: '#f9fafb',
                           padding: '1rem',
                           borderRadius: '12px',
                           border: '1px solid #e5e7eb'
                         }}>
                           <span style={{
                             color: '#111827',
                             fontWeight: 'bold'
                           }}>Total:</span>
                           <span style={{
                             color: '#374151',
                             fontSize: '1.5rem',
                             fontWeight: 'bold'
                           }}>{formatPrice(totalPrice)}</span>
                         </div>
                      </div>
                    </div>

                    {error && (
                      <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span style={{ marginRight: '0.5rem' }}>⚠️</span>
                          {error}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <button
                        onClick={clearCart}
                        style={{
                          width: '100%',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '12px',
                          border: 'none',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        🗑️ Vaciar carrito
                      </button>
                      
                      <button
                        onClick={handleWebPayPayment}
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '1rem 2rem',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: isLoading ? '#9ca3af' : '#374151',
                          border: 'none',
                          fontSize: '1.125rem'
                        }}
                      >
                        {isLoading ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              width: '1.5rem',
                              height: '1.5rem',
                              border: '2px solid transparent',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></div>
                            <span>Procesando...</span>
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
                          }}>
                            <span>💳</span>
                            <span>Proceder al Pago</span>
                          </div>
                        )}
                      </button>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                      <div style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '1rem'
                      }}>
                        <p style={{
                          color: '#1d4ed8',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          🔒 Al hacer clic en "Proceder al Pago" serás redirigido al portal de pago seguro de Transbank
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartComponent; 