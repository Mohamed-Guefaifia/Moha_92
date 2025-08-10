import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const priceId = process.env.STRIPE_PRICE_ID!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
      trial_period_days: 14,
    },
    payment_method_collection: "always",
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=cancel`,
  });

  return NextResponse.json({ url: session.url });
}