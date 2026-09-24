"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import toast from "react-hot-toast";

type StripeCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
};

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const STRIPE_FEE_RATE = 0.03;

function withStripeFee(baseAmount: number): {
  feeAmount: number;
  totalAmount: number;
} {
  const feeAmount = Math.round(baseAmount * STRIPE_FEE_RATE * 100) / 100;
  const totalAmount = Math.round((baseAmount + feeAmount) * 100) / 100;
  return { feeAmount, totalAmount };
}

function StripeCardForm({
  invoiceId,
  amount,
  onClose,
  onSuccess,
}: Omit<StripeCardModalProps, "isOpen">) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { feeAmount, totalAmount } = withStripeFee(amount);

  useEffect(() => {
    let cancelled = false;

    const createIntent = async () => {
      setLoadingIntent(true);
      setError(null);
      setClientSecret(null);

      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token") || "";
        const res = await fetch("/api/users/stripe/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ invoiceId }),
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || json.code !== 200 || !json.data?.clientSecret) {
          setError(json.message || "Failed to start Stripe payment");
          return;
        }

        setClientSecret(json.data.clientSecret);
      } catch {
        if (!cancelled) {
          setError("Failed to start Stripe payment");
        }
      } finally {
        if (!cancelled) setLoadingIntent(false);
      }
    };

    void createIntent();

    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements || !clientSecret) {
      setError("Stripe is not ready yet. Please try again.");
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Card form is not ready.");
      return;
    }

    setPaying(true);
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        return;
      }

      const paymentIntent = result.paymentIntent;
      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setError("Payment was not completed. Please try again.");
        return;
      }

      toast.success("Card payment successful");
      onSuccess(paymentIntent.id);
      onClose();
    } catch {
      setError("Something went wrong while processing payment.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          Invoice:{" "}
          <span className="font-medium text-gray-900">${formatAmount(amount)}</span>
        </p>
        <p>
          Processing fee (3%):{" "}
          <span className="font-medium text-gray-900">${formatAmount(feeAmount)}</span>
        </p>
        <p>
          Total to pay:{" "}
          <span className="font-semibold text-gray-900">${formatAmount(totalAmount)}</span>
        </p>
      </div>

      {loadingIntent ? (
        <p className="text-sm text-gray-500">Preparing secure checkout...</p>
      ) : (
        <>
          <div>
            <Label>Card details</Label>
            <div className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#1f2937",
                      "::placeholder": { color: "#9ca3af" },
                    },
                    invalid: { color: "#ef4444" },
                  },
                }}
              />
            </div>
          </div>

          {error && <p className="text-sm text-error-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={paying}>
              Cancel
            </Button>
            <Button type="submit" loading={paying} disabled={!clientSecret || paying}>
              Pay ${formatAmount(totalAmount)}
            </Button>
          </div>
        </>
      )}

      {!loadingIntent && error && !clientSecret && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </form>
  );
}

export default function StripeCardModal({
  isOpen,
  onClose,
  invoiceId,
  amount,
  onSuccess,
}: StripeCardModalProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(
    null
  );

  useEffect(() => {
    if (!isOpen || !publishableKey) {
      setStripePromise(null);
      return;
    }
    setStripePromise(loadStripe(publishableKey));
  }, [isOpen, publishableKey]);

  const options = useMemo(
    () => ({
      appearance: { theme: "stripe" as const },
    }),
    []
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
        Card Payment
      </h2>

      {!publishableKey ? (
        <div className="space-y-4">
          <p className="text-sm text-error-500">
            Stripe publishable key is missing. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to
            .env and restart the server.
          </p>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
          <StripeCardForm
            invoiceId={invoiceId}
            amount={amount}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </Elements>
      ) : null}
    </Modal>
  );
}
