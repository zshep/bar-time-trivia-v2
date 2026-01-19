import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  List,
  PlusSquare,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import Logout from "./logout"; // adjust import path if needed

export default function Navbar() {
  const [openMobile, setOpenMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/dashboard/viewgamePage", label: "View Trivia Games", icon: List },
    {
      to: "/dashboard/create-session",
      label: "Create Trivia Session",
      icon: PlusSquare,
    },
    {
      to: "/dashboard/join-session",
      label: "Join Trivia Session",
      icon: LogIn,
    },
  ];

  const isActive = (to) => location.pathname === to;

  const SidebarContent = ({ onNavigate }) => (
    <div className="h-full flex flex-col">
      {/* top */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="font-semibold text-gray-900">
          {!collapsed ? "Dashboard" : ""}
        </div>

        {/* desktop collapse button */}
        <button
          className="hidden md:inline-flex rounded p-2 hover:bg-gray-100"
          onClick={() => setCollapsed((v) => !v)}
          aria-label="Toggle collapse"
          type="button"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        {/* mobile close */}
        <button
          className="md:hidden rounded p-2 hover:bg-gray-100"
          onClick={() => setOpenMobile(false)}
          aria-label="Close menu"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* links */}
      <nav className="px-2 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  onClick={() => onNavigate?.()}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive(item.to)
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* bottom */}
      <div className="mt-auto p-3 border-t border-gray-200">
        <div className={collapsed ? "flex justify-center" : ""}>
          <Logout collapsed={collapsed}/>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE hamburger (only shows on small screens) */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 rounded-md bg-white border border-gray-200 px-3 py-2 shadow-sm"
        onClick={() => setOpenMobile(true)}
        aria-label="Open menu"
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>
      {/* DESKTOP sidebar */}
      <aside
        className={[
          "hidden md:flex md:flex-col md:shrink-0 md:h-screen md:sticky md:top-0",
          "bg-white border-r border-gray-200",
          collapsed ? "w-16" : "w-64",
        ].join(" ")}
      >
        <SidebarContent />
      </aside>

      {/* MOBILE overlay drawer */}
      {openMobile && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* backdrop */}
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenMobile(false)}
            aria-label="Close backdrop"
            type="button"
          />

          {/* drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl border-r border-gray-200">
            <SidebarContent onNavigate={() => setOpenMobile(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
