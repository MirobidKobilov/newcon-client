import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bg from '../assets/images/bg.png'
import { Context } from '../context'
import { api } from '../utils/api'

const Login = () => {
    const navigate = useNavigate()
    const { setUserInfo, setIsLogin } = useContext(Context)

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.username.trim() || !formData.password) {
            setError('Пожалуйста, введите имя пользователя и пароль')
            return
        }

        setLoading(true)

        try {
            const response = await api('post', formData, '/login')

            if (response.success && response.status === 200 && response.data) {
                if (response.data.data?.token) {
                    localStorage.setItem('token', response.data.data.token)
                }

                if (response.data.data?.user) {
                    setUserInfo(response.data.data.user)
                }

                setIsLogin(true)

                navigate('/')
            } else {
                setError(
                    response.error ||
                        response.data?.message ||
                        'Ошибка входа. Проверьте ваши данные.'
                )
            }
        } catch (err) {
            setError('Произошла ошибка. Попробуйте еще раз.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex flex-col'>
            <main className='flex-1 relative overflow-hidden'>
                <div className='absolute inset-0 overflow-hidden opacity-30'>
                    <img
                        src={bg}
                        className='w-full h-full object-cover'
                        alt='Background decoration'
                    />
                </div>

                <div className='relative max-w-7xl mt-8 sm:mt-12 md:mt-16 mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8'>
                    <div className='flex justify-center items-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-6rem)]'>
                        <div className='bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-4 sm:p-6 md:p-8 border border-teal-100'>
                            <div className='text-center mb-6 sm:mb-8'>
                                <div className='inline-block p-2 sm:p-3 bg-teal-100 rounded-xl sm:rounded-2xl mb-3 sm:mb-4'>
                                    <svg
                                        className='w-6 h-6 sm:w-8 sm:h-8 text-teal-500'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                        />
                                    </svg>
                                </div>
                                <h3 className='text-gray-800 font-bold text-xl sm:text-2xl mb-1 sm:mb-2'>
                                    Добро пожаловать
                                </h3>
                                <p className='text-gray-500 text-xs sm:text-sm'>
                                    Войдите в свой аккаунт
                                </p>
                            </div>

                            {error && (
                                <div className='mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl'>
                                    <p className='text-red-600 text-xs sm:text-sm text-center'>
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-5'>
                                <div>
                                    <label className='block text-gray-700 text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2'>
                                        Имя пользователя
                                    </label>
                                    <div className='relative'>
                                        <div className='absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none'>
                                            <svg
                                                className='w-4 h-4 sm:w-5 sm:h-5 text-gray-400'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type='text'
                                            name='username'
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder='Введите имя пользователя'
                                            className='w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 text-gray-700 text-xs sm:text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-400 transition-colors bg-white'
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-gray-700 text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2'>
                                        Пароль
                                    </label>
                                    <div className='relative'>
                                        <div className='absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none'>
                                            <svg
                                                className='w-4 h-4 sm:w-5 sm:h-5 text-gray-400'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name='password'
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder='Введите пароль'
                                            className='w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3.5 text-gray-700 text-xs sm:text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-teal-400 transition-colors bg-white'
                                            disabled={loading}
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center'
                                            disabled={loading}
                                        >
                                            {showPassword ? (
                                                <svg
                                                    className='w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className='w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                    />
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='w-full bg-gradient-to-r cursor-pointer from-teal-400 to-cyan-500 rounded-xl py-3 sm:py-4 text-white text-xs sm:text-sm font-bold hover:from-teal-500 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]'
                                >
                                    {loading ? (
                                        <span className='flex items-center justify-center gap-2'>
                                            <svg
                                                className='animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white'
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                            >
                                                <circle
                                                    className='opacity-25'
                                                    cx='12'
                                                    cy='12'
                                                    r='10'
                                                    stroke='currentColor'
                                                    strokeWidth='4'
                                                ></circle>
                                                <path
                                                    className='opacity-75'
                                                    fill='currentColor'
                                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                ></path>
                                            </svg>
                                            Вход...
                                        </span>
                                    ) : (
                                        'ВОЙТИ'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Login
