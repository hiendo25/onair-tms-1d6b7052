import React from "react";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import { theme } from "@/theme/mui/AppTheme";

const MUIThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppRouterCacheProvider
      options={{
        enableCssLayer: true,
        key: "onair",
        // nonce: "668868",
        prepend: true,
      }}
    >
      <InitColorSchemeScript attribute="class" />
      <ThemeProvider theme={theme} disableTransitionOnChange disableNestedContext defaultMode="light">
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};
export default MUIThemeProvider;
