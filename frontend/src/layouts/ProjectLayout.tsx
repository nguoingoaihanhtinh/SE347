import React, { useState, createContext, useCallback } from "react";
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
  useTheme,
  useMediaQuery,
  Slide,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FolderIcon from "@mui/icons-material/Folder";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import BugReportIcon from "@mui/icons-material/BugReport";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IssueDetail from "../components/projects/IssueDetail";
import { useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate

/* ================= CONTEXT ================= */
interface LayoutContextType {
  openIssueDetail: (issueId: string) => void;
  closeIssueDetail: () => void;
}
export const LayoutContext = createContext<LayoutContextType>({
  openIssueDetail: () => {},
  closeIssueDetail: () => {},
});

/* ================= TYPES ================= */
interface ProjectNavItem {
  label: string;
  path: string; // relative path, ví dụ: "board", "backlog"
  icon?: React.ReactNode;
}

interface ProjectLayoutProps {
  children: React.ReactNode;
  projectName?: string;
  projectCode?: string;
  navItems?: ProjectNavItem[];
  breadcrumb?: { label: string; path?: string }[];
}

/* ================= CONSTANTS ================= */
const drawerWidth = 260;
const miniDrawerWidth = 72;
const issueDetailWidth = 400;

const defaultNav: ProjectNavItem[] = [
  { label: "Overview", path: "overview", icon: <FolderIcon /> },
  { label: "Board", path: "board", icon: <ViewKanbanIcon /> },
  { label: "Backlog", path: "backlog", icon: <BugReportIcon /> },
  { label: "Team", path: "team", icon: <PeopleAltIcon /> },
  { label: "Settings", path: "settings", icon: <SettingsIcon /> },
];

/* ================= COMPONENT ================= */
export default function ProjectLayout({
  children,
  projectName,
  projectCode,
  navItems,
  breadcrumb = [],
}: ProjectLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate(); // Thêm useNavigate

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [issueDetailOpen, setIssueDetailOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const items = navItems?.length ? navItems : defaultNav;

  const toggleDrawer = () => setDrawerOpen((p) => !p);

  const openIssueDetail = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setIssueDetailOpen(true);
  }, []);

  const closeIssueDetail = useCallback(() => {
    setIssueDetailOpen(false);
    setSelectedIssueId(null);
  }, []);

  const handleNavClick = (path: string) => {
    if (projectId) {
      navigate(`/projects/${projectId}/${path}`);
    }
  };

  return (
    <LayoutContext.Provider value={{ openIssueDetail, closeIssueDetail }}>
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        {/* ========== LEFT SIDEBAR ========== */}
        <Drawer
          variant={isMobile ? "temporary" : "persistent"}
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            width: drawerOpen ? drawerWidth : miniDrawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerOpen ? drawerWidth : miniDrawerWidth,
              transition: theme.transitions.create("width"),
            },
          }}
        >
          <Toolbar sx={{ height: 64, justifyContent: "space-between" }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                PROJECT
              </Typography>
              {drawerOpen && (
                <>
                  <Typography variant="h6" color="primary" noWrap>
                    {projectName || "Untitled"}
                  </Typography>
                  {projectCode && <Chip size="small" label={projectCode} />}
                </>
              )}
            </Stack>
            <IconButton onClick={toggleDrawer}>{drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
          </Toolbar>
          <Divider />
          <List>
            {items.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ color: "primary.main", minWidth: 40 }}>{item.icon}</ListItemIcon>
                {drawerOpen && <ListItemText primary={item.label} />}
              </ListItemButton>
            ))}
          </List>
        </Drawer>

        {/* ========== MAIN AREA ========== */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            ml: drawerOpen ? 0 : `${miniDrawerWidth}px`,
          }}
        >
          {/* HEADER */}
          <AppBar position="sticky" color="transparent" elevation={0}>
            <Toolbar sx={{ height: 64 }}>
              {isMobile && (
                <IconButton onClick={toggleDrawer}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" color="primary" sx={{ ml: 2 }}>
                {projectName || "Project"}
              </Typography>
            </Toolbar>
            {breadcrumb.length > 0 && (
              <Box px={3} pb={1}>
                <Breadcrumbs>
                  {breadcrumb.map((b, i) =>
                    b.path ? (
                      <Link key={i} component="button" onClick={() => navigate(b.path!)}>
                        {b.label}
                      </Link>
                    ) : (
                      <Typography key={i}>{b.label}</Typography>
                    ),
                  )}
                </Breadcrumbs>
              </Box>
            )}
          </AppBar>

          {/* CONTENT */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 3,
              transition: theme.transitions.create("margin-right"),
              ...(issueDetailOpen && {
                mr: { xs: 0, md: `${issueDetailWidth}px` },
              }),
            }}
          >
            {children}
          </Box>
        </Box>

        {/* ========== ISSUE DETAIL SIDEBAR ========== */}
        <Slide direction="left" in={issueDetailOpen} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "fixed",
              top: 64,
              right: 0,
              bottom: 0,
              width: { xs: "100%", md: issueDetailWidth },
              bgcolor: "background.paper",
              borderLeft: "1px solid",
              borderColor: "divider",
              zIndex: 1300,
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                position: "sticky",
                top: 0,
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
                px: 2,
                py: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">Issue Details</Typography>
              <IconButton onClick={closeIssueDetail}>
                <CloseIcon />
              </IconButton>
            </Box>

            {selectedIssueId && projectId && (
              <IssueDetail selectedIssueId={selectedIssueId} onClose={closeIssueDetail} projectId={projectId} />
            )}
          </Box>
        </Slide>
      </Box>
    </LayoutContext.Provider>
  );
}
