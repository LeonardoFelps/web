const { test, expect } = require("@playwright/test");

test("executive dashboard should render and switch period", async ({ page }) => {
  await page.goto("/dashboard.html");
  await expect(page.getByRole("heading", { name: /visão executiva|executive overview/i })).toBeVisible();
  await page.getByRole("button", { name: /30 dias|30 days/i }).click();
  await expect(page.locator("#metric-revenue")).toContainText("R$");
});

test("operational dashboard should render and export button exist", async ({ page }) => {
  await page.goto("/dashboard-operacional.html");
  await expect(page.getByText(/dashboard operacional/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /exportar csv|export csv/i })).toBeVisible();
});
