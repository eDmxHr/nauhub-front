import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptionPlans,
  getSubscriptionStatus,
  getSubscriptionHistory,
  getPaymentHistory,
  subscribe,
  cancelSubscription,
  renewSubscription,
  upgradeSubscription,
  requestRefund,
} from "@/lib/api/subscriptions";
import {
  SubscriptionPlan,
  Subscription,
  Payment,
  SubscribePayload,
  RenewSubscriptionPayload,
  UpgradeSubscriptionPayload,
  RequestRefundPayload,
} from "@/types/subscription";
import { useAuthStore } from "@/lib/store";

/**
 * Hook to fetch all subscription plans (public)
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      try {
        return await getSubscriptionPlans();
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
        return [];
      }
    },
  });
}

/**
 * Hook to fetch current subscription status
 */
export function useSubscriptionStatus() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      try {
        const response = await getSubscriptionStatus();
        return response.subscription;
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        return null;
      }
    },
    enabled: !!user, // Only fetch if user is authenticated
  });
}

/**
 * Hook to fetch subscription history
 */
export function useSubscriptionHistory() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["subscription-history"],
    queryFn: async () => {
      try {
        return await getSubscriptionHistory();
      } catch (error) {
        console.error("Error fetching subscription history:", error);
        return [];
      }
    },
    enabled: !!user, // Only fetch if user is authenticated
  });
}

/**
 * Hook to fetch payment history
 */
export function usePaymentHistory() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["payment-history"],
    queryFn: async () => {
      try {
        return await getPaymentHistory();
      } catch (error) {
        console.error("Error fetching payment history:", error);
        return [];
      }
    },
    enabled: !!user, // Only fetch if user is authenticated
  });
}

/**
 * Hook to subscribe to a plan
 */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubscribePayload) => {
      return await subscribe(payload);
    },
    onSuccess: () => {
      // Invalidate and refetch subscription status and history
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-history"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    },
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await cancelSubscription();
    },
    onSuccess: () => {
      // Invalidate and refetch subscription status and history
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-history"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    },
  });
}

/**
 * Hook to renew subscription
 */
export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RenewSubscriptionPayload) => {
      return await renewSubscription(payload);
    },
    onSuccess: () => {
      // Invalidate and refetch subscription status and history
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-history"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    },
  });
}

/**
 * Hook to upgrade subscription
 */
export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpgradeSubscriptionPayload) => {
      return await upgradeSubscription(payload);
    },
    onSuccess: () => {
      // Invalidate and refetch subscription status and history
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-history"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    },
  });
}

/**
 * Hook to request a refund
 */
export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RequestRefundPayload) => {
      return await requestRefund(payload);
    },
    onSuccess: () => {
      // Invalidate and refetch subscription and payment history
      queryClient.invalidateQueries({ queryKey: ["subscription-history"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    },
  });
}
