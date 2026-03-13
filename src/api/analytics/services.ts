import { API_BASE_URL } from './config';

export interface ServiceOption {
  value: number;
  label: string;
}

class ServicesService {
  static async getServicesDropdown(): Promise<ServiceOption[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/marketplace/metadata`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to fetch services dropdown:', error);
      // Return fallback data
      return [
        { value: 0, label: 'All Services' },
        { value: 1, label: 'Financial Services' },
        { value: 2, label: 'Non-Financial Services' }
      ];
    }
  }
}

export default ServicesService;