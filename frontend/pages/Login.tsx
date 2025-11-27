
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../services/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Fish, Mail, Lock, User as UserIcon, ArrowRight, X, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check for Confirmation URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('confirmed') === 'true') {
      setSuccessMsg("Account verificato con successo! Ora puoi accedere.");
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        // Registration Validation
        if (password !== confirmPassword) {
          setError("Le password non corrispondono.");
          setIsLoading(false);
          return;
        }
        await register(username, email, password);
        setSuccessMsg("Registrazione avvenuta con successo, controlla la tua email per confermare l'attivazione del tuo account.");
        // Don't redirect yet, wait for verification
        setIsLoading(false);
        return;
      }
      navigate('/account'); // Redirect to dashboard on login success
    } catch (err: any) {
      console.error("Auth Error:", err);
      let errorMessage = "Autenticazione fallita. Controlla i tuoi dati.";

      // Extract error message from the exception
      const rawError = err.message || "";

      // Map common Strapi errors to Italian
      if (rawError.includes("Email is already taken") || rawError.includes("Email or Username are already taken")) {
        errorMessage = "Questa email o questo nome utente sono già stati utilizzati.";
      } else if (rawError.includes("Username is already taken")) {
        errorMessage = "Questo nome utente è già in uso.";
      } else if (rawError.includes("Invalid identifier or password")) {
        errorMessage = "Email o password non validi.";
      } else if (rawError.includes("password must be at least")) {
        errorMessage = "La password deve essere di almeno 6 caratteri.";
      } else if (rawError.includes("Error sending confirmation email")) {
        errorMessage = "Registrazione completata, ma errore nell'invio dell'email di conferma. Contatta l'amministratore.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setSuccessMsg("Se l'indirizzo esiste, riceverai le istruzioni via email.");
      setIsForgotOpen(false);
    } catch (err) {
      // Fallback generico per sicurezza
      setSuccessMsg("Se l'indirizzo esiste, riceverai le istruzioni via email.");
      setIsForgotOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-stone-50 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-nature-200 rounded-full filter blur-3xl opacity-30 animate-fade-in"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-birillo-yellow rounded-full filter blur-3xl opacity-20 animate-fade-in"></div>

        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-100 relative z-10">

          {/* Header */}
          <div className="bg-nature-600 p-8 text-center relative">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Fish size={32} className="text-nature-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Benvenuto in Birillo</h2>
            <p className="text-nature-100 text-sm mt-1">Accedi al tuo mondo naturale</p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mx-8 mt-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <X size={16} /> {error}
            </div>
          )}
          {successMsg && activeTab !== 'register' && (
            <div className="mx-8 mt-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          {/* Success State for Registration */}
          {successMsg && activeTab === 'register' ? (
            <div className="p-8 text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Controlla la tua Email</h3>
              <p className="text-stone-600 mb-8">
                Abbiamo inviato un link di conferma a <strong>{email}</strong>.<br />
                Clicca sul link per attivare il tuo account e accedere.
              </p>
              <Button
                onClick={() => {
                  setSuccessMsg('');
                  setActiveTab('login');
                }}
                className="w-full"
              >
                Torna al Login
              </Button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-stone-100 mt-4 mx-8">
                <button
                  className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${activeTab === 'login' ? 'text-nature-600' : 'text-stone-400'}`}
                  onClick={() => setActiveTab('login')}
                >
                  Accedi
                  {activeTab === 'login' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-nature-600 rounded-full"></div>}
                </button>
                <button
                  className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${activeTab === 'register' ? 'text-nature-600' : 'text-stone-400'}`}
                  onClick={() => setActiveTab('register')}
                >
                  Registrati
                  {activeTab === 'register' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-nature-600 rounded-full"></div>}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
                {activeTab === 'register' && (
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-nature-500 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Nome Utente"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:bg-white transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-nature-500 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="Indirizzo Email"
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:bg-white transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-nature-500 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:bg-white transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {activeTab === 'register' && (
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-nature-500 transition-colors" size={20} />
                    <input
                      type="password"
                      placeholder="Conferma Password"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:bg-white transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}

                {activeTab === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(true)}
                      className="text-xs text-stone-500 hover:text-nature-600 transition-colors"
                    >
                      Password dimenticata?
                    </button>
                  </div>
                )}

                <Button
                  className="w-full py-4 shadow-xl shadow-nature-200"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    "Elaborazione..."
                  ) : (
                    <>
                      {activeTab === 'login' ? 'Accedi Ora' : 'Crea Account'} <ArrowRight size={20} />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Forgot Password Modal */}
        {isForgotOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-stone-100 p-6 relative">
              <button onClick={() => setIsForgotOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Recupero Password</h3>
              <p className="text-stone-500 text-sm mb-4">Inserisci la tua email. Ti invieremo un link per resettare la password.</p>

              <form onSubmit={handleForgotPass} className="space-y-4">
                <input
                  type="email"
                  placeholder="La tua email"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-nature-400"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? "Invio..." : "Invia Link di Reset"}
                </Button>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};
