import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCustomerGetAddresses,
  useCustomerAddAddress,
  useCustomerUpdateAddress,
  useCustomerDeleteAddress,
  useCustomerSetDefaultAddress,
  getCustomerGetAddressesQueryKey,
} from '@/api/generated/customer-addresses/customer-addresses';
import useAuthStore from '@/store/useAuthStore';
import useUserStore from '@/store/useUserStore';
import type { CustomerAddAddressRequest, CustomerUpdateAddressRequest } from '@/api/generated/cartaisyAPI.schemas';

/**
 * Custom hook to manage addresses with authentication check
 *
 * This hook wraps useGetAddresses and only fetches when the user is authenticated.
 * For guest users, it returns an empty array without making API calls.
 *
 * Key features:
 * - Waits for auth store to hydrate before fetching (prevents race conditions after login)
 * - Only fetches when user is authenticated (has token and is not guest)
 * - Disables retry on 401/500 errors to prevent repeated failed requests
 */
export const useAuthenticatedAddresses = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const isGuest = useAuthStore((state) => state.isGuest);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const { setDefaultAddress } = useUserStore();

  // Only fetch addresses if:
  // 1. Auth store has hydrated (token loaded from storage)
  // 2. User has a valid token
  // 3. User is not in guest mode
  const isAuthenticated = _hasHydrated && !!token && !isGuest;

  const {
    data: addressesResponse,
    isLoading,
    error,
    refetch,
  } = useCustomerGetAddresses({
    query: {
      enabled: isAuthenticated, // Only fetch if user is authenticated
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors (401) or server errors (500)
        const status = error?.response?.status;
        if (status === 401 || status === 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  });

  // Backend returns data as array directly, not { addresses: [...] }
  const addresses = isAuthenticated
    ? (Array.isArray((addressesResponse as any)?.data)
        ? (addressesResponse as any).data
        : ((addressesResponse as any)?.data?.addresses || []))
    : [];

  // Sync default address with user store
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((addr: any) => addr.isDefault);
      if (defaultAddr) {
        setDefaultAddress(defaultAddr);
      }
    }
  }, [addresses, setDefaultAddress]);

  // Add address mutation
  const addAddressMutation = useCustomerAddAddress({
    mutation: {
      onSuccess: (response) => {
        console.log('[useAddresses] Address added successfully:', response);
        queryClient.invalidateQueries({ queryKey: getCustomerGetAddressesQueryKey() });
      },
      onError: (error) => {
        console.error('[useAddresses] Failed to add address:', error);
      },
    },
  });

  // Update address mutation
  const updateAddressMutation = useCustomerUpdateAddress({
    mutation: {
      onSuccess: (response) => {
        console.log('[useAddresses] Address updated successfully:', response);
        queryClient.invalidateQueries({ queryKey: getCustomerGetAddressesQueryKey() });
      },
      onError: (error) => {
        console.error('[useAddresses] Failed to update address:', error);
      },
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useCustomerDeleteAddress({
    mutation: {
      onSuccess: (response) => {
        console.log('[useAddresses] Address deleted successfully:', response);
        queryClient.invalidateQueries({ queryKey: getCustomerGetAddressesQueryKey() });
      },
      onError: (error) => {
        console.error('[useAddresses] Failed to delete address:', error);
      },
    },
  });

  // Set default address mutation
  const setDefaultMutation = useCustomerSetDefaultAddress({
    mutation: {
      onSuccess: (response, variables) => {
        console.log('[useAddresses] Default address set successfully:', response);
        // Find and update the default address in store by addressId
        const defaultAddr = addresses.find((addr: any) => addr._id === variables.addressId);
        if (defaultAddr) {
          setDefaultAddress(defaultAddr);
        }
        queryClient.invalidateQueries({ queryKey: getCustomerGetAddressesQueryKey() });
      },
      onError: (error) => {
        console.error('[useAddresses] Failed to set default address:', error);
      },
    },
  });

  // Helper functions
  const addAddress = (data: CustomerAddAddressRequest) => {
    if (!isAuthenticated) {
      console.warn('[useAddresses] User must be logged in to add addresses');
      return;
    }
    addAddressMutation.mutate({ data });
  };

  const updateAddress = (addressId: string, data: CustomerUpdateAddressRequest) => {
    if (!isAuthenticated) {
      console.warn('[useAddresses] User must be logged in to update addresses');
      return;
    }
    updateAddressMutation.mutate({ addressId, data });
  };

  const deleteAddress = (addressId: string) => {
    if (!isAuthenticated) {
      console.warn('[useAddresses] User must be logged in to delete addresses');
      return;
    }
    deleteAddressMutation.mutate({ addressId });
  };

  const setDefault = (addressId: string) => {
    if (!isAuthenticated) {
      console.warn('[useAddresses] User must be logged in to set default address');
      return;
    }
    setDefaultMutation.mutate({ addressId });
  };

  return {
    // Data
    addresses,
    isAuthenticated,

    // Query state
    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : null,
    refetch,

    // Mutations
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,

    // Mutation states
    isAddingAddress: addAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,

    // Raw mutations for custom callbacks
    addAddressMutation,
    updateAddressMutation,
    deleteAddressMutation,
    setDefaultMutation,
  };
};

/**
 * Hook to get formatted address data for UI components
 */
export const useFormattedAddresses = () => {
  const { addresses, isAuthenticated, ...rest } = useAuthenticatedAddresses();
  const { user } = useUserStore();

  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.fullName || 'User'
    : 'User';

  // Map addresses to UI-friendly format
  const formattedAddresses = addresses.map((addr: any, index: number) => ({
    id: index,
    addressId: addr._id || String(index),
    name: addr.label || userName,
    address: [
      addr.address1,
      addr.address2,
      addr.city,
      addr.province,
      addr.country,
      addr.zip,
    ]
      .filter(Boolean)
      .join(', '),
    shipping: 'Shipping Available',
    isDefault: addr.isDefault || false,
    raw: addr, // Keep raw data for editing
  }));

  const defaultAddressIndex = formattedAddresses.findIndex((addr: any) => addr.isDefault);

  return {
    addresses,
    formattedAddresses,
    defaultAddressIndex,
    isAuthenticated,
    ...rest,
  };
};
