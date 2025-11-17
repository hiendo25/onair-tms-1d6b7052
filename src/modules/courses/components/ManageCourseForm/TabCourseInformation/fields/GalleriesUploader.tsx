// import Uploader, { UploaderProps } from "@/shared/ui/Uploader";
// import useUpload from "@/modules/class-room-management/hooks/useUpload";
// import { FormHelperText, FormLabel, IconButton, Typography } from "@mui/material";
// import { Control, useController } from "react-hook-form";
// import { ClassRoom } from "../../classroom-form.schema";
// import Image from "next/image";
// import { CloseIcon } from "@/shared/assets/icons";

// const MAX_IMAGES_COUNT = 5;
// export interface GalleriesUploaderProps {
//   control: Control<ClassRoom>;
//   label?: string;
//   subTitle?: string;
//   description?: React.ReactNode;
// }
// const GalleriesUploader: React.FC<GalleriesUploaderProps> = ({ control, label, subTitle, description }) => {
//   const {
//     field: { value: images, onChange },
//     fieldState: { error },
//   } = useController({ control, name: "galleries" });

//   const { onUploadMultiple } = useUpload();

//   const handleUploadImage: UploaderProps["onChange"] = (file) => {
//     let filesUpload = Array.isArray(file) ? file : [file];

//     if (!filesUpload?.length) return;

//     filesUpload = [...filesUpload].splice(0, MAX_IMAGES_COUNT - images.length);

//     if (!filesUpload.length) return;

//     onUploadMultiple(filesUpload, {
//       onSuccess: (response) => {
//         let newImages: string[] = [];
//         if (response) {
//           response.forEach((fileRs) => {
//             if (fileRs.status === "fulfilled" && fileRs.value.data) {
//               newImages = [
//                 ...newImages,
//                 process.env.NEXT_PUBLIC_STORAGE_URL
//                   ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${fileRs.value.data.fullPath}`
//                   : fileRs.value.data.fullPath,
//               ];
//             }
//           });
//           onChange([...images, ...newImages]);
//         }
//       },
//     });
//   };

//   const handleRemoveImg = (index: number) => () => {
//     const newImges = [...images];
//     newImges.splice(index, 1);
//     onChange(newImges);
//   };
//   return (
//     <div className="galleries">
//       <FormLabel component="div" className="mb-2 inline-block">
//         {label}
//       </FormLabel>
//       {subTitle ? <Typography className="text-xs mb-4">{subTitle}</Typography> : null}
//       {description ? <div className="description mb-2">{description}</div> : null}
//       {images.length ? (
//         <div className="flex items-center gap-2 flex-wrap mb-2">
//           {images.map((imageSrc, _index) => (
//             <div key={_index} className="aspect-square w-28 relative overflow-hidden rounded-lg bg-gray-100">
//               <Image src={imageSrc} alt="thumbnail" fill className="object-contain" />
//               <IconButton
//                 sx={{ width: "1.5rem", height: "1.5rem", position: "absolute", top: "0.5rem", right: "0.5rem" }}
//                 onClick={handleRemoveImg(_index)}
//               >
//                 <CloseIcon className="w-4 h-4" />
//               </IconButton>
//             </div>
//           ))}
//         </div>
//       ) : null}
//       {images.length < MAX_IMAGES_COUNT ? (
//         <div className="gallery-list">
//           <Uploader
//             accept={{ images: [".jpg", ".jpeg", ".png"] }}
//             onChange={handleUploadImage}
//             multiple={true}
//             hidePreviewThumbnail
//           />
//         </div>
//       ) : null}
//       {error?.message ? <FormHelperText error={!!error}>{error?.message}</FormHelperText> : null}
//     </div>
//   );
// };
// export default GalleriesUploader;
