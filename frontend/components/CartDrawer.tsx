
import React from 'react';
import { useCart } from '../services/cartContext';
import { X, Trash2, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, removeFromCart, total, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-in-right">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-nature-50">
            <h2 className="font-display text-xl font-bold text-nature-900">Il tuo Cestino</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
              <X size={20} className="text-stone-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400">
                <ShoppingBag size={48} className="mb-4 opacity-20" />
                <p>Il tuo cestino è vuoto.</p>
              </div>
            ) : (
              items.map((item, index) => {
                const basePrice = item.attributes.prezzo_scontato || item.attributes.prezzo;
                const price = basePrice + (item.selectedVariant?.attributes.prezzo_aggiuntivo || 0);
                const isOnSale = item.attributes.prezzo_scontato && item.attributes.prezzo_scontato < item.attributes.prezzo;
                
                return (
                <div key={`${item.id}-${item.selectedVariant?.id || 'base'}-${index}`} className="flex gap-4 p-3 rounded-xl border border-stone-100 bg-white shadow-sm">
                  <img 
                    src={item.attributes.immagine} 
                    alt={item.attributes.nome} 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-stone-800 text-sm line-clamp-2">{item.attributes.nome}</h4>
                        {item.selectedVariant && (
                          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded mt-1 inline-block">
                            {item.selectedVariant.attributes.nome_variante}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedVariant?.id)} 
                        className="text-stone-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex gap-2 items-baseline mt-1">
                       {isOnSale && !item.selectedVariant && (
                           <span className="text-xs line-through text-stone-400">€{item.attributes.prezzo.toFixed(2)}</span>
                       )}
                       <p className={`${isOnSale ? 'text-red-600' : 'text-nature-600'} font-bold`}>€{price.toFixed(2)}</p>
                    </div>
                    
                    {item.attributes.is_service && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-ocean-600 bg-ocean-50 w-fit px-2 py-1 rounded">
                        <Calendar size={12} />
                        <span>Prenotazione richiesta</span>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-stone-500">Qtà: {item.quantity}</div>
                  </div>
                </div>
              )})
            )}
          </div>

          {items.length > 0 && (
            <div className="p-5 border-t border-stone-100 bg-stone-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-stone-600">Subtotale</span>
                <span className="font-display text-2xl font-bold text-nature-800">€{total.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
              >
                Procedi al Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
