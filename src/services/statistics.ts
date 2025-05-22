import api from './api';
import { KitchenStatistics, SystemStatistics } from '../types';

interface SalesReport {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  itemsSold: number;
  salesByHour: Record<string, number>;
}

interface PopularItemsReport {
  itemId: number;
  name: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
  percentageOfSales: number;
}

interface PreparationTimeReport {
  averageTime: string;
  medianTime: string;
  itemsByTime: Record<string, string>;
  preparationTimesByHour: Record<string, string>;
}

const statisticsService = {
  // Kitchen endpoints
  getKitchenStatistics: async (): Promise<KitchenStatistics> => {
    const response = await api.get<KitchenStatistics>('/kitchen/statistics');
    return response.data;
  },

  // Manager endpoints
  getSystemStatistics: async (): Promise<SystemStatistics> => {
    const response = await api.get<SystemStatistics>('/system/stats');
    return response.data;
  },

  // Reports endpoints
  getDailySalesReport: async (date?: string): Promise<SalesReport> => {
    const url = date ? `/reports/sales/daily?date=${date}` : '/reports/sales/daily';
    const response = await api.get<SalesReport>(url);
    return response.data;
  },

  getWeeklySalesReport: async (startDate?: string): Promise<SalesReport> => {
    const url = startDate ? `/reports/sales/weekly?startDate=${startDate}` : '/reports/sales/weekly';
    const response = await api.get<SalesReport>(url);
    return response.data;
  },

  getPopularItems: async (startDate?: string, endDate?: string, limit?: number): Promise<PopularItemsReport[]> => {
    let url = '/reports/popular-items';
    const params: string[] = [];
    
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (limit) params.push(`limit=${limit}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await api.get<PopularItemsReport[]>(url);
    return response.data;
  },

  getAveragePreparationTime: async (startDate?: string, endDate?: string): Promise<PreparationTimeReport> => {
    let url = '/reports/average-preparation-time';
    const params: string[] = [];
    
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await api.get<PreparationTimeReport>(url);
    return response.data;
  }
};

export default statisticsService; 