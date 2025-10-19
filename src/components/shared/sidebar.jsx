import { useState, useEffect, useContext } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Context } from '../../context'
import { t } from '../../utils/translations'

const ICON_PATHS = {
    dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    users: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z',
    products:
        'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3V5zm0 5h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9zm5 3H5v4h3v-4zm4 0H9v4h3v-4zm4 0h-3v4h3v-4z',
    permissions:
        'M12 2a5 5 0 0 0-5 5v3H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1V7a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v3H9V7a3 3 0 0 1 3-3z',
    roles: 'M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5zm0 2.2l8 4v8.3c0 4.7-3.2 9.1-8 10.3-4.8-1.2-8-5.6-8-10.3v-8.3l8-4z',
    material_types:
        'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
    materials: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    companies:
        'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
    sales: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
    payments:
        'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
    expances:
        'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
    settings: 'M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z M10 4h4v16h-4V4z',
    chevron_down: 'M7 10l5 5 5-5z',
}

const ICON_MAPPING = {
    products: 'products',
    users: 'users',
    permissions: 'permissions',
    roles: 'roles',
    material_types: 'material_types',
    materials: 'materials',
    companies: 'companies',
    sales: 'sales',
    payments: 'payments',
    expances: 'expances',
    settings: 'settings',
}

function Icon({ name, className = '' }) {
    const d = ICON_PATHS[name]
    if (!d) return null
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d={d} fill="currentColor" />
        </svg>
    )
}

