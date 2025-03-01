"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/app/_utils/ProtectedRoute";
import { HeadingText, Container, Button } from "@/app/_brutalComponents";
import { verifyIntentSession } from "@/lib/stripe";

type SessionStatus = "complete" | "open" | "expired";

export default function PaymentSuccessPage() {
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<SessionStatus | null>(null);
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
        // Use the session_id if available, otherwise use the setup_intent
        const id = sessionId || setupIntentId;
        if (!id) {
          setVerifying(false);
          return;
        }

        const status = await verifyIntentSession(id);
        setStatus(status as SessionStatus);
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
    <ProtectedRoute>
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <Container className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] m-4 p-4 bg-green-300">
          <HeadingText>Payment Method Setup Successful!</HeadingText>

          {verifying ? (
            <div className="text-center py-8">Verifying your setup...</div>
          ) : !sessionId && !setupIntentId ? (
            <div className="text-center py-8">
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
            <div className="text-center py-8">
              <p className="mb-6 text-yellow-600">
                Your payment method setup is still in progress. It may take a
                few moments to complete.
              </p>
              <Button
                buttonText="Go to Profile"
                buttonType="primary"
                size="full"
                onClick={handleGoToProfile}
              />
            </div>
          ) : status === "complete" || status !== "expired" ? (
            <div className="text-center py-8">
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
          ) : status === "expired" || status === "requires_action" ? (
            <div className="text-center py-8">
              <p className="mb-6 text-red-600">
                Your payment method setup was not successful. Please try again
                or contact support.
              </p>
              <Button
                buttonText="Back to Payment"
                buttonType="primary"
                size="full"
                onClick={() => router.push("/payment")}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="mb-6 text-red-600">
                Your payment method setup was not successful. Please try again
                or contact support.
              </p>
            </div>
          )}
        </Container>
      </div>
    </ProtectedRoute>
  );
}
