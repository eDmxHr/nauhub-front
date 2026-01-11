"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Copy, Check } from "lucide-react";
import { SubscriptionPlan, PaymentMethod } from "@/types/subscription";
import { useSubscribe } from "@/hooks/use-subscriptions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
];

export function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subscribeMutation = useSubscribe();

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
 
      await subscribeMutation.mutateAsync({
        plan_id: plan.id,
        payment_method: paymentMethod,
        proof_image: paymentProof,
        transaction_id: transactionId || undefined,
      });
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
          <DialogTitle>Complete Payment</DialogTitle>
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
            <label className="block text-sm font-medium mb-2">
              Payment Method
            </label>
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

          {/* Bank Transfer Details Card */}
          {paymentMethod === "bank_transfer" && (
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
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "accountNumber")}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Copy account number"
                  >
                    {copiedField === "accountNumber" ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Proof Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Proof <span className="text-red-500">*</span>
            </label>
            {paymentProofPreview ? (
              <div className="relative">
                <img
                  src={paymentProofPreview}
                  alt="Payment proof"
                  className="w-full h-48 object-contain rounded-lg border border-white/10"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-white/20 rounded-lg hover:border-brand/50 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <Upload className="size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload payment proof
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID if available"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand"
            />
          </div>

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
            <button
              type="button"
              className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="submit"
            form="payment-form"
            disabled={!paymentProof || subscribeMutation.isPending}
            className="flex-1 px-4 py-2.5 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Payment"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
