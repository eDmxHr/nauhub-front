"use client";

import { useState } from "react";
import { ArrowLeft, Crown, Calendar, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "@/components/auth/login-modal";
import { PlanCard } from "@/components/subscription/plan-card";
import { PaymentModal } from "@/components/subscription/payment-modal";
import { StatusBadge } from "@/components/subscription/status-badge";
import {
  useSubscriptionPlans,
  useSubscriptionStatus,
  useSubscriptionHistory,
  useCancelSubscription,
  useRenewSubscription,
  useUpgradeSubscription,
} from "@/hooks/use-subscriptions";
import { SubscriptionPlan } from "@/types/subscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate, formatText } from "@/lib/utils";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"subscribe" | "renew" | "upgrade">("subscribe");
  const [showSwitchPlanView, setShowSwitchPlanView] = useState(false);
  const isAuthenticated = !!user;

  const { data: plans = [], isLoading: isLoadingPlans } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: isLoadingStatus } = useSubscriptionStatus();
  const { data: subscriptionHistory = [], isLoading: isLoadingHistory } = useSubscriptionHistory();
  const cancelMutation = useCancelSubscription();
  const renewMutation = useRenewSubscription();
  const upgradeMutation = useUpgradeSubscription();

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedPlan(plan);
    setPaymentMode("subscribe");
    setShowPaymentModal(true);
  };

  const handleRenew = (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedPlan(plan);
    setPaymentMode("renew");
    setShowPaymentModal(true);
  };

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedPlan(plan);
    setPaymentMode("upgrade");
    setShowPaymentModal(true);
  };


  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }
    try {
      await cancelMutation.mutateAsync();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };



  const hasActiveSubscription = currentSubscription?.status === "active";
  const hasPendingSubscription = currentSubscription?.status === "pending";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-14 lg:top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-xl lg:text-2xl font-bold">Subscription Plans</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-6 max-w-6xl mx-auto">
        {/* Current Subscription Status */}
        {isAuthenticated && !isLoadingStatus && currentSubscription && (
          <div className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Current Subscription</h2>
                <StatusBadge status={currentSubscription.status} />
              </div>
              {hasActiveSubscription && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={cancelMutation.isPending}
                    variant="destructive"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plan</p>
                <p className="font-medium">{formatText(currentSubscription.plan_type)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="font-medium">
                  {currentSubscription.amount} {currentSubscription.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {currentSubscription.status === "active" ? "Expires" : "End Date"}
                </p>
                <p className="font-medium">
                  {formatDate(currentSubscription.end_date)}
                </p>
              </div>
            </div>

            {hasPendingSubscription && (
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-500">
                  Your payment is under review. You'll be notified once it's approved.
                </p>
              </div>
            )}

            {/* Renew/Upgrade Options */}
            {hasActiveSubscription && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-md font-semibold mb-4">Manage Subscription</h3>
                <div className="flex flex-wrap gap-3">
                  {/* Renew Button */}
                  <Button
                    onClick={() => {
                      const currentPlan = plans.find(
                        (p) => p.name === currentSubscription.plan_type
                      );
                      if (currentPlan) {
                        handleRenew(currentPlan);
                      }
                    }}
                    disabled={renewMutation.isPending}
                    variant="outline"
                  >
                    Renew Plan
                  </Button>
                  {/* Switch Plan Button */}
                  <Button
                    onClick={() => setShowSwitchPlanView(true)}
                    variant="secondary"
                  >
                    Switch Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plans Section */}
        {(!hasActiveSubscription || showSwitchPlanView) && (
          <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Crown className="size-5 text-brand" />
              {showSwitchPlanView ? "Switch to a Different Plan" : "Choose Your Plan"}
            </h2>
            {showSwitchPlanView && (
              <Button
                variant="ghost"
                onClick={() => setShowSwitchPlanView(false)}
              >
                Cancel
              </Button>
            )}
          </div>

          {isLoadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = showSwitchPlanView && currentSubscription?.plan_type === plan.name;
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    showSubscribeButton={!showSwitchPlanView}
                    onSubscribe={showSwitchPlanView ? undefined : handleSubscribe}
                    onSelect={showSwitchPlanView ? (selectedPlan) => {
                      // Don't allow selecting the current plan
                      if (currentSubscription?.plan_type === selectedPlan.name) {
                        return;
                      }
                      setSelectedPlan(selectedPlan);
                      setPaymentMode("upgrade");
                      setShowPaymentModal(true);
                      setShowSwitchPlanView(false);
                    } : undefined}
                    isSelected={isCurrentPlan}
                    disabled={isCurrentPlan || (!showSwitchPlanView && (hasActiveSubscription || hasPendingSubscription))}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-8 text-center">
              <p className="text-muted-foreground">No subscription plans available at the moment.</p>
            </div>
          )}
        </div>
        )}

        {/* Subscription History */}
        {isAuthenticated && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="size-5 text-brand" />
              Subscription History
            </h2>

            {isLoadingHistory ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : subscriptionHistory.length > 0 ? (
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                <div className="divide-y divide-white/5">
                  {subscriptionHistory.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium">{formatText(subscription.plan_type)}</p>
                            <StatusBadge status={subscription.status} />
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>
                              {subscription.amount} {subscription.currency}
                            </span>
                            <span>
                              {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No subscription history found.</p>
              </div>
            )}
          </div>
        )}

        {/* Sign In Prompt for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="bg-brand/10 border border-brand/30 rounded-xl p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Sign In to Subscribe</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create an account or sign in to subscribe to a plan and start streaming.
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          mode={paymentMode}
        />
      )}
    </div>
  );
}
