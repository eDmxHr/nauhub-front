"use client";

import { useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "@/components/auth/login-modal";
import {
  usePaymentHistory,
  useSubscriptionPlans,
  useRequestRefund,
} from "@/hooks/use-subscriptions";
import { PaymentStatusBadge } from "@/components/subscription/payment-status-badge";
import { formatDate, formatText } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Payment } from "@/types/subscription";

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundError, setRefundError] = useState("");
  const [refundSuccess, setRefundSuccess] = useState<{
    message: string;
    note: string;
    ticket: { ticket_number: string; status: string; subject: string; created_at: string };
  } | null>(null);
  const isAuthenticated = !!user;

  const refundMutation = useRequestRefund();

  // Fetch payment history and plans
  const { data: paymentHistory = [], isLoading: isLoadingHistory } = usePaymentHistory();
  const { data: plans = [] } = useSubscriptionPlans();

  // Sort history by created_at (newest first)
  const sortedPayments = [...paymentHistory].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleRequestRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundReason("");
    setRefundError("");
    setRefundSuccess(null);
    setShowRefundModal(true);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundError("");
    setRefundSuccess(null);

    if (!refundReason.trim()) {
      setRefundError("Please provide a reason for the refund");
      return;
    }

    if (!selectedPayment) {
      setRefundError("No payment selected");
      return;
    }

    try {
      const response = await refundMutation.mutateAsync({
        payment_id: selectedPayment.id,
        reason: refundReason.trim(),
      });
      setRefundSuccess({
        message: response.message,
        note: response.note,
        ticket: response.ticket,
      });
      // Keep modal open to show success message
    } catch (err: any) {
      setRefundError(
        err?.response?.data?.message ||
          "Failed to submit refund request. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-black">
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
          <h1 className="text-xl lg:text-2xl font-bold">Payment History</h1>
        </div>
      </div>

      {/* Content */}
      <div className="py-6 w-full px-4">
        {!isAuthenticated ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your payment history.
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </Button>
          </div>
        ) : isLoadingHistory ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : sortedPayments.length > 0 ? (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Reference
                    </th>
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
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedPayments.map((payment) => {
                    const plan = plans.find((p) => p.name === payment.subscription.plan_type);
                    return (
                      <tr
                        key={payment.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium font-mono text-sm">
                              {payment.reference_code}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ID: #{payment.id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">
                              {formatText(plan?.name || payment.subscription.plan_type)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatText(payment.subscription.status)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">
                              {payment.amount.toFixed(2)} {payment.currency}
                            </p>
                            {payment.refunded_amount && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Refunded: {payment.refunded_amount.toFixed(2)} {payment.currency}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <PaymentStatusBadge
                            status={payment.status}
                            refundStatus={payment.refund_status}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p>{formatDate(payment.created_at)}</p>
                            {payment.verified_at && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Verified: {formatDate(payment.verified_at)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p>
                              {formatDate(payment.subscription.start_date)} -{" "}
                              {formatDate(payment.subscription.end_date)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {payment.status === "approved" &&
                            payment.refund_status === "none" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRequestRefund(payment)}
                                className="text-brand hover:text-brand/80"
                              >
                               
                                Request Refund
                              </Button>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-white/5">
              {sortedPayments.map((payment) => {
                const plan = plans.find((p) => p.name === payment.subscription.plan_type);
                return (
                  <div
                    key={payment.id}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium font-mono text-sm">
                          {payment.reference_code}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ID: #{payment.id}
                        </p>
                      </div>
                      <PaymentStatusBadge
                        status={payment.status}
                        refundStatus={payment.refund_status}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Plan</p>
                        <p className="font-medium">
                          {formatText(plan?.name || payment.subscription.plan_type)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                        <p className="font-medium">
                          {payment.amount.toFixed(2)} {payment.currency}
                        </p>
                        {payment.refunded_amount && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Refunded: {payment.refunded_amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Payment Date</p>
                        <p className="font-medium">{formatDate(payment.created_at)}</p>
                        {payment.verified_at && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Verified: {formatDate(payment.verified_at)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Period</p>
                        <p className="font-medium">
                          {formatDate(payment.subscription.start_date)} -{" "}
                          {formatDate(payment.subscription.end_date)}
                        </p>
                      </div>
                      {payment.status === "approved" &&
                        payment.refund_status === "none" && (
                          <div className="col-span-2">
                            <Button
                              onClick={() => handleRequestRefund(payment)}
                              variant="outline"
                              className="w-full bg-brand/10 hover:bg-brand/20 text-brand border-brand/30"
                            >
                              Request Refund
                            </Button>
                          </div>
                        )}
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
            <Button
              onClick={() => router.push("/subscription")}
              className="bg-brand hover:bg-brand/90"
            >
              Browse Plans
            </Button>
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

      {/* Refund Request Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
          </DialogHeader>

          {selectedPayment && !refundSuccess ? (
            <form onSubmit={handleSubmitRefund} className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Payment Details</p>
                <p className="font-semibold">
                  {formatText(
                    plans.find((p) => p.name === selectedPayment.subscription.plan_type)
                      ?.name || selectedPayment.subscription.plan_type
                  )}{" "}
                  - {selectedPayment.amount.toFixed(2)} {selectedPayment.currency}
                </p>
                <p className="text-sm text-muted-foreground">
                  Reference: {selectedPayment.reference_code}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payment ID: #{selectedPayment.id}
                </p>
              </div>

              <div>
                <Label className="mb-2">
                  Reason for Refund 
                </Label>
                <Textarea
                  value={refundReason}
                  onChange={(e) => {
                    setRefundReason(e.target.value);
                    setRefundError("");
                  }}
                  rows={5}
                  placeholder="Please explain why you are requesting a refund..."
                  required
                  className="resize-none"
                />
              </div>

              {refundError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-sm">
                  {refundError}
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-lg text-sm">
                Your refund request will be reviewed by our team. You'll be notified once a decision is made.
              </div>

              <DialogFooter className="">
               <div className="flex flex-col gap-y-4 md:flex-row md:gap-x-4">
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedPayment(null);
                    setRefundReason("");
                    setRefundError("");
                    setRefundSuccess(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                
                  type="submit"
                  disabled={!refundReason.trim() || refundMutation.isPending}
                  className="bg-brand hover:bg-brand/90"
                >
                  {refundMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
               </div>
              </DialogFooter>
            </form>
          ) : refundSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-500 font-semibold mb-2">{refundSuccess.message}</p>
                {refundSuccess.note && (
                  <p className="text-sm text-muted-foreground">{refundSuccess.note}</p>
                )}
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Support Ticket Created</p>
                <div className="space-y-1">
                  <p className="font-medium">Ticket #{refundSuccess.ticket.ticket_number}</p>
                  <p className="text-sm text-muted-foreground">
                    Subject: {refundSuccess.ticket.subject}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {formatText(refundSuccess.ticket.status)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {formatDate(refundSuccess.ticket.created_at)}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedPayment(null);
                    setRefundReason("");
                    setRefundError("");
                    setRefundSuccess(null);
                  }}
                  className="bg-brand hover:bg-brand/90"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
