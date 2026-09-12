import test from "node:test";
import assert from "node:assert/strict";

/**
 * Phase 4 Test Suite:
 * 1. Customer Reviews Moderation & Lifecycle
 * 2. Enquiries & Support Tickets Resolution Lifecycle
 * 3. Indian GST 18% Compliance & CSV Injection Protection
 */

// 1. Review Moderation Helper Functions
function filterReviews(reviews, { status = "all", rating = "all", search = "" } = {}) {
  return reviews.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (rating !== "all" && r.rating !== rating) return false;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (r.customerName || "").toLowerCase().includes(q);
      const matchProd = (r.productName || "").toLowerCase().includes(q);
      const matchComment = (r.comment || "").toLowerCase().includes(q);
      return matchName || matchProd || matchComment;
    }
    return true;
  });
}

function updateReviewStatus(review, newStatus, adminNote) {
  const allowed = ["pending", "approved", "rejected"];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid review status: ${newStatus}`);
  }
  return {
    ...review,
    status: newStatus,
    adminNote: adminNote || review.adminNote,
    updatedAt: new Date().toISOString(),
  };
}

test("Customer Reviews Moderation Engine", async (t) => {
  const sampleReviews = [
    { id: "rev_1", customerName: "Aarav Sharma", productName: "Sony FX6 Cinema", rating: 5, status: "pending", comment: "Incredible camera rig" },
    { id: "rev_2", customerName: "Priya Nair", productName: "Canon R5 C", rating: 4, status: "approved", comment: "Great high-speed 8K" },
    { id: "rev_3", customerName: "Rohan Varma", productName: "ARRI Alexa Mini LF", rating: 5, status: "approved", comment: "Flagship Hollywood quality" },
    { id: "rev_4", customerName: "Spam Bot", productName: "Lens Pack", rating: 1, status: "rejected", comment: "Buy cheap crypto here" },
  ];

  await t.test("filters reviews by moderation status", () => {
    const pending = filterReviews(sampleReviews, { status: "pending" });
    assert.equal(pending.length, 1);
    assert.equal(pending[0].id, "rev_1");

    const approved = filterReviews(sampleReviews, { status: "approved" });
    assert.equal(approved.length, 2);
  });

  await t.test("filters reviews by star rating", () => {
    const fiveStars = filterReviews(sampleReviews, { rating: 5 });
    assert.equal(fiveStars.length, 2);
  });

  await t.test("searches reviewer name and comments", () => {
    const searchAarav = filterReviews(sampleReviews, { search: "Aarav" });
    assert.equal(searchAarav.length, 1);
    assert.equal(searchAarav[0].customerName, "Aarav Sharma");

    const searchAlexa = filterReviews(sampleReviews, { search: "Hollywood" });
    assert.equal(searchAlexa.length, 1);
    assert.equal(searchAlexa[0].productName, "ARRI Alexa Mini LF");
  });

  await t.test("updates review status with audit note and validates allowed states", () => {
    const updated = updateReviewStatus(sampleReviews[0], "approved", "Verified cinema shoot rental");
    assert.equal(updated.status, "approved");
    assert.equal(updated.adminNote, "Verified cinema shoot rental");
    assert.ok(updated.updatedAt);

    assert.throws(() => updateReviewStatus(sampleReviews[0], "deleted"), /Invalid review status/);
  });
});

// 2. Enquiries & Support Tickets Resolution Lifecycle
function updateTicketStatus(ticket, nextStatus, priority) {
  const validStatuses = ["open", "in_progress", "pending_customer", "resolved", "closed"];
  if (!validStatuses.includes(nextStatus)) {
    throw new Error(`Invalid ticket status: ${nextStatus}`);
  }
  return {
    ...ticket,
    status: nextStatus,
    priority: priority || ticket.priority || "normal",
    updatedAt: new Date().toISOString(),
  };
}

function appendTicketReply(ticket, { replyText, senderName = "AUREVIA Concierge" }) {
  if (!replyText || !replyText.trim()) {
    throw new Error("Reply text cannot be blank");
  }
  const replyObj = {
    id: `rep_${Date.now()}`,
    sender: senderName,
    text: replyText.trim(),
    sentAt: new Date().toISOString(),
  };
  return {
    ...ticket,
    status: "pending_customer",
    replies: [...(ticket.replies || []), replyObj],
  };
}

test("Customer Support Tickets & Resolution Workflow", async (t) => {
  const initialTicket = {
    id: "TCK-401",
    ticketNo: "AUR-TCK-401",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram@redchillies.com",
    subject: "Battery grip compatibility with RED Komodo",
    status: "open",
    priority: "urgent",
    replies: [],
  };

  await t.test("advances ticket status through resolution cycle", () => {
    const inProgress = updateTicketStatus(initialTicket, "in_progress");
    assert.equal(inProgress.status, "in_progress");
    assert.equal(inProgress.priority, "urgent");

    const resolved = updateTicketStatus(inProgress, "resolved");
    assert.equal(resolved.status, "resolved");
  });

  await t.test("appends staff reply and shifts status to pending_customer", () => {
    const replied = appendTicketReply(initialTicket, {
      replyText: "The RED Komodo includes dual Canon BP-955 battery slots and V-mount adapter.",
      senderName: "AUREVIA Concierge Tech",
    });

    assert.equal(replied.status, "pending_customer");
    assert.equal(replied.replies.length, 1);
    assert.equal(replied.replies[0].sender, "AUREVIA Concierge Tech");
    assert.ok(replied.replies[0].text.includes("V-mount adapter"));
  });

  await t.test("rejects blank replies", () => {
    assert.throws(() => appendTicketReply(initialTicket, { replyText: "   " }), /Reply text cannot be blank/);
  });
});

// 3. Indian GST 18% Compliance & CSV Injection Protection
function computeGstReportRow(booking) {
  const grossPaid = Number(booking.total_payable || 0);
  const securityDeposit = Number(booking.security_deposit || 0);
  const rentalNetWithGst = Math.max(0, grossPaid - securityDeposit);
  const taxableRentalBase = Math.round(rentalNetWithGst / 1.18);
  const totalGst18 = rentalNetWithGst - taxableRentalBase;
  const cgst9 = Math.round(totalGst18 / 2);
  const sgst9 = totalGst18 - cgst9;

  return {
    invoiceRef: booking.reference_code,
    customer: booking.customer_name,
    gstin: "27AABCA1234F1Z5", // Aurevia Maharashtra GSTIN
    taxableRentalBase,
    cgst9,
    sgst9,
    totalGst18,
    securityDeposit,
    grossPaid,
  };
}

function sanitizeCsvValue(val) {
  let str = String(val ?? "");
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

test("Indian GST 18% Compliance & CSV Injection Protection", async (t) => {
  const booking = {
    reference_code: "AUR-GST-8891",
    customer_name: "Yash Raj Films Studio",
    total_payable: 168000, // 118,000 rental + 50,000 deposit
    security_deposit: 50000,
  };

  await t.test("computes exact 18% GST (9% CGST + 9% SGST) with tax-exempt deposit", () => {
    const row = computeGstReportRow(booking);

    assert.equal(row.taxableRentalBase, 100000);
    assert.equal(row.cgst9, 9000);
    assert.equal(row.sgst9, 9000);
    assert.equal(row.totalGst18, 18000);
    assert.equal(row.securityDeposit, 50000);
    assert.equal(row.grossPaid, 168000);
    assert.equal(row.taxableRentalBase + row.totalGst18 + row.securityDeposit, row.grossPaid);
  });

  await t.test("neutralizes formula injection characters (=, +, -, @) in CSV cells", () => {
    // Spreadsheet attack vector payload
    const maliciousFormula = "=cmd|' /C calc'!A0";
    const sanitized = sanitizeCsvValue(maliciousFormula);
    assert.equal(sanitized, `"'=cmd|' /C calc'!A0"`);

    const plusFormula = "+100*200";
    assert.equal(sanitizeCsvValue(plusFormula), ` "'+100*200"`.trim());

    const normalName = "Aurevia Studio";
    assert.equal(sanitizeCsvValue(normalName), `"Aurevia Studio"`);
  });
});
