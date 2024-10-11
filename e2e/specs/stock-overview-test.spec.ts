import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { HomePage } from '../pages';

dotenv.config();

test.describe('Overview Page Test', () => {
  test('should navigate to the Overview page and verify sections', async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step('When I visit the home page', async () => {
      await homePage.gotoHome();
    });

    await test.step('Then I should be at the home page', async () => {
      await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}spa/login`);
    });
  });
});
