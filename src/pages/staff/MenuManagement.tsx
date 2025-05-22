import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useAppSelector } from "../../store/hooks";
import { UserRole } from "../../types";
import menuService, {
  CreateMenuItemRequest,
  CreateCategoryRequest,
  UpdateMenuItemRequest,
  UpdateCategoryRequest,
} from "../../services/menu";
import { MenuItem as MenuItemType, Category } from "../../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-management-tabpanel-${index}`}
      aria-labelledby={`menu-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MenuManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItemType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState<CreateMenuItemRequest>({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
    menuId: 1,
    available: true,
  });
  const [categoryFormData, setCategoryFormData] =
    useState<CreateCategoryRequest>({
      name: "",
      displayOrder: 0,
      description: "",
      active: true,
    });

  useEffect(() => {
    if (user?.role !== UserRole.MANAGER) {
      navigate("/staff/orders");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const sortByDisplayOrder = <T extends { displayOrder?: number }>(
    items: T[]
  ): T[] => {
    return [...items].sort((a, b) => {
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 0;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 0;
      return orderA - orderB;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [items, cats] = await Promise.all([
        menuService.getAvailableMenuItems(),
        menuService.getCategories(),
      ]);

      const sortedCategories = sortByDisplayOrder(cats);
      setCategories(sortedCategories);

      const sortedItems = [...items].sort((a, b) => {
        if (a.categoryId !== b.categoryId) {
          return a.categoryId - b.categoryId;
        }

        const orderA = a.displayOrder !== undefined ? a.displayOrder : 0;
        const orderB = b.displayOrder !== undefined ? b.displayOrder : 0;
        return orderA - orderB;
      });

      setMenuItems(sortedItems);

      if (sortedCategories.length > 0) {
        const initialCategoryId = sortedCategories[0].id;
        setSelectedCategoryId(initialCategoryId);
        const initialFiltered = sortedItems.filter(
          (item) => item.categoryId === initialCategoryId
        );
        setFilteredMenuItems(initialFiltered);
      }

      setError(null);
    } catch (err) {
      setError("Failed to fetch menu data");
      console.error("Error fetching menu data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenItemDialog = (item?: MenuItemType) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        menuId: item.menuId,
        available: item.available,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        categoryId: selectedCategoryId || categories[0]?.id || 0,
        menuId: 1,
        available: true,
      });
    }
    setOpenItemDialog(true);
  };

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setCategoryFormData({
        name: category.name,
        displayOrder: category.displayOrder || 0,
        description: category.description || "",
        active: category.active,
      });
    } else {
      setSelectedCategory(null);

      const nextOrder =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.displayOrder || 0)) + 1
          : 0;

      setCategoryFormData({
        name: "",
        displayOrder: nextOrder,
        description: "",
        active: true,
      });
    }
    setOpenCategoryDialog(true);
  };

  const handleCloseItemDialog = () => {
    setOpenItemDialog(false);
    setSelectedItem(null);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setSelectedCategory(null);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        const updateData: UpdateMenuItemRequest = {
          id: selectedItem.id,
          ...formData,
        };
        await menuService.updateMenuItem(selectedItem.id, updateData);
      } else {
        const categoryItems = menuItems.filter(
          (item) => item.categoryId === formData.categoryId
        );
        const nextOrder =
          categoryItems.length > 0
            ? Math.max(...categoryItems.map((item) => item.displayOrder || 0)) +
              1
            : 0;

        await menuService.createMenuItem({
          ...formData,
        });
      }
      await fetchData();
      handleCloseItemDialog();
    } catch (err) {
      setError("Failed to save menu item");
      console.error("Error saving menu item:", err);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        const updateData: UpdateCategoryRequest = {
          id: selectedCategory.id,
          ...categoryFormData,
        };
        await menuService.updateCategory(selectedCategory.id, updateData);
      } else {
        await menuService.createCategory(categoryFormData);
      }
      await fetchData();
      handleCloseCategoryDialog();
    } catch (err) {
      setError("Failed to save category");
      console.error("Error saving category:", err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await menuService.deleteMenuItem(id);
        await fetchData();
      } catch (err) {
        setError("Failed to delete menu item");
        console.error("Error deleting menu item:", err);
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await menuService.deleteCategory(id);
        await fetchData();
      } catch (err) {
        setError("Failed to delete category");
        console.error("Error deleting category:", err);
      }
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    const filtered = menuItems.filter((item) => item.categoryId === categoryId);

    const sortedFiltered = sortByDisplayOrder(filtered);
    setFilteredMenuItems(sortedFiltered);
  };

  const moveItemUp = async (index: number) => {
    if (index === 0 || !selectedCategoryId) return;

    const updatedItems = [...filteredMenuItems];
    const item = updatedItems[index];
    updatedItems[index] = updatedItems[index - 1];
    updatedItems[index - 1] = item;

    const updatedWithOrder = updatedItems.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));

    setFilteredMenuItems(updatedWithOrder);

    setMenuItems((prevItems) => {
      const newItems = [...prevItems];
      updatedWithOrder.forEach((updatedItem) => {
        const index = newItems.findIndex((item) => item.id === updatedItem.id);
        if (index !== -1) {
          newItems[index] = updatedItem;
        }
      });
      return newItems;
    });

    try {
      await menuService.updateMenuItemOrder(
        selectedCategoryId,
        updatedWithOrder.map((item) => item.id)
      );
    } catch (err) {
      setError("Failed to update menu item order");
      console.error("Error updating menu item order:", err);

      handleCategoryChange(selectedCategoryId);
    }
  };

  const moveItemDown = async (index: number) => {
    if (index === filteredMenuItems.length - 1 || !selectedCategoryId) return;

    const updatedItems = [...filteredMenuItems];
    const item = updatedItems[index];
    updatedItems[index] = updatedItems[index + 1];
    updatedItems[index + 1] = item;

    const updatedWithOrder = updatedItems.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));

    setFilteredMenuItems(updatedWithOrder);

    setMenuItems((prevItems) => {
      const newItems = [...prevItems];
      updatedWithOrder.forEach((updatedItem) => {
        const index = newItems.findIndex((item) => item.id === updatedItem.id);
        if (index !== -1) {
          newItems[index] = updatedItem;
        }
      });
      return newItems;
    });

    try {
      await menuService.updateMenuItemOrder(
        selectedCategoryId,
        updatedWithOrder.map((item) => item.id)
      );
    } catch (err) {
      setError("Failed to update menu item order");
      console.error("Error updating menu item order:", err);

      handleCategoryChange(selectedCategoryId);
    }
  };

  const moveCategoryUp = async (index: number) => {
    if (index === 0) return;

    const updatedCategories = [...categories];
    const category = updatedCategories[index];
    updatedCategories[index] = updatedCategories[index - 1];
    updatedCategories[index - 1] = category;

    const newCategories = updatedCategories.map((category, idx) => ({
      ...category,
      displayOrder: idx + 1,
    }));

    setCategories(newCategories);

    try {
      await menuService.updateCategoryOrder(newCategories.map((c) => c.id));
    } catch (err) {
      setError("Failed to update category order");
      console.error("Error updating category order:", err);
      fetchData();
    }
  };

  const moveCategoryDown = async (index: number) => {
    if (index === categories.length - 1) return;

    const updatedCategories = [...categories];
    const category = updatedCategories[index];
    updatedCategories[index] = updatedCategories[index + 1];
    updatedCategories[index + 1] = category;

    const newCategories = updatedCategories.map((category, idx) => ({
      ...category,
      displayOrder: idx + 1,
    }));

    setCategories(newCategories);

    try {
      await menuService.updateCategoryOrder(newCategories.map((c) => c.id));
    } catch (err) {
      setError("Failed to update category order");
      console.error("Error updating category order:", err);
      fetchData();
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Menu Items" />
          <Tab label="Categories" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5">Menu Items</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl sx={{ minWidth: 200 }} required>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value as number)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenItemDialog()}
            >
              Add Item
            </Button>
          </Box>
        </Box>

        <List sx={{ minHeight: "200px" }}>
          {filteredMenuItems.map((item, index) => (
            <ListItem
              key={item.id}
              divider
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                backgroundColor:
                  index % 2 === 0 ? "rgba(0, 0, 0, 0.02)" : "inherit",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", mr: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => moveItemUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => moveItemDown(index)}
                  disabled={index === filteredMenuItems.length - 1}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Box>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {item.name} {item.displayOrder !== undefined}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    ${item.price.toFixed(2)} - {item.description}
                  </Typography>
                }
                sx={{ flex: 1 }}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenItemDialog(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteItem(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {filteredMenuItems.length === 0 && (
            <ListItem>
              <ListItemText primary="No items in this category" />
            </ListItem>
          )}
        </List>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5">Categories</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCategoryDialog()}
          >
            Add Category
          </Button>
        </Box>

        <List sx={{ minHeight: "200px" }}>
          {categories.map((category, index) => (
            <ListItem
              key={category.id}
              divider
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                backgroundColor:
                  index % 2 === 0 ? "rgba(0, 0, 0, 0.02)" : "inherit",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", mr: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => moveCategoryUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => moveCategoryDown(index)}
                  disabled={index === categories.length - 1}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Box>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {category.name}{" "}
                    {category.displayOrder !== undefined &&
                      `(Order: ${category.displayOrder})`}
                  </Typography>
                }
                secondary={category.description}
                sx={{ flex: 1 }}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenCategoryDialog(category)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteCategory(category.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {categories.length === 0 && (
            <ListItem>
              <ListItemText primary="No categories available" />
            </ListItem>
          )}
        </List>
      </TabPanel>

      {/* Menu Item Dialog */}
      <Dialog
        open={openItemDialog}
        onClose={handleCloseItemDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedItem ? "Edit Menu Item" : "Add Menu Item"}
        </DialogTitle>
        <form onSubmit={handleItemSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={formData.categoryId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value),
                    })
                  }
                  required
                  SelectProps={{
                    native: true,
                  }}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseItemDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedItem ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCategory ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <form onSubmit={handleCategorySubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={categoryFormData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Order"
                  type="number"
                  value={categoryFormData.displayOrder}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      displayOrder: parseInt(e.target.value),
                    })
                  }
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={categoryFormData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      description: e.target.value,
                    })
                  }
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedCategory ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MenuManagement;
