import api from "./api";
import { MenuItem, Category } from "../types";

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  menuId: number;
  available?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  displayOrder: number;
  description?: string;
  active?: boolean;
}

export interface UpdateMenuItemRequest extends CreateMenuItemRequest {
  id: number;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: number;
}

const menuService = {
  getMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await api.get<MenuItem>(`/menu/items/${id}`);
    return response.data;
  },

  createMenuItem: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.post<MenuItem>("/menu/items", data);
    return response.data;
  },

  updateMenuItem: async (
    id: number,
    data: UpdateMenuItemRequest
  ): Promise<MenuItem> => {
    const response = await api.put<MenuItem>(`/menu/items/${id}`, data);
    return response.data;
  },

  deleteMenuItem: async (id: number): Promise<void> => {
    await api.delete(`/menu/items/${id}`);
  },

  uploadMenuItemImage: async (id: number, image: File): Promise<MenuItem> => {
    const formData = new FormData();
    formData.append("image", image);
    const response = await api.post<MenuItem>(
      `/menu/items/${id}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getAvailableMenuItems: async (): Promise<MenuItem[]> => {
    const response = await api.get<MenuItem[]>("/menu/items/available");
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/menu/categories");
    return response.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const categories = await menuService.getCategories();
    const nextDisplayOrder =
      Math.max(...categories.map((c) => c.displayOrder), 0) + 1;

    const categoryData = {
      ...data,
      displayOrder: data.displayOrder || nextDisplayOrder,
    };

    const response = await api.post<Category>("/menu/categories", categoryData);
    return response.data;
  },

  updateCategory: async (
    id: number,
    data: UpdateCategoryRequest
  ): Promise<Category> => {
    const response = await api.put<Category>(`/menu/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/menu/categories/${id}`);
  },

  getItemsByCategory: async (categoryId: number): Promise<MenuItem[]> => {
    const response = await api.get<MenuItem[]>(
      `/menu/categories/${categoryId}/items`
    );
    return response.data;
  },

  updateCategoryOrder: async (categoryIds: number[]): Promise<void> => {
    try {
      const response = await api.post('/display-order/categories', categoryIds);
      return response.data;
    } catch (error) {
      console.error('Error updating category order:', error);
      throw error;
    }
  },

  updateMenuItemOrder: async (categoryId: number, menuItemIds: number[]): Promise<void> => {
    try {
      const response = await api.post(`/display-order/menu-items/${categoryId}`, menuItemIds);
      return response.data;
    } catch (error) {
      console.error('Error updating menu item order:', error);
      throw error;
    }
  },
};

export default menuService;
