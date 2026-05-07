import { useState } from "react";

import { getTypeOfFile } from "@/constants/file.constant";
import { useAuthStore } from "@/modules/auth/store/AuthProvider";
import { supabase } from "@/services";
import { slugify } from "@/utils/slugify";

type FileUploadSuccess = {
  data: {
    id: string;
    path: string;
    fullPath: string;
  };
  error: null;
};
type FileUploadError = {
  data: null;
  error: Error;
};
type FileResponse = FileUploadSuccess | FileUploadError;

interface UseUploadReturn {
  onUploadMultiple: (
    files: File[],
    options?: { onSuccess?: (response: PromiseSettledResult<FileResponse>[]) => void },
  ) => void;
  onUploadSingle: (file: File, options?: { onSuccess?: (response: FileResponse) => void }) => void;
}
const useUpload = () => {
  const userId = useAuthStore((state) => state.data?.id);
  const [isLoading, setIsLoading] = useState(false);
  const onUploadMultiple: UseUploadReturn["onUploadMultiple"] = async (files, options) => {
    const { onSuccess } = options || {};
    setIsLoading(true);
    const uploadFilePromises = files.reduce<
      Promise<{ data: { id: string; path: string; fullPath: string }; error: null } | { data: null; error: any }>[]
    >((acc, file) => {
      const fileName = `${slugify(file.name)}-${new Date().getTime()}`;
      const pathName = `${userId}/${fileName}`;
      const promise = supabase.storage.from("uploads").upload(pathName, file);
      acc = [...acc, promise];
      return acc;
    }, []);

    try {
      const response = await Promise.allSettled(uploadFilePromises);
      console.log(response);
      onSuccess?.(response);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onUploadSingle: UseUploadReturn["onUploadSingle"] = async (file, options) => {
    const { onSuccess } = options || {};
    const fileName = `${slugify(file.name)}-${new Date().getTime()}`;
    const pathName = `${userId}/${fileName}`;
    setIsLoading(true);
    try {
      const response = await supabase.storage.from("uploads").upload(pathName, file);
      console.log(response);
      onSuccess?.(response);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    onUploadMultiple,
    onUploadSingle,
    isLoading,
  };
};
export default useUpload;

export const useUploadAsync = () => {
  const userId = useAuthStore((state) => state.data.id);
  const [fileList, setFileList] = useState<
    {
      file: File;
      fileExt: string;
      fileType: ReturnType<typeof getTypeOfFile>;
      isLoading: boolean;
      data: FileUploadSuccess["data"] | null;
      error: FileUploadError["error"] | null;
    }[]
  >([]);

  const onUploadMultipleAsync = async (
    files: File[],
    options?: {
      onSuccess?: (data: FileUploadSuccess["data"], file: File) => void;
      onError?: (error: FileUploadError["error"]) => void;
    },
  ) => {
    const newFiles = files.map((file) => {
      const fileExt = file.name.split(".").pop();
      return {
        file,
        fileExt: fileExt ? `.${fileExt}`.toLowerCase() : "",
        fileType: fileExt ? getTypeOfFile(fileExt) : "unknown",
        isLoading: true,
        data: null,
        error: null,
      };
    });

    setFileList((prev) => [...prev, ...newFiles]);

    Promise.all(
      files.map(async (file) => {
        const fileName = `${slugify(file.name)}-${new Date().getTime()}`;
        const pathName = `${userId}/${fileName}`;

        try {
          const { data, error } = await supabase.storage.from("uploads").upload(pathName, file);

          setFileList((oldFileList) => {
            return oldFileList.map((f) =>
              f.file === file ? { ...f, data: data || null, error: error || null, isLoading: false } : f,
            );
          });
          if (data) options?.onSuccess?.(data, file);
          // if (error) options?.onError?.(error);
        } catch (error: any) {
          setFileList((oldFileList) => {
            return oldFileList.map((f) => (f.file === file ? { ...f, data: null, error: error, isLoading: false } : f));
          });
          options?.onError?.(error);
        }
      }),
    );
  };

  // const removeFile = (id: string) => setFileList((prev) => prev.filter((f) => f.id !== id));
  // const clearFiles = () => setFileList([]);

  return {
    onUploadMultipleAsync,
    fileList,
  };
};
