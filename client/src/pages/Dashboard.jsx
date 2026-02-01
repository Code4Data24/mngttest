import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import StatsGrid from '../components/StatsGrid'
import ProjectOverview from '../components/ProjectOverview'
import RecentActivity from '../components/RecentActivity'
import { useParams } from 'react-router-dom'
import TasksSummary from '../components/TasksSummary'
import CreateProjectDialog from '../components/CreateProjectDialog'
import { useSelector } from 'react-redux'
import { selectActiveWorkspace } from '../features/workspaceSlice'


const Dashboard = () => {
    const { workspaceId } = useParams()

    const { user } = useUser()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const activeWorkspace = useSelector(selectActiveWorkspace)
    if (!activeWorkspace || activeWorkspace.id !== workspaceId) {
        return null
    }
    return (
        <div className='max-w-6xl mx-auto'>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1"> Welcome back, {user?.fullName || 'User'} </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm"> Here's what's happening with your projects today </p>
                </div>

                <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white space-x-2 hover:opacity-90 transition" >
                    <Plus size={16} /> New Project
                </button>

                <CreateProjectDialog
                    workspaceId={workspaceId}
                    isDialogOpen={isDialogOpen}
                    setIsDialogOpen={setIsDialogOpen}
                />

            </div>

            <StatsGrid workspaceId={workspaceId} />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ProjectOverview workspaceId={workspaceId} />
                    <RecentActivity workspaceId={workspaceId} />
                </div>
                <div>
                    <TasksSummary workspaceId={workspaceId} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
