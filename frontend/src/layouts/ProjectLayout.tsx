import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Breadcrumbs,
  Link,
  Container,
  Chip,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FolderIcon from "@mui/icons-material/Folder";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import BugReportIcon from "@mui/icons-material/BugReport";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";

interface ProjectNavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface ProjectLayoutProps {
  children: React.ReactNode;
  projectName?: string;
  projectCode?: string;
  navItems?: ProjectNavItem[];
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  breadcrumb?: { label: string; path?: string }[];
}

const drawerWidth = 220;

const defaultNav: ProjectNavItem[] = [
  { label: "Overview", path: "/project/overview", icon: <FolderIcon /> },
  { label: "Board", path: "/project/board", icon: <ViewKanbanIcon /> },
  { label: "Issues", path: "/project/issues", icon: <BugReportIcon /> },
  { label: "Team", path: "/project/team", icon: <PeopleAltIcon /> },
  { label: "Settings", path: "/project/settings", icon: <SettingsIcon /> },
];

export default function ProjectLayout({
  children,
  projectName,
  projectCode,
  navItems,
  maxWidth = "lg",
  breadcrumb = [],
}: ProjectLayoutProps) {
  const [open, setOpen] = useState<boolean>(true);
  const items = navItems && navItems.length ? navItems : defaultNav;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
          },
        }}
      >
        <Toolbar>
          <Stack direction="column" spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              PROJECT
            </Typography>
            <Typography variant="h6" color="primary" noWrap>
              {projectName || "Untitled"}
            </Typography>
            {projectCode && (
              <Chip
                size="small"
                label={projectCode}
                color="primary"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
            )}
          </Stack>
        </Toolbar>
        <Divider />
        <List>
          {items.map((item) => (
            <ListItemButton key={item.path} onClick={() => (window.location.href = item.path)}>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            borderBottom: "1px solid",
            borderColor: "grey.200",
            bgcolor: "background.paper",
          }}
        >
          <Toolbar>
            <IconButton edge="start" aria-label="menu" onClick={() => setOpen((o) => !o)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
              {projectName || "Project"}
            </Typography>
            {/* Placeholder for right side actions (search, avatar...) */}
          </Toolbar>
          {breadcrumb.length > 0 && (
            <Box sx={{ px: 3, pb: 1 }}>
              <Breadcrumbs>
                {breadcrumb.map((b, idx) =>
                  b.path ? (
                    <Link
                      underline="hover"
                      color="inherit"
                      key={idx}
                      onClick={() => {
                        if (b.path) {
                          window.location.href = b.path;
                        }
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <Typography key={idx} color="text.primary">
                      {b.label}
                    </Typography>
                  )
                )}
              </Breadcrumbs>
            </Box>
          )}
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
      </Box>
    </Box>
  );
}
