/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SK as string, {
    apiVersion: '2025-11-17.clover' as any, // Cast to any to avoid strict type checking issues if SDK version mismatches
});

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
    async find(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.unauthorized("You must be logged in to view orders");
        }

        try {
            const data = await strapi.entityService.findMany('api::order.order', {
                filters: {
                    user: user.id,
                    ...(ctx.query.filters as any || {})
                },
                sort: { createdAt: 'desc' },
                populate: '*'
            });

            // Transform response to match standard Strapi format if needed, 
            // but for now returning raw data or wrapping it might be enough.
            // Strapi frontend expects { data: [...] } where items have id and attributes (v4) 
            // or just array (v5)? 
            // entityService returns plain objects.

            // We need to match what Account.tsx expects.
            // Account.tsx expects: data.data.map(...)
            // So we should return { data: data }

            // Wait, entityService returns array of objects with IDs.
            // REST API returns { data: [ { id, attributes: {} } ] } usually.
            // But Account.tsx maps `order.id` and `order.total_paid`.
            // If entityService returns flat objects, we need to adapt Account.tsx or the response.

            // Let's return a format that Account.tsx can handle.
            // Account.tsx: const mappedOrders = data.data.map((order: any) => ({ id: order.id, ... }))
            // So we need { data: [ ... ] }

            return { data: data };

        } catch (error) {
            ctx.badRequest("Error fetching orders", { moreDetails: error });
        }
    },

    async create(ctx) {
        const { user } = ctx.state;
        const { cart_snapshot, shipping_details, total_paid } = ctx.request.body.data;

        if (!user) {
            return ctx.unauthorized('Devi essere loggato per effettuare un ordine');
        }

        if (!cart_snapshot || cart_snapshot.length === 0) {
            return ctx.badRequest('Il carrello è vuoto');
        }

        try {
            // 0. Validate Stock Availability
            for (const item of cart_snapshot) {
                // Skip services
                if (item.is_service) continue;

                let availableStock = 0;
                let productName = item.name;

                if (item.variant_id) {
                    // Check Variant Stock
                    const variant = await strapi.entityService.findOne('api::product-variant.product-variant', item.variant_id);
                    if (!variant) throw new Error(`Variante non trovata: ${item.variant} (${item.name})`);
                    availableStock = variant.stock ?? 0;
                    productName = `${item.name} (${item.variant})`;
                } else {
                    // Check Product Stock
                    const product = await strapi.entityService.findOne('api::product.product', item.id);
                    if (!product) throw new Error(`Prodotto non trovato: ${item.name}`);
                    availableStock = product.stock ?? 0;
                }

                if (availableStock < item.quantity) {
                    return ctx.badRequest(`Stock insufficiente per ${productName}. Disponibili: ${availableStock}, Richiesti: ${item.quantity}`);
                }
            }

            // 1. Calculate Line Items for Stripe
            const lineItems = cart_snapshot.map((item) => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name + (item.variant ? ` (${item.variant})` : ''),
                        images: item.image ? [item.image] : [],
                    },
                    unit_amount: Math.round((item.price) * 100),
                },
                quantity: item.quantity,
            }));

            // 2. Calculate Shipping
            const itemsTotal = cart_snapshot.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const shippingCost = total_paid - itemsTotal;

            if (shippingCost > 0.01) {
                lineItems.push({
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Spedizione',
                        },
                        unit_amount: Math.round(shippingCost * 100),
                    },
                    quantity: 1,
                });
            }

            // 3. Create Stripe Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: user.email,
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/#/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/#/checkout`,
                line_items: lineItems,
                metadata: {
                    userId: user.id,
                    shipping_address: JSON.stringify(shipping_details),
                    cart_snapshot: JSON.stringify(cart_snapshot) // Store snapshot in metadata for webhook access if needed
                },
            });

            // 4. Create Order in Strapi
            const newOrder = await strapi.entityService.create('api::order.order', {
                data: {
                    user: user.id,
                    total_paid: total_paid,
                    stato: 'In Attesa',
                    shipping_details,
                    cart_snapshot,
                    stripe_id: session.id,
                },
            });

            return { stripeSessionId: session.id, url: session.url, id: newOrder.id };

        } catch (error: any) {
            console.error('Order Creation Error:', error);
            return ctx.badRequest(error.message || 'Errore durante la creazione dell\'ordine');
        }
    },

    async webhook(ctx) {
        const stripeSignature = ctx.request.headers['stripe-signature'];
        let event;

        // In production, verify signature here
        event = ctx.request.body;

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const stripeId = session.id;

            try {
                const orders = await strapi.entityService.findMany('api::order.order', {
                    filters: { stripe_id: stripeId },
                });

                if (orders && orders.length > 0) {
                    const order = orders[0];

                    // Update status
                    await strapi.entityService.update('api::order.order', order.id, {
                        data: { stato: 'Pagato' },
                    });

                    // DECREMENT STOCK
                    const cartItems = order.cart_snapshot as any[];
                    if (cartItems && Array.isArray(cartItems)) {
                        for (const item of cartItems) {
                            if (item.is_service) continue;

                            try {
                                if (item.variant_id) {
                                    // Decrement Variant
                                    const variant = await strapi.entityService.findOne('api::product-variant.product-variant', item.variant_id);
                                    if (variant) {
                                        const newStock = Math.max(0, (variant.stock || 0) - item.quantity);
                                        await strapi.entityService.update('api::product-variant.product-variant', item.variant_id, {
                                            data: { stock: newStock }
                                        });
                                        console.log(`Decremented stock for variant ${variant.id}: ${variant.stock} -> ${newStock}`);
                                    }
                                } else {
                                    // Decrement Product
                                    const product = await strapi.entityService.findOne('api::product.product', item.id);
                                    if (product) {
                                        const newStock = Math.max(0, (product.stock || 0) - item.quantity);
                                        await strapi.entityService.update('api::product.product', item.id, {
                                            data: { stock: newStock }
                                        });
                                        console.log(`Decremented stock for product ${product.id}: ${product.stock} -> ${newStock}`);
                                    }
                                }
                            } catch (err) {
                                console.error(`Failed to decrement stock for item ${item.name}`, err);
                            }
                        }
                    }

                    console.log(`Order ${order.id} processed successfully`);
                } else {
                    console.warn(`No order found for Stripe Session ${stripeId}`);
                }
            } catch (err) {
                console.error('Error updating order via webhook:', err);
                return ctx.internalServerError('Error updating order');
            }
        }

        return { received: true };
    },
}));
