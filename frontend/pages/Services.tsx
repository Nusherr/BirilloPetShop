
import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Clock, PenTool, Droplets, ArrowRight, CheckCircle, Info } from 'lucide-react';

export const Services: React.FC = () => {
  const navigate = useNavigate();

  const scrollToFooter = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-nature-50 py-16 text-center px-4">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-stone-900 mb-6">
          Ovunque tu sia, <br /><span className="text-nature-600">Noi ci siamo</span>
        </h1>
        <p className="text-stone-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Che tu viva in centro a Teramo o dall'altra parte d'Italia, garantiamo che i tuoi prodotti arrivino velocemente e in perfette condizioni.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">

        {/* SEZIONE 1: LOGISTICA E SPEDIZIONI */}
        <section className="flex flex-col items-center">


          <div className="grid md:grid-cols-2 gap-6 w-full">

            {/* Spedizione Nazionale */}
            <div className="bg-stone-50 p-8 md:p-10 rounded-3xl shadow-xl border-2 border-nature-200 flex flex-col items-start text-left relative overflow-hidden group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-nature-600 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Truck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-3">Spedizione Nazionale</h3>
              <p className="text-stone-600 mb-6 leading-relaxed">
                Spediamo in tutta Italia con corriere espresso. Imballaggi sicuri e tracking in tempo reale per seguire il tuo pacco.
              </p>

              <div className="w-full mb-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-500">
                  <Clock size={16} className="text-nature-600" /> 24/48 Ore
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-stone-500">
                  <CheckCircle size={16} className="text-nature-600" /> Tracciato
                </div>
              </div>

              <div className="mt-auto w-full bg-white rounded-2xl p-4 border border-nature-100 shadow-sm">
                <div className="flex justify-between items-center mb-2 text-sm text-stone-500">
                  <span>Ordini &lt; €99</span>
                  <span className="font-bold text-stone-800">€6.90</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-nature-600">
                  <span>Ordini &gt; €99</span>
                  <span>GRATIS</span>
                </div>
              </div>
            </div>

            {/* Consegna Locale (Teramo) */}
            <div className="bg-nature-600 p-8 md:p-10 rounded-3xl shadow-xl text-white flex flex-col items-start text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <MapPin size={28} />
              </div>
              <div className="flex justify-between items-start w-full pr-4">
                <h3 className="text-2xl font-bold mb-3">Consegna a Domicilio</h3>
                <span className="bg-white text-nature-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Teramo</span>
              </div>
              <p className="text-nature-100 mb-8 leading-relaxed max-w-sm">
                Il nostro furgone, il nostro staff. Consegniamo personalmente a casa tua con la massima cura e flessibilità oraria.
              </p>

              <div className="mt-auto w-full bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center mb-2 text-sm text-nature-100">
                  <span>Ordini &lt; €99</span>
                  <span className="font-bold text-white">€4.99</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-white">
                  <span>Ordini &gt; €99</span>
                  <span className="text-nature-200">GRATIS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEZIONE 2: ACQUARIOLOGIA PROFESSIONALE */}
        <section className="bg-stone-900 rounded-3xl overflow-hidden relative">
          {/* Sfondo Decorativo */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=1600&q=80"
              alt="Aquascape background"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/90 to-transparent"></div>
          </div>

          <div className="relative z-10 p-8 md:p-16 flex flex-col items-center text-center">

            <div className="flex items-center gap-2 text-nature-400 font-bold uppercase tracking-wider text-sm mb-4">
              <Droplets size={18} /> Dipartimento Acquariofilia
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight text-white mb-6 max-w-3xl">
              L'Arte dell'Acquariofilia <br /><span className="text-nature-400">a Casa Tua</span>
            </h2>

            <p className="text-stone-300 text-lg leading-relaxed max-w-2xl mb-10">
              Creiamo e curiamo ecosistemi sommersi unici. Affidati alla nostra esperienza ventennale per progettare l'acquario dei tuoi sogni o per mantenerlo sempre spettacolare e in salute.
            </p>

            {/* Features Row */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-stone-200 mb-12">
              <div className="flex items-center gap-2 bg-stone-800/50 px-4 py-2 rounded-full border border-white/5">
                <CheckCircle className="text-nature-500" size={18} /> <span className="text-sm font-bold">Analisi Acqua</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-800/50 px-4 py-2 rounded-full border border-white/5">
                <CheckCircle className="text-nature-500" size={18} /> <span className="text-sm font-bold">Aquascaping</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-800/50 px-4 py-2 rounded-full border border-white/5">
                <CheckCircle className="text-nature-500" size={18} /> <span className="text-sm font-bold">Manutenzione</span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">

              {/* Card: Manutenzione */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/15 transition-all text-left group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-nature-500/20 p-3 rounded-xl">
                    <PenTool className="text-nature-400" size={24} />
                  </div>
                  <span className="text-[10px] bg-nature-600 text-white px-2 py-1 rounded uppercase font-bold tracking-wide">Solo Teramo</span>
                </div>
                <h4 className="text-white font-bold text-xl mb-2">Manutenzione Programmata</h4>
                <p className="text-stone-300 text-sm mb-6 leading-relaxed">
                  Pensiamo a tutto noi: cambi d'acqua, potatura piante, pulizia filtri e monitoraggio salute. Goditi solo la bellezza.
                </p>
                <Button onClick={() => navigate('/shop?filter=Servizi')} className="w-full justify-between bg-white/10 hover:bg-white/20 border-0 shadow-lg shadow-nature-500/30">
                  Prenota Intervento <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Card: Nuovo Acquario */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/15 transition-all text-left group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <Droplets className="text-blue-400" size={24} />
                  </div>
                </div>
                <h4 className="text-white font-bold text-xl mb-2">Progettazione & Allestimento</h4>
                <p className="text-stone-300 text-sm mb-6 leading-relaxed">
                  Dal primo vetro al primo pesce. Realizziamo acquari su misura, biotopi specifici e aquascaping di alto livello.
                </p>
                <Button onClick={() => navigate('/shop?filter=Acquari')} className="w-full justify-between bg-white/10 hover:bg-white/20 border-0 shadow-lg shadow-blue-500/30">
                  Inizia il Progetto <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

            </div>

            {/* Disclaimer Footer */}
            <div className="mt-10 text-stone-400 text-xs flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full">
              <MapPin size={14} /> Servizi a domicilio disponibili esclusivamente a Teramo e provincia.
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
};
