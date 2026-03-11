import { API_BASE_URL } from './config';

/**
 * Products API Service
 * 
 * Handles communication with the products API endpoints for marketplace filtering.
 */

import { API_BASE_URL } from './config';

export interface Product {
  id: string;
  name: string;
  producttype?: number;
  category?: string;
  subcategory?: string;
  [key: string]: any;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  count: number;
  filter?: string;
}

export class ProductsService {
  /**
   * Get all products
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data: ProductsResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      return [];
    }
  }

  /**
   * Get products filtered by marketplace type
   */
  static async getMarketplaceProducts(type?: string): Promise<Product[]> {
    try {
      let url = `${API_BASE_URL}/api/products/marketplace/filter`;
      if (type) {
        url += `?type=${type}`;
      }
      
      const response = await fetch(url);
      const data: ProductsResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch marketplace products:', error);
      return [];
    }
  }

  /**
   * Get financial products (type: 123950001)
   */
  static async getFinancialProducts(): Promise<Product[]> {
    return this.getMarketplaceProducts('123950001');
  }

  /**
   * Get non-financial products (type: 123950000)
   */
  static async getNonFinancialProducts(): Promise<Product[]> {
    return this.getMarketplaceProducts('123950000');
  }

  /**
   * Get service types for dropdown filtering
   */
  static async getServiceTypes(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/marketplace/metadata`);
      const data = await response.json();
      
      const result = [{ value: 'all', label: 'All Types' }];
      
      if (data.success && data.data) {
        data.data.forEach((item: { value: number; label: string }) => {
          result.push({
            value: item.value === 123950000 ? 'financial' : 'non-financial',
            label: item.label
          });
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get service types:', error);
      return [
        { value: 'all', label: 'All Types' },
        { value: 'financial', label: 'Financial' },
        { value: 'non-financial', label: 'Non Financial' }
      ];
    }
  }

  /**
   * Get sub-service types from servicetype metadata endpoint
   */
  static async getSubServiceTypes(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/servicetype/metadata`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const result = [{ value: 'all', label: 'All Sub-Services' }];
      
      if (data.success && data.data) {
        data.data.forEach((item: { value: any; label: string }) => {
          result.push({
            value: item.value.toString(),
            label: item.label
          });
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get sub-service types:', error);
      return [
        { value: 'all', label: 'All Sub-Services' }
      ];
    }
  }

  /**
   * Get products filtered by sub-service type
   */
  static async getSubServiceProducts(type?: string): Promise<Product[]> {
    try {
      let url = `${API_BASE_URL}/api/products/servicetype/filter`;
      if (type && type !== 'all') {
        url += `?type=${type}`;
      }
      
      const response = await fetch(url);
      const data: ProductsResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch sub-service products:', error);
      return [];
    }
  }

  /**
   * Get regions from accounts metadata endpoint
   */
  static async getRegions(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/region/metadata`);
      const data = await response.json();
      
      const result = [{ value: 'all', label: 'All Regions' }];
      
      if (data.success && data.data) {
        data.data.forEach((item: { value: any; label: string }) => {
          result.push({
            value: item.value.toString().toLowerCase(),
            label: item.label
          });
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get regions:', error);
      return [
        { value: 'all', label: 'All Regions' },
        { value: 'uae', label: 'UAE' },
        { value: 'gcc', label: 'GCC' },
        { value: 'mena', label: 'MENA' },
        { value: 'global', label: 'Global' }
      ];
    }
  }
}

export default ProductsService;