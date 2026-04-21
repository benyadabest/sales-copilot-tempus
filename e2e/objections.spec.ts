import { test, expect } from "@playwright/test";

test.describe("Objection workbench", () => {
  test("nav link reaches the standalone page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /objections/i }).click();
    await expect(page).toHaveURL(/\/objections$/);
    await expect(
      page.getByRole("heading", { name: /test objections, any physician/i }),
    ).toBeVisible();
  });

  test("quick-pick fills textarea and submit generates response", async ({
    page,
  }) => {
    await page.goto("/objections");

    // Select a physician — dr8 (Dr. Torres) lives under provider p5.
    await page.getByTestId("workbench-physician").selectOption("dr8");

    // Click the first quick-pick chip
    await page.getByTestId("workbench-quick-0").click();
    const textarea = page.getByTestId("workbench-objection");
    await expect(textarea).not.toHaveValue("");

    // Submit
    await page.getByTestId("workbench-submit").click();

    // Response body appears with non-trivial content
    const response = page.getByTestId("workbench-response");
    await expect(response).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(async () => (await response.textContent())?.trim().length ?? 0, {
        timeout: 30_000,
      })
      .toBeGreaterThan(40);
  });
});
