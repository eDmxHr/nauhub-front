"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Copy, Check } from "lucide-react";
import { SubscriptionPlan, PaymentMethod } from "@/types/subscription";
import {
  useSubscribe,
  useRenewSubscription,
  useUpgradeSubscription,
} from "@/hooks/use-subscriptions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PaymentMode = "subscribe" | "renew" | "upgrade";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  mode?: PaymentMode;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
];

export function PaymentModal({
  isOpen,
  onClose,
  plan,
  mode = "subscribe",
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subscribeMutation = useSubscribe();
  const renewMutation = useRenewSubscription();
  const upgradeMutation = useUpgradeSubscription();

  const isPending =
    subscribeMutation.isPending ||
    renewMutation.isPending ||
    upgradeMutation.isPending;

  const bankDetails = {
    bankName: "BML",
    accountName: "Adam Zahir",
    accountNumber: "7719509602001",
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setPaymentProof(file);
      setError("");
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!paymentProof) {
      setError("Please upload payment proof");
      return;
    }

    try {
     

      // Validate proof_image is a File
      if (!(paymentProof instanceof File)) {
        setError("Please upload a valid payment proof image");
        return;
      }
 
      if (mode === "renew") {
        const payload = {
          plan_id: plan.id,
          proof_image: paymentProof,
        };
        await renewMutation.mutateAsync(payload);
      } else if (mode === "upgrade") {
        const payload = {
          plan_id: plan.id,
          proof_image: paymentProof,
        };
        await upgradeMutation.mutateAsync(payload);
      } else {
        const payload = {
          plan_id: plan.id,
          payment_method: paymentMethod,
          proof_image: paymentProof,
          transaction_id: transactionId || undefined,
        };
        await subscribeMutation.mutateAsync(payload);
      }
      // Close modal on success
      handleClose();
    } catch (err: any) {
      const errorMessage =  "Failed to submit payment";
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
    setTransactionId("");
    setError("");
    setPaymentMethod("bank_transfer");
    onClose();
  };

  const removeImage = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg scrollbar-hide">
        <DialogHeader>
          <DialogTitle>
            {mode === "renew"
              ? "Renew Subscription"
              : mode === "upgrade"
              ? "Upgrade Subscription"
              : "Complete Payment"}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Plan Info */}
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
            <p className="font-semibold">{plan.name}</p>
            <p className="text-sm text-muted-foreground">
              {plan.price} {plan.currency} / {plan.duration}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="mb-2">
              Payment Method
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bank Transfer Details Card - Always show for renew/upgrade, only for bank_transfer in subscribe */}
          {((mode === "subscribe" && paymentMethod === "bank_transfer") || mode === "renew" || mode === "upgrade") && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Bank Transfer Details</h3>
              <div className="space-y-2">
                {/* Bank Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{bankDetails.bankName}</p>
                    </div>
                  </div>
                </div>

                {/* Account Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Name</p>
                      <p className="font-medium">{bankDetails.accountName}</p>
                    </div>
                  </div>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="font-medium font-mono">{bankDetails.accountNumber}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "accountNumber")}
                    aria-label="Copy account number"
                  >
                    {copiedField === "accountNumber" ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Proof Upload */}
          <div>
            <Label className="mb-2">
              Payment Proof <span className="text-red-500">*</span>
            </Label>
            {paymentProofPreview ? (
              <div className="relative">
                <img
                  src={paymentProofPreview}
                  alt="Payment proof"
                  className="w-full h-48 object-contain rounded-lg border border-white/10"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed hover:border-brand/50 flex flex-col items-center justify-center gap-2 h-auto"
              >
                <Upload className="size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload payment proof
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </span>
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Transaction ID - Only for subscribe mode */}
          {mode === "subscribe" && (
            <div>
              <Label htmlFor="transaction-id" className="mb-2">
                Transaction ID (Optional)
              </Label>
              <Input
                id="transaction-id"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID if available"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Info Message */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-lg text-sm">
            Your payment will be reviewed by our team. You'll be notified once it's approved.
          </div>

        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="payment-form"
            disabled={!paymentProof || isPending}
            className="flex-1"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting...
              </>
            ) : mode === "renew" ? (
              "Renew Subscription"
            ) : mode === "upgrade" ? (
              "Upgrade Subscription"
            ) : (
              "Submit Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
