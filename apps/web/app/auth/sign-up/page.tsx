import Link from 'next/link';

import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signUp'),
  };
};

interface Props {
  searchParams: {
    invite_token?: string;
  };
}

function SignUpPage({ searchParams }: Props) {
  const inviteToken = searchParams.invite_token;

  return (
    <>
      <Heading level={5}>
        <Trans i18nKey={'auth:signUpHeading'} />
      </Heading>

      <SignUpMethodsContainer
        providers={authConfig.providers}
        paths={{
          callback: pathsConfig.auth.callback,
        }}
        inviteToken={inviteToken}
      />

      <div className={'justify-centers flex'}>
        <Link href={pathsConfig.auth.signIn}>
          <Button variant={'link'} size={'sm'}>
            <Trans i18nKey={'auth:alreadyHaveAnAccount'} />
          </Button>
        </Link>
      </div>
    </>
  );
}

export default withI18n(SignUpPage);