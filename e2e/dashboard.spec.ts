import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("renders all 5 providers, ranked", async ({ page }) => {
    await page.goto("/");

    // Display heading present
    await expect(
      page.getByRole("heading", { name: /providers, ranked by opportunity/i }),
    ).toBeVisible();

    // Table row per provider (5 rows in tbody)
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(5);

    // Top row should be the highest-scored provider (p1 or p5 — both score 71)
    const firstRowText = await rows.first().textContent();
    expect(firstRowText).toMatch(/Chicago|Southeast|Atlanta/);
  });

  test("no sidebar", async ({ page }) => {
    await page.goto("/");
    // Old sidebar had nav items "Dashboard", "Coaching History", "Territory" as Link children
    await expect(page.getByRole("link", { name: "Coaching History" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Territory" })).toHaveCount(0);
  });

  test("score breakdown popover opens", async ({ page }) => {
    await page.goto("/");
    const firstScore = page
      .locator('[aria-label^="Opportunity score"]')
      .first();
    await firstScore.click();
    await expect(page.getByText("Opportunity score")).toBeVisible();
    await expect(page.getByText("Total")).toBeVisible();
  });

  test("row click navigates to provider detail", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^View →$/ }).first().click();
    await expect(page).toHaveURL(/\/provider\//);
    await expect(page.getByText(/Physician/i).first()).toBeVisible();
  });

  test("editing formula weights re-ranks live", async ({ page }) => {
    await page.goto("/");

    const rowsBefore = await page.locator("tbody tr").allTextContents();
    const topBefore = rowsBefore[0];

    // Zero out volume (dominant default weight) and max out testing-gap —
    // this flips which provider sits on top.
    const setRange = (el: HTMLInputElement, val: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };
    await page
      .getByTestId("formula-slider-volume")
      .evaluate(setRange, "0");
    await page
      .getByTestId("formula-slider-testingGap")
      .evaluate(setRange, "100");

    const rowsAfter = await page.locator("tbody tr").allTextContents();
    expect(rowsAfter[0]).not.toEqual(topBefore);

    // Reset restores ordering
    await page.getByTestId("formula-reset").click();
    const rowsReset = await page.locator("tbody tr").allTextContents();
    expect(rowsReset[0]).toEqual(topBefore);
  });
});
