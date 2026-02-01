import { useEffect, useRef } from "react";
import WorkspaceDropdown from "./WorkspaceDropdown";
import {
    FolderOpenIcon,
    LayoutDashboardIcon,
    SettingsIcon,
    UsersIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import { selectActiveWorkspace } from "../features/workspaceSlice";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { openUserProfile } = useClerk();
    const activeWorkspace = useSelector(selectActiveWorkspace);

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    if (!activeWorkspace) return null;

    const menuItems = [
        {
            name: "Dashboard",
            href: `/workspace/${activeWorkspace.id}`,
            icon: LayoutDashboardIcon,
        },
        {
            name: "Projects",
            href: `/workspace/${activeWorkspace.id}/projects`,
            icon: FolderOpenIcon,
        },
        {
            name: "Team",
            href: `/workspace/${activeWorkspace.id}/team`,
            icon: UsersIcon,
        },
    ];

    return (
        <div
            ref={sidebarRef}
            className={`z-10 bg-white dark:bg-zinc-900 min-w-68 flex flex-col h-screen border-r transition-all ${
                isSidebarOpen ? "left-0" : "-left-full"
            }`}
        >
            <WorkspaceDropdown />
            <hr className="border-gray-200 dark:border-zinc-800" />

            <div className="p-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className="flex items-center gap-3 py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        <item.icon size={16} />
                        <span className="text-sm">{item.name}</span>
                    </NavLink>
                ))}

                <button
                    onClick={openUserProfile}
                    className="flex w-full items-center gap-3 py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                    <SettingsIcon size={16} />
                    <span className="text-sm">Settings</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
