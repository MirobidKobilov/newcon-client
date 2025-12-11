import { useState } from 'react'
import Header from '../components/shared/Header'
import Sidebar from '../components/shared/sidebar'

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className='flex h-screen overflow-hidden'>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className='fixed inset-0 bg-black/50 z-40 lg:hidden'
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <div className='flex-1 flex flex-col w-full lg:w-auto min-w-0'>
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <div className='flex-1 overflow-y-auto'>{children}</div>
            </div>
        </div>
    )
}

export default Layout
