import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { KitchenStatistics, SystemStatistics } from '../../types';
import statisticsService from '../../services/statistics';

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

interface StatisticsState {
  kitchenStats: KitchenStatistics | null;
  systemStats: SystemStatistics | null;
  dailySalesReport: SalesReport | null;
  weeklySalesReport: SalesReport | null;
  popularItems: PopularItemsReport[] | null;
  preparationTimeReport: PreparationTimeReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatisticsState = {
  kitchenStats: null,
  systemStats: null,
  dailySalesReport: null,
  weeklySalesReport: null,
  popularItems: null,
  preparationTimeReport: null,
  loading: false,
  error: null,
};

// Kitchen statistics
export const fetchKitchenStatistics = createAsyncThunk(
  'statistics/fetchKitchenStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await statisticsService.getKitchenStatistics();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch kitchen statistics');
    }
  }
);

// System statistics
export const fetchSystemStatistics = createAsyncThunk(
  'statistics/fetchSystemStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await statisticsService.getSystemStatistics();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system statistics');
    }
  }
);

// Daily sales report
export const fetchDailySalesReport = createAsyncThunk(
  'statistics/fetchDailySalesReport',
  async (date: string | undefined, { rejectWithValue }) => {
    try {
      const report = await statisticsService.getDailySalesReport(date);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily sales report');
    }
  }
);

// Weekly sales report
export const fetchWeeklySalesReport = createAsyncThunk(
  'statistics/fetchWeeklySalesReport',
  async (startDate: string | undefined, { rejectWithValue }) => {
    try {
      const report = await statisticsService.getWeeklySalesReport(startDate);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch weekly sales report');
    }
  }
);

// Popular items report
export const fetchPopularItems = createAsyncThunk(
  'statistics/fetchPopularItems',
  async ({ startDate, endDate, limit }: { startDate?: string; endDate?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const items = await statisticsService.getPopularItems(startDate, endDate, limit);
      return items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular items');
    }
  }
);

// Preparation time report
export const fetchPreparationTimeReport = createAsyncThunk(
  'statistics/fetchPreparationTimeReport',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const report = await statisticsService.getAveragePreparationTime(startDate, endDate);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch preparation time report');
    }
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Kitchen Statistics
      .addCase(fetchKitchenStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKitchenStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenStats = action.payload;
      })
      .addCase(fetchKitchenStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // System Statistics
      .addCase(fetchSystemStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStats = action.payload;
      })
      .addCase(fetchSystemStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Daily Sales Report
      .addCase(fetchDailySalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailySalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.dailySalesReport = action.payload;
      })
      .addCase(fetchDailySalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Weekly Sales Report
      .addCase(fetchWeeklySalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklySalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklySalesReport = action.payload;
      })
      .addCase(fetchWeeklySalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Popular Items
      .addCase(fetchPopularItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularItems.fulfilled, (state, action) => {
        state.loading = false;
        state.popularItems = action.payload;
      })
      .addCase(fetchPopularItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Preparation Time Report
      .addCase(fetchPreparationTimeReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPreparationTimeReport.fulfilled, (state, action) => {
        state.loading = false;
        state.preparationTimeReport = action.payload;
      })
      .addCase(fetchPreparationTimeReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = statisticsSlice.actions;
export default statisticsSlice.reducer; 