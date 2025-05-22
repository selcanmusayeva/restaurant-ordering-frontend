import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Table, TableSession } from '../../types';
import tableService from '../../services/table';

interface TableState {
  tables: Table[];
  selectedTable: Table | null;
  tableSession: TableSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: TableState = {
  tables: [],
  selectedTable: null,
  tableSession: null,
  loading: false,
  error: null,
};

// Customer actions
export const startTableSession = createAsyncThunk(
  'table/startTableSession',
  async ({ tableId, qrCode }: { tableId: number; qrCode: string }, { rejectWithValue }) => {
    try {
      const session = await tableService.startSession(tableId, qrCode);
      return session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start table session');
    }
  }
);

// Waiter actions
export const getAssignedTables = createAsyncThunk(
  'table/getAssignedTables',
  async (_, { rejectWithValue }) => {
    try {
      const tables = await tableService.getAssignedTables();
      return tables;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned tables');
    }
  }
);

export const assignTable = createAsyncThunk(
  'table/assignTable',
  async (tableId: number, { rejectWithValue }) => {
    try {
      await tableService.assignTable(tableId);
      return tableId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign table');
    }
  }
);

export const unassignTable = createAsyncThunk(
  'table/unassignTable',
  async (tableId: number, { rejectWithValue }) => {
    try {
      await tableService.unassignTable(tableId);
      return tableId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unassign table');
    }
  }
);

// Manager actions
export const getAllTables = createAsyncThunk(
  'table/getAllTables',
  async (_, { rejectWithValue }) => {
    try {
      const tables = await tableService.getAllTables();
      return tables;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all tables');
    }
  }
);

export const getTableById = createAsyncThunk(
  'table/getTableById',
  async (id: number, { rejectWithValue }) => {
    try {
      const table = await tableService.getTableById(id);
      return table;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch table');
    }
  }
);

export const createTable = createAsyncThunk(
  'table/createTable',
  async (table: Omit<Table, 'id' | 'qrCode'>, { rejectWithValue }) => {
    try {
      const newTable = await tableService.createTable(table);
      return newTable;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create table');
    }
  }
);

export const updateTable = createAsyncThunk(
  'table/updateTable',
  async ({ id, data }: { id: number; data: Partial<Table> }, { rejectWithValue }) => {
    try {
      const updatedTable = await tableService.updateTable(id, data);
      return updatedTable;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update table');
    }
  }
);

export const deleteTable = createAsyncThunk(
  'table/deleteTable',
  async (id: number, { rejectWithValue }) => {
    try {
      await tableService.deleteTable(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete table');
    }
  }
);

export const generateQRCode = createAsyncThunk(
  'table/generateQRCode',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await tableService.generateQRCode(id);
      return { id, qrCode: response.qrCodeData };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate QR code');
    }
  }
);

export const assignTableToWaiter = createAsyncThunk(
  'table/assignTableToWaiter',
  async ({ tableId, username, shiftDate }: { tableId: number; username: string; shiftDate?: string }, { rejectWithValue }) => {
    try {
      await tableService.assignTableToWaiter(tableId, username, shiftDate);
      return { tableId, username };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign table to waiter');
    }
  }
);

export const unassignTableFromWaiter = createAsyncThunk(
  'table/unassignTableFromWaiter',
  async (tableId: number, { rejectWithValue }) => {
    try {
      await tableService.unassignTableFromWaiter(tableId);
      return tableId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unassign table from waiter');
    }
  }
);

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setSelectedTable: (state, action: PayloadAction<Table | null>) => {
      state.selectedTable = action.payload;
    },
    clearTableSession: (state) => {
      state.tableSession = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Table Session
      .addCase(startTableSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTableSession.fulfilled, (state, action) => {
        state.loading = false;
        state.tableSession = action.payload;
      })
      .addCase(startTableSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Assigned Tables
      .addCase(getAssignedTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssignedTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload;
      })
      .addCase(getAssignedTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get All Tables
      .addCase(getAllTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload;
      })
      .addCase(getAllTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Table By Id
      .addCase(getTableById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTableById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTable = action.payload;
      })
      .addCase(getTableById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Table
      .addCase(createTable.fulfilled, (state, action) => {
        state.tables.push(action.payload);
      })
      
      // Update Table
      .addCase(updateTable.fulfilled, (state, action) => {
        const index = state.tables.findIndex(table => table.id === action.payload.id);
        if (index !== -1) {
          state.tables[index] = action.payload;
        }
        if (state.selectedTable?.id === action.payload.id) {
          state.selectedTable = action.payload;
        }
      })
      
      // Delete Table
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.tables = state.tables.filter(table => table.id !== action.payload);
        if (state.selectedTable?.id === action.payload) {
          state.selectedTable = null;
        }
      })
      
      // Generate QR Code
      .addCase(generateQRCode.fulfilled, (state, action) => {
        const { id, qrCode } = action.payload;
        const tableIndex = state.tables.findIndex(table => table.id === id);
        if (tableIndex !== -1) {
          state.tables[tableIndex].qrCode = qrCode;
        }
        if (state.selectedTable?.id === id) {
          state.selectedTable.qrCode = qrCode;
        }
      });
  },
});

export const { setSelectedTable, clearTableSession, clearError } = tableSlice.actions;
export default tableSlice.reducer; 