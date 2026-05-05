export interface PublicMenuItemModel {
  name: string;
  description?: string;
  ingredients?: string;
  price: number;
  imageUrl?: string;
  tags: string[];
}

export interface PublicCategoryModel {
  name: string;
  items: PublicMenuItemModel[];
}

export interface PublicMenuModel {
  name: string;
  openingHours?: string;
  categories: PublicCategoryModel[];
}

export interface PublicMenuResponse {
  restaurantName: string;
  logoUrl?: string;
  menus: PublicMenuModel[];
}

export interface PublicRestaurantInfo {
  restaurantName: string;
  logoUrl?: string;
  openingHours?: string;
}
