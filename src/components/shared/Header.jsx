import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Context } from '../../context'
import { t } from '../../utils/translations'

const ICON_PATHS = {
    bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
    user: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
    logout: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
    chevron_down: 'M7 10l5 5 5-5z',
}

function Icon({ name, className = '' }) {
    const d = ICON_PATHS[name]
    if (!d) return null
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
        >
            <path d={d} fill='currentColor' />
        </svg>
    )
}

const Header = ({ onMenuClick }) => {
    const navigate = useNavigate()
    const { userInfo, setIsLogin } = useContext(Context)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsLogin(false)
        navigate('/login')
    }

    // Получаем имя пользователя или используем значение по умолчанию
    const userName = userInfo?.username || 'User'
    const userRole = userInfo?.roles?.[0] || 'Member'

    return (
        <header className='h-16 bg-white border-b border-neutral-200 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4'>
            {/* Mobile menu button */}
            <button
                onClick={onMenuClick}
                className='lg:hidden p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-600'
                aria-label='Open menu'
            >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 6h16M4 12h16M4 18h16'
                    />
                </svg>
            </button>

            <div className='flex items-center gap-2 sm:gap-4 ml-auto'>
                {/* Notifications Bell */}
                <Link
                    to='/actions'
                    className='relative group p-2 rounded-xl hover:bg-gray-50 transition-all duration-200'
                >
                    <div className='relative'>
                        <Icon
                            name='bell'
                            className='w-5 h-5 text-slate-500 group-hover:text-gray-900 transition-colors'
                        />
                        {/* Notification badge - можно сделать динамическим */}
                        <span className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white'></span>
                    </div>
                </Link>

                {/* User Info Dropdown */}
                <div className='relative' ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className='flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group'
                    >
                        <div className='flex items-center gap-2 sm:gap-3'>
                            {/* User Avatar */}
                            <div className='w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center ring-1 ring-teal-500/20 flex-shrink-0'>
                                <Icon name='user' className='w-4 h-4 text-teal-600' />
                            </div>
                            {/* User Info - скрываем на очень маленьких экранах */}
                            <div className='text-left hidden xs:block'>
                                <div className='text-xs sm:text-sm font-semibold text-gray-900 leading-tight truncate max-w-[100px] sm:max-w-none'>
                                    {userName}
                                </div>
                                <div className='text-[10px] sm:text-xs text-slate-500 leading-tight truncate max-w-[100px] sm:max-w-none'>
                                    {userRole}
                                </div>
                            </div>
                        </div>
                        <Icon
                            name='chevron_down'
                            className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                                dropdownOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50 overflow-hidden'>
                            <div className='px-4 py-3 border-b border-neutral-200'>
                                <div className='text-sm font-semibold text-gray-900'>
                                    {userName}
                                </div>
                                <div className='text-xs text-slate-500'>{userRole}</div>
                            </div>
                            <div className='py-2'>
                                <button
                                    onClick={handleLogout}
                                    className='w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 transition-colors'
                                >
                                    <Icon name='logout' className='w-4 h-4 text-slate-500' />
                                    <span>{t('common.logout', 'Выйти')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
