'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { isBrowser } from '@supabase/ssr';

import { useSupabase } from '../hooks/use-supabase';
import {
  useRevalidateUserSession,
  useUserSession,
} from '../hooks/use-user-session';

function AuthRedirectListener({
  children,
  appHomePath,
}: React.PropsWithChildren<{
  appHomePath: string;
}>) {
  const client = useSupabase();
  const pathName = usePathname();
  const router = useRouter();
  const revalidateUserSession = useRevalidateUserSession();
  const session = useUserSession();
  const accessToken = session.data?.access_token;

  useEffect(() => {
    // keep this running for the whole session unless the component was unmounted
    const listener = client.auth.onAuthStateChange((_, user) => {
      // log user out if user is falsy
      // and if the current path is a private route
      const shouldRedirectUser = !user && isPrivateRoute(pathName);

      if (shouldRedirectUser) {
        // send user away when signed out
        window.location.assign('/');

        return;
      }

      if (accessToken) {
        const isOutOfSync = user?.access_token !== accessToken;

        if (isOutOfSync) {
          void router.refresh();
        }
      }
    });

    // destroy listener on un-mounts
    return () => listener.data.subscription.unsubscribe();
  }, [
    client.auth,
    router,
    accessToken,
    revalidateUserSession,
    pathName,
    appHomePath,
  ]);

  return <>{children}</>;
}

export function AuthChangeListener({
  children,
  appHomePath,
}: React.PropsWithChildren<{
  appHomePath: string;
  privateRoutes?: string[];
}>) {
  const shouldActivateListener = isBrowser();

  // we only activate the listener if
  // we are rendering in the browser
  if (!shouldActivateListener) {
    return <>{children}</>;
  }

  return (
    <AuthRedirectListener appHomePath={appHomePath}>
      {children}
    </AuthRedirectListener>
  );
}

function isPrivateRoute(path: string) {
  // TODO: use config
  const prefixes = ['/home', '/admin', '/password-reset'];

  return prefixes.some((prefix) => path.startsWith(prefix));
}