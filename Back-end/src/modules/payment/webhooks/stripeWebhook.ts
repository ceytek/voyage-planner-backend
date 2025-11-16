import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, stripeConfig } from '../../../config/stripe';
import { PaymentService } from '../services/PaymentService';

export class StripeWebhookHandler {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Handle incoming webhook events from Stripe
   */
  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      console.error('❌ No stripe-signature header found');
      return res.status(400).send('Webhook Error: No signature');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      if (stripeConfig.webhookSecret) {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          stripeConfig.webhookSecret
        );
        console.log('✅ Webhook signature verified');
      } else {
        // For development without webhook secret
        console.warn('⚠️ Webhook secret not configured, using unverified event');
        event = JSON.parse(req.body);
      }
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('🔔 Webhook event received:', event.type);

    // Handle the event
    try {
      await this.paymentService.handleWebhookEvent(event);
      
      // Return a 200 response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error: any) {
      console.error('❌ Error handling webhook:', error.message);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
}

// Export singleton instance
export const stripeWebhookHandler = new StripeWebhookHandler();
