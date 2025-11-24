import React from "react";
import { AppBar, Toolbar, Typography, Box, Container, Divider, Stack } from "@mui/material";

interface DefaultLayoutProps {
  children: React.ReactNode;
  title?: string;
  footerText?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}

export default function DefaultLayout({ children, title, footerText, maxWidth = "lg" }: DefaultLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "grey.200",
          bgcolor: "background.paper",
        }}
      >
        <Toolbar>
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
            {title || "Default"}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={maxWidth}
        sx={{
          flexGrow: 1,
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {children}
      </Container>

      <Divider />
      <Box
        component="footer"
        sx={{
          bgcolor: "background.paper",
          py: 2,
        }}
      >
        <Container maxWidth={maxWidth}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {footerText || "© 2025 SEJobs. All rights reserved."}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
              Build v1.0.0
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
