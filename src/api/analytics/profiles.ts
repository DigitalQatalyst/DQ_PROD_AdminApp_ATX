import { API_BASE_URL } from './config';

/**
 * Profiles API Service
 * 
 * Handles communication with the profiles API endpoints for CRM data.
 */

export interface BusinessSizeResponse {
  success: boolean;
  data: Array<{ value: any; label: string }>;
}

export class ProfilesService {
  /**
   * Get business size metadata from CRM
   */
  static async getBusinessSizes(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/businesssize/metadata`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: BusinessSizeResponse = await response.json();
      
      const result = [{ value: 'all', label: 'All Sizes' }];
      
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
      console.error('Failed to get business sizes:', error);
      return [
        { value: 'all', label: 'All Sizes' },
        { value: '123950000', label: 'Micro' },
        { value: '123950001', label: 'Small' },
        { value: '123950002', label: 'Medium' },
        { value: '123950003', label: 'Large' }
      ];
    }
  }

  /**
   * Get filtered business profiles by size
   */
  static async getBusinessProfilesBySize(size: string): Promise<any[]> {
    try {
      const url = size === 'all' 
        ? `${API_BASE_URL}/api/profiles/businesssize/filter`
        : `${API_BASE_URL}/api/profiles/businesssize/filter?size=${size}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Failed to get business profiles by size:', error);
      return [];
    }
  }
}

export default ProfilesService;