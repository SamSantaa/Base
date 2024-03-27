'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getProductPlanPairFromId } from '@kit/billing';
import { getBillingGatewayProvider } from '@kit/billing-gateway';
import { Logger } from '@kit/shared/logger';
import { requireAuth } from '@kit/supabase/require-auth';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import appConfig from '~/config/app.config';
import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';

/**
 * Creates a checkout session for a personal account.
 *
 * @param {object} params - The parameters for creating the checkout session.
 * @param {string} params.planId - The ID of the plan to be associated with the account.
 */
export async function createPersonalAccountCheckoutSession(params: {
  planId: string;
}) {
  const client = getSupabaseServerActionClient();
  const { data, error } = await requireAuth(client);

  if (error ?? !data.user) {
    throw new Error('Authentication required');
  }

  const planId = z.string().min(1).parse(params.planId);

  Logger.info(
    {
      planId,
    },
    `Creating checkout session for plan ID`,
  );

  const service = await getBillingGatewayProvider(client);
  const productPlanPairFromId = getProductPlanPairFromId(billingConfig, planId);

  if (!productPlanPairFromId) {
    throw new Error('Product not found');
  }

  // in the case of personal accounts
  // the account ID is the same as the user ID
  const accountId = data.user.id;

  // the return URL for the checkout session
  const returnUrl = getCheckoutSessionReturnUrl();

  // find the customer ID for the account if it exists
  // (eg. if the account has been billed before)
  const customerId = await getCustomerIdFromAccountId(accountId);

  // retrieve the product and plan from the billing configuration
  const { product, plan } = productPlanPairFromId;

  // call the payment gateway to create the checkout session
  const { checkoutToken } = await service.createCheckoutSession({
    paymentType: product.paymentType,
    returnUrl,
    accountId,
    planId,
    trialPeriodDays: plan.trialPeriodDays,
    customerEmail: data.user.email,
    customerId,
  });

  Logger.info(
    {
      userId: data.user.id,
    },
    `Checkout session created. Returning checkout token to client...`,
  );

  // return the checkout token to the client
  // so we can call the payment gateway to complete the checkout
  return {
    checkoutToken,
  };
}

export async function createPersonalAccountBillingPortalSession() {
  const client = getSupabaseServerActionClient();
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error('Authentication required');
  }

  const service = await getBillingGatewayProvider(client);

  const accountId = data.user.id;
  const customerId = await getCustomerIdFromAccountId(accountId);
  const returnUrl = getBillingPortalReturnUrl();

  if (!customerId) {
    throw new Error('Customer not found');
  }

  const { url } = await service.createBillingPortalSession({
    customerId,
    returnUrl,
  });

  return redirect(url);
}

function getCheckoutSessionReturnUrl() {
  return new URL(
    pathsConfig.app.personalAccountBillingReturn,
    appConfig.url,
  ).toString();
}

function getBillingPortalReturnUrl() {
  return new URL(
    pathsConfig.app.personalAccountBilling,
    appConfig.url,
  ).toString();
}

async function getCustomerIdFromAccountId(accountId: string) {
  const client = getSupabaseServerActionClient();

  const { data, error } = await client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', accountId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.customer_id;
}