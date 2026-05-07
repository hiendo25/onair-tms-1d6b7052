export interface PresignedUrlResponse {
  presignedUrl: string;
  s3Key: string;
  publicUrl: string;
  thumbnailUrl: string | null;
}

export interface UploadToS3Options {
  onProgress?: (percent: number) => void;
}

export interface UploadToS3Result {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string | null;
}

async function getPresignedUrl(
  file: File
): Promise<PresignedUrlResponse> {
  const response = await fetch("/api/libraries/upload/presigned-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get presigned URL");
  }

  return response.json();
}

async function uploadFileToPresignedUrl(
  file: File,
  presignedUrl: string,
  options?: UploadToS3Options
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (options?.onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percentComplete);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Failed to upload file to S3"));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Failed to upload file to S3"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("PUT", presignedUrl) ;
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

export async function uploadFileToS3(
  file: File,
  options?: UploadToS3Options
): Promise<UploadToS3Result> {
  const presignedData = await getPresignedUrl(file);

  await uploadFileToPresignedUrl(file, presignedData.presignedUrl, options);

  return {
    url: presignedData.publicUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    thumbnailUrl: presignedData.thumbnailUrl,
  };
}

export async function uploadFilesToS3(
  files: File[],
  options?: {
    onFileProgress?: (fileIndex: number, percent: number) => void;
    onOverallProgress?: (percent: number) => void;
  }
): Promise<UploadToS3Result[]> {
  const results: UploadToS3Result[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;

    const result = await uploadFileToS3(file, {
      onProgress: (percent) => {
        options?.onFileProgress?.(i, percent);

        if (options?.onOverallProgress) {
          const completedFiles = i;
          const currentFileProgress = percent / 100;
          const overallProgress = Math.round(
            ((completedFiles + currentFileProgress) / totalFiles) * 100
          );
          options.onOverallProgress(overallProgress);
        }
      },
    });

    results.push(result);
  }

  return results;
}

