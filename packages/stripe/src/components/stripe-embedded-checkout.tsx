'use client';

import { useState } from 'react';

import { invariant } from '@epic-web/invariant';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

invariant(STRIPE_PUBLISHABLE_KEY, 'Stripe publishable key is required');

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export function StripeCheckout({
  checkoutToken,
  onClose,
}: React.PropsWithChildren<{
  checkoutToken: string;
  onClose?: () => void;
}>) {
  return (
    <EmbeddedCheckoutPopup key={checkoutToken} onClose={onClose}>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret: checkoutToken }}
      >
        <EmbeddedCheckout className={'EmbeddedCheckoutClassName'} />
      </EmbeddedCheckoutProvider>
    </EmbeddedCheckoutPopup>
  );
}

function EmbeddedCheckoutPopup({
  onClose,
  children,
}: React.PropsWithChildren<{
  onClose?: () => void;
}>) {
  const [open, setOpen] = useState(true);
  const className = `bg-white p-4 max-h-[98vh] overflow-y-auto shadow-transparent border`;

  return (
    <Dialog
      defaultOpen
      open={open}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }

        setOpen(open);
      }}
    >
      <DialogHeader>
        <DialogTitle>Complete your purchase</DialogTitle>
      </DialogHeader>

      <DialogContent
        className={className}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
}