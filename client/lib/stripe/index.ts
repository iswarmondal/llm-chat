"use client";

import { loadStripe } from "@stripe/stripe-js";
import { auth } from "@/lib/firebase/init";

// Initialize Stripe with the publishable key
loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

/**
 * Create a checkout session and redirect to Stripe checkout
 */
export async function createIntentSession(): Promise<void> {
  try {
    // Get the current user's ID token
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const idToken = await user.getIdToken();

    console.log("idToken", idToken);

    // Create checkout session
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-intent-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create checkout session");
    }

    const { intent } = await response.json();

    console.log("checkout session", intent);

    // Redirect to Stripe's hosted checkout page
    if (intent && intent.url) {
      // Directly redirect to the Stripe Checkout URL
      window.location.href = intent.url;
    } else {
      throw new Error("Invalid checkout session response from server");
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Verify a checkout session or setup intent
 */
export async function verifyIntentSession(id: string): Promise<string> {
  try {
    // Get the current user's ID token
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const idToken = await user.getIdToken();

    // Determine if this is a session ID or setup intent ID
    const isSessionId = id.startsWith("cs_");
    const queryParam = isSessionId ? "sessionId" : "intentId";

    // Verify the session or intent
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify-intent?${queryParam}=${id}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to verify payment");
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
}

/**
 * Purchase tokens using saved payment method
 */
export async function purchaseTokens(amount: number): Promise<void> {
  try {
    // Get the current user's ID token
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const idToken = await user.getIdToken();

    // Create payment intent
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payment/charge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ amount }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to process payment");
    }

    const { success, paymentIntent } = await response.json();

    if (!success) {
      throw new Error("Payment failed");
    }

    console.log("Payment successful", paymentIntent);
    return;
  } catch (error) {
    console.error("Error purchasing tokens:", error);
    throw error;
  }
}
