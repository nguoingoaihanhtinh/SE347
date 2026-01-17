import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

// Sidebar Item Component with Tooltip
function SidebarItem({ item, isActive, isCollapsed }: SidebarItemProps) {
  return (
    <Link
      to={item.path}
      className={`relative flex items-center ${
        isCollapsed 
          ? "w-10 h-10 justify-center rounded-xl mx-auto" 
          : "gap-3 px-3 py-2.5 rounded-xl"
      } group transition-colors ${
        isActive
          ? "bg-indigo-50 text-indigo-600"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center">{item.icon}</div>

      {/* Text Label (only when expanded) */}
      {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}

      {/* Tooltip (only when collapsed, shows on hover) - Fixed positioning to avoid clipping */}
      {isCollapsed && (
        <span 
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]"
        >
          {item.label}
          {/* Tooltip Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
        </span>
      )}
    </Link>
  );
}

const navItems: NavItem[] = [
  {
    label: "Admin Dashboard",
    path: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    label: "User Management",
    path: "/admin/users",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    label: "Project Management",
    path: "/admin/projects",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    ),
  },
  {
    label: "System Settings",
    path: "/admin/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children, title = "Admin Panel" }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0 flex h-screen w-screen bg-slate-100 overflow-hidden m-0 p-0 font-['Poppins',sans-serif]">
      {/* Sidebar - Light Mode iOS Style - INSTANT SNAP (NO ANIMATION) */}
      <aside
        className={`${
          isCollapsed ? "w-14" : "w-64"
        } fixed left-0 top-0 h-full bg-white border-r border-slate-200 overflow-visible flex flex-col z-50`}
      >
        {/* Sidebar Header - Logo & Hamburger Toggle */}
        <div className={`h-16 flex items-center shrink-0 ${isCollapsed ? "justify-center px-0" : "px-4"}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-slate-800 font-semibold text-lg">Admin</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors ${isCollapsed ? "p-1.5" : "p-2"}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-1 overflow-visible ${isCollapsed ? "px-2" : "px-3"} ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return <SidebarItem key={item.path} item={item} isActive={isActive} isCollapsed={isCollapsed} />;
          })}
        </nav>

        {/* Sidebar Footer - Admin User Info */}
        <div className={`border-t border-slate-200 shrink-0 ${isCollapsed ? "py-3 px-0 flex flex-col items-center gap-2" : "p-4"}`}>
          {isCollapsed ? (
            <>
              {/* Collapsed: Avatar only (smaller) */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              {/* Collapsed: Tiny Logout Icon Button */}
              <button
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
                title="Logout"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Expanded: Full user info */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    {user?.role === "super_admin" ? "Super Admin" : "Administrator"}
                  </p>
                </div>
              </div>
              {/* Expanded: Logout Button with Text */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area - INSTANT SNAP (NO ANIMATION) */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isCollapsed ? 'ml-14' : 'ml-64'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-900">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
