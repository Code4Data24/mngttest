import { useState, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
    ChevronRightIcon,
    SettingsIcon,
    KanbanIcon,
    ChartColumnIcon,
    CalendarIcon,
    ArrowRightIcon
} from "lucide-react";
import { useSelector } from "react-redux";

const ProjectSidebar = () => {
    const location = useLocation();
    const [expandedProjects, setExpandedProjects] = useState(new Set());
    const [searchParams] = useSearchParams();

    const projects = useSelector(
        state => state.workspace.currentWorkspace?.projects
    ) || [];

    const projectItems = useMemo(() => projects, [projects]);

    const toggleProject = (id) => {
        setExpandedProjects(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const getProjectSubItems = (id) => [
        { title: "Tasks", icon: KanbanIcon, url: `/projectsDetail?id=${id}&tab=tasks` },
        { title: "Analytics", icon: ChartColumnIcon, url: `/projectsDetail?id=${id}&tab=analytics` },
        { title: "Calendar", icon: CalendarIcon, url: `/projectsDetail?id=${id}&tab=calendar` },
        { title: "Settings", icon: SettingsIcon, url: `/projectsDetail?id=${id}&tab=settings` }
    ];

    return (
        <div className="mt-6 px-3">
            <div className="flex justify-between px-3 py-2">
                <h3 className="text-xs uppercase">Projects</h3>
                <Link to="/projects">
                    <ArrowRightIcon className="size-4" />
                </Link>
            </div>

            <div className="space-y-1 px-3">
                {projectItems.map(project => (
                    <div key={project.id}>
                        <button
                            onClick={() => toggleProject(project.id)}
                            className="w-full flex items-center gap-2 px-3 py-2"
                        >
                            <ChevronRightIcon
                                className={`size-3 ${
                                    expandedProjects.has(project.id) ? "rotate-90" : ""
                                }`}
                            />
                            <span className="truncate">{project.name}</span>
                        </button>

                        {expandedProjects.has(project.id) && (
                            <div className="ml-5 space-y-1">
                                {getProjectSubItems(project.id).map(item => {
                                    const isActive =
                                        location.pathname === "/projectsDetail" &&
                                        searchParams.get("id") === project.id &&
                                        searchParams.get("tab") === item.title.toLowerCase();

                                    return (
                                        <Link
                                            key={item.title}
                                            to={item.url}
                                            className={`flex gap-2 px-3 py-1 text-xs ${
                                                isActive ? "text-blue-600" : ""
                                            }`}
                                        >
                                            <item.icon className="size-3" />
                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectSidebar;
