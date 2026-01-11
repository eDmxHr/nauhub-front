export interface SubscriptionPlan {
  id: number;
  plan_id: string;
  tier: string;
  name: string;
  duration: string;
  price: string;
  currency: string;
  duration_days: number;
  features: string[];
  popular?: boolean;
  savings?: string;
  discount_text?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_type: string;
  amount: string;
  currency: string;
  start_date: string;
  end_date: string;
  status: "pending" | "active" | "expired" | "cancelled";
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = "bank_transfer" | "upi" | "mobile_money" | "other";

export interface SubscribePayload {
  plan_id: number;
  payment_method: PaymentMethod;
  proof_image: File;
  transaction_id?: string;
}

export interface SubscriptionStatusResponse {
  subscription: Subscription | null;
  message?: string;
}

export interface SubscriptionHistoryResponse {
  subscriptions: Subscription[];
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}
