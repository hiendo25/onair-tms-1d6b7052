// "use client";
// import { ClassRoom } from "../../classroom-form.schema";
// import { Alert, alpha, Box, Button, Typography } from "@mui/material";
// import FAQsFields from "./resource-fields/FAQsFields";
// import ForWhomFields from "./resource-fields/ForWhomFields";
// import DocumentFields from "./resource-fields/DocumentFields";
// import WhiesFields from "./resource-fields/WhiesFields";
// import { FileIcon, HelpIcon, MarkerPinIcon, UsersIcon2 } from "@/shared/assets/icons";
// import React, { useState } from "react";
// import AccordionResourceItem from "./AccordionResourceItem";
// import BoxIcon from "./BoxIcon";
// import { useClassRoomFormContext } from "../ClassRoomFormContainer";

// type ClassResourceKey = keyof Pick<ClassRoom, "faqs" | "forWhom" | "docs" | "whies">;
// type ResourceTypeItem = {
//   key: ClassResourceKey;
//   title: string;
//   icon: React.ReactNode;
// };

// const RESOURCE_ITEMS: ResourceTypeItem[] = [
//   {
//     key: "docs",
//     title: "Tài liệu",
//     icon: React.createElement(FileIcon),
//   },
//   {
//     key: "faqs",
//     title: "Câu hỏi thường gặp",
//     icon: React.createElement(HelpIcon),
//   },
//   {
//     key: "forWhom",
//     title: "Dành cho ai",
//     icon: React.createElement(UsersIcon2),
//   },
//   {
//     key: "whies",
//     title: "Tại sao nên tham gia sự kiện?",
//     icon: React.createElement(MarkerPinIcon),
//   },
// ];
// interface TabClassRoomResourceProps {
//   className?: string;
// }
// const TabClassRoomResource: React.FC<TabClassRoomResourceProps> = ({ className }) => {
//   const { getValues, setValue } = useClassRoomFormContext();

//   const [resourceAddingItems, setResourceAddingItems] = useState<ResourceTypeItem[]>(() => {
//     let items: ResourceTypeItem[] = [];

//     const recourseSelectedItems = {
//       faqs: getValues("faqs"),
//       forWhom: getValues("forWhom"),
//       docs: getValues("docs"),
//       whies: getValues("whies"),
//     };

//     Object.keys(recourseSelectedItems).forEach((key) => {
//       if (recourseSelectedItems[key as keyof typeof recourseSelectedItems].length) {
//         const item = RESOURCE_ITEMS.find((item) => item.key === key);
//         if (item) {
//           items = [...items, item];
//         }
//       }
//     });

//     return items;
//   });
//   const handleAddSelectingResource = (type: ResourceTypeItem) => {
//     setResourceAddingItems((prevResource) => [...prevResource, type]);
//     /**
//      * init First resource field when add
//      */
//     if (type.key === "faqs") {
//       setValue(type.key, [{ answer: "", question: "" }]);
//     }
//     if (type.key === "forWhom" || type.key === "whies") {
//       setValue(type.key, [{ description: "" }]);
//     }
//   };

//   const filterSelectedResource = (rcs: ResourceTypeItem[]) => {
//     return rcs.filter((rc) => resourceAddingItems.every((it) => it.key !== rc.key));
//   };
//   const handleRemoveSelectingResource = (key: ClassResourceKey) => {
//     setResourceAddingItems((prevResource) => prevResource.filter((rs) => rs.key !== key));
//     /**
//      * Delete all resource item when remove
//      */
//     setValue(key, []);
//   };
//   const isFullyResourceTypeSelected = resourceAddingItems.length === RESOURCE_ITEMS.length;
//   return (
//     <div className="flex flex-col gap-4">
//       {resourceAddingItems.map((type) => (
//         <React.Fragment key={type.key}>
//           <AccordionResourceItem
//             title={type.title}
//             icon={type.icon}
//             onRemove={() => handleRemoveSelectingResource(type.key)}
//           >
//             {type.key === "docs" ? (
//               <DocumentFields />
//             ) : type.key === "faqs" ? (
//               <FAQsFields />
//             ) : type.key === "forWhom" ? (
//               <ForWhomFields />
//             ) : type.key === "whies" ? (
//               <WhiesFields />
//             ) : null}
//           </AccordionResourceItem>
//         </React.Fragment>
//       ))}
//       {isFullyResourceTypeSelected ? null : (
//         <div className="bg-white rounded-xl p-6">
//           <Alert
//             severity="info"
//             variant="outlined"
//             sx={(theme) => ({ background: alpha(theme.palette.info.light, 0.2), borderColor: theme.palette.info.main })}
//           >
//             Bạn có thể tiếp tục mà không cần thêm thông tin này
//           </Alert>
//           <div className="h-6"></div>
//           <Typography component="h3" sx={{ fontWeight: "bold" }}>
//             Tài nguyên
//           </Typography>
//           <div className="h-6"></div>
//           <ResourceList items={filterSelectedResource(RESOURCE_ITEMS)} onAdd={handleAddSelectingResource} />
//         </div>
//       )}
//     </div>
//   );
// };
// export default TabClassRoomResource;

// interface ResourceListProps {
//   onAdd: (rc: ResourceTypeItem) => void;
//   items: ResourceTypeItem[];
// }
// const ResourceList: React.FC<ResourceListProps> = ({ items, onAdd }) => {
//   return (
//     <div className="rc-items flex flex-col gap-5">
//       {items.map((rc) => (
//         <div key={rc.key} className="field-box__header flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <BoxIcon>{rc.icon}</BoxIcon>
//             {rc.title ? <Typography sx={{ fontWeight: 600 }}>{rc.title}</Typography> : null}
//           </div>
//           <Button variant="fill" onClick={() => onAdd(rc)}>
//             Thêm
//           </Button>
//         </div>
//       ))}
//     </div>
//   );
// };
