import React, { useEffect, useMemo, useState } from 'react'
import DatePicker from '../components/UI/DatePicker'
import ErrorModal from '../components/UI/ErrorModal'
import Select from '../components/UI/Select'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Dashboard = () => {
    // Format date to yyyy-mm-dd string format
    const formatDateToYYYYMMDD = (dateValue) => {
        if (!dateValue) return ''
        // If already in yyyy-mm-dd format string, return as is
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue
        }
        // Otherwise, format it to yyyy-mm-dd string
        const d = new Date(dateValue)
        if (isNaN(d.getTime())) return ''
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}` // Always returns string in yyyy-mm-dd format
    }

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    // Ensure initial date is always yyyy-mm-dd string format
    const [selectedDate, setSelectedDate] = useState(formatDateToYYYYMMDD(new Date()))
    const [salesData, setSalesData] = useState(null)
    const [dailySalesData, setDailySalesData] = useState(null)
    const [loadingMonth, setLoadingMonth] = useState(false)
    const [loadingDay, setLoadingDay] = useState(false)
    const [error, setError] = useState(null)
    const [isErrorOpen, setIsErrorOpen] = useState(false)

    const months = [
        { value: 1, label: 'Январь' },
        { value: 2, label: 'Февраль' },
        { value: 3, label: 'Март' },
        { value: 4, label: 'Апрель' },
        { value: 5, label: 'Май' },
        { value: 6, label: 'Июнь' },
        { value: 7, label: 'Июль' },
        { value: 8, label: 'Август' },
        { value: 9, label: 'Сентябрь' },
        { value: 10, label: 'Октябрь' },
        { value: 11, label: 'Ноябрь' },
        { value: 12, label: 'Декабрь' },
    ]

    const fetchSalesByMonth = async (month) => {
        setLoadingMonth(true)
        setError(null)
        try {
            const response = await api(
                'post',
                { month: month.toString() },
                '/dashboard/get-sale-by-month'
            )
            if (response.success && response.data) {
                setSalesData(response.data)
            } else {
                setError({
                    message: response.error || 'Ошибка при загрузке данных о продажах за месяц',
                    statusCode: response.statusCode,
                    errors: response.errors,
                })
                setIsErrorOpen(true)
            }
        } catch (error) {
            setError({
                message: 'Произошла ошибка при загрузке данных',
                statusCode: null,
            })
            setIsErrorOpen(true)
        } finally {
            setLoadingMonth(false)
        }
    }

    const fetchSalesByDay = async (day) => {
        setLoadingDay(true)
        setError(null)
        try {
            const response = await api('post', { day: day }, '/dashboard/get-sale-by-day')
            if (response.success && response.data) {
                setDailySalesData(response.data)
            } else {
                setError({
                    message: response.error || 'Ошибка при загрузке данных о продажах за день',
                    statusCode: response.statusCode,
                    errors: response.errors,
                })
                setIsErrorOpen(true)
            }
        } catch (error) {
            setError({
                message: 'Произошла ошибка при загрузке данных',
                statusCode: null,
            })
            setIsErrorOpen(true)
        } finally {
            setLoadingDay(false)
        }
    }

    useEffect(() => {
        fetchSalesByMonth(selectedMonth)
    }, [selectedMonth])

    useEffect(() => {
        fetchSalesByDay(selectedDate)
    }, [selectedDate])

    const formatNumber = (num) => {
        return new Intl.NumberFormat('ru-RU').format(num)
    }

    // Prepare chart data for daily sales
    const dailyChartData = useMemo(() => {
        if (!dailySalesData || !dailySalesData.data) return []

        const salesByDate = {}
        dailySalesData.data.forEach((sale) => {
            const date = sale.created_at
            if (salesByDate[date]) {
                salesByDate[date] += parseFloat(sale.summa)
            } else {
                salesByDate[date] = parseFloat(sale.summa)
            }
        })

        const sorted = Object.entries(salesByDate)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, summa]) => ({
                date,
                summa,
                label: (() => {
                    const d = new Date(date)
                    if (isNaN(d.getTime())) return date
                    const day = String(d.getDate()).padStart(2, '0')
                    const month = String(d.getMonth() + 1).padStart(2, '0')
                    return `${day}-${month}`
                })(),
            }))

        return sorted
    }, [dailySalesData])

    // Prepare chart data for monthly sales
    const monthlyChartData = useMemo(() => {
        if (!salesData || !salesData.data) return []

        const salesByDate = {}
        salesData.data.forEach((sale) => {
            const date = sale.created_at
            if (salesByDate[date]) {
                salesByDate[date] += parseFloat(sale.summa)
            } else {
                salesByDate[date] = parseFloat(sale.summa)
            }
        })

        const sorted = Object.entries(salesByDate)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, summa]) => ({
                date,
                summa,
                label: (() => {
                    const d = new Date(date)
                    if (isNaN(d.getTime())) return date
                    const day = String(d.getDate()).padStart(2, '0')
                    const month = String(d.getMonth() + 1).padStart(2, '0')
                    return `${day}-${month}`
                })(),
            }))

        return sorted
    }, [salesData])

    const dailyMaxValue = useMemo(() => {
        if (dailyChartData.length === 0) return 0
        return Math.max(...dailyChartData.map((d) => d.summa))
    }, [dailyChartData])

    const monthlyMaxValue = useMemo(() => {
        if (monthlyChartData.length === 0) return 0
        return Math.max(...monthlyChartData.map((d) => d.summa))
    }, [monthlyChartData])

    const handleMonthSelect = (value) => {
        setSelectedMonth(value)
    }

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value) // DatePicker returns yyyy-mm-dd format
    }

    const renderChart = (chartData, maxValue, loading) => {
        if (loading) {
            return (
                <div className='h-80 flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-2'></div>
                        <div className='text-slate-500 text-sm'>Загрузка данных...</div>
                    </div>
                </div>
            )
        }

        if (chartData.length === 0) {
            return (
                <div className='h-80 flex flex-col items-center justify-center'>
                    <svg
                        className='w-16 h-16 text-slate-300 mb-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                        />
                    </svg>
                    <div className='text-slate-500 text-sm font-medium'>
                        Нет данных для отображения
                    </div>
                </div>
            )
        }

        return (
            <div
                className='relative py-20'
                style={{ minWidth: `${Math.max(chartData.length * 60, 400)}px` }}
            >
                <div className='flex items-end justify-around h-64 px-4 relative'>
                    {chartData.map((item, index) => {
                        const heightPercent = maxValue > 0 ? (item.summa / maxValue) * 100 : 0
                        const barHeight = Math.max((heightPercent / 100) * 240, 8)

                        return (
                            <div
                                key={index}
                                className='flex flex-col items-center group relative'
                                style={{ flex: '0 0 auto', width: '40px' }}
                            >
                                {/* Tooltip */}
                                <div className='absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]'>
                                    <div className='bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap'>
                                        <div className='font-semibold'>
                                            {formatNumber(item.summa)} Сум
                                        </div>
                                        <div className='text-gray-300 text-[10px] mt-0.5'>
                                            {item.label}
                                        </div>
                                    </div>
                                </div>

                                {/* Bar */}
                                <div className='relative w-full flex items-end justify-center'>
                                    <div
                                        className='w-10 bg-gradient-to-t from-teal-500 via-teal-400 to-teal-300 rounded-t-lg shadow-sm group-hover:from-teal-600 group-hover:via-teal-500 group-hover:to-teal-400 transition-all duration-300 cursor-pointer'
                                        style={{ height: `${barHeight}px` }}
                                    ></div>
                                </div>

                                {/* Date label */}
                                <div className='text-slate-600 text-[11px] font-medium mt-2 text-center'>
                                    {item.label}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Y-axis labels */}
                <div className='absolute left-0 top-20 bottom-20 flex flex-col justify-between text-slate-500 text-[10px] font-medium'>
                    {[5, 4, 3, 2, 1, 0].map((multiplier) => {
                        const value = (maxValue / 5) * multiplier
                        let label = ''
                        if (value >= 1000000) {
                            label = `${(value / 1000000).toFixed(1)} млн`
                        } else if (value >= 1000) {
                            label = `${Math.round(value / 1000)} т`
                        } else {
                            label = Math.round(value).toString()
                        }
                        return (
                            <div key={multiplier} className='text-right pr-2 -translate-y-2'>
                                {label}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6'>
                <h1 className='text-gray-800 tracking-tight font-bold text-xl mb-6'>
                    Панель управления
                </h1>

                {/* Two column layout */}
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                    {/* Left Column - Daily Sales */}
                    <div className='space-y-4'>
                        {/* Header */}
                        <div className='flex items-center justify-between bg-white rounded-xl shadow-sm p-4'>
                            <h2 className='text-gray-800 font-bold text-lg'>Продажи по дням</h2>
                        </div>

                        {/* Date Picker Card */}
                        <div className='bg-white rounded-xl shadow-sm p-4'>
                            <DatePicker
                                label='Выберите дату'
                                name='selectedDate'
                                value={selectedDate}
                                onChange={handleDateChange}
                                placeholder='dd-mm-yyyy'
                                className='w-full'
                            />
                        </div>

                        {/* Daily Stats Card */}
                        <div className='bg-white rounded-2xl shadow-sm p-4 lg:p-6'>
                            <div className='flex justify-between items-start mb-4'>
                                <div>
                                    <p className='text-slate-500 text-xs uppercase tracking-wide font-bold mb-2'>
                                        Продажи за день
                                    </p>
                                    <h3 className='text-gray-800 text-2xl font-bold mb-1'>
                                        {loadingDay
                                            ? '...'
                                            : dailySalesData
                                            ? `${formatNumber(dailySalesData.total_summa)} Сум`
                                            : '0 Сум'}
                                    </h3>
                                    <div className='text-slate-500 text-sm'>
                                        {(() => {
                                            if (!selectedDate) return ''
                                            try {
                                                const date = new Date(selectedDate)
                                                if (isNaN(date.getTime())) return ''
                                                const day = String(date.getDate()).padStart(2, '0')
                                                const month = String(date.getMonth() + 1).padStart(
                                                    2,
                                                    '0'
                                                )
                                                const year = date.getFullYear()
                                                return `${day}-${month}-${year}`
                                            } catch {
                                                return ''
                                            }
                                        })()}
                                    </div>
                                </div>
                                <div className='w-14 h-14 bg-teal-400/90 text-white rounded-xl shadow-sm flex items-center justify-center ring-1 ring-teal-300/50'>
                                    <svg
                                        className='w-8 h-8'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        stroke='currentColor'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className='flex gap-4 pt-4 border-t border-slate-100'>
                                <div>
                                    <p className='text-slate-500 text-xs mb-1'>Количество</p>
                                    <p className='text-gray-800 font-semibold'>
                                        {loadingDay
                                            ? '...'
                                            : dailySalesData
                                            ? formatNumber(dailySalesData.count)
                                            : '0'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Daily Chart */}
                        <div className='bg-white rounded-2xl shadow-sm p-4 lg:p-6'>
                            <h3 className='text-gray-800 text-lg font-bold mb-4'>График продаж</h3>
                            <div className='overflow-x-auto'>
                                {renderChart(dailyChartData, dailyMaxValue, loadingDay)}
                            </div>
                        </div>

                        {/* Daily Sales Table */}
                        {dailySalesData &&
                            dailySalesData.data &&
                            dailySalesData.data.length > 0 && (
                                <div className='bg-white rounded-2xl shadow-sm p-4 lg:p-6'>
                                    <h3 className='text-gray-800 text-lg font-bold mb-4'>
                                        Детали продаж ({dailySalesData.count})
                                    </h3>
                                    <div className='overflow-x-auto'>
                                        <table className='w-full min-w-[600px]'>
                                            <thead>
                                                <tr className='border-b border-slate-200'>
                                                    <th className='text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase'>
                                                        ID
                                                    </th>
                                                    <th className='text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase'>
                                                        Компания
                                                    </th>
                                                    <th className='text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase'>
                                                        Сумма
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dailySalesData.data.map((sale) => (
                                                    <tr
                                                        key={sale.id}
                                                        className='border-b border-slate-100 hover:bg-slate-50 transition-colors'
                                                    >
                                                        <td className='py-3 px-4 text-sm text-gray-800'>
                                                            #{sale.id}
                                                        </td>
                                                        <td className='py-3 px-4'>
                                                            <div className='text-sm font-medium text-gray-800'>
                                                                {sale.company?.name || 'N/A'}
                                                            </div>
                                                            <div className='text-xs text-slate-500'>
                                                                {sale.company?.phone || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className='py-3 px-4'>
                                                            <span className='text-sm font-semibold text-teal-600'>
                                                                {formatNumber(
                                                                    parseFloat(sale.summa)
                                                                )}{' '}
                                                                Сум
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className='mt-4 pt-4 border-t border-slate-200 text-right'>
                                        <div className='text-base font-bold text-gray-800'>
                                            Итого: {formatNumber(dailySalesData.total_summa)} Сум
                                        </div>
                                    </div>
                                </div>
                            )}

                        {!loadingDay &&
                            (!dailySalesData ||
                                !dailySalesData.data ||
                                dailySalesData.data.length === 0) && (
                                <div className='bg-white rounded-2xl shadow-sm p-8 text-center'>
                                    <div className='text-slate-500'>
                                        Нет данных о продажах за выбранный день
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Right Column - Monthly Sales */}
                    <div className='space-y-4'>
                        {/* Header with month picker */}
                        <div className='flex items-center justify-between bg-white rounded-xl shadow-sm p-4'>
                            <h2 className='text-gray-800 font-bold text-lg'>Продажи по месяцам</h2>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-slate-600 font-medium'>Месяц:</span>
                                <div className='w-48'>
                                    <Select
                                        options={months}
                                        value={selectedMonth}
                                        onChange={handleMonthSelect}
                                        placeholder='Выберите месяц'
                                        searchable={false}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Monthly Stats Card */}
                        <div className='bg-white rounded-2xl shadow-sm p-4 lg:p-6'>
                            <div className='flex justify-between items-start mb-4'>
                                <div>
                                    <p className='text-slate-500 text-xs uppercase tracking-wide font-bold mb-2'>
                                        Продажи за месяц
                                    </p>
                                    <h3 className='text-gray-800 text-2xl font-bold mb-1'>
                                        {loadingMonth
                                            ? '...'
                                            : salesData
                                            ? `${formatNumber(salesData.total_summa)} Сум`
                                            : '0 Сум'}
                                    </h3>
                                    <div className='text-slate-500 text-sm'>
                                        {months.find((m) => m.value === selectedMonth)?.label} 2025
                                    </div>
                                </div>
                                <div className='w-14 h-14 bg-teal-400/90 text-white rounded-xl shadow-sm flex items-center justify-center ring-1 ring-teal-300/50'>
                                    <svg
                                        className='w-8 h-8'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        stroke='currentColor'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className='flex gap-4 pt-4 border-t border-slate-100'>
                                <div>
                                    <p className='text-slate-500 text-xs mb-1'>Количество</p>
                                    <p className='text-gray-800 font-semibold'>
                                        {loadingMonth
                                            ? '...'
                                            : salesData
                                            ? formatNumber(salesData.count)
                                            : '0'}
                                    </p>
                                </div>
                                <div className='border-l border-slate-100 pl-4'>
                                    <p className='text-slate-500 text-xs mb-1'>Дней с продажами</p>
                                    <p className='text-gray-800 font-semibold'>
                                        {monthlyChartData.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Chart */}
                        <div className='bg-white rounded-2xl shadow-sm p-4 lg:p-6'>
                            <h3 className='text-gray-800 text-lg font-bold mb-4'>График продаж</h3>
                            <div className='overflow-x-auto'>
                                {renderChart(monthlyChartData, monthlyMaxValue, loadingMonth)}
                            </div>
                        </div>

                        {/* Monthly Sales Table */}
                        {salesData && salesData.data && salesData.data.length > 0 && (
                            <div className='bg-white rounded-2xl shadow-sm p-4 lg:p-6'>
                                <h3 className='text-gray-800 text-lg font-bold mb-4'>
                                    Детали продаж ({salesData.count})
                                </h3>
                                <div className='overflow-x-auto'>
                                    <table className='w-full min-w-[600px]'>
                                        <thead>
                                            <tr className='border-b border-slate-200'>
                                                <th className='text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase'>
                                                    ID
                                                </th>
                                                <th className='text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase'>
                                                    Компания
                                                </th>
                                                <th className='text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase'>
                                                    Сумма
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesData.data.map((sale) => (
                                                <tr
                                                    key={sale.id}
                                                    className='border-b border-slate-100 hover:bg-slate-50 transition-colors'
                                                >
                                                    <td className='py-3 px-4 text-sm text-gray-800'>
                                                        #{sale.id}
                                                    </td>
                                                    <td className='py-3 px-4'>
                                                        <div className='text-sm font-medium text-gray-800'>
                                                            {sale.company?.name || 'N/A'}
                                                        </div>
                                                        <div className='text-xs text-slate-500'>
                                                            {sale.company?.phone || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className='py-3 px-4'>
                                                        <span className='text-sm font-semibold text-teal-600'>
                                                            {formatNumber(parseFloat(sale.summa))}{' '}
                                                            Сум
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className='mt-4 pt-4 border-t border-slate-200 text-right'>
                                    <div className='text-base font-bold text-gray-800'>
                                        Итого: {formatNumber(salesData.total_summa)} Сум
                                    </div>
                                </div>
                            </div>
                        )}

                        {!loadingMonth &&
                            (!salesData || !salesData.data || salesData.data.length === 0) && (
                                <div className='bg-white rounded-2xl shadow-sm p-8 text-center'>
                                    <div className='text-slate-500'>
                                        Нет данных о продажах за выбранный месяц
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            <ErrorModal
                isOpen={isErrorOpen}
                onClose={() => setIsErrorOpen(false)}
                title='Xatolik'
                message={error?.message || "Noma'lum xatolik yuz berdi"}
                statusCode={error?.statusCode}
                errors={error?.errors}
            />
        </Layout>
    )
}

export default Dashboard
