/**
 * inventory controller
 */

export default {
    async decrementStockByBarcode(ctx) {
        const { barcode } = ctx.request.body;

        if (!barcode) {
            return ctx.badRequest('Barcode is required');
        }

        // 1. Search in Products
        const products = await strapi.entityService.findMany('api::product.product', {
            filters: { barcode },
            limit: 1,
        });

        let item = products.length > 0 ? products[0] : null;
        let type = 'product';

        // 2. Search in Variants if not found
        if (!item) {
            const variants = await strapi.entityService.findMany('api::product-variant.product-variant', {
                filters: { barcode },
                limit: 1,
            });
            item = variants.length > 0 ? variants[0] : null;
            type = 'variant';
        }

        if (!item) {
            return ctx.notFound('Product not found');
        }

        // 3. Check Stock
        if (item.stock <= 0) {
            // Return 400 but with the item info so we can show what was scanned
            return ctx.badRequest('Out of stock', { item, type });
        }

        // 4. Decrement Stock
        const newStock = item.stock - 1;

        let updatedItem;
        if (type === 'product') {
            updatedItem = await strapi.entityService.update('api::product.product', item.id, {
                data: { stock: newStock },
            });
        } else {
            updatedItem = await strapi.entityService.update('api::product-variant.product-variant', item.id, {
                data: { stock: newStock },
            });
        }

        return {
            message: 'Stock updated',
            item: updatedItem,
            type
        };
    },

    async lookupByBarcode(ctx) {
        const { barcode } = ctx.params;

        if (!barcode) {
            return ctx.badRequest('Barcode is required');
        }

        // 1. Search in Products
        const products = await strapi.entityService.findMany('api::product.product', {
            filters: { barcode },
            limit: 1,
        });

        let item = products.length > 0 ? products[0] : null;
        let type = 'product';

        // 2. Search in Variants if not found
        if (!item) {
            const variants = await strapi.entityService.findMany('api::product-variant.product-variant', {
                filters: { barcode },
                limit: 1,
            });
            item = variants.length > 0 ? variants[0] : null;
            type = 'variant';
        }

        if (!item) {
            return ctx.notFound('Product not found');
        }

        return {
            item,
            type
        };
    }
};
