/**
 * @deprecated This component is deprecated. Use RHFThumbnailUpload from @/shared/ui/form/RHFThumbnailUpload instead.
 * This file is kept for backward compatibility but will be removed in a future version.
 */

import React from "react";
import { Control } from "react-hook-form";

import RHFThumbnailUpload from "@/shared/ui/form/RHFThumbnailUpload";
import { ClassRoom } from "../../classroom-form.schema";

export interface ThumbnailUploaderProps {
  onChange?: (url: string) => void;
  control: Control<ClassRoom>;
  label?: string;
  subTitle?: string;
  description?: React.ReactNode;
}

/**
 * ThumbnailUploader - Wrapper component for backward compatibility
 *
 * This component now uses the reusable RHFThumbnailUpload component.
 * Please migrate to using RHFThumbnailUpload directly in new code.
 */
const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({ control, onChange, label, subTitle, description }) => {
  return (
    <RHFThumbnailUpload
      control={control}
      name="thumbnailUrl"
      label={label}
      subTitle={subTitle}
      description={description}
      required
      aspectRatio="21/9"
      // width="480px"
      onChange={onChange}
    />
  );
};

export default ThumbnailUploader;
