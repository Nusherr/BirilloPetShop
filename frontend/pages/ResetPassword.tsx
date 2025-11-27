import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { STRAPI_API_URL } from '../constants';

export const ResetPassword: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [code, setCode] = useState<string | null>(null);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const codeParam = params.get('code');
        if (codeParam) {
            setCode(codeParam);
        } else {
            setStatus('error');
            setMessage('Codice di reset mancante o non valido.');
        }
    }, [location]);

    const isSubmitting = React.useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting.current) return;

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Le password non corrispondono.');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('La password deve essere di almeno 6 caratteri.');
            return;
        }

        isSubmitting.current = true;
        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        console.log("Submitting Reset Password with code:", code);

        try {
            const response = await fetch(`${STRAPI_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    password,
                    passwordConfirmation: confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Password aggiornata con successo! Ora puoi accedere.');
            } else {
                console.error("Reset Password Failed:", data);
                setStatus('error');
                // Show full error details for debugging
                const errorDetails = data.error ? JSON.stringify(data.error) : JSON.stringify(data);
                setMessage(data.error?.message || `Errore sconosciuto: ${errorDetails}`);
                isSubmitting.current = false; // Allow retry if it failed (e.g. network error, though 400 usually means logic error)
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setStatus('error');
            setMessage('Errore di connessione. Riprova più tardi.');
            isSubmitting.current = false;
        } finally {
            setIsLoading(false);
        }
    };

    if (!code && status === 'error') {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 bg-stone-50">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 text-center border border-stone-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800">Link non valido</h2>
                        <p className="text-stone-600 mt-2 mb-6">{message}</p>
                        <Button onClick={() => navigate('/login')} className="w-full">
                            Torna al Login
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (status === 'success') {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 bg-stone-50">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 text-center border border-stone-100">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800">Password Aggiornata!</h2>
                        <p className="text-stone-600 mt-2 mb-6">{message}</p>
                        <Button onClick={() => navigate('/login')} className="w-full">
                            Vai al Login
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 bg-stone-50">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 border border-stone-100">

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-stone-800">Nuova Password</h2>
                        <p className="text-stone-500 mt-2">Inserisci la tua nuova password sicura.</p>
                    </div>

                    {status === 'error' && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <XCircle size={16} />
                                <span className="font-bold">Errore:</span> {message}
                            </div>
                            <div className="text-xs font-mono bg-red-100 p-2 rounded mt-2 break-all">
                                <p><strong>Debug Info:</strong></p>
                                <p>Code: {code || 'NULL'}</p>
                                <p>Raw Error: {JSON.stringify(status === 'error' ? message : '', null, 2)}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-nature-500 transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nuova Password"
                                required
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:bg-white transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-nature-500 transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Conferma Password"
                                required
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:bg-white transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full py-4 shadow-lg"
                            disabled={isLoading}
                            type="submit"
                        >
                            {isLoading ? "Aggiornamento..." : "Imposta Password"}
                        </Button>
                    </form>

                </div>
            </div>
        </Layout>
    );
};
