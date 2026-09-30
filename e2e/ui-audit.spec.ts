import { expect, test, type Page } from '@playwright/test';

const password = 'DemoPass123!';

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.documentWidth,
    `document overflowed ${dimensions.viewportWidth}px viewport`,
  ).toBeLessThanOrEqual(dimensions.viewportWidth);
}

test('capture seeded UI audit screens', async ({ browser }) => {
  test.setTimeout(120_000);
  const roles = [
    {
      role: 'admin',
      email: 'admin@demo.local',
      paths: [
        '/dashboard',
        '/projects',
        '/projects/demo-project-portal',
        '/board',
        '/admin',
      ],
    },
    {
      role: 'pm',
      email: 'pm@demo.local',
      paths: [
        '/dashboard',
        '/projects',
        '/projects/demo-project-portal',
        '/board',
        '/admin',
      ],
    },
    {
      role: 'engineer',
      email: 'engineer@demo.local',
      paths: ['/dashboard', '/board'],
    },
    {
      role: 'client',
      email: 'client@demo.local',
      paths: ['/dashboard', '/projects', '/projects/demo-project-portal'],
    },
  ];
  for (const account of roles) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto('/login');
    await page.getByLabel('Email address').fill(account.email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    for (const path of account.paths) {
      await page.goto(path);
      await page.waitForTimeout(300);
      if (path.startsWith('/projects/')) {
        await page
          .locator('a[href^="/requirements/"]')
          .filter({ visible: true })
          .first()
          .waitFor({ state: 'visible' });
      }
      const name = path.replaceAll('/', '-').replace(/^-/, '') || 'home';
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `test-results/ui-audit/${account.role}-${name}-1440.png`,
        fullPage: true,
      });
      if (path === '/projects' || path === '/admin') {
        for (const width of [375, 768, 1024]) {
          await page.setViewportSize({ width, height: 900 });
          await expectNoHorizontalOverflow(page);
          await page.screenshot({
            path: `test-results/ui-audit/${account.role}-${name}-${width}.png`,
            fullPage: true,
          });
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
      if (path === '/projects/demo-project-portal') {
        const requirement = page
          .locator('a[href^="/requirements/"]')
          .filter({ visible: true })
          .first();
        if (await requirement.count()) {
          for (const width of [375, 768, 1024]) {
            await page.setViewportSize({ width, height: 900 });
            await expectNoHorizontalOverflow(page);
            await page.screenshot({
              path: `test-results/ui-audit/${account.role}-project-detail-${width}.png`,
              fullPage: true,
            });
          }
          await page.setViewportSize({ width: 1440, height: 1000 });
          await requirement.click();
          await page.waitForURL(/\/requirements\//);
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await page.screenshot({
            path: `test-results/ui-audit/${account.role}-requirement-detail-1440.png`,
            fullPage: true,
          });
          for (const width of [375, 768, 1024]) {
            await page.setViewportSize({ width, height: 900 });
            await expectNoHorizontalOverflow(page);
            await page.screenshot({
              path: `test-results/ui-audit/${account.role}-requirement-detail-${width}.png`,
              fullPage: true,
            });
          }
          await page.setViewportSize({ width: 1440, height: 1000 });
        }
      }
      if (path === '/board' || path === '/dashboard') {
        for (const width of [375, 768, 1024]) {
          await page.setViewportSize({ width, height: 900 });
          await expectNoHorizontalOverflow(page);
          await page.screenshot({
            path: `test-results/ui-audit/${account.role}-${name}-${width}.png`,
            fullPage: true,
          });
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
    }
    await context.close();
  }
  const publicPage = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  for (const path of ['/login', '/register', '/invite/audit-invalid-token']) {
    await publicPage.goto(path);
    await publicPage.waitForTimeout(500);
    await expectNoHorizontalOverflow(publicPage);
    await publicPage.screenshot({
      path: `test-results/ui-audit/public-${path.replaceAll('/', '-')}-1440.png`,
      fullPage: true,
    });
    await publicPage.setViewportSize({ width: 375, height: 812 });
    await expectNoHorizontalOverflow(publicPage);
    await publicPage.screenshot({
      path: `test-results/ui-audit/public-${path.replaceAll('/', '-')}-375.png`,
      fullPage: true,
    });
    await publicPage.setViewportSize({ width: 1440, height: 1000 });
  }
  await publicPage.close();
});
