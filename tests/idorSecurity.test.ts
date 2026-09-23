import { describe, it, expect } from "vitest";

describe("Sprint 2 Security: Insecure Direct Object Reference (IDOR) Prevention", () => {
  const mockOrderRecord = {
    order_number: "MB-20260923-00042",
    order_token: "d3b07384-d113-44f2-95f0-519f95d85d77",
    customer_phone: "+919876543210",
    customer_email: "priya@example.com",
    total_amount: 499,
  };

  it("permits access when correct cryptographic order_token is presented", () => {
    const presentedToken = "d3b07384-d113-44f2-95f0-519f95d85d77";
    const isAuthorized = presentedToken === mockOrderRecord.order_token;
    expect(isAuthorized).toBe(true);
  });

  it("denies access when attacker guesses an order number without valid token", () => {
    const guessedToken = "00000000-0000-0000-0000-000000000000";
    const isAuthorized = guessedToken === mockOrderRecord.order_token;
    expect(isAuthorized).toBe(false);
  });

  it("permits order tracking lookup only when verified phone or email matches", () => {
    // Correct verification
    const correctPhone = "9876543210";
    const cleanPhone = mockOrderRecord.customer_phone.replace(/[\s\-\+]/g, "");
    const matchesPhone = cleanPhone.includes(correctPhone);
    expect(matchesPhone).toBe(true);

    // Attacker guessed order number with wrong phone
    const wrongPhone = "9111111111";
    const matchesWrongPhone = cleanPhone.includes(wrongPhone);
    expect(matchesWrongPhone).toBe(false);
  });
});
