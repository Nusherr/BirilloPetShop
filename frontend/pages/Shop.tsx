import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { fetchProducts, fetchCategories, fetchAnimals } from '../services/strapi';
import { Product } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Loader2, Search, X, LayoutList, Grid2x2, Grid3x3, LayoutGrid } from 'lucide-react';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Shop Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Qualcosa è andato storto.</h2>
            <p className="text-stone-600 mb-6">Non siamo riusciti a caricare il negozio. Ci scusiamo per l'inconveniente.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-nature-600 text-white px-6 py-3 rounded-xl hover:bg-nature-700 transition-colors font-bold shadow-lg"
            >
              Ricarica la Pagina
            </button>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}

// --- Main Shop Component ---
export const Shop: React.FC = () => {
  return (
    <ErrorBoundary>
      <ShopContent />
    </ErrorBoundary>
  );
};

// --- Shop Content ---
const ShopContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [animalsList, setAnimalsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeAnimal, setActiveAnimal] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4>(3);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Parallel fetch for better performance
        const [fetchedProducts, fetchedCategories, fetchedAnimals] = await Promise.all([
          fetchProducts().catch(err => {
            console.error("Failed to fetch products:", err);
            return [];
          }),
          fetchCategories().catch(err => {
            console.error("Failed to fetch categories:", err);
            return [];
          }),
          fetchAnimals().catch(err => {
            console.error("Failed to fetch animals:", err);
            return [];
          })
        ]);

        setProducts(fetchedProducts || []);
        setCategoriesList(fetchedCategories || []);
        setAnimalsList(fetchedAnimals || []);
      } catch (error) {
        console.error("Critical error loading shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // URL Params Sync
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const filterParam = params.get('filter');
    if (filterParam) setActiveCategory(filterParam);

    const searchParam = params.get('search');
    if (searchParam) setSearchQuery(searchParam);
    else setSearchQuery('');

  }, [location.search]);

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/shop');
  };

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    if (!p || !p.attributes) return false;

    const { categoria, animale, nome, descrizione } = p.attributes;

    // Category Match
    const catMatch = activeCategory === 'All' || categoria === activeCategory;

    // Animal Match
    const animalMatch = activeAnimal === 'All' || animale === activeAnimal;

    // Search Match
    const searchLower = searchQuery.toLowerCase();
    const name = (typeof nome === 'string') ? nome.toLowerCase() : '';
    const desc = (typeof descrizione === 'string') ? descrizione.toLowerCase() : '';

    const searchMatch = !searchQuery ||
      name.includes(searchLower) ||
      desc.includes(searchLower);

    return catMatch && animalMatch && searchMatch;
  });

  const getGridClass = () => {
    switch (viewMode) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <div className="bg-nature-50 py-12 border-b border-nature-100">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-4">Negozio & Servizi</h1>
          <p className="text-stone-600 max-w-2xl">
            Esplora la nostra selezione di prodotti premium e servizi dedicati per il benessere dei tuoi animali.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 sticky top-24">
            <div className="flex items-center gap-2 font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">
              <Filter size={20} className="text-nature-600" /> Filtri
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="font-semibold text-xs text-stone-400 uppercase tracking-wider mb-4">Categoria</h3>
              <div className="space-y-2">
                <FilterButton
                  label="Tutti"
                  isActive={activeCategory === 'All'}
                  onClick={() => setActiveCategory('All')}
                />
                {categoriesList.map(cat => (
                  <FilterButton
                    key={cat}
                    label={cat}
                    isActive={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </div>
            </div>

            {/* Animals */}
            <div>
              <h3 className="font-semibold text-xs text-stone-400 uppercase tracking-wider mb-4">Animale</h3>
              <div className="space-y-2">
                <FilterButton
                  label="Tutti"
                  isActive={activeAnimal === 'All'}
                  onClick={() => setActiveAnimal('All')}
                />
                {animalsList.map(anim => (
                  <FilterButton
                    key={anim}
                    label={anim}
                    isActive={activeAnimal === anim}
                    onClick={() => setActiveAnimal(anim)}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* Controls Bar */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">

            {/* Search Status */}
            <div className="flex-1 w-full sm:w-auto">
              {searchQuery ? (
                <div className="flex items-center gap-3 bg-nature-50 px-4 py-2 rounded-lg border border-nature-100">
                  <Search size={16} className="text-nature-600" />
                  <span className="text-sm text-stone-700 truncate">
                    Ricerca: <span className="font-bold">"{searchQuery}"</span>
                  </span>
                  <button
                    onClick={clearSearch}
                    className="ml-auto p-1 hover:bg-red-100 text-red-500 rounded-full transition-colors"
                    title="Cancella ricerca"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-stone-500 pl-2">
                  Mostrando {filteredProducts.length} prodotti
                </span>
              )}
            </div>

            {/* View Toggles */}
            <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-200">
              <ViewToggle icon={<LayoutList size={18} />} active={viewMode === 1} onClick={() => setViewMode(1)} />
              <ViewToggle icon={<Grid2x2 size={18} />} active={viewMode === 2} onClick={() => setViewMode(2)} className="block md:hidden lg:block" />
              <ViewToggle icon={<Grid3x3 size={18} />} active={viewMode === 3} onClick={() => setViewMode(3)} className="hidden md:block" />
              <ViewToggle icon={<LayoutGrid size={18} />} active={viewMode === 4} onClick={() => setViewMode(4)} className="hidden lg:block" />
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="animate-spin text-nature-600 mb-4" size={48} />
              <p className="text-stone-500 font-medium">Caricamento prodotti in corso...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-stone-100 shadow-sm">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                <Search size={40} />
              </div>
              <h3 className="text-2xl text-stone-800 font-bold mb-2">Nessun risultato trovato</h3>
              <p className="text-stone-500 mb-8 max-w-md mx-auto">
                Non abbiamo trovato prodotti che corrispondono ai tuoi filtri. Prova a cercare qualcos'altro o rimuovi i filtri attivi.
              </p>
              {(searchQuery || activeCategory !== 'All' || activeAnimal !== 'All') && (
                <button
                  onClick={() => {
                    clearSearch();
                    setActiveCategory('All');
                    setActiveAnimal('All');
                  }}
                  className="text-nature-600 font-bold hover:text-nature-700 hover:underline"
                >
                  Resetta tutti i filtri
                </button>
              )}
            </div>
          ) : (
            <div className={`grid ${getGridClass()} gap-6 transition-all duration-300`}>
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// --- Helper Components ---

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive
      ? 'bg-nature-600 text-white font-bold shadow-md shadow-nature-200'
      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
      }`}
  >
    {label}
  </button>
);

const ViewToggle: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; className?: string }> = ({ icon, active, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-all duration-200 ${active
      ? 'bg-white text-nature-600 shadow-sm'
      : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
      } ${className}`}
  >
    {icon}
  </button>
);