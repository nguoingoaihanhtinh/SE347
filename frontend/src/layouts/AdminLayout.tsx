import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  navItems?: NavItem[];
}

const drawerWidth = 240;

const defaultNav: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
  { label: "Users", path: "/admin/users", icon: <PeopleIcon /> },
  { label: "Settings", path: "/admin/settings", icon: <SettingsIcon /> },
];

export default function AdminLayout({ children, title, navItems }: AdminLayoutProps) {
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
          <Typography variant="h6" color="primary">
            {title || "Admin"}
          </Typography>
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

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
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
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setOpen((o) => !o)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
              {title || "Admin Panel"}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
