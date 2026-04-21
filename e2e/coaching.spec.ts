import { test, expect } from "@playwright/test";

test.describe("Live coaching", () => {
  test("typed objection produces a streaming response", async ({ page }) => {
    await page.goto("/provider/p5");

    // Open coaching overlay
    await page.getByRole("button", { name: /start coaching session/i }).click();
    await expect(page.getByTestId("coaching-panel")).toBeVisible();

    // Type into the manual-input field (the mic path requires permission dialogs)
    const input = page.getByTestId("objection-input");
    await expect(input).toBeVisible();
    await input.fill(
      "Foundation Medicine gets me reports in 10 days, what about Tempus?",
    );
    await page.getByTestId("objection-submit").click();

    // A response card appears, and eventually its body is non-empty
    const card = page.getByTestId("response-card").first();
    await expect(card).toBeVisible();
    const body = card.getByTestId("response-body");
    await expect.poll(async () => (await body.textContent())?.trim().length ?? 0, {
      timeout: 30_000,
    }).toBeGreaterThan(40);
  });

  test("end session generates summary and save-to-CRM works", async ({
    page,
  }) => {
    await page.goto("/provider/p5");
    await page.getByRole("button", { name: /start coaching session/i }).click();

    // Submit one objection
    const input = page.getByTestId("objection-input");
    await input.fill("Cost is a concern for our CFO.");
    await page.getByTestId("objection-submit").click();

    // Wait for stream to settle (first response card has body content)
    const body = page.getByTestId("response-card").first().getByTestId("response-body");
    await expect.poll(
      async () => (await body.textContent())?.trim().length ?? 0,
      { timeout: 30_000 },
    ).toBeGreaterThan(40);

    // End session
    await page.getByTestId("end-session").click();
    await expect(page.getByTestId("session-summary")).toBeVisible();

    // Wait for summary body (contains the "Save to CRM" button when ready)
    await expect(page.getByTestId("save-to-crm")).toBeVisible({
      timeout: 30_000,
    });

    // Save
    await page.getByTestId("save-to-crm").click();
    await expect(page.getByRole("button", { name: /^saved to crm$/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("close button dismisses the panel", async ({ page }) => {
    await page.goto("/provider/p5");
    await page.getByRole("button", { name: /start coaching session/i }).click();
    await expect(page.getByTestId("coaching-panel")).toBeVisible();
    await page.getByTestId("close-coaching").click();
    await expect(page.getByTestId("coaching-panel")).toHaveCount(0);
  });
});
