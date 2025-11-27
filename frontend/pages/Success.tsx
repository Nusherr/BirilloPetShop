import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { CheckCircle, Package, Home, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../services/cartContext';
import { useAuth } from '../services/authContext';
import { STRAPI_API_URL } from '../constants';

interface OrderDetails {
    id: number;
    total_paid: number;
    cart_snapshot: Array<{
        name: string;
        quantity: number;
        price: number;
        variant?: string;
        image?: string;
    }>;
}

export const Success: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();
    const { token } = useAuth();
    const sessionId = searchParams.get('session_id');

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Force clear cart immediately
        clearCart();
        localStorage.removeItem('aquapet_cart');

        const fetchOrder = async () => {
            if (!sessionId || !token) {
                setLoading(false);
                return;
            }

            try {
                // We use the stripe_id to find the specific order
                const response = await fetch(`${STRAPI_API_URL}/orders?filters[stripe_id][$eq]=${sessionId}&populate=cart_snapshot`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.length > 0) {
                        setOrder(data.data[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [sessionId, token, clearCart]);

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-stone-100 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600 w-10 h-10" />
                    </div>

                    <h1 className="font-display text-3xl font-bold text-stone-800 mb-2">Ordine Confermato!</h1>
                    <p className="text-stone-600 mb-8">
                        Grazie per il tuo acquisto. Abbiamo ricevuto il tuo ordine e stiamo iniziando a prepararlo.
                    </p>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-nature-600" size={32} />
                        </div>
                    ) : order ? (
                        <div className="bg-stone-50 rounded-xl p-6 mb-8 border border-stone-100 text-left">
                            <h3 className="font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2">Riepilogo Ordine #{order.id}</h3>
                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                                {order.cart_snapshot.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                            <span className="font-medium text-stone-700">{item.quantity}x {item.name}</span>
                                            {item.variant && <span className="block text-xs text-stone-500">{item.variant}</span>}
                                        </div>
                                        <span className="font-bold text-stone-600">€{item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                                <span className="font-bold text-stone-600">Totale Pagato</span>
                                <span className="font-bold text-xl text-nature-700">€{order.total_paid.toFixed(2)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl mb-8 text-sm">
                            Impossibile recuperare i dettagli dell'ordine al momento, ma non preoccuparti: è stato confermato!
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/account')}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <Package size={18} /> I Miei Ordini
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <Home size={18} /> Torna alla Home
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
