import { formatDate } from 'date-fns';
import { BadgeCheck, CheckCircle2 } from 'lucide-react';

import { BillingConfig, getProductPlanPairByVariantId } from '@kit/billing';
import { Database } from '@kit/supabase/database';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { CurrentPlanAlert } from './current-plan-alert';
import { CurrentPlanBadge } from './current-plan-badge';
import { LineItemDetails } from './line-item-details';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type LineItem = Database['public']['Tables']['subscription_items']['Row'];

interface Props {
  subscription: Subscription & {
    items: LineItem[];
  };

  config: BillingConfig;
}

export function CurrentPlanCard({
  subscription,
  config,
}: React.PropsWithChildren<Props>) {
  const lineItems = subscription.items;
  const firstLineItem = lineItems[0];

  if (!firstLineItem) {
    throw new Error('No line items found in subscription');
  }

  const { product, plan } = getProductPlanPairByVariantId(
    config,
    firstLineItem.variant_id,
  );

  if (!product || !plan) {
    throw new Error(
      'Product or plan not found. Did you forget to add it to the billing config?',
    );
  }

  const productLineItems = plan.lineItems;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans i18nKey="billing:planCardTitle" />
        </CardTitle>

        <CardDescription>
          <Trans i18nKey="billing:planCardDescription" />
        </CardDescription>
      </CardHeader>

      <CardContent className={'space-y-3 text-sm'}>
        <div className={'flex flex-col space-y-1'}>
          <div className={'flex items-center space-x-2 text-lg font-semibold'}>
            <BadgeCheck
              className={
                's-6 fill-green-500 text-white dark:fill-white dark:text-black'
              }
            />

            <span>{product.name}</span>

            <CurrentPlanBadge status={subscription.status} />
          </div>
        </div>

        {/*
         Only show the alert if the subscription requires action
          (e.g. trial ending soon, subscription canceled, etc.)
        */}
        <If condition={!subscription.active}>
          <div>
            <CurrentPlanAlert status={subscription.status} />
          </div>
        </If>

        <div>
          <If condition={subscription.status === 'trialing'}>
            <div className="flex flex-col space-y-0.5">
              <span className="font-semibold">
                <Trans i18nKey="billing:trialEndsOn" />
              </span>

              <div className={'text-muted-foreground'}>
                <span>
                  {subscription.trial_ends_at
                    ? formatDate(subscription.trial_ends_at, 'P')
                    : ''}
                </span>
              </div>
            </div>
          </If>

          <If condition={subscription.cancel_at_period_end}>
            <div className="flex flex-col space-y-0.5">
              <span className="font-semibold">
                <Trans i18nKey="billing:cancelSubscriptionDate" />
              </span>

              <div className={'text-muted-foreground'}>
                <span>
                  {formatDate(subscription.period_ends_at ?? '', 'P')}
                </span>
              </div>
            </div>
          </If>

          <div className="flex flex-col space-y-0.5">
            <span className="font-semibold">
              <Trans i18nKey="billing:detailsLabel" />
            </span>

            <LineItemDetails
              lineItems={productLineItems}
              currency={subscription.currency}
              selectedInterval={firstLineItem.interval}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
