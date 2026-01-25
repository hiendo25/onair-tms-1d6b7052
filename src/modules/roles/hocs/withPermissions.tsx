// import { PemissionCheck, usePermissions } from "../store/PermissionsProvider";

// export default function withPermissions<P extends object>(
//   perms: PemissionCheck[],
//   options?: { fallback?: React.ReactNode },
// ) {
//   return (WrappedComponent: React.ComponentType<P>) => {
//     const ComponentWithPermissions: React.FC<P> = (props) => {
//       const { hasPermissions } = usePermissions();
//       if (!hasPermissions(perms)) return <>{options?.fallback ?? null}</>;
//       return <WrappedComponent {...props} />;
//     };

//     ComponentWithPermissions.displayName = `withPermissions(${
//       WrappedComponent.displayName || WrappedComponent.name || "Component"
//     })`;

//     return ComponentWithPermissions;
//   };
// }
