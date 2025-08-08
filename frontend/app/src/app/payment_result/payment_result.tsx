import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PaymentResult = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'failure' | 'pending' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const token = searchParams.get('token');
        const statusParam = searchParams.get('status');
        
        if (statusParam === 'success') {
          setStatus('success');
        } else if (statusParam === 'failure') {
          setStatus('failure');
        } else if (token) {
          // Si tenemos token, consultar el estado en el backend
          try {
            const response = await fetch(`http://localhost:8000/api/transactions/${token}`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const transactionData = await response.json();
              if (transactionData.status === 'AUTHORIZED') {
                setStatus('success');
              } else {
                setStatus('failure');
              }
            } else {
              setStatus('pending');
            }
          } catch (error) {
            console.error('Error consultando transacción:', error);
            setStatus('pending');
          }
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Error procesando resultado:', error);
        setStatus('pending');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A20] text-white">
        <div className="bg-[#23262F] p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F0B90B] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#F0B90B' }}>
            Verificando pago...
          </h1>
          <p className="text-gray-300">Procesando resultado del pago</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A20] text-white">
      <div className="bg-[#23262F] p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#F0B90B' }}>
          Resultado del Pago WebPay
        </h1>
        {status === 'success' && (
          <>
            <div className="text-green-400 text-6xl mb-4">✅</div>
            <p className="text-green-400 text-lg mb-2">¡Pago realizado con éxito!</p>
            <p className="text-gray-300">Tu transacción ha sido procesada correctamente.</p>
            <p className="text-gray-300 text-sm mt-2">Recibirás un correo de confirmación.</p>
          </>
        )}
        {status === 'failure' && (
          <>
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <p className="text-red-400 text-lg mb-2">El pago fue cancelado o rechazado.</p>
            <p className="text-gray-300">No se realizó ningún cargo a tu cuenta.</p>
            <p className="text-gray-300 text-sm mt-2">Puedes intentar nuevamente.</p>
          </>
        )}
        {status === 'pending' && (
          <>
            <div className="text-yellow-400 text-6xl mb-4">⏳</div>
            <p className="text-yellow-400 text-lg mb-2">Estado del pago no determinado.</p>
            <p className="text-gray-300">El pago está siendo procesado o no se pudo verificar.</p>
            <p className="text-gray-300 text-sm mt-2">Revisa tu correo o contacta soporte.</p>
          </>
        )}
        <a
          href="/"
          className="inline-block mt-6 px-6 py-2 rounded bg-[#F0B90B] text-[#181A20] font-bold hover:bg-yellow-400 transition"
        >
          Volver a la tienda
        </a>
      </div>
    </div>
  );
};

export default PaymentResult;