import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { scanBarcode, lookupProductByBarcode } from '../services/strapi';
import { Layout } from '../components/Layout';
import { Check, X, Package, Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Camera } from 'lucide-react';

interface CartItem {
    product: any;
    quantity: number;
    scannedBarcode: string;
    type: string;
}

interface ScanResult {
    message: string;
    item: any;
    quantity?: number;
    totalPrice?: number;
    type: string;
    timestamp: Date;
    status: 'success' | 'error';
}

const POS: React.FC = () => {
    const [barcode, setBarcode] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [logs, setLogs] = useState<ScanResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [cameras, setCameras] = useState<Array<{ id: string, label: string }>>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep focus on input unless interacting with UI
    useEffect(() => {
        const focusInput = (e: MouseEvent) => {
            // Only refocus if clicking outside of buttons/inputs and scanner is not open
            if (!showScanner && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'INPUT') {
                inputRef.current?.focus();
            }
        };
        // Initial focus
        if (!showScanner) inputRef.current?.focus();

        window.addEventListener('click', focusInput);
        return () => window.removeEventListener('click', focusInput);
    }, [showScanner]);

    // Handle Camera Scanner
    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;

        const startScanning = async () => {
            if (showScanner && selectedCameraId) {
                try {
                    // Ensure element exists
                    if (!document.getElementById("reader")) return;

                    html5QrCode = new Html5Qrcode("reader");

                    await html5QrCode.start(
                        selectedCameraId,
                        {
                            fps: 10,
                            // videoConstraints removed to use default settings
                        },
                        async (decodedText) => {
                            // Success
                            await html5QrCode?.stop();
                            html5QrCode = null;
                            setShowScanner(false);

                            setLoading(true);
                            try {
                                const result = await lookupProductByBarcode(decodedText);
                                if (result && result.item) {
                                    addToCart(result.item, result.type, decodedText);
                                } else {
                                    throw new Error('Prodotto non trovato');
                                }
                            } catch (error: any) {
                                const errorItem: ScanResult = {
                                    message: `ERRORE: ${error.message} (Codice: ${decodedText})`,
                                    item: null,
                                    type: 'error',
                                    timestamp: new Date(),
                                    status: 'error'
                                };
                                setLogs(prev => [errorItem, ...prev]);
                            } finally {
                                setLoading(false);
                            }
                        },
                        (errorMessage) => {
                            // parse error, ignore
                        }
                    );
                } catch (err: any) {
                    console.error("Errore avvio camera", err);
                    alert(`Impossibile avviare la fotocamera: ${err.name || err.message}`);
                    setShowScanner(false);
                }
            }
        };

        // Fetch cameras if needed
        const initCameras = async () => {
            if (showScanner && cameras.length === 0) {
                try {
                    const devices = await Html5Qrcode.getCameras();
                    if (devices && devices.length) {
                        setCameras(devices);
                        if (!selectedCameraId) setSelectedCameraId(devices[0].id);
                    } else {
                        alert("Nessuna fotocamera trovata.");
                    }
                } catch (err) {
                    console.error("Error fetching cameras", err);
                    alert("Errore permessi fotocamera");
                }
            }
        };

        initCameras().then(() => {
            startScanning();
        });

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error("Failed to stop", err));
            }
        };
    }, [showScanner, selectedCameraId]);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcode.trim() || loading) return;

        setLoading(true);
        const code = barcode;
        setBarcode(''); // Clear input immediately

        try {
            // 1. Lookup product
            const result = await lookupProductByBarcode(code);

            if (result && result.item) {
                addToCart(result.item, result.type, code);
            } else {
                throw new Error('Prodotto non trovato');
            }

        } catch (error: any) {
            // Log error immediately
            const errorItem: ScanResult = {
                message: `ERRORE: ${error.message} (Codice: ${code})`,
                item: null,
                type: 'error',
                timestamp: new Date(),
                status: 'error'
            };
            setLogs(prev => [errorItem, ...prev]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item: any, type: string, code: string) => {
        setCart(prev => {
            const existingIndex = prev.findIndex(i => i.scannedBarcode === code);
            if (existingIndex >= 0) {
                // Check stock limit
                const currentQty = prev[existingIndex].quantity;
                if (currentQty >= item.stock) {
                    alert(`Attenzione: Stock insufficiente per ${item.nome || item.nome_variante} (Max: ${item.stock})`);
                    return prev;
                }

                const newCart = [...prev];
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: newCart[existingIndex].quantity + 1
                };
                return newCart;
            } else {
                if (item.stock <= 0) {
                    alert(`Attenzione: Prodotto esaurito!`);
                    return prev;
                }
                return [{ product: item, quantity: 1, scannedBarcode: code, type }, ...prev];
            }
        });
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev => {
            const newCart = [...prev];
            const item = { ...newCart[index] }; // Copy item
            const newQty = item.quantity + delta;

            if (newQty <= 0) {
                return prev.filter((_, i) => i !== index);
            }

            if (newQty > item.product.stock) {
                alert(`Stock massimo raggiunto (${item.product.stock})`);
                return prev;
            }

            item.quantity = newQty;
            newCart[index] = item;
            return newCart;
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!confirm(`Confermi la vendita di ${cart.reduce((acc, i) => acc + i.quantity, 0)} articoli per €${calculateTotal().toFixed(2)}?`)) return;

        setLoading(true);

        // Process items sequentially
        for (const cartItem of cart) {
            let successCount = 0;
            let lastResultItem = null;

            for (let i = 0; i < cartItem.quantity; i++) {
                try {
                    const result = await scanBarcode(cartItem.scannedBarcode);
                    successCount++;
                    lastResultItem = result.item;
                } catch (error: any) {
                    const errorItem: ScanResult = {
                        message: `ERRORE VENDITA: ${error.message} (${cartItem.product.nome})`,
                        item: cartItem.product,
                        type: 'error',
                        timestamp: new Date(),
                        status: 'error'
                    };
                    setLogs(prev => [errorItem, ...prev]);
                }
            }

            if (successCount > 0 && lastResultItem) {
                const price = Number(lastResultItem.prezzo_scontato || lastResultItem.prezzo || lastResultItem.prezzo_aggiuntivo || 0);
                const logItem: ScanResult = {
                    message: lastResultItem.nome || lastResultItem.nome_variante,
                    item: lastResultItem,
                    quantity: successCount,
                    totalPrice: price * successCount,
                    type: cartItem.type,
                    timestamp: new Date(),
                    status: 'success'
                };
                setLogs(prev => [logItem, ...prev]);
            }
        }

        setCart([]);
        setLoading(false);
        inputRef.current?.focus();
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.product.prezzo_scontato || item.product.prezzo || item.product.prezzo_aggiuntivo || 0;
            return total + (Number(price) * item.quantity);
        }, 0);
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">
                <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                    <ShoppingCart className="text-primary" /> Terminale POS
                </h1>

                {/* Camera Modal */}
                {showScanner && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
                            <button
                                onClick={() => setShowScanner(false)}
                                className="absolute top-4 right-4 text-stone-500 hover:text-red-500"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold mb-4 text-center">Scansiona Codice a Barre</h2>

                            {cameras.length > 1 && (
                                <div className="mb-4">
                                    <select
                                        value={selectedCameraId}
                                        onChange={(e) => setSelectedCameraId(e.target.value)}
                                        className="w-full p-2 border rounded-lg bg-stone-50 text-stone-700"
                                    >
                                        {cameras.map(cam => (
                                            <option key={cam.id} value={cam.id}>
                                                {cam.label || `Camera ${cam.id.substring(0, 5)}...`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div id="reader" className="w-full overflow-hidden rounded-lg bg-black"></div>

                            <p className="text-center text-sm text-stone-500 mt-4">Inquadra il codice a barre del prodotto</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                    {/* LEFT COLUMN: Scanner & Cart */}
                    <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
                        {/* Scanner Input */}
                        <div className="bg-white p-6 rounded-xl shadow-lg shrink-0">
                            <form onSubmit={handleScan} className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        placeholder="Scansiona codice a barre..."
                                        className="w-full pl-12 p-4 text-2xl border-2 border-primary rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/30 font-mono"
                                        autoComplete="off"
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="bg-stone-100 text-stone-600 px-4 rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center"
                                    title="Usa Fotocamera"
                                >
                                    <Camera size={24} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                                >
                                    {loading ? '...' : 'AGGIUNGI'}
                                </button>
                            </form>
                        </div>

                        {/* Cart List */}
                        <div className="bg-white rounded-xl shadow-lg flex-1 overflow-hidden flex flex-col">
                            <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
                                <h2 className="font-bold text-lg text-stone-700">Carrello Corrente</h2>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                                    {cart.reduce((acc, i) => acc + i.quantity, 0)} Articoli
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-50">
                                        <ShoppingCart size={64} className="mb-4" />
                                        <p className="text-xl">Il carrello è vuoto</p>
                                        <p className="text-sm">Scansiona un prodotto per iniziare</p>
                                    </div>
                                ) : (
                                    cart.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors bg-white group">
                                            {/* Image */}
                                            <div className="w-16 h-16 bg-stone-100 rounded-md shrink-0 overflow-hidden">
                                                {item.product.immagine ? (
                                                    <img src={item.product.immagine.url ? `http://localhost:1337${item.product.immagine.url}` : 'https://placehold.co/100'} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-full h-full p-4 text-stone-300" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-stone-800 truncate">{item.product.nome || item.product.nome_variante}</h3>
                                                <div className="flex items-center gap-2 text-sm text-stone-500">
                                                    <span className="font-mono bg-stone-100 px-1 rounded">{item.scannedBarcode}</span>
                                                    <span>•</span>
                                                    <span className="text-nature-600 font-bold">€{Number(item.product.prezzo_scontato || item.product.prezzo || item.product.prezzo_aggiuntivo).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1">
                                                <button onClick={() => updateQuantity(index, -1)} className="p-2 hover:bg-white rounded-md shadow-sm transition-all text-stone-600 hover:text-red-500">
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(index, 1)} className="p-2 hover:bg-white rounded-md shadow-sm transition-all text-stone-600 hover:text-green-600">
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Total & Remove */}
                                            <div className="text-right min-w-[80px]">
                                                <div className="font-bold text-lg">€{(Number(item.product.prezzo_scontato || item.product.prezzo || item.product.prezzo_aggiuntivo) * item.quantity).toFixed(2)}</div>
                                            </div>

                                            <button onClick={() => removeFromCart(index)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer Totals */}
                            <div className="p-6 bg-stone-900 text-white mt-auto">
                                <div className="flex justify-between items-end mb-6">
                                    <div className="text-stone-400">Totale da pagare</div>
                                    <div className="text-4xl font-bold text-green-400">€{calculateTotal().toFixed(2)}</div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || loading}
                                    className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-stone-700 disabled:text-stone-500 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-green-900/20"
                                >
                                    {loading ? (
                                        'Elaborazione...'
                                    ) : (
                                        <>
                                            <CreditCard /> CONCLUDI VENDITA
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Logs */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden h-full">
                        <div className="p-4 border-b bg-stone-50">
                            <h2 className="font-bold text-lg text-stone-700">Ultime Transazioni</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
                            {logs.length === 0 ? (
                                <div className="text-center text-stone-400 py-12">
                                    <p>Nessuna attività recente</p>
                                </div>
                            ) : (
                                logs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border-l-4 text-sm shadow-sm bg-white ${log.status === 'success'
                                            ? 'border-green-500'
                                            : 'border-red-500'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-bold ${log.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                                {log.status === 'success' ? 'VENDITA' : 'ERRORE'}
                                            </span>
                                            <span className="text-xs text-stone-400">{log.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-stone-700 font-bold text-base leading-tight">{log.message}</p>
                                        {log.status === 'success' && log.quantity && log.totalPrice && (
                                            <div className="mt-1 flex justify-between items-center text-stone-600 bg-stone-50 p-1 rounded">
                                                <span>Qtà: <span className="font-bold">{log.quantity}</span></span>
                                                <span className="font-bold text-nature-600">Tot: €{log.totalPrice.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default POS;
