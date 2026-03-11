
import axios from 'axios';

export interface ServiceTypeMetadata {
  value: string;
  label: string;
}

export const fetchServiceTypeMetadata = async (): Promise<ServiceTypeMetadata[]> => {
  try {
    const response = await axios.get<{ success: boolean; data: ServiceTypeMetadata[]; message?: string }>('/api/products/servicetype/metadata');
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch service type metadata');
    }
  } catch (error) {
    console.error('Error fetching service type metadata:', error);
    throw error;
  }
};
