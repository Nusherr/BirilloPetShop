
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useCart } from '../services/cartContext';
import { useAuth } from '../services/authContext';
import { Button } from '../components/Button';
import { Calendar as CalendarIcon, CreditCard, Package, MapPin, AlertCircle, CheckCircle, Truck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STRAPI_API_URL } from '../constants';
import { loadStripe } from '@stripe/stripe-js';

// Chiave Pubblica di Stripe (Produzione / Test)
const stripePromise = loadStripe('pk_test_51SV5rnFi1kEwIp0cCe1ch3oCZiyQMlhYfGPvNXbbmcSrtlI2pJkvfwYttP4RjuG8poIIXvLubLedzzXGYGJgAVqe00hvcY2kTk');

export const Checkout: React.FC = () => {
  const { items, total, updateServiceDetails, clearCart } = useCart();
  const { user, isAuthenticated, updateProfile, token, isLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Local state for shipping edit if user wants to update address during checkout
  const [shippingDetails, setShippingDetails] = useState({
    address: '',
    city: '',
    zip: '',
    phone: '',
    notes: ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // State for manual selection of local delivery
  const [wantsLocalDelivery, setWantsLocalDelivery] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      setShippingDetails({
        address: user.indirizzo || '',
        city: user.citta || '',
        zip: user.cap || '',
        phone: user.telefono || '',
        notes: user.note_indirizzo || ''
      });
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  // Helper Logic: Detect Teramo Province eligibility
  const isEligibleForLocalDelivery = () => {
    const city = shippingDetails.city.toLowerCase().trim();
    const zip = shippingDetails.zip.trim();
    // Check if city contains 'teramo' or zip starts with '64' (Teramo province prefix)
    return city.includes('teramo') || zip.startsWith('64');
  };

  const canHaveLocalDelivery = isEligibleForLocalDelivery();

  // Reset local delivery selection if address changes to non-eligible
  useEffect(() => {
    if (!canHaveLocalDelivery) {
      setWantsLocalDelivery(false);
    }
  }, [canHaveLocalDelivery]);

  // Shipping Cost Logic
  // If Order > 99: Free
  // If Local Delivery Selected (< 99): 4.99
  // Else (< 99): 9.90
  const isFreeShippingThreshold = total >= 99;

  const shippingCost = isFreeShippingThreshold
    ? 0
    : (wantsLocalDelivery ? 4.99 : 9.90);

  const finalTotal = total + shippingCost;

  const serviceItems = items.filter(item => item.attributes.is_service);
  const physicalItems = items.filter(item => !item.attributes.is_service);

  const hasPhysicalItems = physicalItems.length > 0;
  const hasAddress = user?.indirizzo && user?.citta && user?.cap;

  // If physical items exist, address is mandatory
  const canProceed = !hasPhysicalItems || (hasAddress && !isEditingAddress);

  const handleSaveAddress = async () => {
    await updateProfile({
      indirizzo: shippingDetails.address,
      citta: shippingDetails.city,
      cap: shippingDetails.zip,
      telefono: shippingDetails.phone,
      note_indirizzo: shippingDetails.notes
    });
    setIsEditingAddress(false);
  };

  const handlePayment = async () => {
    if (!token || !user) return;
    setIsProcessing(true);

    try {
      console.log("Starting payment process...");
      // 1. Prepare Payload
      const orderPayload = {
        data: {
          user: user.id,
          total_paid: finalTotal,
          stato: "In Attesa", // Will be updated by webhook or manual check
          shipping_details: shippingDetails,
          cart_snapshot: items.map(item => ({
            id: item.id,
            name: item.attributes.nome,
            quantity: item.quantity,
            price: (item.attributes.prezzo_scontato || item.attributes.prezzo) + (item.selectedVariant?.attributes.prezzo_aggiuntivo || 0),
            variant: item.selectedVariant?.attributes.nome_variante,
            is_service: item.attributes.is_service,
            service_date: item.serviceDate,
            service_notes: item.serviceNotes
          }))
        }
      };
      console.log("Order Payload:", orderPayload);

      // 2. Call Backend to Create Order & Stripe Session
      const response = await fetch(`${STRAPI_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      console.log("Response Status:", response.status);
      const responseData = await response.json();
      console.log("Response Data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error?.message || "Impossibile creare l'ordine");
      }

      // 3. Redirect to Stripe
      if (responseData.url) {
        console.log("Redirecting to Stripe:", responseData.url);
        window.location.href = responseData.url;
      } else {
        console.warn("No Stripe URL returned, falling back to manual success");
        // Fallback for manual orders (no stripe session returned)
        clearCart();
        navigate('/account');
      }

    } catch (error) {
      console.error("Order Error:", error);
      alert("Si è verificato un errore: " + error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nature-600"></div></div>;
  if (!isAuthenticated) return null; // Will redirect via useEffect

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Il tuo carrello è vuoto</h2>
            <Button onClick={() => navigate('/shop')}>Vai allo Shop</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-stone-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-8 text-stone-800">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">

              {/* Section: Shipping Address (Conditional for Physical Items) */}
              {hasPhysicalItems && (
                <div className={`p-6 rounded-2xl shadow-sm border transition-all ${hasAddress && !isEditingAddress ? 'bg-white border-stone-100' : 'bg-red-50 border-red-100'}`}>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MapPin className={hasAddress ? "text-nature-600" : "text-red-500"} />
                    Informazioni di Spedizione
                  </h3>

                  {!hasAddress || isEditingAddress ? (
                    <div className="space-y-4 animate-fade-in">
                      {!hasAddress && <p className="text-sm text-red-600 font-semibold">Inserisci un indirizzo di spedizione per continuare.</p>}
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Indirizzo"
                          className="col-span-2 p-3 bg-white border border-stone-200 rounded-lg"
                          value={shippingDetails.address}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Note (es. Scala, Piano, Campanello)"
                          className="col-span-2 p-3 bg-white border border-stone-200 rounded-lg"
                          value={shippingDetails.notes}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, notes: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Città (es. Teramo)"
                          className="p-3 bg-white border border-stone-200 rounded-lg"
                          value={shippingDetails.city}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="CAP (es. 64100)"
                          className="p-3 bg-white border border-stone-200 rounded-lg"
                          value={shippingDetails.zip}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, zip: e.target.value })}
                        />
                        <input
                          type="tel"
                          placeholder="Telefono"
                          className="col-span-2 p-3 bg-white border border-stone-200 rounded-lg"
                          value={shippingDetails.phone}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleSaveAddress} size="sm">Salva Indirizzo</Button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-stone-600">
                        <p className="font-bold text-stone-800">{user?.nome_completo || user?.username}</p>
                        <p>{user?.indirizzo}</p>
                        {user?.note_indirizzo && <p className="text-stone-500 italic flex items-center gap-1"><FileText size={12} /> {user.note_indirizzo}</p>}
                        <p>{user?.citta}, {user?.cap}</p>
                        <p>{user?.telefono}</p>
                      </div>
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="text-nature-600 text-sm font-bold hover:underline"
                      >
                        Modifica
                      </button>
                    </div>
                  )}

                  {/* Local Delivery Selection Checkbox */}
                  {hasAddress && !isEditingAddress && canHaveLocalDelivery && (
                    <div className="mt-6 pt-4 border-t border-stone-100 animate-fade-in">
                      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${wantsLocalDelivery ? 'bg-nature-50 border-nature-200' : 'bg-white border-stone-200 hover:border-nature-200'}`}>
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-nature-600 rounded focus:ring-nature-500"
                            checked={wantsLocalDelivery}
                            onChange={(e) => setWantsLocalDelivery(e.target.checked)}
                          />
                        </div>
                        <div>
                          <span className="font-bold text-nature-800 flex items-center gap-2">
                            <Truck size={18} /> Richiedi Consegna a Domicilio
                          </span>
                          <p className="text-sm text-stone-600 mt-1">
                            Poiché risiedi nella zona di Teramo, possiamo consegnare l'ordine direttamente a casa tua!
                            <span className="text-nature-600 font-bold block mt-1">
                              {isFreeShippingThreshold
                                ? "Gratuita per questo ordine!"
                                : "Costo agevolato: €4.99 (Gratis oltre €99)"
                              }
                            </span>
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Section: Review Items */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Package className="text-nature-600" /> Articoli Ordine
                </h3>

                {physicalItems.map(item => (
                  <div key={`${item.id}-${item.selectedVariant?.id}`} className="flex gap-4 items-center py-4 border-b border-stone-50 last:border-0">
                    {/* Product Image Thumbnail */}
                    <div className="w-16 h-16 bg-stone-50 rounded-xl border border-stone-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.attributes.immagine}
                        alt={item.attributes.nome}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    <div className="flex-1">
                      <span className="text-stone-800 font-bold block">{item.attributes.nome}</span>
                      {item.selectedVariant && (
                        <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded inline-block mt-1">
                          {item.selectedVariant.attributes.nome_variante}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-stone-400 mb-0.5">x{item.quantity}</div>
                      <div className="font-semibold text-stone-800">€{((item.attributes.prezzo + (item.selectedVariant?.attributes.prezzo_aggiuntivo || 0)) * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}

                {serviceItems.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-ocean-500 uppercase mb-2">Servizi da Prenotare</h4>
                    {serviceItems.map(item => (
                      <div key={item.id} className="bg-ocean-50 p-4 rounded-xl mb-3 border border-ocean-100">
                        <div className="flex gap-4 mb-3">
                          <div className="w-12 h-12 bg-white rounded-lg border border-ocean-100 flex-shrink-0 overflow-hidden">
                            <img src={item.attributes.immagine} alt={item.attributes.nome} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between font-semibold text-ocean-900">
                              <span>{item.attributes.nome}</span>
                              <span>€{item.attributes.prezzo.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-3">
                          <div>
                            <label className="text-xs text-ocean-700 block mb-1">Data Preferita</label>
                            <input
                              type="date"
                              className="w-full p-2 rounded border border-ocean-200 text-sm"
                              onChange={(e) => updateServiceDetails(item.id, e.target.value, item.serviceNotes || '')}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-ocean-700 block mb-1">Note</label>
                            <textarea
                              className="w-full p-2 rounded border border-ocean-200 text-sm h-16"
                              placeholder="Istruzioni specifiche..."
                              onChange={(e) => updateServiceDetails(item.id, item.serviceDate || '', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Total */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24 border border-stone-100">
                <h3 className="font-bold text-xl mb-4">Riepilogo</h3>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Totale Articoli</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">
                      {wantsLocalDelivery ? 'Consegna a Domicilio' : 'Spedizione'}
                    </span>
                    <div className="text-right">
                      {hasPhysicalItems ? (
                        shippingCost === 0 ? (
                          <span className="text-nature-600 font-bold flex items-center justify-end gap-1">
                            {(wantsLocalDelivery || isFreeShippingThreshold) ? <Truck size={14} /> : null} Gratis
                          </span>
                        ) : (
                          <span className="font-semibold">€{shippingCost.toFixed(2)}</span>
                        )
                      ) : (
                        <span className="text-stone-400">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Local Delivery Note */}
                  {wantsLocalDelivery && hasPhysicalItems && (
                    <div className="text-xs bg-nature-50 text-nature-700 p-2 rounded mt-1 border border-nature-100">
                      <strong>Consegna Locale Attiva</strong><br />
                      Verrai contattato per l'orario.
                    </div>
                  )}

                  {!wantsLocalDelivery && hasPhysicalItems && !isFreeShippingThreshold && (
                    <div className="text-xs text-stone-400 mt-1 text-right">
                      Spedizione gratuita oltre €99
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4 flex justify-between font-bold text-xl text-nature-800">
                    <span>Totale</span>
                    <span>€{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {!canProceed ? (
                  <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm flex gap-2 items-start mb-4">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>Salva il tuo indirizzo di spedizione per procedere al pagamento.</p>
                  </div>
                ) : (
                  <Button
                    className="w-full flex items-center justify-center gap-2 py-3"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Reindirizzamento a Stripe...' : <><CreditCard size={18} /> Paga e Ordina</>}
                  </Button>
                )}

                <p className="text-xs text-center text-stone-400 mt-4 flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Checkout Sicuro via Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
