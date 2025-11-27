
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../services/wishlistContext';
import { fetchProducts } from '../services/strapi';
import { Product } from '../types';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const Wishlist: React.FC = () => {
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter products that are in the wishlist
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <Layout>
      <div className="bg-nature-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-red-500 shadow-md mb-4">
            <Heart size={32} fill="currentColor" />
          </div>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">I Miei Preferiti</h1>
          <p className="text-stone-600">Tieni traccia delle cose che tu e i tuoi animali amate.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-nature-600" size={32} />
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-stone-300 mb-4">La tua lista dei desideri è vuota</h3>
            <Button onClick={() => navigate('/shop')}>Scopri i Prodotti</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};