import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import { SiteHeader } from '~/(marketing)/_components/site-header';
import appConfig from '~/config/app.config';
import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata = {
  title: `Page not found - ${appConfig.name}`,
};

const NotFoundPage = async () => {
  const client = getSupabaseServerComponentClient();

  const {
    data: { session },
  } = await client.auth.getSession();

  return (
    <div className={'flex h-screen flex-1 flex-col'}>
      <SiteHeader session={session} />

      <div
        className={
          'm-auto flex w-full flex-1 flex-col items-center justify-center'
        }
      >
        <div className={'flex flex-col items-center space-y-12'}>
          <div>
            <h1 className={'text-8xl font-extrabold'}>404 :(</h1>
          </div>

          <div className={'flex flex-col items-center space-y-4'}>
            <div className={'flex flex-col items-center space-y-2.5'}>
              <div>
                <Heading level={1}>
                  <Trans i18nKey={'common:pageNotFound'} />
                </Heading>
              </div>

              <p className={'text-muted-foreground'}>
                <Trans i18nKey={'common:pageNotFoundSubHeading'} />
              </p>
            </div>

            <Link href={'/'}>
              <Button variant={'outline'}>
                <ArrowLeft className={'mr-2 h-4'} />

                <Trans i18nKey={'common:backToHomePage'} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withI18n(NotFoundPage);