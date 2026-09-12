import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("AUREVIA Booking Lifecycle & KYC Operations", () => {
  const VALID_BOOKING_STATUSES = [
    "pending",
    "paid",
    "approval_pending",
    "approved",
    "ready_for_pickup",
    "rented",
    "returned",
    "completed",
    "cancelled",
    "rejected",
    "overdue",
  ];

  function validateBookingStatusTransition(currentStatus, targetStatus) {
    if (!targetStatus || !VALID_BOOKING_STATUSES.includes(targetStatus.toLowerCase())) {
      return { valid: false, code: "INVALID_STATUS_VALUE" };
    }

    const curr = currentStatus.toLowerCase();
    const next = targetStatus.toLowerCase();

    // Completed bookings cannot be reverted to pending or paid
    if (curr === "completed" && ["pending", "paid", "approval_pending"].includes(next)) {
      return { valid: false, code: "INVALID_TRANSITION" };
    }

    // Cancelled bookings cannot jump straight to active states
    if (curr === "cancelled" && ["rented", "ready_for_pickup", "returned", "completed"].includes(next)) {
      return { valid: false, code: "INVALID_TRANSITION" };
    }

    return { valid: true, targetStatus: next };
  }

  function filterAndPaginateBookings(bookings, { search, status, page = 1, limit = 10 }) {
    let filtered = [...bookings];

    if (status && status !== "ALL") {
      filtered = filtered.filter((b) => b.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.reference_code?.toLowerCase().includes(q) ||
          b.contact_name?.toLowerCase().includes(q) ||
          b.contact_phone?.includes(q)
      );
    }

    const total = filtered.length;
    const pages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return { items, total, pages, page, limit };
  }

  function validateKycAction(docId, targetStatus, rejectionReason) {
    if (!docId || !targetStatus) {
      return { valid: false, code: "INVALID_KYC_ACTION" };
    }

    const allowed = ["approved", "rejected", "reupload_required"];
    const next = targetStatus.toLowerCase();

    if (!allowed.includes(next)) {
      return { valid: false, code: "INVALID_KYC_STATUS" };
    }

    if (next === "rejected" && (!rejectionReason || rejectionReason.trim().length === 0)) {
      return { valid: false, code: "REJECTION_REASON_REQUIRED" };
    }

    return { valid: true, status: next, rejectionReason: rejectionReason || null };
  }

  // --- Booking Lifecycle Tests ---
  test("Allows standard forward booking lifecycle transitions", () => {
    assert.equal(validateBookingStatusTransition("pending", "paid").valid, true);
    assert.equal(validateBookingStatusTransition("paid", "approved").valid, true);
    assert.equal(validateBookingStatusTransition("approved", "ready_for_pickup").valid, true);
    assert.equal(validateBookingStatusTransition("ready_for_pickup", "rented").valid, true);
    assert.equal(validateBookingStatusTransition("rented", "returned").valid, true);
    assert.equal(validateBookingStatusTransition("returned", "completed").valid, true);
  });

  test("Rejects unrecognized booking status strings", () => {
    const res = validateBookingStatusTransition("pending", "magical_status");
    assert.equal(res.valid, false);
    assert.equal(res.code, "INVALID_STATUS_VALUE");
  });

  test("Rejects invalid transition from completed to pending", () => {
    const res = validateBookingStatusTransition("completed", "pending");
    assert.equal(res.valid, false);
    assert.equal(res.code, "INVALID_TRANSITION");
  });

  test("Rejects cancelled booking jumping straight to rented", () => {
    const res = validateBookingStatusTransition("cancelled", "rented");
    assert.equal(res.valid, false);
    assert.equal(res.code, "INVALID_TRANSITION");
  });

  // --- Search & Pagination Tests ---
  test("Filters bookings by search query on reference code, name, and phone", () => {
    const sampleBookings = [
      { id: "1", reference_code: "AUR-8821", contact_name: "Christopher Nolan", contact_phone: "+91 99999 11111", status: "completed" },
      { id: "2", reference_code: "AUR-9942", contact_name: "Roger Deakins", contact_phone: "+91 88888 22222", status: "rented" },
      { id: "3", reference_code: "AUR-1044", contact_name: "Greig Fraser", contact_phone: "+91 77777 33333", status: "pending" },
    ];

    const searchRes = filterAndPaginateBookings(sampleBookings, { search: "deakins" });
    assert.equal(searchRes.items.length, 1);
    assert.equal(searchRes.items[0].reference_code, "AUR-9942");

    const phoneRes = filterAndPaginateBookings(sampleBookings, { search: "77777" });
    assert.equal(phoneRes.items.length, 1);
    assert.equal(phoneRes.items[0].contact_name, "Greig Fraser");
  });

  test("Computes correct pagination slices and metadata", () => {
    const sampleBookings = Array.from({ length: 25 }, (_, i) => ({
      id: `b-${i + 1}`,
      reference_code: `AUR-${1000 + i}`,
      status: i % 2 === 0 ? "approved" : "rented",
    }));

    const page1 = filterAndPaginateBookings(sampleBookings, { page: 1, limit: 10 });
    assert.equal(page1.items.length, 10);
    assert.equal(page1.pages, 3);
    assert.equal(page1.total, 25);

    const page3 = filterAndPaginateBookings(sampleBookings, { page: 3, limit: 10 });
    assert.equal(page3.items.length, 5);
  });

  // --- KYC Verification Tests ---
  test("Validates KYC document approval", () => {
    const res = validateKycAction("doc-123", "approved");
    assert.equal(res.valid, true);
    assert.equal(res.status, "approved");
  });

  test("Requires rejection reason when rejecting KYC document", () => {
    const noReason = validateKycAction("doc-123", "rejected", "");
    assert.equal(noReason.valid, false);
    assert.equal(noReason.code, "REJECTION_REASON_REQUIRED");

    const withReason = validateKycAction("doc-123", "rejected", "Document corners are cropped / blurry.");
    assert.equal(withReason.valid, true);
    assert.equal(withReason.status, "rejected");
  });

  test("Accepts reupload_required KYC status", () => {
    const res = validateKycAction("doc-123", "reupload_required", "Please upload clear government ID");
    assert.equal(res.valid, true);
    assert.equal(res.status, "reupload_required");
  });
});
