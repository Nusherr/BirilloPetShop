export default {
    routes: [
        {
            method: 'POST',
            path: '/inventory/scan',
            handler: 'inventory.decrementStockByBarcode',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/inventory/lookup/:barcode',
            handler: 'inventory.lookupByBarcode',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
    ],
};
