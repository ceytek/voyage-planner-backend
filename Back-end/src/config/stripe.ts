import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover', // Latest Stripe API version
  typescript: true,
});

// Export configuration
export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: process.env.STRIPE_CURRENCY || 'usd',
  
  // Credit packages with Price IDs
  creditPackages: {
    credits_150: {
      priceId: process.env.STRIPE_PRICE_150_CREDITS || '',
      credits: 150,
      amount: 9.99,
      name: '150 Credits Package'
    },
    credits_350: {
      priceId: process.env.STRIPE_PRICE_350_CREDITS || '',
      credits: 350,
      amount: 19.99,
      name: '350 Credits Package'
    },
    credits_800: {
      priceId: process.env.STRIPE_PRICE_800_CREDITS || '',
      credits: 800,
      amount: 39.99,
      name: '800 Credits Package'
    }
  }
};

console.log('✅ Stripe initialized successfully');
console.log('💳 Currency:', stripeConfig.currency.toUpperCase());
console.log('📦 Credit packages configured:', Object.keys(stripeConfig.creditPackages).length);
