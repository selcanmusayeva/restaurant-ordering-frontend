import api from './api';
import { Table, TableSession } from '../types';

interface QRCodeResponse {
  tableId: number;
  tableNumber: string;
  qrCodeData: string;
  qrCodeUrl: string;
}

const tableService = {
  // Customer endpoints
  startSession: async (tableId: number, qrCode: string): Promise<TableSession> => {
    const response = await api.post<TableSession>(
      `/customer/table/${tableId}/session?qrCode=${qrCode}`
    );
    return response.data;
  },

  getTableByUuid: async (uuid: string): Promise<Table> => {
    const response = await api.get<Table>(`/tables/uuid/${uuid}`);
    return response.data;
  },

  // Waiter endpoints
  getAssignedTables: async (): Promise<Table[]> => {
    const response = await api.get<Table[]>('/waiter/tables');
    return response.data;
  },

  assignTable: async (tableId: number): Promise<void> => {
    await api.post(`/waiter/tables/${tableId}/assign`);
  },

  unassignTable: async (tableId: number): Promise<void> => {
    await api.delete(`/waiter/tables/${tableId}/assign`);
  },

  // Manager endpoints
  getAllTables: async (): Promise<Table[]> => {
    const response = await api.get<Table[]>('/tables');
    return response.data;
  },

  getTableById: async (id: number): Promise<Table> => {
    const response = await api.get<Table>(`/tables/${id}`);
    return response.data;
  },

  createTable: async (table: Omit<Table, 'id' | 'qrCode'>): Promise<Table> => {
    const response = await api.post<Table>('/tables', table);
    return response.data;
  },

  updateTable: async (id: number, table: Partial<Table>): Promise<Table> => {
    const response = await api.put<Table>(`/tables/${id}`, table);
    return response.data;
  },

  deleteTable: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },

  generateQRCode: async (id: number): Promise<QRCodeResponse> => {
    const response = await api.post<QRCodeResponse>(`/tables/qrcode/${id}`);
    return response.data;
  },

  assignTableToWaiter: async (tableId: number, username: string, shiftDate?: string): Promise<void> => {
    const endpoint = `/manager/tables/${tableId}/assign/${username}`;
    const url = shiftDate ? `${endpoint}?shiftDate=${shiftDate}` : endpoint;
    await api.post(url);
  },

  unassignTableFromWaiter: async (tableId: number): Promise<void> => {
    await api.delete(`/manager/tables/${tableId}/assign`);
  }
};

export default tableService; 