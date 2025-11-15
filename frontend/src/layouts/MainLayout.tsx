import React from "react";
import { Container, AppBar, Toolbar, Typography, Box } from "@mui/material";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => (
  <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Typography variant="h6" color="primary">
          {title || "App"}
        </Typography>
      </Toolbar>
    </AppBar>
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {children}
    </Container>
  </Box>
);

export default MainLayout;
