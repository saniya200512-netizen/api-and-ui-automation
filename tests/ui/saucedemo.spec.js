const { test, expect } = require('@playwright/test');

const USER = 'standard_user';
const PASS = 'secret_sauce';
const BACKPACK = 'sauce-labs-backpack';

async function login(page, user = USER, pass = PASS) {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(user);
  await page.locator('[data-test="password"]').fill(pass);
  await page.locator('[data-test="login-button"]').click();
}

async function addBackpack(page) {
  await page.locator(`[data-test="add-to-cart-${BACKPACK}"]`).click();
}

test.describe('Login', () => {
  test('1. valid login lands on products page', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  });

  test('2. invalid login shows an error', async ({ page }) => {
    await login(page, USER, 'wrong_password');
    await expect(page.locator('[data-test="error"]')).toContainText('do not match');
  });
});

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => login(page));

  test('3. adding an item updates the cart badge', async ({ page }) => {
    await addBackpack(page);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('4. cart page lists the added item', async ({ page }) => {
    await addBackpack(page);
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
  });

  test('5. removing an item empties the cart', async ({ page }) => {
    await addBackpack(page);
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator(`[data-test="remove-${BACKPACK}"]`).click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });
});

test.describe('Sorting', () => {
  test.beforeEach(async ({ page }) => login(page));

  test('6. sort by price low to high', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
    const prices = (await page.locator('[data-test="inventory-item-price"]').allTextContents())
      .map((p) => parseFloat(p.replace('$', '')));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('7. sort by name Z to A', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('za');
    const names = await page.locator('[data-test="inventory-item-name"]').allTextContents();
    expect(names).toEqual([...names].sort().reverse());
  });
});

test.describe('Checkout and logout', () => {
  test('8. complete a checkout', async ({ page }) => {
    await login(page);
    await addBackpack(page);
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Tester');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });

  test('9. logout returns to the login page', async ({ page }) => {
    await login(page);
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
