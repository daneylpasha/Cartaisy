import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../apiClient';

// Order interface based on backend response
export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  confirmationNumber: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  mobileStatus: {
    current: string;
    history: any[];
  };
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  currency: string;
  totalPrice: number;
  subtotalPrice: number;
  shippingCost: number;
  totalTax: number;
  totalItems: number;
  totalWeight: number;
  discount: number;
  lineItems: Array<{
    productId?: string;
    variantId?: string;
    title?: string;
    variantTitle?: string;
    image?: string | null;
    price?: number;
    quantity?: number;
    total?: number;
  }>;
  shippingAddress: {
    firstName?: string;
    lastName?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  shipping: {
    method: string;
    cost: number;
  };
  paymentMethod: string;
  email: string;
  source: string;
  channel: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    totalOrders: number;
  };
}

// Fetch orders
export const fetchOrders = async (page = 1, limit = 20): Promise<OrdersResponse> => {
  const response = await axiosInstance.get<OrdersResponse>('/customer/orders', {
    params: { page, limit },
  });
  return response.data;
};

// React Query hook
export const useOrders = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => fetchOrders(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single order details
export const fetchOrderDetails = async (orderId: string): Promise<{ success: boolean; data: { order: Order } }> => {
  const response = await axiosInstance.get<{ success: boolean; data: { order: Order } }>(`/customer/orders/${orderId}`);
  return response.data;
};

// React Query hook for order details
export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderDetails(orderId),
    enabled: !!orderId, // Only fetch if orderId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Cancel order
export const cancelOrder = async (orderId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string }>(`/customer/orders/${orderId}/cancel`, {
    reason,
  });
  return response.data;
};

// React Query mutation hook for cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      cancelOrder(orderId, reason),
    onSuccess: (_, variables) => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate specific order details
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
};
