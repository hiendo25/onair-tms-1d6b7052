/**
 * Certificate Generator Service
 * Handles certificate image generation via external API
 */

import { v4 as uuidv4 } from "uuid";

import {
  certificateTemplatesRepository,
  employeeCertificateTemplatesRepository,
} from "@/repository";

// Environment variables
const BFF_BASE_URL = process.env.BFF_BASE_URL;
const BFF_API_SECRET = process.env.BFF_API_SECRET;
const S3_BASE_URL = process.env.S3_BASE_URL;

export type CertificateGenerationPayload = {
  employeeId: string;
  employeeName: string;
  classRoomId: string;
  classRoomTitle: string;
  certificateTemplateId: string;
  completionDate: Date;
  organizationName: string;
};

type CertificateAPIRequest = {
  id: string;
  organizationName: string;
  completionTitle: string;
  awardedTo: string;
  fullName: string;
  programCompletion: string;
  className: string;
  issueDateLabel: string;
  issueDate: string;
  expiryDateLabel: string;
  expiryDate: string;
  frameUrl: string;
};

/**
 * Generate certificate for an employee
 */
async function generateCertificate(payload: CertificateGenerationPayload): Promise<string> {
  try {
    // Validate environment variables
    if (!BFF_BASE_URL) {
      throw new Error("BFF_BASE_URL is not configured");
    }
    if (!BFF_API_SECRET) {
      throw new Error("BFF_API_SECRET is not configured");
    }
    if (!S3_BASE_URL) {
      throw new Error("S3_BASE_URL is not configured");
    }

    const { employeeId, employeeName, classRoomId, classRoomTitle, certificateTemplateId, completionDate, organizationName } =
      payload;

    // Check if certificate already exists
    const hasExisting = await employeeCertificateTemplatesRepository.hasEmployeeCertificate(
      employeeId,
      certificateTemplateId,
      classRoomId
    );

    if (hasExisting) {
      console.log(
        `[CertificateGenerator] Employee ${employeeId} already has certificate for template ${certificateTemplateId} in classroom ${classRoomId}`
      );
      return "Certificate already exists";
    }

    // Fetch certificate template details
    const template = await certificateTemplatesRepository.getCertificateTemplateById(certificateTemplateId);

    if (!template) {
      throw new Error(`Certificate template ${certificateTemplateId} not found`);
    }

    const layoutConfig = template.layout_config as any;
    const frameUrl = template.frame?.image_url;

    if (!frameUrl) {
      throw new Error(`Certificate template ${certificateTemplateId} has no frame`);
    }

    // Generate unique ID for the employee certificate
    const certificateId = uuidv4();

    // Build image URL
    const imageUrl = `${S3_BASE_URL}/certificates/${certificateId}.png`;

    // Build API request based on layout_config
    const apiRequest: CertificateAPIRequest = {
      id: certificateId,
      organizationName: organizationName,
      completionTitle: layoutConfig?.completion_title?.toUpperCase() || "Certificate of Completion",
      awardedTo: layoutConfig?.awarded_to || "Awarded to",
      fullName: employeeName,
      programCompletion: layoutConfig?.program_completion || "for successfully completing the program",
      className: classRoomTitle,
      issueDateLabel: layoutConfig?.issue_date_label || "Issue Date",
      issueDate: completionDate.toISOString().split("T")[0] as string,
      expiryDateLabel: layoutConfig?.expiry_date_label || "Expiry Date",
      expiryDate: "No expiry",
      frameUrl,
    };

    // Call BFF API for certificate generation
    const response = await fetch(`${BFF_BASE_URL}/api/v1/image-generator/certificates/generate`, {
      method: "POST",
      headers: {
        "X-Token-Secret": BFF_API_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([apiRequest]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Certificate generation API failed: ${response.status} - ${errorText}`);
    }

    // Store certificate record in database
    const certificateData = {
      id: certificateId,
      employee_id: employeeId,
      certificate_template_id: certificateTemplateId,
      class_room_id: classRoomId,
      image_url: imageUrl,
      layout_config: layoutConfig,
      data: {
        className: classRoomTitle,
        completionDate: completionDate.toISOString(),
        generatedAt: new Date().toISOString(),
      },
    };

    await employeeCertificateTemplatesRepository.createEmployeeCertificateTemplate(certificateData);

    console.log(
      `[CertificateGenerator] Successfully generated certificate ${certificateId} for employee ${employeeId}`
    );

    return certificateId;
  } catch (error) {
    console.error("[CertificateGenerator] Error generating certificate:", error);
    throw error;
  }
}

export { generateCertificate };
