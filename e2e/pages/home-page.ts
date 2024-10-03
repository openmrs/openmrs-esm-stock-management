import { Page } from '@playwright/test';

export class HomePage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto('/openmrs/spa/stock-management');
  }
}
