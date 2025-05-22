import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem, Category } from '../../types';
import menuService, { 
  CreateMenuItemRequest, 
  UpdateMenuItemRequest, 
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '../../services/menu';

interface MenuState {
  items: MenuItem[];
  categories: Category[];
  selectedCategory: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  items: [],
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

export const fetchMenu = createAsyncThunk(
  'menu/fetchMenu',
  async (_, { rejectWithValue }) => {
    try {
      const menu = await menuService.getAvailableMenuItems();
      return menu;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await menuService.getCategories();
      return categories;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryItems = createAsyncThunk(
  'menu/fetchCategoryItems',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const items = await menuService.getAvailableMenuItems();
      return { categoryId, items: items.filter((item: MenuItem) => item.categoryId === categoryId) };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category items');
    }
  }
);

export const createCategory = createAsyncThunk(
  'menu/createCategory',
  async (category: CreateCategoryRequest, { rejectWithValue }) => {
    try {
      const newCategory = await menuService.createCategory(category);
      return newCategory;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'menu/updateCategory',
  async ({ id, data }: { id: number; data: UpdateCategoryRequest }, { rejectWithValue }) => {
    try {
      const updatedCategory = await menuService.updateCategory(id, data);
      return updatedCategory;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'menu/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      await menuService.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

export const createMenuItem = createAsyncThunk(
  'menu/createMenuItem',
  async (menuItem: CreateMenuItemRequest, { rejectWithValue }) => {
    try {
      const newMenuItem = await menuService.createMenuItem(menuItem);
      return newMenuItem;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create menu item');
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateMenuItem',
  async ({ id, data }: { id: number; data: UpdateMenuItemRequest }, { rejectWithValue }) => {
    try {
      const updatedMenuItem = await menuService.updateMenuItem(id, data);
      return updatedMenuItem;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update menu item');
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async (id: number, { rejectWithValue }) => {
    try {
      await menuService.deleteMenuItem(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu item');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<number | null>) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Menu
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Category Items
      .addCase(fetchCategoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryItems.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, items } = action.payload;
        state.selectedCategory = categoryId;
        state.items = items;
      })
      .addCase(fetchCategoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Category
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      
      // Update Category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(category => category.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      
      // Delete Category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(category => category.id !== action.payload);
      })
      
      // Create Menu Item
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update Menu Item
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete Menu Item
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { setSelectedCategory, clearError } = menuSlice.actions;
export default menuSlice.reducer; 