import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("AUREVIA Staff Management & Role Hierarchy Protections", () => {
  const DEFAULT_STAFF = [
    {
      id: "STF-01",
      name: "Prem Mundargi",
      email: "premmundargi135@gmail.com",
      role: "super_admin",
      status: "ACTIVE",
    },
    {
      id: "STF-02",
      name: "Sachin K",
      email: "sachiii8827@gmail.com",
      role: "admin",
      status: "ACTIVE",
    },
  ];

  function validateStaffInvite(callerRole, payload, existingList) {
    const { name, email, role } = payload;
    if (!name || !email || !role) {
      return { valid: false, code: "MISSING_FIELDS" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, code: "INVALID_EMAIL" };
    }

    if (!["super_admin", "admin", "staff"].includes(role)) {
      return { valid: false, code: "INVALID_ROLE" };
    }

    if (role !== "staff" && callerRole !== "super_admin") {
      return { valid: false, code: "FORBIDDEN_ROLE_ESCALATION" };
    }

    if (existingList.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      return { valid: false, code: "STAFF_ALREADY_EXISTS" };
    }

    return { valid: true };
  }

  function validateStaffDeletion(caller, targetId, staffList) {
    if (!targetId) return { allowed: false, code: "MISSING_ID" };

    if (caller.id === targetId || caller.email.toLowerCase() === staffList.find((s) => s.id === targetId)?.email.toLowerCase()) {
      return { allowed: false, code: "SELF_DELETION_FORBIDDEN" };
    }

    const target = staffList.find((s) => s.id === targetId);
    if (!target) return { allowed: false, code: "NOT_FOUND" };

    if (target.id === "STF-01" || target.email === "premmundargi135@gmail.com") {
      return { allowed: false, code: "ROOT_ADMIN_PROTECTED" };
    }

    if (target.role === "super_admin") {
      if (caller.role !== "super_admin") {
        return { allowed: false, code: "FORBIDDEN" };
      }
      const remainingSuperAdmins = staffList.filter((s) => s.role === "super_admin" && s.id !== targetId);
      if (remainingSuperAdmins.length === 0) {
        return { allowed: false, code: "LAST_SUPER_ADMIN" };
      }
    } else if (target.role === "admin" && caller.role !== "super_admin") {
      return { allowed: false, code: "FORBIDDEN" };
    }

    return { allowed: true };
  }

  function validateRoleUpdate(caller, target, newRole, staffList) {
    if (target.role === "super_admin" && caller.role !== "super_admin") {
      return { allowed: false, code: "FORBIDDEN" };
    }
    if (newRole === "super_admin" && caller.role !== "super_admin") {
      return { allowed: false, code: "FORBIDDEN" };
    }
    if (target.role === "admin" && caller.role !== "super_admin" && target.id !== caller.id) {
      return { allowed: false, code: "FORBIDDEN" };
    }
    if (target.role === "super_admin" && newRole !== "super_admin") {
      const activeSuperAdmins = staffList.filter(
        (s) => s.role === "super_admin" && s.status === "ACTIVE" && s.id !== target.id
      );
      if (activeSuperAdmins.length === 0) {
        return { allowed: false, code: "PROTECTED_SUPER_ADMIN" };
      }
    }
    return { allowed: true };
  }

  test("Accepts valid staff invitation from super_admin", () => {
    const res = validateStaffInvite("super_admin", {
      name: "Arjun Mehta",
      email: "arjun@aurevia.com",
      role: "admin",
    }, DEFAULT_STAFF);
    assert.equal(res.valid, true);
  });

  test("Rejects malformed email on staff invitation", () => {
    const res = validateStaffInvite("super_admin", {
      name: "Rohan",
      email: "not-an-email",
      role: "staff",
    }, DEFAULT_STAFF);
    assert.equal(res.valid, false);
    assert.equal(res.code, "INVALID_EMAIL");
  });

  test("Enforces role escalation protection: Admin cannot invite an admin or super_admin", () => {
    const resAdmin = validateStaffInvite("admin", {
      name: "Karan",
      email: "karan@aurevia.com",
      role: "admin",
    }, DEFAULT_STAFF);
    assert.equal(resAdmin.valid, false);
    assert.equal(resAdmin.code, "FORBIDDEN_ROLE_ESCALATION");

    const resSuper = validateStaffInvite("admin", {
      name: "Karan",
      email: "karan@aurevia.com",
      role: "super_admin",
    }, DEFAULT_STAFF);
    assert.equal(resSuper.valid, false);
    assert.equal(resSuper.code, "FORBIDDEN_ROLE_ESCALATION");
  });

  test("Admin CAN invite normal staff members", () => {
    const res = validateStaffInvite("admin", {
      name: "Priya",
      email: "priya@aurevia.com",
      role: "staff",
    }, DEFAULT_STAFF);
    assert.equal(res.valid, true);
  });

  test("Rejects duplicate staff email invitation", () => {
    const res = validateStaffInvite("super_admin", {
      name: "Duplicate Sachin",
      email: "sachiii8827@gmail.com",
      role: "staff",
    }, DEFAULT_STAFF);
    assert.equal(res.valid, false);
    assert.equal(res.code, "STAFF_ALREADY_EXISTS");
  });

  test("Prevents self-deletion of caller administrative account", () => {
    const caller = { id: "STF-02", email: "sachiii8827@gmail.com", role: "admin" };
    const res = validateStaffDeletion(caller, "STF-02", DEFAULT_STAFF);
    assert.equal(res.allowed, false);
    assert.equal(res.code, "SELF_DELETION_FORBIDDEN");
  });

  test("Prevents deletion of protected root super_admin (STF-01)", () => {
    const caller = { id: "STF-99", email: "other_super@aurevia.com", role: "super_admin" };
    const res = validateStaffDeletion(caller, "STF-01", DEFAULT_STAFF);
    assert.equal(res.allowed, false);
    assert.equal(res.code, "ROOT_ADMIN_PROTECTED");
  });

  test("Enforces deletion hierarchy: Admin cannot delete another admin", () => {
    const caller = { id: "STF-03", email: "admin2@aurevia.com", role: "admin" };
    const staffList = [...DEFAULT_STAFF, { id: "STF-03", email: "admin2@aurevia.com", role: "admin", status: "ACTIVE" }];
    const res = validateStaffDeletion(caller, "STF-02", staffList);
    assert.equal(res.allowed, false);
    assert.equal(res.code, "FORBIDDEN");
  });

  test("Super admin can delete an admin account", () => {
    const caller = { id: "STF-01", email: "premmundargi135@gmail.com", role: "super_admin" };
    const res = validateStaffDeletion(caller, "STF-02", DEFAULT_STAFF);
    assert.equal(res.allowed, true);
  });

  test("Prevents demoting the only active super_admin", () => {
    const caller = { id: "STF-01", email: "premmundargi135@gmail.com", role: "super_admin" };
    const target = DEFAULT_STAFF[0];
    const res = validateRoleUpdate(caller, target, "admin", DEFAULT_STAFF);
    assert.equal(res.allowed, false);
    assert.equal(res.code, "PROTECTED_SUPER_ADMIN");
  });
});
