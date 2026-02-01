import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { CreateOrganization, SignIn, useAuth, useUser, useOrganization } from '@clerk/clerk-react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWorkspaces, resetWorkspaces } from '../features/workspaceSlice'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'



const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { user, isLoaded } = useUser()
    const { organization, isLoaded: isOrgLoaded } = useOrganization()
    const { loading, initialized, workspaces } = useSelector(
        (state) => state.workspace
    )
    const { getToken } = useAuth()
    const dispatch = useDispatch()
    const orgId = organization?.id;


    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    useEffect(() => {
        if (!isLoaded || !isOrgLoaded || !user || !organization) return;

        dispatch(resetWorkspaces());
        dispatch(fetchWorkspaces({ getToken }));
    }, [orgId, isLoaded, isOrgLoaded, user, organization, dispatch]);

    useEffect(() => {
        if (!initialized) return;
        if (workspaces.length > 0) return;
        if (!orgId) return;

        const retry = setTimeout(() => {
            dispatch(fetchWorkspaces({ getToken }));
        }, 1200);

        return () => clearTimeout(retry);
    }, [initialized, workspaces.length, orgId, dispatch, getToken]);




    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen bg-white dark:bg-zinc-950">
                <SignIn />
            </div>
        )
    }
    if (user && !organization) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <CreateOrganization />
            </div>
        )
    }

    if (
        !initialized ||
        loading ||
        (initialized && workspaces.length === 0 && orgId)
    ) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        );
    }




  return (
   
    <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100 h-screen overflow-hidden">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            
            <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    </div>
)
}

export default Layout
