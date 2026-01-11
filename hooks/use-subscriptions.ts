import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptionPlans,
  getSubscriptionStatus,
  getSubscriptionHistory,
  subscribe,
  cancelSubscription,
} from "@/lib/api/subscriptions";
import {
  SubscriptionPlan,
  Subscription,
  SubscribePayload,
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
    },
  });
}
