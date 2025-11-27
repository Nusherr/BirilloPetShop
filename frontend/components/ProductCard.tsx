
import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../services/cartContext';
import { useWishlist } from '../services/wishlistContext';
import { Plus, Calendar, Heart, ChevronRight, Tag } from 'lucide-react';
import { ProductModal } from './ProductModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Defensive check
  if (!product || !product.attributes) {
    return null;
  }

  const { nome, prezzo, prezzo_scontato, categoria, is_service, immagine, variants } = product.attributes;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isSaved = isInWishlist(product.id);
  const hasVariants = variants && variants.length > 0;
  const isOnSale = prezzo_scontato && prezzo_scontato < prezzo;

  // Calculate discount percentage
  const discountPercent = isOnSale ? Math.round(((prezzo - prezzo_scontato) / prezzo) * 100) : 0;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Add Clicked", { hasVariants, product });
    if (hasVariants) {
      console.log("Opening Modal");
      setIsModalOpen(true);
    } else {
      addToCart(product, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  const adjustQuantity = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setQuantity(prev => Math.max(1, prev + delta));
  };

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-stone-100 flex flex-col h-full relative">

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isSaved ? 'bg-white text-birillo-red ring-1 ring-red-100' : 'bg-black/20 text-white hover:bg-white hover:text-birillo-red backdrop-blur-sm'
            }`}
          aria-label={isSaved ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        >
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>

        {/* Sale Badge - Uses Birillo Red as accent */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-10 bg-birillo-red text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md animate-fade-in">
            <Tag size={12} fill="currentColor" /> -{discountPercent}%
          </div>
        )}

        <div className="relative h-52 overflow-hidden cursor-pointer bg-stone-50" onClick={() => setIsModalOpen(true)}>
          <img
            src={immagine}
            alt={nome}
            className="w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-500"
          />
          {/* Service/Product Badge */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${is_service ? 'bg-ocean-500 text-white border-ocean-400' : 'bg-nature-500 text-white border-nature-400'
              }`}>
              {is_service ? 'Servizio' : 'Prodotto'}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="text-xs text-stone-500 font-bold mb-1 uppercase tracking-wider">{categoria}</div>
          <h3
            className="font-display font-bold text-lg text-stone-900 mb-2 leading-tight cursor-pointer hover:text-nature-600 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            {nome}
          </h3>

          <div className="mt-auto pt-4 border-t border-stone-50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                {isOnSale ? (
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-stone-400 line-through decoration-red-300 decoration-1">€{prezzo.toFixed(2)}</span>
                    <span className="text-xl font-extrabold text-birillo-red">€{prezzo_scontato.toFixed(2)}</span>
                  </div>
                ) : (
                  // If price is 0 and has variants, show "Vedi Opzioni" or min price
                  (prezzo === 0 && hasVariants) ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-stone-400 uppercase font-bold">A partire da</span>
                      <span className="text-lg font-extrabold text-nature-700">
                        €{Math.min(...variants.map(v => v.attributes.prezzo_aggiuntivo)).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-extrabold text-nature-700">€{prezzo.toFixed(2)}</span>
                  )
                )}
                {hasVariants && prezzo > 0 && <span className="text-[10px] font-bold text-nature-600 uppercase bg-nature-50 px-1.5 py-0.5 rounded-sm w-fit mt-0.5">+ opzioni</span>}
              </div>

              <div className="flex items-center gap-2">
                {/* Inline Quantity Selector */}
                {!is_service && !hasVariants && (
                  <div className="flex items-center bg-stone-100 rounded-full h-9 px-1 shadow-inner border border-stone-200" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => adjustQuantity(e, -1)}
                      className="w-6 h-full flex items-center justify-center text-stone-500 hover:text-nature-600 font-bold disabled:opacity-30"
                      disabled={quantity <= 1}
                    >-</button>
                    <span className="w-4 text-center text-sm font-bold text-stone-800 select-none">{quantity}</span>
                    <button
                      onClick={(e) => adjustQuantity(e, 1)}
                      className="w-6 h-full flex items-center justify-center text-stone-500 hover:text-nature-600 font-bold"
                    >+</button>
                  </div>
                )}

                <button
                  onClick={handleAddClick}
                  className={`h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 
                    ${is_service
                      ? 'w-10 bg-ocean-500 text-white hover:bg-ocean-600'
                      : 'bg-nature-600 text-white hover:bg-nature-700'
                    } ${hasVariants ? 'px-4 text-sm font-bold' : 'w-10'}
                  `}
                  aria-label="Aggiungi al carrello"
                >
                  {hasVariants ? (
                    <>Scegli <ChevronRight size={14} className="ml-1" /></>
                  ) : (
                    is_service ? <Calendar size={18} /> : <Plus size={22} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details / Variant Selection Modal */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
