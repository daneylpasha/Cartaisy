import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  authApi,
  AuthResponse,
  CompleteProfileData,
  LoginCredentials,
  SignUpData,
} from "../endpoints";

export const useLogin = (
  options?: UseMutationOptions<AuthResponse, AxiosError<any>, LoginCredentials>
) => {
  const mutation = useMutation<AuthResponse, AxiosError<any>, LoginCredentials>(
    {
      mutationFn: (data: LoginCredentials) => authApi.login(data),
      onMutate: async (variables) => {
        console.log("🔄 React Query: Starting login mutation with:", variables);
        if (options?.onMutate) {
          return await options.onMutate(variables);
        }
      },
      onSuccess: (data, variables, context,onMutateResult) => {
        console.log("✅ React Query: Login mutation successful!", data);
        options?.onSuccess?.(data, variables, context,onMutateResult);
      },
      onError: (error, variables, context,onMutateResult) => {
        console.log("❌ React Query: Login mutation failed!", error);
        options?.onError?.(error, variables, context,onMutateResult);
      },
      onSettled: (data, error, variables, context,onMutateResult) => {
        console.log("🎯 React Query: Login mutation completed");
        options?.onSettled?.(data, error, variables, context,onMutateResult);
      },
      ...options,
    }
  );

  return {
    // Main mutation function
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,

    // Status booleans
    isPending: mutation.isPending,
    isIdle: mutation.isIdle,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    isPaused: mutation.isPaused,

    // Data and error
    data: mutation.data,
    error: mutation.error,
    failureCount: mutation.failureCount,
    failureReason: mutation.failureReason,

    // Mutation state
    status: mutation.status,
    variables: mutation.variables,
    submittedAt: mutation.submittedAt,

    // Utility functions
    reset: mutation.reset,

    // Context for optimistic updates
    context: mutation.context,
  };
};

export const useSignUp = (
  options?: UseMutationOptions<AuthResponse, AxiosError<any>, SignUpData>
) => {
  const mutation = useMutation<AuthResponse, AxiosError<any>, SignUpData>({
    mutationFn: (data: SignUpData) => authApi.signUp(data),
    onMutate: async (variables) => {
      console.log("🔄 React Query: Starting sign-up mutation with:", variables);
      if (options?.onMutate) {
        return await options.onMutate(variables);
      }
      
    },
    onSuccess: (data, variables, context,onMutateResult) => {
      console.log("✅ React Query: Sign-up mutation successful!", data);
      options?.onSuccess?.(data, variables, context,onMutateResult);
    },
    onError: (error, variables, context,onMutateResult) => {
      console.log("❌ React Query: Sign-up mutation failed!", error);
      options?.onError?.(error, variables, context,onMutateResult);
    },
    onSettled: (data, variables, context,error,onMutateResult) => {
      console.log("🎯 React Query: Sign-up mutation completed");
      options?.onSettled?.(data,  variables,context,error,onMutateResult);
    },
    ...options,
  });

  return {
    // Main mutation function
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,

    // Status booleans
    isPending: mutation.isPending,
    isIdle: mutation.isIdle,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    isPaused: mutation.isPaused,

    // Data and error
    data: mutation.data,
    error: mutation.error,
    failureCount: mutation.failureCount,
    failureReason: mutation.failureReason,

    // Mutation state
    status: mutation.status,
    variables: mutation.variables,
    submittedAt: mutation.submittedAt,

    // Utility functions
    reset: mutation.reset,

    // Context for optimistic updates
    context: mutation.context,
  };
};
export const useCompleteProfile = (
  token: string,
  options?: UseMutationOptions<
    AuthResponse,
    AxiosError<any>,
    CompleteProfileData
  >
) => {
  const mutation = useMutation<
    AuthResponse,
    AxiosError<any>,
    CompleteProfileData
  >({
    mutationFn: (data: CompleteProfileData) => authApi.completeProfile(data, token),
    ...options,
  });

  return {
    // Main mutation function
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,

    // Status booleans
    isPending: mutation.isPending,
    isIdle: mutation.isIdle,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    isPaused: mutation.isPaused,

    // Data and error
    data: mutation.data,
    error: mutation.error,
    failureCount: mutation.failureCount,
    failureReason: mutation.failureReason,

    // Mutation state
    status: mutation.status,
    variables: mutation.variables,
    submittedAt: mutation.submittedAt,

    // Utility functions
    reset: mutation.reset,

    // Context for optimistic updates
    context: mutation.context,
  };
};
