import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubscribe = async () => {
    const { data: { id } } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/payments/create-checkout-session`);
    stripe.redirectToCheckout({ sessionId: id });
  };

  return (
    <div>
      <h2>Subscribe to Premium ($9/month)</h2>
      <button onClick={handleSubscribe}>Subscribe</button>
    </div>
  );
};

const Premium = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Premium;