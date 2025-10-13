import React from 'react'
import Layout from '../layout/layout'

const Dashboard = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <h1 className="text-gray-800 tracking-tight font-bold text-base sm:text-lg lg:text-xl">
                        Панель управления
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-[10px] sm:text-[11px] uppercase tracking-wide font-bold mb-1.5 sm:mb-2">
                                    Деньги за сегодня
                                </p>
                                <h3 className="text-gray-800 text-lg sm:text-xl font-bold mb-1">
                                    $53,000
                                </h3>
                                <div
                                    className="flex items-center gap-1 text-emerald-500 text-xs sm:text-sm font-semibold"
                                    aria-label="Процент роста"
                                >
                                    +55%
                                </div>
                            </div>
                            <div
                                className="w-10 h-10 sm:w-11 sm:h-11 bg-teal-400/90 text-white rounded-xl shadow-sm flex items-center justify-center ring-1 ring-teal-300/50 transition-transform duration-200 hover:scale-105 cursor-pointer"
                                aria-hidden="true"
                            >
                                <div className="w-6 h-6 relative">
                                    <div className="w-4 h-1 bg-white/95 rounded absolute top-1 left-1"></div>
                                    <div className="w-5 h-3.5 bg-white/95 rounded absolute top-3 left-1"></div>
                                    <div className="w-1.5 h-2 bg-white/95 rounded absolute top-2 left-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-[10px] sm:text-[11px] uppercase tracking-wide font-bold mb-1.5 sm:mb-2">
                                    Пользователи за сегодня
                                </p>
                                <h3 className="text-gray-800 text-lg sm:text-xl font-bold mb-1">
                                    2,300
                                </h3>
                                <div
                                    className="flex items-center gap-1 text-emerald-500 text-xs sm:text-sm font-semibold"
                                    aria-label="Процент роста"
                                >
                                    +5%
                                </div>
                            </div>
                            <div
                                className="w-10 h-10 sm:w-11 sm:h-11 bg-teal-400/90 text-white rounded-xl shadow-sm flex items-center justify-center ring-1 ring-teal-300/50 transition-transform duration-200 hover:scale-105 cursor-pointer"
                                aria-hidden="true"
                            >
                                <div className="w-6 h-6 relative">
                                    <div className="w-3 h-3 border border-white/95 rounded-sm absolute top-1 left-1"></div>
                                    <div className="w-2 h-2 border border-white/95 rounded-sm absolute top-1 right-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-[10px] sm:text-[11px] uppercase tracking-wide font-bold mb-1.5 sm:mb-2">
                                    Новые клиенты
                                </p>
                                <h3 className="text-gray-800 text-lg sm:text-xl font-bold mb-1">
                                    +3,052
                                </h3>
                                <div
                                    className="flex items-center gap-1 text-red-500 text-xs sm:text-sm font-semibold"
                                    aria-label="Процент снижения"
                                >
                                    -14%
                                </div>
                            </div>
                            <div
                                className="w-10 h-10 sm:w-11 sm:h-11 bg-teal-400/90 text-white rounded-xl shadow-sm flex items-center justify-center ring-1 ring-teal-300/50 transition-transform duration-200 hover:scale-105 cursor-pointer"
                                aria-hidden="true"
                            >
                                <div className="w-6 h-6 relative">
                                    <div className="w-4 h-5 border border-white/95 rounded-sm absolute top-1 left-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-[10px] sm:text-[11px] uppercase tracking-wide font-bold mb-1.5 sm:mb-2">
                                    Общие продажи
                                </p>
                                <h3 className="text-gray-800 text-lg sm:text-xl font-bold mb-1">
                                    $173,000
                                </h3>
                                <div
                                    className="flex items-center gap-1 text-emerald-500 text-xs sm:text-sm font-semibold"
                                    aria-label="Процент роста"
                                >
                                    +8%
                                </div>
                            </div>
                            <div
                                className="w-10 h-10 sm:w-11 sm:h-11 bg-teal-400/90 text-white rounded-xl shadow-sm flex items-center justify-center ring-1 ring-teal-300/50 transition-transform duration-200 hover:scale-105 cursor-pointer"
                                aria-hidden="true"
                            >
                                <div className="w-6 h-6 relative">
                                    <div className="w-5 h-3.5 bg-white/95 rounded absolute top-2 left-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 transition-all duration-200 hover:shadow-md">
                        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                            <div className="lg:w-1/2">
                                <p className="text-slate-500 text-[10px] sm:text-[11px] uppercase tracking-wide font-bold mb-2">
                                    Создано разработчиками
                                </p>
                                <h2 className="text-gray-800 text-base sm:text-lg font-bold mb-3 sm:mb-4">
                                    Purity UI Dashboard
                                </h2>
                                <p className="text-slate-500 text-sm mb-5 sm:mb-6 leading-relaxed">
                                    От цветов, карточек и типографики до сложных элементов — здесь
                                    вы найдёте полную документацию.
                                </p>
                                <button className="flex items-center gap-2 text-gray-800 font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-md px-1 transition-all duration-200 hover:text-teal-700 active:scale-[.98] cursor-pointer">
                                    Подробнее
                                    <svg
                                        className="w-3 h-3"
                                        viewBox="0 0 12 12"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M6.28 2.62L9.66 6L6.28 9.38L5.22 8.32L7.54 6L5.22 3.68L6.28 2.62Z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="lg:w-1/2">
                                <div
                                    className="bg-teal-400 rounded-xl h-40 sm:h-48 lg:h-64 relative overflow-hidden transition-transform duration-200 hover:scale-[1.01] cursor-pointer"
                                    role="img"
                                    aria-label="Декоративный круговой узор"
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-95">
                                        <div className="w-24 sm:w-32 h-24 sm:h-32 border border-white/95 rounded-full"></div>
                                        <div className="w-36 sm:w-48 h-36 sm:h-48 border border-white/90 rounded-full absolute"></div>
                                        <div className="w-48 sm:w-64 h-48 sm:h-64 border border-white/80 rounded-full absolute"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer">
                        <div className="relative">
                            <div className="bg-gradient-to-l from-slate-700 to-gray-900 rounded-xl p-5 sm:p-6 text-white">
                                <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                                    Работайте с Rockets
                                </h2>
                                <p className="text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed opacity-90">
                                    Создание богатства — это сравнительно недавняя игра с
                                    положительной суммой. Всё зависит от того, кто первым
                                    воспользуется возможностью.
                                </p>
                                <button className="flex items-center gap-2 text-white font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-md px-1 transition-all duration-200 hover:opacity-90 active:scale-[.98] cursor-pointer">
                                    Подробнее
                                    <svg
                                        className="w-3 h-3"
                                        viewBox="0 0 12 12"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M6.28 2.62L9.66 6L6.28 9.38L5.22 8.32L7.54 6L5.22 3.68L6.28 2.62Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 transition-all duration-200 hover:shadow-md">
                        <div className="flex justify-between items-center mb-5 sm:mb-6">
                            <div>
                                <h3 className="text-gray-800 text-base sm:text-lg font-bold mb-1">
                                    Активные пользователи
                                </h3>
                                <div className="flex items-center gap-1 text-xs sm:text-sm">
                                    <span className="text-emerald-500 font-semibold">(+23)</span>
                                    <span className="text-slate-500">чем на прошлой неделе</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-[560px] bg-gradient-to-l from-slate-700 to-gray-900 rounded-xl p-4 h-64 relative">
                                <div className="flex items-end justify-between h-40 px-4 gap-2">
                                    {[24, 16, 9, 24, 40, 32, 36, 24, 12].map((height, index) => (
                                        <div
                                            key={index}
                                            className="flex-1 max-w-3 bg-white rounded-full"
                                            style={{ height: `${height * 2}px` }}
                                        ></div>
                                    ))}
                                </div>

                                <div className="absolute left-4 top-4 text-white text-[10px] sm:text-xs space-y-8 opacity-90">
                                    <div>500</div>
                                    <div>400</div>
                                    <div>300</div>
                                    <div>200</div>
                                    <div>100</div>
                                    <div>0</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-6">
                            {[
                                { label: 'Пользователи', value: '32,984', icon: '👥' },
                                { label: 'Клики', value: '2,42m', icon: '🖱️' },
                                { label: 'Продажи', value: '2,400$', icon: '💰' },
                                { label: 'Товары', value: '320', icon: '📦' },
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-6 h-6 bg-teal-400/90 text-white rounded-md mx-auto mb-2 flex items-center justify-center ring-1 ring-teal-300/50">
                                        <span className="text-xs" aria-hidden="true">
                                            {stat.icon}
                                        </span>
                                    </div>
                                    <h4 className="text-gray-800 font-bold text-base sm:text-lg">
                                        {stat.value}
                                    </h4>
                                    <p className="text-slate-500 text-[11px] sm:text-xs">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 transition-all duration-200 hover:shadow-md">
                        <div className="flex justify-between items-center mb-5 sm:mb-6">
                            <h3 className="text-gray-800 text-base sm:text-lg font-bold">
                                Обзор продаж
                            </h3>
                            <div className="flex items-center gap-1 text-xs sm:text-sm">
                                <span className="text-emerald-500 font-semibold">(+5) больше</span>
                                <span className="text-slate-500">в 2021</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto cursor-pointer">
                            <div className="h-64 relative min-w-[640px]">
                                <div className="flex justify-between items-end h-40 px-4 border-b border-l border-slate-200 gap-3">
                                    {[
                                        300, 250, 200, 280, 350, 320, 300, 270, 240, 260, 290, 320,
                                    ].map((height, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div
                                                className="w-3 bg-teal-400/90 rounded-t"
                                                style={{ height: `${height / 10}px` }}
                                            ></div>
                                            <div className="text-slate-400 text-[11px] sm:text-xs mt-2 whitespace-nowrap">
                                                {
                                                    [
                                                        'Янв',
                                                        'Фев',
                                                        'Мар',
                                                        'Апр',
                                                        'Май',
                                                        'Июн',
                                                        'Июл',
                                                        'Авг',
                                                        'Сен',
                                                        'Окт',
                                                        'Ноя',
                                                        'Дек',
                                                    ][index]
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="absolute left-4 top-0 text-slate-400 text-[11px] sm:text-xs space-y-12">
                                    <div>500</div>
                                    <div>400</div>
                                    <div>300</div>
                                    <div>200</div>
                                    <div>100</div>
                                    <div>0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard
