"use client";

import { useState } from "react";
import ProtectedRoute from "@/app/_utils/ProtectedRoute";
import { HeadingText, Container, Button } from "@/app/_brutalComponents";
import { createIntentSession } from "@/lib/stripe";

export default function PaymentPage() {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await createIntentSession();
      // Redirect happens in the createIntentSession function
      setIsProcessing(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create intent session"
      );
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <Container className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] m-4 p-4 bg-yellow-300">
          <HeadingText>Purchase Tokens</HeadingText>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <>
            <p className="mb-6">
              Select a token package to enhance your LLM Chat experience:
            </p>

            <div className="flex justify-center">
              <Button
                buttonText={
                  isProcessing ? "Processing..." : "Proceed to Checkout"
                }
                buttonType="primary"
                size="full"
                disabled={isProcessing}
                onClick={handleCheckout}
              />
            </div>
          </>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
