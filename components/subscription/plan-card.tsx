"use client";

import { Check, Crown } from "lucide-react";
import { SubscriptionPlan } from "@/types/subscription";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected?: boolean;
  onSelect?: (plan: SubscriptionPlan) => void;
  showSubscribeButton?: boolean;
  onSubscribe?: (plan: SubscriptionPlan) => void;
  disabled?: boolean;
}

export function PlanCard({
  plan,
  isSelected = false,
  onSelect,
  showSubscribeButton = true,
  onSubscribe,
  disabled = false,
}: PlanCardProps) {
  const isPopular = plan.popular;


  return (
    <div
  className={cn(
    "relative flex flex-col bg-white/5 rounded-2xl border transition-all overflow-hidden",
    isPopular
      ? "border-brand/70 bg-brand/5 shadow-lg shadow-brand/20"
      : "border-white/10 hover:border-white/30 hover:shadow-lg",
    isSelected && "ring-2 ring-brand",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  {/* Popular Badge */}
  {isPopular && (
    <div className="absolute left-0 top-0">
      <div className="bg-brand text-white px-3 py-1 rounded-br-lg full text-xs font-semibold flex items-center gap-1 shadow-lg">
        <Crown className="size-3" />
        Most Popular
      </div>
    </div>
  )}

  {/* Savings Ribbon */}
  {plan.savings && (
    <div className="absolute right-0 top-0">
      <div className="bg-green-500 text-white text-xs px-3 py-1 font-semibold rounded-bl-lg shadow-md">
        🎉 Save {plan.savings}
      </div>
    </div>
  )}

  <div className="p-6 space-y-5 flex-1">
    {/* Plan Name */}
    <div>
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <p className="text-sm text-muted-foreground">{plan.tier}</p>
    </div>

    {/* Price Section */}
    <div className="space-y-1">
      <div className="flex items-end gap-2">
        <span className="text-4xl font-extrabold tracking-tight">
          {plan.price} {plan.currency}
        </span>

        <span className="text-sm text-muted-foreground mb-1">
          / {plan.duration}
        </span>
      </div>

      {plan.discount_text && (
        <div className="text-sm font-medium text-green-400 flex items-center gap-1">
          <span>{plan.discount_text}</span>
        </div>
      )}
    </div>

    {/* Features */}
    <div className="space-y-2">
      {plan.features.map((feature, index) => (
        <div key={index} className="flex items-start gap-2">
          <Check className="size-4 text-brand mt-0.5 shrink-0" />
          <span className="text-sm">{feature}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Bottom CTA section always sticks to bottom */}
  <div className="p-4 border-t border-white/10 bg-white/5">
    {onSelect && (
      <button
        onClick={() => !disabled && onSelect(plan)}
        disabled={disabled}
        className={cn(
          "w-full py-2.5 rounded-lg font-medium transition-colors mb-2",
          isSelected
            ? "bg-brand text-white"
            : "bg-white/10 hover:bg-white/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {isSelected ? "Selected" : "Select Plan"}
      </button>
    )}

    {showSubscribeButton && onSubscribe && (
      <button
        onClick={() => !disabled && onSubscribe(plan)}
        disabled={disabled}
        className="w-full py-3 rounded-lg font-semibold transition-colors bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Subscribe now
      </button>
    )}
  </div>
</div>

  );
}
