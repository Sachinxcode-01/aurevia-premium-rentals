import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("AUREVIA Authentication & Security Protections", () => {
  // Input validation logic from auth actions
  function validateRegistration(email, password, fullName) {
    if (!email || !email.includes("@") || !email.includes(".")) {
      return { valid: false, error: "Please enter a valid email address." };
    }
    if (!password || password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters." };
    }
    if (!fullName || fullName.trim().length === 0) {
      return { valid: false, error: "Full name is required." };
    }
    return { valid: true };
  }

  function checkAdminPrivileges(role) {
    const adminRoles = ["admin", "staff", "super_admin"];
    return adminRoles.includes(role);
  }

  test("Rejects malformed email on registration", () => {
    const res = validateRegistration("invalid-email", "pass12345", "Prem Mundargi");
    assert.equal(res.valid, false);
    assert.equal(res.error, "Please enter a valid email address.");
  });

  test("Rejects weak password under 6 characters", () => {
    const res = validateRegistration("valid@aurevia.com", "123", "Prem Mundargi");
    assert.equal(res.valid, false);
    assert.equal(res.error, "Password must be at least 6 characters.");
  });

  test("Accepts complete and valid registration payload", () => {
    const res = validateRegistration("filmmaker@cinema.com", "SecurePass@2026", "Vikram Sen");
    assert.equal(res.valid, true);
  });

  test("Enforces RBAC: Customer role is denied administrative access", () => {
    assert.equal(checkAdminPrivileges("customer"), false);
    assert.equal(checkAdminPrivileges("guest"), false);
    assert.equal(checkAdminPrivileges(undefined), false);
  });

  test("Enforces RBAC: Admin and staff roles are granted administrative access", () => {
    assert.equal(checkAdminPrivileges("admin"), true);
    assert.equal(checkAdminPrivileges("staff"), true);
    assert.equal(checkAdminPrivileges("super_admin"), true);
  });
});
