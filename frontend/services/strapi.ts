
import { Product } from '../types';
import { STRAPI_API_URL } from '../constants';

// Helper to get full image URL
const getImageUrl = (imageData: any) => {
  if (!imageData) return 'https://placehold.co/400x400?text=No+Image';
  if (typeof imageData === 'string') return imageData;

  // Handle Strapi v5 flat response (imageData is the object directly)
  if (imageData.url) {
    const url = imageData.url;
    if (url.startsWith('http')) return url;
    return `http://localhost:1337${url}`;
  }

  // Handle Strapi v4 or nested structure
  const url = imageData.data?.attributes?.url || imageData.attributes?.url;
  if (!url) return 'https://placehold.co/400x400?text=No+Image';

  if (url.startsWith('http')) return url;
  return `http://localhost:1337${url}`;
};

// Helper to extract Gallery Array
const getGalleryUrls = (galleryData: any): string[] => {
  if (!galleryData) return [];

  // v5 flat array
  if (Array.isArray(galleryData)) {
    return galleryData.map((img: any) => {
      const url = img.url;
      if (url && url.startsWith('http')) return url;
      return `http://localhost:1337${url}`;
    });
  }

  // v4 data wrapper
  if (!galleryData.data) return [];
  return galleryData.data.map((img: any) => {
    const url = img.attributes?.url || img.url;
    if (url && url.startsWith('http')) return url;
    return `http://localhost:1337${url}`;
  });
};

// Mapper: Converts Raw Strapi JSON to our App's Product Interface
const mapStrapiProduct = (item: any): Product => {
  try {
    // Strapi v5 returns flat structure, v4 returns nested attributes
    // We normalize to "attributes" concept for our frontend types, or just map directly

    // Check if we have 'attributes' wrapper (v4) or if item is flat (v5)
    const isV4 = !!item.attributes;
    const data = isV4 ? item.attributes : item;
    const id = item.id;

    // Category
    let categoryName = 'Generale';
    if (data.category) {
      // v5 flat: data.category is object
      // v4 nested: data.category.data.attributes
      if (data.category.nome) categoryName = data.category.nome;
      else if (data.category.data?.attributes?.nome) categoryName = data.category.data.attributes.nome;
    } else if (data.categoria) {
      if (data.categoria.nome) categoryName = data.categoria.nome;
      else if (data.categoria.data?.attributes?.nome) categoryName = data.categoria.data.attributes.nome;
    }

    // Animal
    let animalName = 'Tutti';
    if (data.animal) {
      if (data.animal.nome) animalName = data.animal.nome;
      else if (data.animal.data?.attributes?.nome) animalName = data.animal.data.attributes.nome;
    } else if (data.animale) {
      if (data.animale.nome) animalName = data.animale.nome;
      else if (data.animale.data?.attributes?.nome) animalName = data.animale.data.attributes.nome;
    }

    // Variants
    // v5: data.varianti_prodotto is array
    // v4: data.varianti_prodotto.data is array
    let variantsRaw = [];
    if (data.varianti_prodotto) {
      variantsRaw = Array.isArray(data.varianti_prodotto) ? data.varianti_prodotto : (data.varianti_prodotto.data || []);
    } else if (data.product_variants) {
      variantsRaw = Array.isArray(data.product_variants) ? data.product_variants : (data.product_variants.data || []);
    }

    const variants = variantsRaw.map((v: any) => {
      // v5 variant is flat, v4 is nested
      const vData = v.attributes || v;
      return {
        id: Number(v.id),
        attributes: {
          nome_variante: vData.nome_variante || 'Variante',
          prezzo_aggiuntivo: Number(vData.prezzo_aggiuntivo) || 0,
          peso_kg: vData.peso_kg ? Number(vData.peso_kg) : undefined,
          prezzo_scontato: vData.prezzo_scontato ? Number(vData.prezzo_scontato) : undefined,
          opzioni: vData.opzioni || {}
        }
      };
    });

    return {
      id: Number(id),
      attributes: {
        nome: data.nome || 'Prodotto senza nome',
        prezzo: Number(data.prezzo) || 0,
        prezzo_scontato: data.prezzo_scontato ? Number(data.prezzo_scontato) : undefined,
        descrizione: data.descrizione || '', // Rich text or string
        categoria: categoryName,
        animale: animalName,
        is_service: Boolean(data.is_service),
        is_featured: Boolean(data.is_featured),
        immagine: getImageUrl(data.immagine),
        galleria: getGalleryUrls(data.galleria),
        variants: variants
      }
    };
  } catch (e) {
    console.error("Error mapping product:", item, e);
    return null as any;
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Fetch products populate all possible relations name variations
    const query = `${STRAPI_API_URL}/products?populate=*`;

    console.log("Tentativo connessione Strapi:", query);
    const response = await fetch(query);

    if (!response.ok) {
      console.error(`Errore Strapi Status: ${response.status}`);
      throw new Error('Failed to connect to Strapi');
    }

    const json = await response.json();

    if (!json.data || json.data.length === 0) {
      console.warn("Strapi ha risposto OK, ma la lista prodotti è vuota.");
      return [];
    }

    console.log("Prodotti trovati su Strapi:", json.data.length);
    return json.data.map(mapStrapiProduct).filter((p: any) => p !== null);

  } catch (error) {
    console.error("ERRORE FETCH STRAPI:", error);
    return [];
  }
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${STRAPI_API_URL}/products?populate=*&filters[is_featured][$eq]=true&pagination[limit]=3`);
    if (!response.ok) throw new Error('Network response was not ok');
    const json = await response.json();
    if (!json.data || json.data.length === 0) return [];
    return json.data.map(mapStrapiProduct).filter((p: any) => p !== null);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

export const searchProductsPreview = async (query: string): Promise<Product[]> => {
  try {
    if (!query) return [];
    const response = await fetch(`${STRAPI_API_URL}/products?filters[nome][$containsi]=${encodeURIComponent(query)}&pagination[limit]=5&populate=*`);
    if (!response.ok) throw new Error('Search failed');
    const json = await response.json();
    return json.data.map(mapStrapiProduct).filter((p: any) => p !== null);
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

// Dynamic filters
export const fetchCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${STRAPI_API_URL}/categories`);
    const json = await response.json();
    // v5 flat response
    return json.data.map((c: any) => c.nome || c.attributes?.nome);
  } catch (e) {
    console.warn("Categorie Strapi non trovate");
    return [];
  }
};

export const fetchAnimals = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${STRAPI_API_URL}/animals`);
    const json = await response.json();
    // v5 flat response
    return json.data.map((a: any) => a.nome || a.attributes?.nome);
  } catch (e) {
    console.warn("Animali Strapi non trovati");
    return [];
  }
};
