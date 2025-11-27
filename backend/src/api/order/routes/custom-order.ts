export default {
    routes: [
        {
            method: 'POST',
            path: '/orders/webhook',
            handler: 'order.webhook',
            config: {
                auth: false, // Public access, signature verification handles security
                middlewares: [],
            },
        },
    ],
};
