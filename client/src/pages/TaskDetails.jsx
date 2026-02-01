import { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../configs/api";
import { CalendarIcon, MessageCircle, PenIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { selectActiveWorkspace } from "../features/workspaceSlice";

const TaskDetails = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const { getToken } = useAuth();
    const { user } = useUser();

    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeWorkspace = useSelector(selectActiveWorkspace);
    const workspaceId = activeWorkspace?.id;

  
    useEffect(() => {
        if (!workspaceId || !projectId || !taskId) return;

        let mounted = true;
        async function fetchTask() {
            try {
                setLoading(true);
                const token = await getToken();
                const { data } = await api.get(
                    `/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!mounted) return;
                setTask(data.task);
                setProject(data.project);
            } catch (err) {
                console.error("Fetch Task Error:", err);
                setTask(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchTask();
        return () => { mounted = false; };
    }, [workspaceId, projectId, taskId, getToken]);

  
    const fetchComments = useCallback(async () => {
        if (!taskId) return;
        try {
            const token = await getToken();
            const { data } = await api.get(`/api/comments/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(data.comments || []);
        } catch (error) {
            console.error("Comment fetch failed", error);
        }
    }, [taskId, getToken]);

   
    useEffect(() => {
        if (!workspaceId || !taskId || !task) return;

        fetchComments();
        const interval = setInterval(fetchComments, 10000);

        return () => clearInterval(interval);
    }, [workspaceId, taskId, task, fetchComments]);

    const handleAddComment = async () => {
        if (!newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const loadingToast = toast.loading("Adding comment...");

            const token = await getToken();
            const { data } = await api.post(
                `/api/comments`,
                { taskId: task.id, content: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setComments((prev) => [...prev, data.comment]);
            setNewComment("");
            toast.dismiss(loadingToast);
            toast.success("Comment added.");
        } catch (error) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || "Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    
    const formatDate = (dateStr, pattern) => {
        try {
            return dateStr ? format(new Date(dateStr), pattern) : "N/A";
        } catch (e) {
            return "Invalid Date";
        }
    };

    if (!workspaceId) {
        return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading workspace...</div>;
    }
    if (loading) {
        return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task details...</div>;
    }
    if (!task) {
        return <div className="text-red-500 px-4 py-6">Task not found.</div>;
    }

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
         
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800 flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Task Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 overflow-y-auto no-scrollbar mb-4">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mr-2">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className={`sm:max-w-[85%] dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md ${comment.user.id === user?.id ? "ml-auto bg-blue-50/50" : "mr-auto"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400">
                                            <img src={comment.user.image} alt="avatar" className="size-5 rounded-full" />
                                            <span className="font-medium text-gray-900 dark:text-white">{comment.user.name}</span>
                                            <span className="text-xs text-gray-400 dark:text-zinc-600">
                                                • {formatDate(comment.createdAt, "dd MMM yyyy, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-zinc-200 break-words">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-zinc-500 text-sm italic">No comments yet. Start the conversation!</p>
                        )}
                    </div>

                   
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            disabled={isSubmitting}
                            className="w-full dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
                            rows={3}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={isSubmitting || !newComment.trim()}
                            className="w-full sm:w-auto bg-gradient-to-l from-blue-500 to-blue-600 transition-all text-white text-sm px-6 py-2 rounded hover:opacity-90 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            </div>

           
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="p-5 rounded-md bg-white dark:bg-zinc-950/50 border border-gray-300 dark:border-zinc-800">
                    <div className="mb-3">
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold">
                                {task.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] uppercase font-bold">
                                {task.type}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold">
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>
                    )}

                    <hr className="border-gray-200 dark:border-zinc-800 my-4" />

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Assignee</span>
                            <div className="flex items-center gap-2">
                                <img src={task.assignee?.image} className="size-5 rounded-full" alt="avatar" />
                                <span className="text-gray-900 dark:text-zinc-200 font-medium">{task.assignee?.name || "Unassigned"}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Due Date</span>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="size-4 text-gray-400" />
                                <span className="text-gray-900 dark:text-zinc-200">{formatDate(task.due_date, "dd MMM yyyy")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {project && (
                    <div className="p-5 rounded-md bg-white dark:bg-zinc-950/50 border border-gray-300 dark:border-zinc-800">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Project Context</h2>
                        <div className="flex items-center gap-2 text-gray-900 dark:text-zinc-100 mb-4">
                            <PenIcon className="size-4 text-blue-500" />
                            <span className="font-medium">{project.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-gray-500 mb-1">Status</p>
                                <p className="font-medium text-gray-900 dark:text-zinc-200">{project.status}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Progress</p>
                                <p className="font-medium text-gray-900 dark:text-zinc-200">{project.progress}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;