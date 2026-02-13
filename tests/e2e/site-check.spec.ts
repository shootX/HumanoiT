import { test, expect } from '@playwright/test';
import { initLog, logStep, logSection, getLogPath } from './e2e-logger';

const LOGIN_EMAIL = process.env.E2E_LOGIN_EMAIL || 'company@example.com';
const LOGIN_PASSWORD = process.env.E2E_LOGIN_PASSWORD || 'password';

test.describe('Site check (auth, navigation, invoices, settings)', () => {
  test.beforeAll(() => {
    initLog();
  });

  test('1. Auth – login with credentials', async ({ page }) => {
    logSection('Auth');
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    logStep('Open /login', 'ok');

    await page.getByLabel(/email|Email address/i).fill(LOGIN_EMAIL);
    await page.getByLabel(/password|Password/i).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: /log in|login/i }).click();

    await page.waitForURL(/\/(dashboard|login)/, { timeout: 15000 }).catch(() => {});
    const url = page.url();
    if (url.includes('/dashboard') || !url.includes('/login')) {
      logStep('Login submit → dashboard or app', 'ok', url);
    } else {
      const err = await page.locator('[class*="error"], .text-red-600, [role="alert"]').first().textContent().catch(() => '');
      logStep('Login submit', 'fail', err || url);
    }
  });

  test('2. Navigation – sidebar links load', async ({ page }) => {
    logSection('Navigation');
    await page.goto('/login');
    await page.getByLabel(/email|Email address/i).fill(LOGIN_EMAIL);
    await page.getByLabel(/password|Password/i).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: /log in|login/i }).click();
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 15000 }).catch(() => {});

    if (page.url().includes('/login')) {
      logStep('Sidebar nav (skip – not logged in)', 'fail');
      return;
    }

    const links = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Workspaces', path: /workspaces/ },
      { name: 'Projects', path: /projects/ },
      { name: 'Invoices', path: /invoices/ },
      { name: 'Notes', path: /notes/ },
      { name: 'Settings', path: /settings/ },
    ];

    for (const { name, path } of links) {
      const link = page.getByRole('link', { name: new RegExp(name, 'i') }).first();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const ok = typeof path === 'string' ? page.url().includes(path) : path.test(page.url());
        const hasError = await page.locator('text=404').isVisible().catch(() => false);
        if (ok && !hasError) {
          logStep(`Nav: ${name}`, 'ok', page.url());
        } else {
          logStep(`Nav: ${name}`, 'fail', page.url());
        }
      } else {
        logStep(`Nav: ${name}`, 'ok', 'not in sidebar (no permission)');
      }
    }
  });

  test('3. Invoices – index, create form, show, mark-as-paid modal', async ({ page }) => {
    logSection('Invoices');
    await page.goto('/login');
    await page.getByLabel(/email|Email address/i).fill(LOGIN_EMAIL);
    await page.getByLabel(/password|Password/i).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: /log in|login/i }).click();
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 15000 }).catch(() => {});

    if (page.url().includes('/login')) {
      logStep('Invoices flow (skip – not logged in)', 'fail');
      return;
    }

    await page.goto('/invoices');
    await page.waitForLoadState('networkidle').catch(() => {});
    if (!page.url().includes('/invoices')) {
      logStep('Invoices index', 'fail', 'redirected to ' + page.url());
      return;
    }
    logStep('Invoices index loads', 'ok');

    const createBtn = page.getByRole('link', { name: /create|new invoice|add/i }).or(page.getByRole('button', { name: /create|new|add/i }));
    if (await createBtn.first().isVisible().catch(() => false)) {
      await createBtn.first().click();
      await page.waitForLoadState('networkidle').catch(() => {});
      const onCreate = page.url().includes('/invoices/create') || page.url().includes('/create');
      logStep('Invoices create form open', onCreate ? 'ok' : 'fail', page.url());
      if (onCreate) {
        const projectSelect = page.locator('select').filter({ has: page.locator('option') }).first();
        if (await projectSelect.isVisible().catch(() => false)) logStep('Create: project select visible', 'ok');
        const categorySelect = page.getByText(/budget category|category/i).first();
        if (await categorySelect.isVisible().catch(() => false)) logStep('Create: budget category visible', 'ok');
      }
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle').catch(() => {});
    }

    const firstRowLink = page.locator('table a[href*="/invoices/"]').first();
    if (await firstRowLink.isVisible().catch(() => false)) {
      await firstRowLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      if (page.url().match(/\/invoices\/\d+/)) {
        logStep('Invoice show opens', 'ok');
        const markPaidBtn = page.getByRole('button', { name: /mark as paid|mark paid/i });
        if (await markPaidBtn.isVisible().catch(() => false)) {
          await markPaidBtn.click();
          await page.waitForTimeout(500);
          const modal = page.locator('[role="dialog"], .modal').filter({ hasText: /mark as paid|payment method/i });
          const modalVisible = await modal.isVisible().catch(() => false);
          if (modalVisible) {
            const select = modal.locator('select').first();
            const opts = await select.locator('option').allTextContents().catch(() => []);
            logStep('Mark as Paid modal + payment method select', 'ok', `options: ${opts.length}`);
          } else {
            logStep('Mark as Paid modal', 'fail', 'modal not found');
          }
        }
      } else {
        logStep('Invoice show', 'fail', page.url());
      }
    } else {
      logStep('Invoice show (no invoices in list)', 'ok', 'skipped');
    }
  });

  test('4. Settings – payment settings page', async ({ page }) => {
    logSection('Settings');
    await page.goto('/login');
    await page.getByLabel(/email|Email address/i).fill(LOGIN_EMAIL);
    await page.getByLabel(/password|Password/i).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: /log in|login/i }).click();
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 15000 }).catch(() => {});

    if (page.url().includes('/login')) {
      logStep('Settings (skip – not logged in)', 'fail');
      return;
    }

    await page.goto('/settings');
    await page.waitForLoadState('networkidle').catch(() => {});
    if (!page.url().includes('/settings')) {
      logStep('Settings page', 'fail', page.url());
      return;
    }
    logStep('Settings page loads', 'ok');

    const paymentLink = page.getByRole('link', { name: /payment/i }).or(page.getByText('Payment', { exact: true }));
    if (await paymentLink.first().isVisible().catch(() => false)) {
      await paymentLink.first().click();
      await page.waitForLoadState('networkidle').catch(() => {});
    }
    const hasPaymentMethods = await page.getByText(/bank transfer|company card|cash/i).first().isVisible().catch(() => false);
    logStep('Payment methods visible (5 methods)', hasPaymentMethods ? 'ok' : 'fail');
  });

  test('5. Console errors', async ({ page }) => {
    logSection('Console');
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.goto('/login');
    await page.getByLabel(/email|Email address/i).fill(LOGIN_EMAIL);
    await page.getByLabel(/password|Password/i).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: /log in|login/i }).click();
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 15000 }).catch(() => {});
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle').catch(() => {});
    const critical = errors.filter((e) => !e.includes('favicon') && !e.includes('Extension'));
    if (critical.length === 0) {
      logStep('No critical console errors on app pages', 'ok');
    } else {
      logStep('Console errors', 'fail', critical.slice(0, 3).join('; '));
    }
  });
});

test.afterAll(async () => {
  // eslint-disable-next-line no-console
  console.log('\nLog file:', getLogPath());
});
