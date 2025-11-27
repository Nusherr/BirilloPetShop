
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../services/cartContext';
import { useWishlist } from '../services/wishlistContext';
import { useAuth } from '../services/authContext';
import { ShoppingBag, Fish, User, Heart, LogIn, MapPin, Search, X, Loader2, ArrowRight, Tag, Clock, Mail, Phone, Package } from 'lucide-react';
import { CartDrawer } from './CartDrawer';
import { AiAdvisor } from './AiAdvisor';
import { Product } from '../types';
import { searchProductsPreview } from '../services/strapi';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live Search State
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<{ type: string, label: string, filter: string }[]>([]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Negozio' },
    { path: '/services', label: 'Servizi' }, // Updated Link
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    // Exact match for /services vs /shop
    return location.pathname === path;
  };

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Debounced Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);

        // 1. Generate Smart Category Suggestions based on keywords
        const lowerTerm = searchTerm.toLowerCase();
        const newSmartSuggestions = [];

        if ('cane'.includes(lowerTerm) || lowerTerm.includes('cane') || lowerTerm.includes('dog')) {
          newSmartSuggestions.push({ type: 'Animale', label: 'Prodotti per Cani', filter: 'Cane' });
        }
        if ('gatto'.includes(lowerTerm) || lowerTerm.includes('gatto') || lowerTerm.includes('cat')) {
          newSmartSuggestions.push({ type: 'Animale', label: 'Prodotti per Gatti', filter: 'Gatto' });
        }
        if ('pesci'.includes(lowerTerm) || lowerTerm.includes('pesci') || lowerTerm.includes('acquario')) {
          newSmartSuggestions.push({ type: 'Animale', label: 'Prodotti per Pesci & Acquari', filter: 'Pesci' });
        }
        if ('cibo'.includes(lowerTerm) || lowerTerm.includes('mangime')) {
          newSmartSuggestions.push({ type: 'Categoria', label: 'Tutto il Cibo', filter: 'Cibo' });
        }
        if ('servizi'.includes(lowerTerm) || lowerTerm.includes('manutenzione')) {
          newSmartSuggestions.push({ type: 'Categoria', label: 'Servizi Professionali', filter: 'Servizi' });
        }
        setSmartSuggestions(newSmartSuggestions);

        // 2. Fetch Product Previews
        const results = await searchProductsPreview(searchTerm);
        setSuggestions(results);

        setIsSearching(false);
      } else {
        setSuggestions([]);
        setSmartSuggestions([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = (id: number) => {
    const product = suggestions.find(p => p.id === id);
    if (product) {
      navigate(`/shop?search=${encodeURIComponent(product.attributes.nome)}`);
    }
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const handleSmartSuggestionClick = (filter: string) => {
    navigate(`/shop?filter=${filter}`);
    setIsSearchOpen(false);
    setSearchTerm('');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Notification */}
      <div className="bg-nature-900 text-white text-center py-2 text-xs font-bold px-4 flex flex-col sm:flex-row justify-center gap-1 sm:gap-4 tracking-wide relative z-50">
        <span className="flex items-center justify-center gap-1">
          <Package size={14} className="text-nature-300" /> Spedizione gratuita per ordini oltre €99
        </span>
        <span className="hidden sm:inline opacity-40">|</span>
        <span className="flex items-center justify-center gap-1">
          <MapPin size={14} className="text-nature-300" />
          Consegna a Domicilio in Giornata disponibile in <span className="underline decoration-nature-300 underline-offset-2">Provincia di Teramo</span>!
        </span>
      </div>

      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border-2 border-white/20 overflow-hidden bg-white">
                <img src="/logo.png" alt="Birillo Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold text-2xl text-nature-600 tracking-tight group-hover:text-nature-700 transition-colors">
                  BIRILLO
                </span>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Pet Shop</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center lg:justify-start lg:pl-12">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold uppercase tracking-wide transition-all hover:text-nature-600 hover:scale-105 ${isActive(link.path) ? 'text-nature-600' : 'text-stone-500'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                className={`p-2.5 transition-colors rounded-full ${isSearchOpen ? 'bg-nature-50 text-nature-600' : 'text-stone-500 hover:text-nature-600'}`}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label={isSearchOpen ? "Chiudi ricerca" : "Cerca"}
              >
                {isSearchOpen ? <X size={22} /> : <Search size={22} />}
              </button>

              <Link to="/wishlist" className="hidden sm:flex relative p-2.5 text-stone-500 hover:text-birillo-red hover:bg-red-50 rounded-full transition-all group" aria-label="Preferiti">
                <Heart size={22} className={wishlistIds.length > 0 ? "fill-birillo-red text-birillo-red" : ""} />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-birillo-red rounded-full ring-2 ring-white"></span>
                )}
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/account"
                  className="flex items-center gap-2 text-stone-500 hover:text-nature-600 hover:bg-nature-50 rounded-full pr-4 pl-2 py-1.5 transition-all border border-transparent hover:border-nature-100"
                >
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <span className="hidden lg:inline font-bold text-sm">{user?.username}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-stone-500 hover:text-nature-600 font-bold text-sm p-2 transition-colors"
                >
                  <LogIn size={22} />
                  <span className="hidden lg:inline">Accedi</span>
                </Link>
              )}

              <button
                className="relative p-2.5 text-stone-500 hover:text-nature-600 transition-colors hover:bg-nature-50 rounded-full"
                onClick={() => setIsCartOpen(true)}
                aria-label="Carrello"
              >
                <ShoppingBag size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-nature-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Unified Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-lg py-6 px-4 animate-fade-in -z-10 max-h-[80vh] overflow-y-auto">
            <div className="max-w-3xl mx-auto relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={20} className="absolute left-4 text-nature-600 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cerca prodotti, cibo, accessori..."
                  className="w-full bg-stone-50 text-stone-800 text-lg rounded-full py-3 pl-12 pr-12 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:bg-white transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </form>

              {searchTerm.length > 1 && (
                <div className="mt-4 bg-white rounded-2xl border border-stone-100 shadow-xl overflow-hidden animate-fade-in-up">
                  {isSearching ? (
                    <div className="p-6 flex items-center justify-center text-stone-500 gap-2">
                      <Loader2 className="animate-spin" size={20} /> Cercando...
                    </div>
                  ) : (
                    <>
                      {smartSuggestions.length > 0 && (
                        <div className="p-2 border-b border-stone-50 bg-nature-50/50 flex flex-wrap gap-2">
                          {smartSuggestions.map((sg, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSmartSuggestionClick(sg.filter)}
                              className="text-xs font-bold flex items-center gap-1 bg-white border border-nature-100 text-nature-700 px-3 py-1.5 rounded-full hover:bg-nature-100 transition-colors"
                            >
                              <Tag size={12} /> {sg.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {suggestions.length > 0 ? (
                        <div>
                          <div className="p-2">
                            <h4 className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider">Prodotti</h4>
                            {suggestions.map(product => (
                              <div
                                key={product.id}
                                onClick={() => handleSuggestionClick(product.id)}
                                className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-xl cursor-pointer transition-colors"
                              >
                                <img
                                  src={product.attributes.immagine}
                                  alt={product.attributes.nome}
                                  className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                                />
                                <div className="flex-1">
                                  <h5 className="font-bold text-stone-800 text-sm">{product.attributes.nome}</h5>
                                  <span className="text-xs text-stone-500">{product.attributes.categoria}</span>
                                </div>
                                <div className="font-bold text-nature-600 text-sm">
                                  €{product.attributes.prezzo_scontato
                                    ? product.attributes.prezzo_scontato.toFixed(2)
                                    : product.attributes.prezzo.toFixed(2)
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full bg-stone-50 p-3 text-center text-sm font-bold text-nature-600 hover:bg-stone-100 transition-colors border-t border-stone-100 flex items-center justify-center gap-1"
                          >
                            Vedi tutti i risultati <ArrowRight size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-stone-500 font-medium">Nessun prodotto trovato per "{searchTerm}"</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-nature-900 text-nature-100 pt-16 pb-8 border-t-4 border-nature-700">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white border-2 border-nature-700">
                <img src="/logo.png" alt="Birillo Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-display font-bold text-2xl text-white">BIRILLO <span className="text-nature-300 text-sm uppercase align-middle">Pet Shop</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-4 opacity-80">
              Il punto di riferimento per chi ama la natura.
              Professionalità, passione e i migliori prodotti per i tuoi amici animali.
            </p>
            <div className="flex items-center gap-2 text-nature-300 text-sm font-bold">
              <MapPin size={16} />
              <span>Consegna Rapida a Teramo</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
              <Clock size={18} className="text-nature-300" /> Orari
            </h4>
            <ul className="space-y-2 text-sm font-medium opacity-80">
              <li className="flex justify-between border-b border-nature-800 pb-1">
                <span className="text-nature-200">Lun - Mer</span>
                <span className="text-right">08-13, 15:30-19:30</span>
              </li>
              <li className="flex justify-between border-b border-nature-800 pb-1">
                <span className="text-nature-200">Giovedì</span>
                <span className="text-right">08-13, 15:30-19:00</span>
              </li>
              <li className="flex justify-between border-b border-nature-800 pb-1">
                <span className="text-nature-200">Ven - Sab</span>
                <span className="text-right">08-13, 15:30-19:30</span>
              </li>
              <li className="flex justify-between pt-1 text-birillo-red font-bold">
                <span>Domenica</span>
                <span>Chiuso</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Servizi</h4>
            <ul className="space-y-3 text-sm font-medium opacity-80">
              <li><Link to="/services" className="hover:text-white transition-colors hover:underline">Installazione Acquari</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors hover:underline">Manutenzione Mensile</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors hover:underline">Test dell'Acqua</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors hover:underline">Consegna a Domicilio</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Contatti</h4>
            <ul className="space-y-4 text-sm font-medium opacity-80">
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Birillo+Pet+Shop+Via+Po+26+Teramo"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 hover:text-white transition-colors group"
                >
                  <MapPin size={18} className="mt-0.5 text-nature-300 group-hover:text-white" />
                  <span>Via Po 26/28,<br />Piazza Aldo Moro,<br />64100 Teramo (TE)</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:birillopetshop@hotmail.it"
                  className="flex items-center gap-3 hover:text-white transition-colors group"
                >
                  <Mail size={18} className="text-nature-300 group-hover:text-white" />
                  <span className="break-all">birillopetshop@hotmail.it</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+390861210515"
                  className="flex items-center gap-3 hover:text-white transition-colors group"
                >
                  <Phone size={18} className="text-nature-300 group-hover:text-white" />
                  <span>0861 210515</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-nature-800 pt-8 text-center text-xs opacity-60">
          &copy; {new Date().getFullYear()} Birillo Pet Shop. Tutti i diritti riservati.
        </div>
      </footer>

      <CartDrawer />
      <AiAdvisor />
    </div>
  );
};
