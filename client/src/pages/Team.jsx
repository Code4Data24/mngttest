import { useState, useMemo } from "react";
import { UsersIcon, Search, UserPlus, Shield, Activity } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { useSelector } from "react-redux";

const Team = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);

    
    const { users, tasks, projects } = useMemo(() => {
        const members = currentWorkspace?.members || [];
        const workspaceProjects = currentWorkspace?.projects || [];
        const allTasks = workspaceProjects.flatMap(project => project.tasks || []);
        
        return { users: members, tasks: allTasks, projects: workspaceProjects };
    }, [currentWorkspace]);

    
    const filteredUsers = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return users.filter((u) => 
            u.user?.name?.toLowerCase().includes(query) || 
            u.user?.email?.toLowerCase().includes(query)
        );
    }, [searchTerm, users]);

    if (!currentWorkspace) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-gray-500 dark:text-zinc-400">
                <Activity className="animate-spin mr-2 size-4" /> Loading team...
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4">
           
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Team</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">Manage team members and their contributions</p>
                </div>
                <button 
                    onClick={() => setIsDialogOpen(true)} 
                    className="flex items-center px-5 py-2 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Invite Member
                </button>
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Members" value={users.length} Icon={UsersIcon} color="blue" />
                <StatCard 
                    title="Active Projects" 
                    value={projects.filter(p => !["CANCELLED", "COMPLETED"].includes(p.status)).length} 
                    Icon={Activity} 
                    color="emerald" 
                />
                <StatCard title="Total Tasks" value={tasks.length} Icon={Shield} color="purple" />
            </div>

         
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input 
                    placeholder="Search team members..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 w-full text-sm rounded-md border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                />
            </div>

            
            <div className="w-full">
                {filteredUsers.length === 0 ? (
                    <EmptyState isSearch={searchTerm.length > 0} />
                ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                       
                        <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                            <thead className="bg-gray-50 dark:bg-zinc-900">
                                <tr>
                                    {['Name', 'Email', 'Role'].map((head) => (
                                        <th key={head} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {filteredUsers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img src={member.user.image} alt="" className="size-8 rounded-full bg-gray-100" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{member.user?.name || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{member.user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><RoleBadge role={member.role} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                      
                        <div className="sm:hidden divide-y divide-gray-200 dark:divide-zinc-800">
                            {filteredUsers.map((member) => (
                                <div key={member.id} className="p-4 bg-white dark:bg-zinc-900">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img src={member.user.image} alt="" className="size-10 rounded-full" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{member.user?.name}</p>
                                            <p className="text-xs text-gray-500">{member.user.email}</p>
                                        </div>
                                    </div>
                                    <RoleBadge role={member.role} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const StatCard = ({ title, value, Icon, color }) => {
    const colors = {
        blue: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
        emerald: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        purple: "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
    };
    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors[color]}`}><Icon className="size-5" /></div>
            </div>
        </div>
    );
};

const RoleBadge = ({ role }) => (
    <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md ${
        role === "ADMIN" ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
    }`}>
        {role || "User"}
    </span>
);

const EmptyState = ({ isSearch }) => (
    <div className="text-center py-20 bg-gray-50/50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
        <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isSearch ? "No matches found" : "No team members yet"}</h3>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">{isSearch ? "Try adjusting your search criteria." : "Start by inviting your colleagues to collaborate."}</p>
    </div>
);

export default Team;