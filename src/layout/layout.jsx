import Sidebar from '../components/shared/sidebar'
import Header from '../components/shared/Header'

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>
    )
}

export default Layout
