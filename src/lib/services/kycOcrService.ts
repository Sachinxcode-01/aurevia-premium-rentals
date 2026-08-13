/**
 * Aurevia AI KYC OCR Document Verification Service
 * Simulates intelligent document analysis, regex format validation, and identity matching.
 */

export interface KycOcrResult {
  documentType: "aadhaar" | "driving_license" | "passport" | "unknown";
  documentNumber: string;
  extractedName: string;
  extractedDOB?: string;
  confidenceScore: number; // 0 - 100%
  isFormatValid: boolean;
  nameMatchPercentage: number;
  anomalies: string[];
  status: "high_confidence_match" | "manual_review_required" | "rejected_invalid_format";
}

/**
 * Analyzes uploaded KYC document image and extracts details
 */
export function analyzeKycDocument(
  fileOrUrl: string,
  userFullName: string
): KycOcrResult {
  const fileNameLower = (fileOrUrl || "").toLowerCase();
  
  let docType: "aadhaar" | "driving_license" | "passport" | "unknown" = "aadhaar";
  if (fileNameLower.includes("dl") || fileNameLower.includes("license") || fileNameLower.includes("driving")) {
    docType = "driving_license";
  } else if (fileNameLower.includes("passport") || fileNameLower.includes("pass")) {
    docType = "passport";
  }

  // Generate realistic OCR extracted data based on docType
  let docNumber = "";
  let isValid = true;
  const anomalies: string[] = [];

  if (docType === "aadhaar") {
    docNumber = "4589 1234 9876";
    // Check 12-digit Aadhaar format
    isValid = /^\d{4}\s\d{4}\s\d{4}$/.test(docNumber);
  } else if (docType === "driving_license") {
    docNumber = "KA-04-2022-0098765";
    isValid = /^[A-Z]{2}-\d{2}-\d{4}-\d{7}$/.test(docNumber);
  } else if (docType === "passport") {
    docNumber = "Z9876543";
    isValid = /^[A-Z]\d{7}$/.test(docNumber);
  }

  // Calculate name match
  const extractedName = userFullName.toUpperCase().trim() || "PREM MUNDARGI";
  const nameMatchPercentage = 98; // 98% match

  let confidenceScore = 96;
  if (!isValid) {
    confidenceScore -= 40;
    anomalies.push("Invalid document number structure detected");
  }

  if (nameMatchPercentage < 80) {
    confidenceScore -= 30;
    anomalies.push("Name spelling variance exceeds 20% threshold");
  } else {
    anomalies.push("Verified watermarks & hologram clarity");
    anomalies.push("Exact match against government format database");
  }

  let status: KycOcrResult["status"] = "high_confidence_match";
  if (confidenceScore < 70) {
    status = "rejected_invalid_format";
  } else if (confidenceScore < 90) {
    status = "manual_review_required";
  }

  return {
    documentType: docType,
    documentNumber: docNumber,
    extractedName,
    extractedDOB: "15/08/1995",
    confidenceScore,
    isFormatValid: isValid,
    nameMatchPercentage,
    anomalies,
    status,
  };
}
