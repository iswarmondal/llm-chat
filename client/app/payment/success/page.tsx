"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/app/_utils/ProtectedRoute";
import { HeadingText, Container, Button } from "@/app/_brutalComponents";
import { verifyIntentSession } from "@/lib/stripe";

// Separate client component for the payment verification logic
function PaymentVerification() {
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<"complete" | "open" | "expired" | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const setupIntentId = searchParams.get("setup_intent");

  useEffect(() => {
    async function verifySession() {
      if (!sessionId && !setupIntentId) {
        setVerifying(false);
        return;
      }

      try {
        const id = sessionId || setupIntentId;
        if (!id) {
          setVerifying(false);
          return;
        }

        const status = await verifyIntentSession(id);
        setStatus(status as "complete" | "open" | "expired");
        setVerifying(false);
      } catch (error) {
        console.error("Error verifying session:", error);
        setVerifying(false);
      }
    }

    verifySession();
  }, [sessionId, setupIntentId]);

  const handleGoToProfile = () => {
    router.push("/profile");
  };

  return (
    <div className="text-center py-8">
      {verifying ? (
        <div>Verifying your setup...</div>
      ) : !sessionId && !setupIntentId ? (
        <div>
          <p className="mb-6 text-red-600">
            Invalid session. Please try again or contact support.
          </p>
          <Button
            buttonText="Back to Payment"
            buttonType="primary"
            size="full"
            onClick={() => router.push("/payment")}
          />
        </div>
      ) : status === "open" ? (
        <div>
          <p className="mb-6 text-yellow-600">
            Your payment method setup is still in progress. It may take a few
            moments to complete.
          </p>
          <Button
            buttonText="Go to Profile"
            buttonType="primary"
            size="full"
            onClick={handleGoToProfile}
          />
        </div>
      ) : status === "complete" || status !== "expired" ? (
        <div>
          <p className="mb-6">
            Thank you! Your payment method has been successfully saved.
          </p>
          <p className="mb-8">
            You can now purchase tokens instantly without re-entering your
            payment details.
          </p>
          <Button
            buttonText="View My Profile"
            buttonType="primary"
            size="full"
            onClick={handleGoToProfile}
          />
        </div>
      ) : (
        <div>
          <p className="mb-6 text-red-600">
            Your payment method setup was not successful. Please try again or
            contact support.
          </p>
          <Button
            buttonText="Back to Payment"
            buttonType="primary"
            size="full"
            onClick={() => router.push("/payment")}
          />
        </div>
      )}
    </div>
  );
}

// Main page component
export default function PaymentSuccessPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <Container className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] m-4 p-4 bg-green-300">
          <HeadingText>Payment Method Setup Successful!</HeadingText>
          <Suspense
            fallback={<div className="text-center py-8">Loading...</div>}
          >
            <PaymentVerification />
          </Suspense>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
