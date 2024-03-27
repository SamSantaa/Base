import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

import { getBillingGatewayProvider } from '@kit/billing-gateway';
import { BillingSessionStatus } from '@kit/billing-gateway/components';
import { requireAuth } from '@kit/supabase/require-auth';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

interface SessionPageProps {
  searchParams: {
    session_id: string;
  };
}

const LazyEmbeddedCheckout = dynamic(
  async () => {
    const { EmbeddedCheckout } = await import(
      '@kit/billing-gateway/components'
    );

    return EmbeddedCheckout;
  },
  {
    ssr: false,
  },
);

async function ReturnStripeSessionPage({ searchParams }: SessionPageProps) {
  const { customerEmail, checkoutToken } = await loadCheckoutSession(
    searchParams.session_id,
  );

  if (checkoutToken) {
    return (
      <LazyEmbeddedCheckout
        checkoutToken={checkoutToken}
        provider={billingConfig.provider}
      />
    );
  }

  return (
    <>
      <div className={'fixed left-0 top-48 z-50 mx-auto w-full'}>
        <BillingSessionStatus
          customerEmail={customerEmail ?? ''}
          redirectPath={pathsConfig.app.home}
        />
      </div>

      <div
        className={
          'fixed left-0 top-0 w-full bg-background/30 backdrop-blur-sm' +
          ' !m-0 h-full'
        }
      />
    </>
  );
}

export default withI18n(ReturnStripeSessionPage);

export async function loadCheckoutSession(sessionId: string) {
  const client = getSupabaseServerComponentClient();

  await requireAuth(client);

  const gateway = await getBillingGatewayProvider(client);

  const session = await gateway.retrieveCheckoutSession({
    sessionId,
  });

  if (!session) {
    notFound();
  }

  const checkoutToken = session.isSessionOpen ? session.checkoutToken : null;

  // otherwise - we show the user the return page
  // and display the details of the session
  return {
    status: session.status,
    customerEmail: session.customer.email,
    checkoutToken,
  };
}