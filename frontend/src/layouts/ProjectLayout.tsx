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

const drawerWidth = 240; // Tăng width drawer cho đủ không gian

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
  maxWidth = false,
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
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          <Stack direction="column" spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
              PROJECT
            </Typography>
            <Typography variant="h6" fontWeight={600} color="primary" noWrap>
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
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          <List>
            {items.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => (window.location.href = item.path)}
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  py: 1.5,
                }}
              >
                {item.icon && (
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {React.cloneElement(item.icon as React.ReactElement, {
                      sx: { color: "text.secondary" },
                    })}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: "0.925rem",
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0, // Quan trọng để kích hoạt scrolling
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            height: 64,
            zIndex: 1100,
          }}
        >
          <Toolbar sx={{ minHeight: 64 }}>
            <IconButton
              edge="start"
              aria-label="menu"
              onClick={() => setOpen((o) => !o)}
              sx={{
                mr: 2,
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} color="primary" sx={{ flexGrow: 1 }}>
              {projectName || "Project"}
            </Typography>
            {/* Có thể thêm các action buttons ở đây */}
          </Toolbar>
          {breadcrumb.length > 0 && (
            <Box sx={{ px: 3, pb: 1.5, pt: 0.5 }}>
              <Breadcrumbs aria-label="breadcrumb">
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
                      sx={{
                        cursor: "pointer",
                        fontWeight: 500,
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <Typography key={idx} color="text.primary" fontWeight={500}>
                      {b.label}
                    </Typography>
                  )
                )}
              </Breadcrumbs>
            </Box>
          )}
        </AppBar>

        {/* Scrollable content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: "auto", // Kích hoạt scrolling dọc
            overflowX: "hidden", // Ngăn horizontal scroll trừ khi cần thiết
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: "background.default",
            minHeight: 0, // Quan trọng để flexbox hoạt động với scrolling
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
