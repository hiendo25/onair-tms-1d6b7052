import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { AWS_S3_PUBLIC_BUCKET, s3Client } from "@/lib/aws-s3";
import { createSVClient } from "@/services";

interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  s3Key: string;
  publicUrl: string;
  thumbnailUrl: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: PresignedUrlRequest = await request.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "Missing required fields: fileName, fileType, fileSize" },
        { status: 400 }
      );
    }

    const maxFileSize = 100 * 1024 * 1024;
    if (fileSize > maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const fileExtension = fileName.split('.').pop() || '';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `library/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: AWS_S3_PUBLIC_BUCKET,
      Key: s3Key,
      ContentType: fileType,
      ACL: "public-read",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    const publicUrl = `https://${AWS_S3_PUBLIC_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const isImage = fileType.startsWith("image/");
    const thumbnailUrl = isImage ? publicUrl : null;

    const response: PresignedUrlResponse = {
      presignedUrl,
      s3Key,
      publicUrl,
      thumbnailUrl,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred while generating presigned URL";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

