import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    console.log('BOOTSTRAP STARTING...');
    try {
      const products = await strapi.documents('api::product.product').findMany({
        filters: {
          nome: 'Prodotto Test',
        },
        status: 'draft',
      });
      console.log('Products found:', products.length);

      if (products.length === 0) {
        console.log('Creating product...');
        await strapi.documents('api::product.product').create({
          data: {
            nome: 'Prodotto Test',
            descrizione: 'Questo è un prodotto di test creato automaticamente.',
            prezzo: 19.99,
            prezzo_scontato: 14.99,
            is_service: false,
            is_featured: true,
          },
          status: 'published',
        });
        console.log('Prodotto Test creato con successo');
      } else {
        console.log('Prodotto Test già esistente');
        const product = products[0];

        // Force update description to ensure it's clean text (fix for migration from blocks to richtext)
        await strapi.documents('api::product.product').update({
          documentId: product.documentId,
          data: {
            descrizione: 'Questo è un prodotto di test creato automaticamente.',
          },
        });
        console.log('Descrizione Prodotto Test aggiornata.');

        if (!product.publishedAt) {
          console.log('Prodotto Test is draft. Publishing...');
          await strapi.documents('api::product.product').publish({
            documentId: product.documentId,
          });
          console.log('Prodotto Test published.');
        }
      }
    } catch (error) {
      console.error('Errore durante la creazione del prodotto test:', error);
    }
  },
};
