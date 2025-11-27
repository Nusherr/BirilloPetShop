import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { STRAPI_API_URL } from '../constants';

export const EmailConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifica in corso...');

    const hasFetched = React.useRef(false);

    useEffect(() => {
        const confirmEmail = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            const params = new URLSearchParams(location.search);
            const confirmationCode = params.get('confirmation');

            if (!confirmationCode) {
                setStatus('error');
                setMessage('Codice di conferma mancante.');
                return;
            }

            try {
                const response = await fetch(`${STRAPI_API_URL}/auth/email-confirmation?confirmation=${confirmationCode}`);

                if (response.ok) {
                    setStatus('success');
                    setMessage('Email verificata con successo! Ora puoi accedere.');
                } else {
                    let errorMsg = 'Link di conferma non valido o scaduto.';
                    try {
                        const data = await response.json();
                        if (data?.error?.message) {
                            errorMsg = `Errore: ${data.error.message}`;
                        }
                    } catch (e) {
                        console.warn('Non-JSON error response received');
                    }
                    setStatus('error');
                    setMessage(errorMsg);
                }
            } catch (error) {
                console.error('Confirmation network error:', error);
                setStatus('error');
                setMessage('Errore di connessione durante la verifica.');
            }
        };

        confirmEmail();
    }, [location]);

    return (
        <Layout>
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 bg-stone-50">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 text-center border border-stone-100">

                    {status === 'loading' && (
                        <div className="flex flex-col items-center animate-fade-in">
                            <Loader className="w-16 h-16 text-nature-600 animate-spin mb-4" />
                            <h2 className="text-xl font-bold text-stone-800">Verifica in corso...</h2>
                            <p className="text-stone-500 mt-2">Attendi mentre confermiamo il tuo account.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-stone-800">Account Attivato!</h2>
                            <p className="text-stone-600 mt-2 mb-6">{message}</p>
                            <Button onClick={() => navigate('/login')} className="w-full">
                                Vai al Login
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center animate-fade-in">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-stone-800">Verifica Fallita</h2>
                            <p className="text-stone-600 mt-2 mb-6">{message}</p>
                            <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                                Torna al Login
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};
