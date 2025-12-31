'use client';

import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';

interface SubscriptionButtonProps {
  session: Session;
  priceId: string;
  buttonText: string;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ session, priceId, buttonText }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscription = async () => {
    if (!session?.user?.email) {
      alert('Please log in to subscribe.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          planName: 'subscription',
        }),
      });

      const { url, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to initiate subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscription}
      disabled={isLoading || !session}
      className="px-6 py-3 rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 mt-8"
    >
      {isLoading ? 'Processing...' : buttonText}
    </button>
  );
};

export default SubscriptionButton;
