import { Property } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class PropertyService {
  static async searchProperties(params: {
    q?: string;
    city?: string;
    propertyType?: string;
    transactionType?: string;
    minPrice?: number;
    maxPrice?: number;
    rooms?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}): Promise<{ properties: Property[]; total: number; page: number; totalPages: number }> {
    console.log('📡 PropertyService: searchProperties called with params:', params);

    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/sale/api/properties?${queryParams}`;
    console.log('🌐 PropertyService: Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 PropertyService: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ PropertyService: Response error:', errorText);
      throw new Error(`Failed to search properties: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ PropertyService: Response data:', result);
    return result;
  }

  static async getPropertyById(id: string): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/sale/api/properties/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get property');
    }

    return response.json();
  }

  static async createProperty(propertyData: Omit<Property, '_id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/sale/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create property');
    }

    return response.json();
  }

  static async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/sale/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update property');
    }

    return response.json();
  }

  static async deleteProperty(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sale/api/properties/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete property');
    }
  }

  static async getUserProperties(userId: string): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/sale/api/properties/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user properties');
    }

    return response.json();
  }
}