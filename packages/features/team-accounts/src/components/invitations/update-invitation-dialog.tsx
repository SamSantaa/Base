import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Database } from '@kit/supabase/database';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { updateInvitationAction } from '../../actions/account-invitations-server-actions';
import { UpdateRoleSchema } from '../../schema/update-role-schema';
import { MembershipRoleSelector } from '../membership-role-selector';

type Role = Database['public']['Enums']['account_role'];

export const UpdateInvitationDialog: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  invitationId: number;
  userRole: Role;
}> = ({ isOpen, setIsOpen, invitationId, userRole }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'teams:updateMemberRoleModalHeading'} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={'teams:updateMemberRoleModalDescription'} />
          </DialogDescription>
        </DialogHeader>

        <UpdateInvitationForm
          setIsOpen={setIsOpen}
          invitationId={invitationId}
          userRole={userRole}
        />
      </DialogContent>
    </Dialog>
  );
};

function UpdateInvitationForm({
  invitationId,
  userRole,
  setIsOpen,
}: React.PropsWithChildren<{
  invitationId: number;
  userRole: Role;
  setIsOpen: (isOpen: boolean) => void;
}>) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();

  const onSubmit = ({ role }: { role: Role }) => {
    startTransition(async () => {
      try {
        await updateInvitationAction({
          invitationId,
          role,
        });

        setIsOpen(false);
      } catch (e) {
        setError(true);
      }
    });
  };

  const form = useForm({
    resolver: zodResolver(
      UpdateRoleSchema.refine(
        (data) => {
          return data.role !== userRole;
        },
        {
          message: 'Role must be different from the current role.',
          path: ['role'],
        },
      ),
    ),
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: {
      role: userRole,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={'flex flex-col space-y-6'}
      >
        <If condition={error}>
          <UpdateRoleErrorAlert />
        </If>

        <FormField
          name={'role'}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>New Role</FormLabel>
                <FormControl>
                  <MembershipRoleSelector
                    currentUserRole={userRole}
                    value={field.value}
                    onChange={(newRole) => form.setValue('role', newRole)}
                  />
                </FormControl>

                <FormDescription>Pick a role for this member.</FormDescription>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button data-test={'confirm-update-member-role'} disabled={pending}>
          <Trans i18nKey={'teams:updateRoleSubmitLabel'} />
        </Button>
      </form>
    </Form>
  );
}

function UpdateRoleErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:updateRoleErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'teams:updateRoleErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}