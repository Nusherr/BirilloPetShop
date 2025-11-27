export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http:', 'ws:', 'wss:', 'https://api.stripe.com', 'https://checkout.stripe.com', 'https://m.stripe.network', 'https://*.stripe.com', 'https://m.stripe.com'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com', 'https://*.stripe.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'script-src': ["'self'", "'unsafe-inline'", 'blob:', 'https://js.stripe.com', 'https://m.stripe.network', 'https://*.stripe.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
          'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com', 'https://checkout.stripe.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'http://localhost:1337', 'http://localhost:5173', 'http://192.168.1.7:3000', process.env.FRONTEND_URL].filter(Boolean),
      headers: ['*'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
