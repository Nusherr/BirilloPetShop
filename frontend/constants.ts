

import { Product } from './types';

// Mock Data Removed
export const MOCK_PRODUCTS: Product[] = [];

// SAFE ENVIRONMENT VARIABLE ACCESS
const getEnvVar = (key: string, fallback: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Ignore errors
  }
  return fallback;
};

export const STRAPI_API_URL = getEnvVar('VITE_STRAPI_URL', 'http://localhost:1337/api');