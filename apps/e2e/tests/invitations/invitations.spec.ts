import { expect, Page, test } from '@playwright/test';
import { InvitationsPageObject } from './invitations.po';

test.describe('Invitations', () => {
  let page: Page;
  let invitations: InvitationsPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    invitations = new InvitationsPageObject(page);

    await invitations.setup();
  });

  test('Full invite flow', async ({page}) => {
    await page.waitForLoadState('networkidle');

    await invitations.navigateToMembers();
    await invitations.openInviteForm();

    const invites = [
      {
        email: invitations.auth.createRandomEmail(),
        role: 'member'
      },
      {
        email: invitations.auth.createRandomEmail(),
        role: 'member'
      },
    ];

    await invitations.inviteMembers(invites);

    const firstEmail = invites[0]!.email;

    await expect(await invitations.getInvitations()).toHaveCount(2)

    // sign out and sign in with the first email
    await invitations.auth.signOut();

    await invitations.auth.visitConfirmEmailLink(invites[0]!.email, {
      deleteAfter: true
    });

    await invitations.auth.signUp({
      email: firstEmail,
      password: 'password',
      repeatPassword: 'password'
    });

    await invitations.auth.visitConfirmEmailLink(firstEmail);

    await invitations.acceptInvitation();

    await invitations.teamAccounts.openAccountsSelector();

    await expect(await invitations.teamAccounts.getTeams()).toHaveCount(1);
  });

  test('users can delete invites', async ({page}) => {
    await page.waitForLoadState('networkidle');

    await invitations.navigateToMembers();
    await invitations.openInviteForm();

    const email = invitations.auth.createRandomEmail();

    const invites = [
      {
        email,
        role: 'member'
      },
    ];

    await invitations.inviteMembers(invites);

    await expect(await invitations.getInvitations()).toHaveCount(1);

    await invitations.deleteInvitation(email);

    await expect(await invitations.getInvitations()).toHaveCount(0);
  });

  test('users can update invites', async ({page}) => {
    await page.waitForLoadState('networkidle');

    await invitations.navigateToMembers();
    await invitations.openInviteForm();

    const email = invitations.auth.createRandomEmail();

    const invites = [
      {
        email,
        role: 'member'
      },
    ];

    await invitations.inviteMembers(invites);

    await expect(await invitations.getInvitations()).toHaveCount(1);

    await invitations.updateInvitation(email, 'owner');

    const row = invitations.getInvitationRow(email);

    await expect(row.locator('[data-test="member-role-badge"]')).toHaveText('owner');
  });
});
