"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "@/components/auth/login-modal";
import { useSubscriptionHistory, useSubscriptionPlans } from "@/hooks/use-subscriptions";
import { StatusBadge } from "@/components/subscription/status-badge";
import { formatDate, formatText } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthenticated = !!user;

  // Fetch subscription history and plans
  const { data: subscriptionHistory = [], isLoading: isLoadingHistory } = useSubscriptionHistory();
  const { data: plans = [] } = useSubscriptionPlans();

  // Sort history by created_at (newest first)
  const sortedHistory = [...subscriptionHistory].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-14 lg:top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold">Payment History</h1>
        </div>
      </div>

      {/* Content */}
      <div className="py-6 max-w-4xl mx-auto px-4 md:px-0">
        {!isAuthenticated ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your payment history.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : isLoadingHistory ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : sortedHistory.length > 0 ? (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Purchase Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Period
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedHistory.map((subscription) => {
                    const plan = plans.find((p) => p.name === subscription.plan_type);
                    return (
                      <tr
                        key={subscription.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">
                              {formatText(plan?.name || subscription.plan_type)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ID: #{subscription.id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {subscription.amount} {subscription.currency}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={subscription.status} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{formatDate(subscription.created_at)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p>{formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-white/5">
              {sortedHistory.map((subscription) => {
                const plan = plans.find((p) => p.name === subscription.plan_type);
                return (
                  <div
                    key={subscription.id}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">
                          {plan?.name || subscription.plan_type}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ID: #{subscription.id}
                        </p>
                      </div>
                      <StatusBadge status={subscription.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                        <p className="font-medium">
                          {subscription.amount} {subscription.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Purchase Date</p>
                        <p className="font-medium">{formatDate(subscription.created_at)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Period</p>
                        <p className="font-medium">
                          {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="p-4 bg-white/5 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="size-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Payment History</h2>
            <p className="text-muted-foreground mb-6">
              You haven't made any subscription payments yet.
            </p>
            <button
              onClick={() => router.push("/subscription")}
              className="px-6 py-3 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
            >
              Browse Plans
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          if (!user) router.back();
        }}
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
}
