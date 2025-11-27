
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { User, Package, MapPin, LogOut, User as UserIcon, Phone, Hash, ChevronRight, X, FileText } from 'lucide-react';
import { Order, OrderStatus } from '../types';

// Mock Orders for the demo


import { STRAPI_API_URL } from '../constants';

export const Account: React.FC = () => {
  const { user, logout, updateProfile, isAuthenticated, isLoading, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    nome_completo: '',
    indirizzo: '',
    note_indirizzo: '',
    citta: '',
    cap: '',
    telefono: ''
  });

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        nome_completo: user.nome_completo || '',
        indirizzo: user.indirizzo || '',
        note_indirizzo: user.note_indirizzo || '',
        citta: user.citta || '',
        cap: user.cap || '',
        telefono: user.telefono || ''
      });
      fetchOrders();
    }
  }, [user, isAuthenticated, navigate, isLoading]);

  const fetchOrders = async () => {
    if (!user || !token) return;
    setIsLoadingOrders(true);
    try {
      const response = await fetch(`${STRAPI_API_URL}/orders?sort=createdAt:desc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Strapi Error Details:", errorData);
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      // Map Strapi response to Order interface
      const mappedOrders: Order[] = data.data.map((order: any) => ({
        id: order.id,
        date: new Date(order.createdAt).toLocaleDateString('it-IT'),
        total: order.total_paid,
        status: order.stato,
        items: order.cart_snapshot.map((item: any) => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          variant_name: item.variant,
          image_url: item.image // Assuming image is saved in snapshot, otherwise fallback or fetch
        }))
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nature-600"></div></div>;
  if (!user) return null;

  return (
    <Layout>
      <div className="bg-stone-50 min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-stone-900 mb-8">Il mio Account</h1>

          {/* Responsive Grid: 1 col Mobile, 3 cols Tablet (Sidebar 33%), 4 cols Desktop (Sidebar 25%) */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">

            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-100">
                <div className="p-6 bg-nature-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon size={20} />
                    </div>
                    <p className="font-bold text-base">{user.username}</p>
                  </div>
                </div>
                <nav className="p-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-nature-50 text-nature-700' : 'text-stone-600 hover:bg-stone-50'}`}
                  >
                    <User size={18} /> Profilo & Indirizzo
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-nature-50 text-nature-700' : 'text-stone-600 hover:bg-stone-50'}`}
                  >
                    <Package size={18} /> Storico Ordini
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors mt-2"
                  >
                    <LogOut size={18} /> Esci
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-2 lg:col-span-3">

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                      <MapPin className="text-nature-600" /> Dettagli Spedizione
                    </h2>
                    {!isEditing && (
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Modifica Dati</Button>
                    )}
                  </div>

                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-stone-600 mb-2">Nome Completo</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className="w-full p-3 rounded-lg bg-stone-50 border border-stone-200 disabled:text-stone-500"
                        value={formData.nome_completo}
                        onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-stone-600 mb-2">Indirizzo</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className="w-full p-3 rounded-lg bg-stone-50 border border-stone-200 disabled:text-stone-500"
                        value={formData.indirizzo}
                        onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-stone-600 mb-2">Note Consegna (Campanello, Piano, Scala...)</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input
                          type="text"
                          disabled={!isEditing}
                          className="w-full pl-10 p-3 rounded-lg bg-stone-50 border border-stone-200 disabled:text-stone-500"
                          value={formData.note_indirizzo}
                          placeholder="Es: Scala B, 2° Piano, lasciare in portineria..."
                          onChange={(e) => setFormData({ ...formData, note_indirizzo: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-600 mb-2">Città</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className="w-full p-3 rounded-lg bg-stone-50 border border-stone-200 disabled:text-stone-500"
                        value={formData.citta}
                        onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-600 mb-2">CAP</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className="w-full p-3 rounded-lg bg-stone-50 border border-stone-200 disabled:text-stone-500"
                        value={formData.cap}
                        onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-stone-600 mb-2">Numero di Telefono</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input
                          type="tel"
                          disabled={!isEditing}
                          className="w-full pl-10 p-3 rounded-lg bg-stone-50 border border-stone-200 disabled:text-stone-500"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="md:col-span-2 flex gap-4 justify-end mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Annulla</Button>
                        <Button type="submit">Salva Modifiche</Button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-100 animate-fade-in-up">
                  <div className="p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-800">Storico Ordini</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
                        <tr>
                          <th className="p-4">ID Ordine</th>
                          <th className="p-4">Data</th>
                          <th className="p-4">Totale</th>
                          <th className="p-4">Stato</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-stone-500">
                              Non hai ancora effettuato ordini.
                            </td>
                          </tr>
                        ) : (
                          orders.map(order => (
                            <tr key={order.id} className="hover:bg-stone-50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                              <td className="p-4 font-mono text-stone-600">#{order.id}</td>
                              <td className="p-4 text-stone-800">{order.date}</td>
                              <td className="p-4 font-bold text-nature-700">€{order.total.toFixed(2)}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                  order.status === OrderStatus.PAID ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <ChevronRight className="inline-block text-stone-300 group-hover:text-nature-600" size={20} />
                              </td>
                            </tr>
                          )))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-nature-50 p-6 border-b border-nature-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-nature-900 flex items-center gap-2">
                  <Hash size={20} /> Ordine #{selectedOrder.id}
                </h3>
                <p className="text-sm text-stone-500">Effettuato il {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h4 className="text-xs font-bold text-stone-400 uppercase mb-4">Articoli Acquistati</h4>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url && <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-stone-800">{item.product_name}</p>
                      {item.variant_name && <p className="text-xs text-stone-500">Variante: {item.variant_name}</p>}
                      <p className="text-sm text-stone-600">Qtà: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-stone-800">€{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stone-50 p-6 border-t border-stone-100 flex justify-between items-center">
              <span className="text-stone-600 font-bold">Totale Pagato</span>
              <span className="text-2xl font-bold text-nature-700">€{selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
