import Stripe from "stripe";
import admin from "firebase-admin";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Create a Stripe checkout session for saving payment method
 */
export async function createIntentSession(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // First, check if the customer already exists in Stripe
  let customerId: string;
  const userSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .get();

  if (userSnapshot.exists && userSnapshot.data()?.stripeCustomerId) {
    // Use existing customer
    customerId = userSnapshot.data()?.stripeCustomerId;
  } else {
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      metadata: {
        userId,
        email: userSnapshot.data()?.email,
      },
    });
    customerId = customer.id;

    // Save the customer ID to Firestore
    await admin.firestore().collection("users").doc(userId).set(
      {
        stripeCustomerId: customerId,
        email: userSnapshot.data()?.email,
      },
      { merge: true }
    );
  }

  // Create a checkout session with $0 amount to save the payment method
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "setup",
    customer: customerId,
    success_url: `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/payment/cancel`,
    metadata: {
      userId,
      email: userSnapshot.data()?.email,
    },
  });

  return {
    intent: {
      id: session.id,
      url: session.url,
    },
  };
}

/**
 * Verify a checkout session
 */
export async function verifyIntentSession(sessionId: string): Promise<string> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session.status || "unknown";
}

/**
 * Charge a customer using their saved payment method
 */
export async function chargeCustomer(
  userId: string,
  amount: number,
  description: string
) {
  // Get the customer ID from Firestore
  const userSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .get();

  if (!userSnapshot.exists || !userSnapshot.data()?.stripeCustomerId) {
    throw new Error("Customer not found");
  }

  const customerId = userSnapshot.data()?.stripeCustomerId;

  // Get the customer's payment methods
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  if (paymentMethods.data.length === 0) {
    throw new Error("No payment method found");
  }

  // Use the most recent payment method
  const paymentMethodId = paymentMethods.data[0].id;

  // Create a payment intent and confirm it immediately
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
    description,
    metadata: {
      userId,
      tokens: Math.floor(amount / 10).toString(), // 1 token per $0.10
    },
  });

  return paymentIntent;
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulSetup(session);
      break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleSuccessfulPayment(paymentIntent);
      break;
    // Add more event handlers as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle successful setup by updating user's payment method status
 */
async function handleSuccessfulSetup(session: Stripe.Checkout.Session) {
  const { userId } = session.metadata || {};

  if (!userId) {
    console.error("Missing userId in session metadata", session.id);
    return;
  }

  try {
    // Update the user's document to indicate they have a payment method
    await admin.firestore().collection("users").doc(userId).update({
      hasPaymentMethod: true,
      paymentMethodSetupDate: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(
      `Successfully updated payment method status for user ${userId}`
    );
  } catch (error) {
    console.error("Error updating payment method status:", error);
    throw error;
  }
}

/**
 * Handle successful payment by updating user's token balance
 */
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const { userId, tokens } = paymentIntent.metadata || {};

  if (!userId || !tokens) {
    console.error("Missing metadata in payment intent", paymentIntent.id);
    return;
  }

  try {
    // Get a reference to the user's document in Firestore
    const userRef = admin.firestore().collection("users").doc(userId);

    // Update the user's token balance in a transaction
    await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        // Create user document if it doesn't exist
        transaction.set(userRef, {
          tokenBalance: parseInt(tokens),
          purchaseHistory: [
            {
              date: admin.firestore.FieldValue.serverTimestamp(),
              tokens: parseInt(tokens),
              paymentId: paymentIntent.id,
              amount: paymentIntent.amount,
            },
          ],
        });
      } else {
        // Update existing user document
        const userData = userDoc.data();
        const currentBalance = userData?.tokenBalance || 0;

        transaction.update(userRef, {
          tokenBalance: currentBalance + parseInt(tokens),
          purchaseHistory: admin.firestore.FieldValue.arrayUnion({
            date: admin.firestore.FieldValue.serverTimestamp(),
            tokens: parseInt(tokens),
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount,
          }),
        });
      }
    });

    console.log(`Successfully updated token balance for user ${userId}`);
  } catch (error) {
    console.error("Error updating user token balance:", error);
    throw error;
  }
}
