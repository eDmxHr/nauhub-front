// User types
export interface User {
  id: string;
  mobile: string;
  name?: string;
  avatar?: string;
  token: string; // Auth token from API
  createdAt: Date;
  profiles?: Profile[];
}

// Profile types (Netflix-like multi-profile support)
export interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  passcode?: string; // Optional 4-digit passcode for profile lock
  createdAt: Date;
}

// Subscription types
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'family';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
  maxDevices: number;
  description: string;
}

export interface UserSubscription {
  id: string;
  planId: SubscriptionTier;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  paymentId?: string;
}

// Single movie purchase
export interface MoviePurchase {
  id: string;
  movieId: string;
  movieTitle: string;
  price: number;
  currency: string;
  purchaseDate: Date;
  expiresAt?: Date; // Some purchases might expire
  status: 'pending' | 'approved' | 'rejected';
  paymentSlipUrl?: string;
}

// Payment types
export interface Payment {
  id: string;
  type: 'subscription' | 'movie';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentSlipUrl: string;
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  // Reference to what was purchased
  subscriptionId?: string;
  moviePurchaseId?: string;
}

// Movie request
export interface MovieRequest {
  id: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  requestDate: Date;
  status: 'pending' | 'uploaded' | 'rejected';
  notifyWhenAvailable: boolean;
}
