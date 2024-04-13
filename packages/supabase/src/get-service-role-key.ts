import 'server-only';

import { z } from 'zod';

/**
 * @name getServiceRoleKey
 * @description Get the Supabase Service Role Key.
 * ONLY USE IN SERVER-SIDE CODE. DO NOT EXPOSE THIS TO CLIENT-SIDE CODE.
 */
export function getServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return z.string().min(1).parse(serviceRoleKey);
}

/**
 * Displays a warning message if the Supabase Service Role is being used.
 */
export function warnServiceRoleKeyUsage() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Dev Only] This is a simple warning to let you know you are using the Supabase Service Role. Make sure it's the right call.`,
    );
  }
}