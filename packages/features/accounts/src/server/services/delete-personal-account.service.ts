import { SupabaseClient } from '@supabase/supabase-js';

import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

/**
 * @name DeletePersonalAccountService
 * @description Service for managing accounts in the application
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const accountsService = new DeletePersonalAccountService();
 */
export class DeletePersonalAccountService {
  private namespace = 'accounts.delete';

  /**
   * @name deletePersonalAccount
   * Delete personal account of a user.
   * This will delete the user from the authentication provider and cancel all subscriptions.
   *
   * Permissions are not checked here, as they are checked in the server action.
   * USE WITH CAUTION. THE USER MUST HAVE THE NECESSARY PERMISSIONS.
   */
  async deletePersonalAccount(params: {
    adminClient: SupabaseClient<Database>;

    userId: string;
    userEmail: string | null;

    emailSettings: {
      fromEmail: string;
      productName: string;
    };
  }) {
    const userId = params.userId;
    const logger = await getLogger();

    logger.info(
      { name: this.namespace, userId },
      'User requested deletion. Processing...',
    );

    // execute the deletion of the user
    try {
      await params.adminClient.auth.admin.deleteUser(userId);
    } catch (error) {
      logger.error(
        {
          name: this.namespace,
          userId,
          error,
        },
        'Error deleting user',
      );

      throw new Error('Error deleting user');
    }

    logger.info({ name: this.namespace, userId }, 'User deleted successfully');
  }
}
