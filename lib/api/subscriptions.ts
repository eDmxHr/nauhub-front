import { apiClient } from "./client";
import {
  SubscriptionPlan,
  Subscription,
  SubscribePayload,
  SubscriptionStatusResponse,
  SubscriptionHistoryResponse,
  SubscriptionPlansResponse,
  RenewSubscriptionPayload,
  UpgradeSubscriptionPayload,
  RequestRefundPayload,
  RequestRefundResponse,
  RenewSubscriptionResponse,
  UpgradeSubscriptionResponse,
  Payment,
  PaymentHistoryResponse,
} from "@/types/subscription";

/**
 * Get all available subscription plans (public endpoint)
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get<SubscriptionPlansResponse>(
    "/subscriptions/plans"
  );
  return response.data.plans;
}

/**
 * Get current subscription status for authenticated user
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  try {
    const response = await apiClient.get<SubscriptionStatusResponse>(
      "/subscriptions/status"
    );
    return response.data;
  } catch (error: any) {
    // Handle 401 gracefully (user not authenticated)
    if (error.response?.status === 401) {
      return { subscription: null };
    }
    throw error;
  }
}

/**
 * Get subscription history for authenticated user
 */
export async function getSubscriptionHistory(): Promise<Subscription[]> {
  try {
    const response = await apiClient.get<SubscriptionHistoryResponse>(
      "/subscriptions/history"
    );
    return response.data.subscriptions || [];
  } catch (error: any) {
    // Handle 401 gracefully (user not authenticated)
    if (error.response?.status === 401) {
      return [];
    }
    throw error;
  }
}

/**
 * Get payment history for authenticated user
 */
export async function getPaymentHistory(): Promise<Payment[]> {
  try {
    const response = await apiClient.get<PaymentHistoryResponse>(
      "/subscriptions/payments"
    );
    return response.data.payments || [];
  } catch (error: any) {
    // Handle 401 gracefully (user not authenticated)
    if (error.response?.status === 401) {
      return [];
    }
    throw error;
  }
}

/**
 * Subscribe to a plan
 */
export async function subscribe(
  payload: SubscribePayload
): Promise<Subscription> {
  const formData = new FormData();
  
  // Ensure plan_id is a number
  formData.append("plan_id", String(payload.plan_id));
  formData.append("payment_method", payload.payment_method);
  
  // Ensure proof_image is a File
  if (!(payload.proof_image instanceof File)) {
    throw new Error("proof_image must be a File object");
  }
  formData.append("proof_image", payload.proof_image);
  
  if (payload.transaction_id) {
    formData.append("transaction_id", payload.transaction_id);
  }

  const response = await apiClient.post<{ subscription: Subscription }>(
    "/subscriptions/subscribe",
    formData
  );
  return response.data.subscription;
}

/**
 * Cancel current subscription
 */
export async function cancelSubscription(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    "/subscriptions/cancel"
  );
  return response.data;
}

/**
 * Renew current subscription
 */
export async function renewSubscription(
  payload: RenewSubscriptionPayload
): Promise<RenewSubscriptionResponse> {
  const formData = new FormData();
  
  formData.append("plan_id", String(payload.plan_id));
  
  if (!(payload.proof_image instanceof File)) {
    throw new Error("proof_image must be a File object");
  }
  formData.append("proof_image", payload.proof_image);

  const response = await apiClient.post<RenewSubscriptionResponse>(
    "/subscriptions/renew",
    formData
  );
  return response.data;
}

/**
 * Upgrade current subscription
 */
export async function upgradeSubscription(
  payload: UpgradeSubscriptionPayload
): Promise<UpgradeSubscriptionResponse> {
  const formData = new FormData();
  
  formData.append("plan_id", String(payload.plan_id));
  
  if (!(payload.proof_image instanceof File)) {
    throw new Error("proof_image must be a File object");
  }
  formData.append("proof_image", payload.proof_image);

  const response = await apiClient.post<UpgradeSubscriptionResponse>(
    "/subscriptions/upgrade",
    formData
  );
  return response.data;
}

/**
 * Request a refund
 */
export async function requestRefund(
  payload: RequestRefundPayload
): Promise<RequestRefundResponse> {
  const response = await apiClient.post<RequestRefundResponse>(
    "/subscriptions/request-refund",
    payload
  );
  return response.data;
}
