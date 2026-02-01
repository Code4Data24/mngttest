import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { selectActiveWorkspace } from "../features/workspaceSlice";

function WorkspaceDropdown() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { workspaces } = useSelector((state) => state.workspace);
    const activeWorkspace = useSelector(selectActiveWorkspace);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const onSelectWorkspace = (workspaceId) => {
        if (!activeWorkspace || workspaceId === activeWorkspace.id) return;

        dispatch(setCurrentWorkspace(workspaceId));
        navigate(`/workspace/${workspaceId}`);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!activeWorkspace) return null;

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
                <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                        {activeWorkspace.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border rounded shadow top-full left-0">
                    <div className="p-2">
                        {workspaces.map((workspace) => (
                            <div
                                key={workspace.id}
                                onClick={() => onSelectWorkspace(workspace.id)}
                                className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                            >
                                <img
                                    src={workspace.image_url}
                                    alt={workspace.name}
                                    className="w-6 h-6 rounded"
                                />
                                <p className="text-sm font-medium truncate">
                                    {workspace.name}
                                </p>
                                {activeWorkspace.id === workspace.id && (
                                    <Check className="w-4 h-4 text-blue-600 ml-auto" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
