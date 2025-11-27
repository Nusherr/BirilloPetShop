
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { fetchFeaturedProducts } from '../services/strapi';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, CheckCircle, Loader2, Truck, MapPin } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      const data = await fetchFeaturedProducts();
      setFeaturedProducts(data);
      setLoading(false);
    };
    loadFeatured();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-nature-50 pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 bg-white text-nature-700 rounded-full text-sm font-bold tracking-wide shadow-sm">
                📍 Il Tuo Pet Shop di Fiducia
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-stone-900 leading-tight">
                Solo il Meglio per i tuoi <br />
                <span className="text-nature-600">Amici Animali</span>
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                Dalla nutrizione premium alle installazioni personalizzate di acquari.
                Combiniamo prodotti e servizi per garantire il benessere dei tuoi animali.
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg" onClick={() => navigate('/shop')}>
                  Acquista Ora
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/services')}>
                  I Nostri Servizi
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-nature-200 rounded-full filter blur-3xl opacity-30 transform translate-y-8"></div>
              <img
                src="/hero-dog.png"
                alt="Golden Retriever felice"
                className="relative rounded-3xl shadow-2xl transform md:rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-white"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Esperti del Settore</p>
                  <p className="text-xs text-stone-500">Da oltre 20 anni</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Delivery Feature Banner */}
      <section className="bg-white py-8 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-nature-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl shadow-nature-100">
            <div className="flex items-start gap-4 mb-6 md:mb-0">
              <div className="bg-white/20 p-3 rounded-xl">
                <Truck size={32} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold mb-1">Vivi in Provincia di Teramo?</h3>
                <p className="text-nature-100 max-w-md">
                  Offriamo un'esclusiva <span className="font-bold text-white">Consegna Diretta a Domicilio</span> per i clienti locali.
                  Veloce, sicura e gestita personalmente dal nostro team.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-nature-700/50 px-6 py-3 rounded-xl border border-nature-500/30">
              <MapPin size={20} className="text-nature-300" />
              <div className="text-sm">
                <span className="block font-bold">Aree di Consegna:</span>
                <span className="text-nature-200">Teramo Città, Giulianova, Roseto...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-stone-900">Articoli in Evidenza</h2>
              <p className="text-stone-500 mt-2">Essenziali selezionati per i tuoi animali.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/shop')} className="hidden md:flex">
              Vedi Tutti <ArrowRight size={16} />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-nature-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {featuredProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Mobile 'See All' Button */}
              <div className="mt-8 md:hidden flex justify-center">
                <Button variant="outline" onClick={() => navigate('/shop')} className="w-full justify-center">
                  Vedi Tutti <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Services Banner */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          {/* High quality Aquascape image from Unsplash */}
          <img
            src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1600&q=80"
            alt="Acquario professionale piantumato"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 to-stone-900/40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Servizi Professionali per Acquari
          </h2>
          <p className="text-stone-200 max-w-2xl mx-auto mb-10 text-lg md:text-xl leading-relaxed font-light">
            Non vendiamo solo vasche; creiamo <span className="font-semibold text-white">ecosistemi</span>.
            Prenota una consulenza per un'installazione personalizzata
            o iscriviti ai nostri piani di manutenzione mensile senza pensieri.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/services')}
            className="mx-auto !shadow-none"
          >
            Scopri i Servizi
          </Button>
        </div>
      </section>
    </Layout >
  );
};
