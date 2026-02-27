export interface TaxBreakdown {
  state_rate: number;
  county_rate: number;
  city_rate: number;
  special_rates: number;
}

export interface Order {
  id: number;
  latitude: number;
  longitude: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  timestamp: string;
  composite_tax_rate: number;
  breakdown: TaxBreakdown;
}

export interface CreateOrderDto {
  latitude: number;
  longitude: number;
  subtotal: number;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrdersFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  minSubtotal?: number;
  maxSubtotal?: number;
  search?: string;
}