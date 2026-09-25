import { expect, test, type Page } from '@playwright/test';

const demoPassword = 'DemoPass123!';

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(demoPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test('client submission moves through PM approval and engineering start in real time', async ({
  browser,
}) => {
  const runId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const requirementTitle = `E2E delivery request ${runId}`;
  const taskTitle = `Implement request ${runId}`;

  const clientContext = await browser.newContext();
  const clientPage = await clientContext.newPage();
  await signIn(clientPage, 'client@demo.local');
  await clientPage.goto('/projects/demo-project-portal');
  await clientPage.getByLabel('Title').fill(requirementTitle);
  await clientPage
    .getByLabel('Description')
    .fill(
      'Deliver a tenant-safe status view for the end-to-end release check.',
    );
  await clientPage.getByLabel('Priority').selectOption('HIGH');
  await clientPage.getByRole('button', { name: 'Submit requirement' }).click();
  await expect(
    clientPage.getByText('Requirement submitted for review.'),
  ).toBeVisible();
  await clientPage
    .getByRole('link', { name: new RegExp(requirementTitle) })
    .click();
  await expect(clientPage).toHaveURL(/\/requirements\/[^/]+$/);
  const requirementUrl = clientPage.url();

  const pmContext = await browser.newContext();
  const pmPage = await pmContext.newPage();
  await signIn(pmPage, 'pm@demo.local');
  await pmPage.goto(requirementUrl);
  await expect(
    pmPage.getByRole('heading', { level: 1, name: 'Requirement' }),
  ).toBeVisible();

  await pmPage.getByRole('button', { name: 'Apply transition' }).click();
  await expect(pmPage.getByLabel('Next status')).toHaveValue('NEEDS_INFO');
  await pmPage.getByLabel('Next status').selectOption('APPROVED');
  await pmPage.getByRole('button', { name: 'Apply transition' }).click();
  await expect(pmPage.getByRole('heading', { name: 'Add task' })).toBeVisible();

  await pmPage.getByLabel('Task title').fill(taskTitle);
  await pmPage.getByLabel('Engineer').selectOption({ label: 'Eli Engineer' });
  await pmPage
    .getByLabel('Description', { exact: true })
    .fill('Implement and verify the approved end-to-end delivery request.');
  await pmPage.getByLabel('Estimate (hours)').fill('2');
  await pmPage.getByRole('button', { name: 'Add task' }).click();
  await expect(
    pmPage.getByText('Task added to the requirement breakdown.'),
  ).toBeVisible();

  const engineerContext = await browser.newContext();
  const engineerPage = await engineerContext.newPage();
  await signIn(engineerPage, 'engineer@demo.local');
  await engineerPage.goto('/board');
  const taskCard = engineerPage
    .locator('article')
    .filter({ hasText: taskTitle });
  await expect(taskCard).toBeVisible();
  await taskCard.getByLabel('Status').selectOption('IN_PROGRESS');
  await expect(
    engineerPage.getByText(`${taskTitle} moved to in progress.`),
  ).toBeVisible();

  await expect(
    clientPage.getByText('IN PROGRESS', { exact: true }),
  ).toBeVisible({
    timeout: 15_000,
  });

  await Promise.all([
    clientContext.close(),
    pmContext.close(),
    engineerContext.close(),
  ]);
});

test('client cannot open another client account project', async ({ page }) => {
  await signIn(page, 'client@demo.local');
  await page.goto('/projects/demo-project-operations');

  await expect(
    page.getByRole('heading', { name: 'Unable to load this project' }),
  ).toBeVisible();
  await expect(page.getByText('Store Operations Dashboard')).toHaveCount(0);
});