const Sidebar = () => {
    const [mounted, setMounted] = useState(false)
    const location = useLocation()
    const { menu } = useContext(Context)

    const settingsPages = ['products', 'users', 'roles', 'material_types', 'materials']
    const currentPath = location.pathname.split('/')[1]
    const isOnSettingsPage = settingsPages.includes(currentPath)

    const [openSubmenu, setOpenSubmenu] = useState(isOnSettingsPage ? 'settings' : null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const currentPath = location.pathname.split('/')[1]
        if (settingsPages.includes(currentPath)) {
            setOpenSubmenu('settings')
        }
    }, [location.pathname])

    if (!menu) {
        return (
            <aside className="w-full max-w-[240px] h-screen flex flex-col bg-white border-r border-neutral-200">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200">
                    <Link to="/" className="flex items-center gap-3 group">
                        <span className="text-gray-700 text-sm font-bold font-['Helvetica'] leading-tight group-hover:text-gray-900 transition-colors">
                            NEWCON
                        </span>
                    </Link>
                </div>
                <nav className="flex-1 px-3 py-4" role="navigation">
                    <div className="text-slate-500 text-xs px-3">{t('common.loading')}</div>
                </nav>
            </aside>
        )
    }

    return (
        <aside className="w-full max-w-[240px] h-screen flex flex-col bg-white border-r border-neutral-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200">
                <Link to="/" className="flex items-center gap-3 group">
                    <span className="text-gray-700 text-sm font-bold font-['Helvetica'] leading-tight group-hover:text-gray-900 transition-colors">
                        NEWCON
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto" role="navigation">
                <ul className="space-y-2">
                    {/* Dashboard Link */}
                    <li
                        className={
                            `transition-all duration-300 ` +
                            (mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2')
                        }
                    >
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold font-['Helvetica'] leading-tight transition-all duration-300 ease-out ` +
                                (isActive
                                    ? 'bg-gray-100 text-gray-900 shadow-sm'
                                    : 'text-slate-500 hover:bg-gray-50 hover:text-gray-800 hover:shadow-sm')
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={
                                            `absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-teal-500 transition-all duration-300 ` +
                                            (isActive
                                                ? 'opacity-100 h-7 w-0.5'
                                                : 'opacity-0 h-5 w-0.5 group-hover:opacity-50 group-hover:h-6')
                                        }
                                    />
                                    <span
                                        className={
                                            `inline-flex items-center justify-center w-7 h-7 rounded-xl ring-1 ring-black/5 transition-transform duration-300 will-change-transform ` +
                                            (isActive
                                                ? 'bg-teal-400/20 text-teal-600 scale-110 translate-x-[2px] rotate-3 drop-shadow-sm'
                                                : 'bg-white text-teal-500 group-hover:scale-105 group-hover:rotate-1')
                                        }
                                    >
                                        <Icon name="dashboard" className="w-4 h-4" />
                                    </span>
                                    <span
                                        className={
                                            `transition-all duration-300 will-change-transform ` +
                                            (isActive
                                                ? 'translate-x-[3px]'
                                                : 'group-hover:translate-x-[2px] group-hover:tracking-wide')
                                        }
                                    >
                                        {t('menu.dashboard', 'Dashboard')}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    </li>
                    {Object.entries(menu).map(([sectionKey, section], idx) => {
                        const isSettings = sectionKey === 'settings'
                        const isOpen = openSubmenu === 'settings'
                        const displayTitle =
                            sectionKey === 'settings'
                                ? t('menu.settings', 'Справочник')
                                : section.title

                        return (
                            <li
                                key={sectionKey}
                                className={
                                    `transition-all duration-300 ` +
                                    (mounted
                                        ? 'opacity-100 translate-x-0'
                                        : 'opacity-0 -translate-x-2')
                                }
                                style={{ transitionDelay: `${idx * 40}ms` }}
                            >
                                {isSettings ? (
                                    <div>
                                        <button
                                            onClick={() =>
                                                setOpenSubmenu(isOpen ? null : 'settings')
                                            }
                                            className={
                                                `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold font-['Helvetica'] leading-tight transition-all duration-300 ease-out w-full ` +
                                                (isOpen
                                                    ? 'bg-gray-100 text-gray-900 shadow-sm'
                                                    : 'text-slate-500 hover:bg-gray-50 hover:text-gray-800 hover:shadow-sm')
                                            }
                                        >
                                            <span
                                                className={
                                                    `absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-teal-500 transition-all duration-300 ` +
                                                    (isOpen
                                                        ? 'opacity-100 h-7 w-0.5'
                                                        : 'opacity-0 h-5 w-0.5 group-hover:opacity-50 group-hover:h-6')
                                                }
                                            />
                                            <span
                                                className={
                                                    `inline-flex items-center justify-center w-7 h-7 rounded-xl ring-1 ring-black/5 transition-transform duration-300 will-change-transform ` +
                                                    (isOpen
                                                        ? 'bg-teal-400/20 text-teal-600 scale-110 translate-x-[2px] rotate-3 drop-shadow-sm'
                                                        : 'bg-white text-teal-500 group-hover:scale-105 group-hover:rotate-1')
                                                }
                                            >
                                                <Icon name="settings" className="w-4 h-4" />
                                            </span>
                                            <span
                                                className={
                                                    `flex-1 text-left transition-all duration-300 will-change-transform ` +
                                                    (isOpen
                                                        ? 'translate-x-[3px]'
                                                        : 'group-hover:translate-x-[2px] group-hover:tracking-wide')
                                                }
                                            >
                                                {displayTitle}
                                            </span>
                                            <Icon
                                                name="chevron_down"
                                                className={`w-4 h-4 transition-transform duration-300 ${
                                                    isOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-200 ${
                                                isOpen ? 'max-h-[600px] mt-1' : 'max-h-0'
                                            }`}
                                        >
                                            <ul className="space-y-1 px-1">
                                                {section.children &&
                                                    Object.entries(section.children).map(
                                                        ([childKey, child]) => (
                                                            <li key={childKey}>
                                                                <NavLink
                                                                    to={`/${childKey}`}
                                                                    className={({ isActive }) =>
                                                                        `group relative flex items-center gap-2.5 pl-3 pr-3 py-1.5 rounded-lg text-xs font-semibold font-['Helvetica'] leading-tight transition-all duration-200 ease-out ` +
                                                                        (isActive
                                                                            ? 'bg-teal-50 text-teal-700'
                                                                            : 'text-slate-500 hover:bg-gray-50 hover:text-gray-800')
                                                                    }
                                                                >
                                                                    {({ isActive }) => (
                                                                        <>
                                                                            <span
                                                                                className={
                                                                                    `absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-teal-500 transition-all duration-200 ` +
                                                                                    (isActive
                                                                                        ? 'opacity-100 h-5 w-0.5'
                                                                                        : 'opacity-0 h-4 w-0.5 group-hover:opacity-50')
                                                                                }
                                                                            />
                                                                            <span
                                                                                className={
                                                                                    `inline-flex items-center justify-center w-6 h-6 rounded-lg ring-1 ring-black/5 transition-transform duration-200 will-change-transform ` +
                                                                                    (isActive
                                                                                        ? 'bg-teal-400/20 text-teal-600 scale-105 drop-shadow-sm'
                                                                                        : 'bg-white text-teal-500 group-hover:scale-105')
                                                                                }
                                                                            >
                                                                                <Icon
                                                                                    name={
                                                                                        ICON_MAPPING[
                                                                                            childKey
                                                                                        ] ||
                                                                                        childKey
                                                                                    }
                                                                                    className="w-3.5 h-3.5"
                                                                                />
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    `transition-all duration-200 will-change-transform ` +
                                                                                    (isActive
                                                                                        ? 'translate-x-[2px]'
                                                                                        : 'group-hover:translate-x-[1px]')
                                                                                }
                                                                            >
                                                                                {t(
                                                                                    `menu.${childKey}`,
                                                                                    child.title
                                                                                )}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </NavLink>
                                                            </li>
                                                        )
                                                    )}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <NavLink
                                        to={`/${sectionKey}`}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold font-['Helvetica'] leading-tight transition-all duration-300 ease-out ` +
                                            (isActive
                                                ? 'bg-gray-100 text-gray-900 shadow-sm'
                                                : 'text-slate-500 hover:bg-gray-50 hover:text-gray-800 hover:shadow-sm')
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span
                                                    className={
                                                        `absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-teal-500 transition-all duration-300 ` +
                                                        (isActive
                                                            ? 'opacity-100 h-7 w-0.5'
                                                            : 'opacity-0 h-5 w-0.5 group-hover:opacity-50 group-hover:h-6')
                                                    }
                                                />
                                                <span
                                                    className={
                                                        `inline-flex items-center justify-center w-7 h-7 rounded-xl ring-1 ring-black/5 transition-transform duration-300 will-change-transform ` +
                                                        (isActive
                                                            ? 'bg-teal-400/20 text-teal-600 scale-110 translate-x-[2px] rotate-3 drop-shadow-sm'
                                                            : 'bg-white text-teal-500 group-hover:scale-105 group-hover:rotate-1')
                                                    }
                                                >
                                                    <Icon
                                                        name={
                                                            ICON_MAPPING[sectionKey] || sectionKey
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        `transition-all duration-300 will-change-transform ` +
                                                        (isActive
                                                            ? 'translate-x-[3px]'
                                                            : 'group-hover:translate-x-[2px] group-hover:tracking-wide')
                                                    }
                                                >
                                                    {t(`menu.${sectionKey}`, displayTitle)}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar
