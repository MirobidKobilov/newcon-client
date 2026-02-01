import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/UI/Button'
import ErrorModal from '../components/UI/ErrorModal'
import Input from '../components/UI/Input'
import Modal from '../components/UI/Modal'
import Select from '../components/UI/Select'
import SuccessModal from '../components/UI/SuccessModal'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const CompanyDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [company, setCompany] = useState(null)
    const [companySales, setCompanySales] = useState([])
    const [companyPayments, setCompanyPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isErrorOpen, setIsErrorOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedDetail, setSelectedDetail] = useState(null)
    const [detailType, setDetailType] = useState(null) // 'sale' or 'payment'
    const [isCreatePaymentModalOpen, setIsCreatePaymentModalOpen] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [selectedSaleId, setSelectedSaleId] = useState('')
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768 ? 'table' : 'cards'
        }
        return 'table'
    })

    useEffect(() => {
        if (id) {
            fetchCompanyDetails()
        }
    }, [id])

    const [total_payments, setTotalPayments] = useState(0)

    const fetchCompanyDetails = async () => {
        setLoading(true)
        try {
            // Fetch sales and payments for this company
            const response = await api('get', {}, `/companies/show/${id}`)
            if (response.success && response.data && response.data.data) {
                const data = response.data.data
                // Set company info - data contains id, name, phone, address directly
                setCompany({
                    id: data.id,
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                    deposit: data.deposit,
                })

                setTotalPayments(data.total_payments || 0)

                // Set sales data
                if (data.sales) {
                    setCompanySales(Array.isArray(data.sales) ? data.sales : [])
                } else {
                    setCompanySales([])
                }

                // Set payments data
                if (data.payments) {
                    setCompanyPayments(Array.isArray(data.payments) ? data.payments : [])
                } else {
                    setCompanyPayments([])
                }
            } else {
                setCompanySales([])
                setCompanyPayments([])
                setError({
                    message: response.error || 'Ошибка при загрузке данных',
                    statusCode: response.statusCode,
                    errors: response.errors,
                })
                setIsErrorOpen(true)
            }
        } catch (err) {
            console.error('Error fetching company details:', err)
            setCompanySales([])
            setCompanyPayments([])
            setError({
                message: 'Ошибка при загрузке данных',
            })
            setIsErrorOpen(true)
        } finally {
            setLoading(false)
        }
    }

    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '0'
        return Math.round(Number(num))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        try {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return dateStr
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            return `${day}-${month}-${year}`
        } catch {
            return dateStr
        }
    }

    const formatNumberInput = (num) => {
        if (num === null || num === undefined || num === '') return ''
        const numStr = String(num).trim()
        if (numStr === '') return ''

        // Проверяем, заканчивается ли строка на точку
        const endsWithDot = numStr.endsWith('.')

        // Разделяем на целую и дробную части
        const parts = numStr.split('.')
        let integerPart = parts[0] || ''
        const decimalPart = parts.length > 1 ? parts[1] : ''

        // Если целая часть пустая и есть точка, используем '0'
        if (integerPart === '' && (endsWithDot || decimalPart !== '')) {
            integerPart = '0'
        }

        // Проверяем валидность целой части (должна содержать только цифры)
        if (integerPart !== '' && !/^\d+$/.test(integerPart)) {
            return ''
        }

        // Проверяем валидность дробной части (должна содержать только цифры или быть пустой)
        if (decimalPart !== '' && !/^\d*$/.test(decimalPart)) {
            return ''
        }

        // Если целая часть все еще пустая, возвращаем пустую строку
        if (integerPart === '') {
            return ''
        }

        // Форматируем целую часть с пробелами
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

        // Объединяем с дробной частью или точкой
        if (endsWithDot || decimalPart !== '') {
            return `${formattedInteger}.${decimalPart}`
        }
        return formattedInteger
    }

    const formatPriceInput = (value) => {
        // Убираем все недопустимые символы, кроме цифр и точки
        let cleaned = value.replace(/[^\d.]/g, '')

        // Разрешаем только одну точку
        const parts = cleaned.split('.')
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('')
        }

        // Форматируем число
        return formatNumberInput(cleaned)
    }

    const parseFormattedNumber = (str) => {
        // Убираем только пробелы, сохраняя точку
        return str.replace(/\s/g, '')
    }

    const handleCreatePayment = async (e) => {
        e.preventDefault()
        setIsSubmittingPayment(true)
        setError(null)

        try {
            const amount = parseFloat(parseFormattedNumber(paymentAmount))
            if (!amount || isNaN(amount) || amount <= 0) {
                setError({
                    message: 'Пожалуйста, введите корректную сумму',
                })
                setIsErrorOpen(true)
                setIsSubmittingPayment(false)
                return
            }

            if (!selectedSaleId) {
                setError({
                    message: 'Пожалуйста, выберите продажу',
                })
                setIsErrorOpen(true)
                setIsSubmittingPayment(false)
                return
            }

            const paymentData = {
                name: 'Платеж',
                payment_type_id: 1,
                sale_id: parseInt(selectedSaleId),
                amount: amount,
                company_id: parseInt(id),
            }

            const response = await api('post', paymentData, '/payments/create')

            if (response.success && response.data) {
                // Refresh company details
                await fetchCompanyDetails()

                setIsCreatePaymentModalOpen(false)
                setPaymentAmount('')
                setSelectedSaleId('')
                setSuccessMessage('Платеж успешно создан')
                setIsSuccessOpen(true)
            } else {
                setError({
                    message: response.error || 'Ошибка при создании платежа',
                    statusCode: response.statusCode,
                    errors: response.errors,
                })
                setIsErrorOpen(true)
            }
        } catch (err) {
            console.error('Error creating payment:', err)
            setError({
                message: 'Ошибка при создании платежа',
            })
            setIsErrorOpen(true)
        } finally {
            setIsSubmittingPayment(false)
        }
    }

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
                {/* Header with Breadcrumb */}
                <div className='mb-6'>
                    <nav className='mb-4' aria-label='Breadcrumb'>
                        <ol className='flex items-center space-x-2 text-sm'>
                            <li>
                                <button
                                    onClick={() => navigate('/companies')}
                                    className='text-gray-500 hover:text-gray-700'
                                >
                                    Компании
                                </button>
                            </li>
                            <li>
                                <svg
                                    className='w-4 h-4 text-gray-400'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            </li>
                            <li>
                                <span className='text-gray-700 font-medium'>
                                    {company?.name
                                        ? `Детали - ${company.name}`
                                        : id
                                        ? `Детали - Компания #${id}`
                                        : 'Загрузка...'}
                                </span>
                            </li>
                        </ol>
                    </nav>
                    <h2 className='text-2xl font-bold text-gray-900'>
                        {company?.name
                            ? `Детали - ${company.name}`
                            : id
                            ? `Детали - Компания #${id}`
                            : 'Загрузка...'}
                    </h2>
                </div>

                <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden'>
                    <div className='p-4 sm:p-6 flex flex-row justify-between items-center border-b border-slate-200'>
                        <div className='flex items-center justify-end gap-4 mb-4'>
                            <Button
                                onClick={() => setIsCreatePaymentModalOpen(true)}
                                variant='primary'
                                className='btn-sm'
                            >
                                Создать платеж
                            </Button>
                            <div className='flex gap-1 sm:gap-2 bg-gray-100 p-0.5 sm:p-1 rounded-lg'>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                                        viewMode === 'table'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Таблица
                                </button>
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                                        viewMode === 'cards'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Карточки
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='p-4 sm:p-6'>
                        {loading ? (
                            <div className='text-center py-12 text-slate-500'>Загрузка...</div>
                        ) : (
                            <div className='flex flex-col md:flex-row gap-6'>
                                {/* Left Section - Sales */}
                                <div className='w-full md:w-1/2 flex flex-col'>
                                    <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                                        Продажи
                                    </h3>

                                    {viewMode === 'table' && (
                                        <div>
                                            <table className='w-full'>
                                                <thead>
                                                    <tr className='border-b border-slate-200'>
                                                        <th className='text-left px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            ID
                                                        </th>
                                                        <th className='text-left px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            Товары
                                                        </th>
                                                        <th className='text-left px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            Сумма
                                                        </th>
                                                        <th className='text-right px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            Действия
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {companySales.length === 0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan='5'
                                                                className='px-2 py-4 text-center text-slate-500 text-xs'
                                                            >
                                                                Нет данных
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        companySales.map((sale) => (
                                                            <tr
                                                                key={sale.id}
                                                                className='border-b border-slate-200 hover:bg-gray-50'
                                                            >
                                                                <td className='px-2 py-1.5'>
                                                                    <div className='text-xs font-bold text-gray-700'>
                                                                        {sale.id}
                                                                    </div>
                                                                </td>
                                                                <td className='px-2 py-1.5'>
                                                                    <div
                                                                        className='text-xs text-slate-600 truncate max-w-[150px]'
                                                                        title={
                                                                            sale.products &&
                                                                            sale.products.length > 0
                                                                                ? sale.products
                                                                                      .map(
                                                                                          (p) =>
                                                                                              `${
                                                                                                  p.name ||
                                                                                                  'Товар'
                                                                                              } (${
                                                                                                  p.pivot_quantity ||
                                                                                                  p.quantity ||
                                                                                                  0
                                                                                              })`
                                                                                      )
                                                                                      .join(', ')
                                                                                : '-'
                                                                        }
                                                                    >
                                                                        {sale.products &&
                                                                        sale.products.length > 0
                                                                            ? sale.products
                                                                                  .map((p) => {
                                                                                      return `${
                                                                                          p.name ||
                                                                                          'Товар'
                                                                                      } (${
                                                                                          p.pivot_quantity ||
                                                                                          p.quantity ||
                                                                                          0
                                                                                      })`
                                                                                  })
                                                                                  .join(', ')
                                                                            : '-'}
                                                                    </div>
                                                                </td>
                                                                <td className='px-2 py-1.5'>
                                                                    <div className='text-xs text-slate-600 font-semibold'>
                                                                        {formatNumber(
                                                                            sale.summa || 0
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className='px-2 py-1.5'>
                                                                    <div className='flex justify-end'>
                                                                        <Button
                                                                            onClick={() => {
                                                                                setSelectedDetail(
                                                                                    sale
                                                                                )
                                                                                setDetailType(
                                                                                    'sale'
                                                                                )
                                                                                setIsDetailModalOpen(
                                                                                    true
                                                                                )
                                                                            }}
                                                                            variant='secondary'
                                                                            className='btn-sm btn-circle min-h-[40px] min-w-[40px] flex items-center justify-center !p-0 !px-0 !pb-0'
                                                                            title='Показать детали'
                                                                        >
                                                                            <svg
                                                                                xmlns='http://www.w3.org/2000/svg'
                                                                                fill='none'
                                                                                viewBox='0 0 24 24'
                                                                                strokeWidth={2.5}
                                                                                stroke='currentColor'
                                                                                className='w-6 h-6'
                                                                            >
                                                                                <path
                                                                                    strokeLinecap='round'
                                                                                    strokeLinejoin='round'
                                                                                    d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                                                                                />
                                                                                <path
                                                                                    strokeLinecap='round'
                                                                                    strokeLinejoin='round'
                                                                                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                                                />
                                                                            </svg>
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {viewMode === 'cards' && (
                                        <div className='space-y-4'>
                                            {companySales.length === 0 ? (
                                                <div className='text-center py-12 text-slate-500 text-sm'>
                                                    Нет данных
                                                </div>
                                            ) : (
                                                companySales.map((sale) => (
                                                    <div
                                                        key={sale.id}
                                                        className='bg-white border-2 border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow'
                                                    >
                                                        <div className='flex justify-between items-start mb-3'>
                                                            <div className='flex-1'>
                                                                <div className='text-xs text-slate-400 mb-1'>
                                                                    ID
                                                                </div>
                                                                <div className='text-lg font-bold text-gray-700 mb-3'>
                                                                    #{sale.id}
                                                                </div>
                                                                <div className='text-xs text-slate-400 mb-1'>
                                                                    Товары
                                                                </div>
                                                                <div className='text-sm text-slate-600 mb-3'>
                                                                    {sale.products &&
                                                                    sale.products.length > 0
                                                                        ? sale.products
                                                                              .map((p) => {
                                                                                  return `${
                                                                                      p.name ||
                                                                                      'Товар'
                                                                                  } (${
                                                                                      p.pivot_quantity ||
                                                                                      p.quantity ||
                                                                                      0
                                                                                  })`
                                                                              })
                                                                              .join(', ')
                                                                        : '-'}
                                                                </div>
                                                                <div className='grid grid-cols-2 gap-4'>
                                                                    <div>
                                                                        <div className='text-xs text-slate-400 mb-1'>
                                                                            Сумма
                                                                        </div>
                                                                        <div className='text-base font-semibold text-gray-700'>
                                                                            {formatNumber(
                                                                                sale.summa || 0
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className='text-xs text-slate-400 mb-1'>
                                                                            Дата
                                                                        </div>
                                                                        <div className='text-sm text-slate-600'>
                                                                            {formatDate(
                                                                                sale.date ||
                                                                                    sale.created_at
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() => {
                                                                    setSelectedDetail(sale)
                                                                    setDetailType('sale')
                                                                    setIsDetailModalOpen(true)
                                                                }}
                                                                variant='secondary'
                                                                className='btn-sm btn-circle min-h-[40px] min-w-[40px] flex items-center justify-center !p-0 !px-0 !pb-0'
                                                                title='Показать детали'
                                                            >
                                                                <svg
                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                    fill='none'
                                                                    viewBox='0 0 24 24'
                                                                    strokeWidth={2}
                                                                    stroke='currentColor'
                                                                    className='w-5 h-5'
                                                                >
                                                                    <path
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                                                                    />
                                                                    <path
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                                    />
                                                                </svg>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Divider - vertical on desktop, horizontal on mobile */}
                                <div className='hidden md:block w-px bg-gray-300 self-stretch mx-3'></div>
                                <div className='md:hidden w-full h-px bg-gray-300 my-4'></div>

                                {/* Right Section - Payments */}
                                <div className='w-full md:w-1/2 flex flex-col'>
                                    <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                                        Платежи
                                    </h3>

                                    {viewMode === 'table' && (
                                        <div>
                                            <table className='w-full'>
                                                <thead>
                                                    <tr className='border-b border-slate-200'>
                                                        <th className='text-left px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            ID
                                                        </th>
                                                        <th className='text-left px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            Название
                                                        </th>
                                                        <th className='text-left px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            Тип платежа
                                                        </th>
                                                        <th className='text-left px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            Сумма
                                                        </th>
                                                        <th className='text-right px-2 py-1.5 text-slate-400 text-[10px] font-bold uppercase'>
                                                            Действия
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {companyPayments.length === 0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan='5'
                                                                className='px-2 py-4 text-center text-slate-500 text-xs'
                                                            >
                                                                Нет данных
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        companyPayments.map((payment) => {
                                                            const paymentType =
                                                                payment.payment_type_id === 1
                                                                    ? '$'
                                                                    : payment.payment_type_id === 2
                                                                    ? '$'
                                                                    : '-'
                                                            // Get amount from companies pivot
                                                            const companyPayment =
                                                                payment.companies?.find(
                                                                    (c) => c.id === parseInt(id)
                                                                )
                                                            const amount =
                                                                companyPayment?.pivot?.amount || 0

                                                            return (
                                                                <tr
                                                                    key={payment.id}
                                                                    className='border-b border-slate-200 hover:bg-gray-50'
                                                                >
                                                                    <td className='px-2 py-1.5'>
                                                                        <div className='text-xs font-bold text-gray-700'>
                                                                            {payment.id}
                                                                        </div>
                                                                    </td>
                                                                    <td className='px-2 py-1.5'>
                                                                        <div
                                                                            className='text-xs font-bold text-gray-700 truncate max-w-[120px]'
                                                                            title={
                                                                                payment.name || '-'
                                                                            }
                                                                        >
                                                                            {payment.name || '-'}
                                                                        </div>
                                                                    </td>
                                                                    <td className='px-2 py-1.5'>
                                                                        <div className='text-xs text-slate-600'>
                                                                            {paymentType}
                                                                        </div>
                                                                    </td>
                                                                    <td className='px-2 py-1.5'>
                                                                        <div className='text-xs text-slate-600 font-semibold'>
                                                                            {formatNumber(amount)}
                                                                        </div>
                                                                    </td>
                                                                    <td className='px-2 py-1.5'>
                                                                        <div className='flex justify-end'>
                                                                            <Button
                                                                                onClick={() => {
                                                                                    setSelectedDetail(
                                                                                        payment
                                                                                    )
                                                                                    setDetailType(
                                                                                        'payment'
                                                                                    )
                                                                                    setIsDetailModalOpen(
                                                                                        true
                                                                                    )
                                                                                }}
                                                                                variant='secondary'
                                                                                className='btn-sm btn-circle min-h-[40px] min-w-[40px] flex items-center justify-center !p-0 !px-0 !pb-0'
                                                                                title='Показать детали'
                                                                            >
                                                                                <svg
                                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                                    fill='none'
                                                                                    viewBox='0 0 24 24'
                                                                                    strokeWidth={2}
                                                                                    stroke='currentColor'
                                                                                    className='w-5 h-5'
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap='round'
                                                                                        strokeLinejoin='round'
                                                                                        d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap='round'
                                                                                        strokeLinejoin='round'
                                                                                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                                                    />
                                                                                </svg>
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {viewMode === 'cards' && (
                                        <div className='space-y-4'>
                                            {companyPayments.length === 0 ? (
                                                <div className='text-center py-12 text-slate-500 text-sm'>
                                                    Нет данных
                                                </div>
                                            ) : (
                                                companyPayments.map((payment) => {
                                                    const paymentType =
                                                        payment.payment_type_id === 1
                                                            ? '$'
                                                            : payment.payment_type_id === 2
                                                            ? '$'
                                                            : '-'
                                                    const companyPayment = payment.companies?.find(
                                                        (c) => c.id === parseInt(id)
                                                    )
                                                    const amount =
                                                        companyPayment?.pivot?.amount || 0

                                                    return (
                                                        <div
                                                            key={payment.id}
                                                            className='bg-white border-2 border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow'
                                                        >
                                                            <div className='flex justify-between items-start mb-3'>
                                                                <div className='flex-1'>
                                                                    <div className='text-xs text-slate-400 mb-1'>
                                                                        ID
                                                                    </div>
                                                                    <div className='text-lg font-bold text-gray-700 mb-3'>
                                                                        #{payment.id}
                                                                    </div>
                                                                    <div className='text-xs text-slate-400 mb-1'>
                                                                        Название
                                                                    </div>
                                                                    <div className='text-sm font-semibold text-gray-700 mb-3'>
                                                                        {payment.name || '-'}
                                                                    </div>
                                                                    <div className='grid grid-cols-2 gap-4'>
                                                                        <div>
                                                                            <div className='text-xs text-slate-400 mb-1'>
                                                                                Тип платежа
                                                                            </div>
                                                                            <div className='text-sm text-slate-600'>
                                                                                {paymentType}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className='text-xs text-slate-400 mb-1'>
                                                                                Сумма
                                                                            </div>
                                                                            <div className='text-base font-semibold text-gray-700'>
                                                                                {formatNumber(
                                                                                    amount
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className='text-xs text-slate-400 mb-1'>
                                                                                Дата
                                                                            </div>
                                                                            <div className='text-sm text-slate-600'>
                                                                                {formatDate(
                                                                                    payment.date ||
                                                                                        payment.created_at
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    onClick={() => {
                                                                        setSelectedDetail(payment)
                                                                        setDetailType('payment')
                                                                        setIsDetailModalOpen(true)
                                                                    }}
                                                                    variant='secondary'
                                                                    className='btn-sm btn-circle min-h-[40px] min-w-[40px] flex items-center justify-center !p-0 !px-0 !pb-0'
                                                                    title='Показать детали'
                                                                >
                                                                    <svg
                                                                        xmlns='http://www.w3.org/2000/svg'
                                                                        fill='none'
                                                                        viewBox='0 0 24 24'
                                                                        strokeWidth={2}
                                                                        stroke='currentColor'
                                                                        className='w-5 h-5'
                                                                    >
                                                                        <path
                                                                            strokeLinecap='round'
                                                                            strokeLinejoin='round'
                                                                            d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                                                                        />
                                                                        <path
                                                                            strokeLinecap='round'
                                                                            strokeLinejoin='round'
                                                                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                                        />
                                                                    </svg>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Modal for Sale or Payment */}
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false)
                        setSelectedDetail(null)
                        setDetailType(null)
                    }}
                    title={
                        detailType === 'sale'
                            ? `Детали продажи #${selectedDetail?.id || ''}`
                            : `Детали платежа #${selectedDetail?.id || ''}`
                    }
                    maxWidth='max-w-4xl'
                >
                    {selectedDetail && detailType === 'sale' && (
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        ID
                                    </div>
                                    <div className='text-sm font-bold text-gray-700'>
                                        {selectedDetail.id}
                                    </div>
                                </div>
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        Сумма
                                    </div>
                                    <div className='text-sm font-semibold text-gray-700'>
                                        {formatNumber(selectedDetail.summa || 0)}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className='text-xs text-slate-400 font-medium uppercase mb-2'>
                                    Товары
                                </div>
                                <div className='space-y-2'>
                                    {selectedDetail.products &&
                                    selectedDetail.products.length > 0 ? (
                                        selectedDetail.products.map((product, index) => (
                                            <div
                                                key={index}
                                                className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                                            >
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <div>
                                                        <div className='text-xs text-slate-400 mb-1'>
                                                            Название
                                                        </div>
                                                        <div className='text-sm font-semibold text-gray-700'>
                                                            {product.name || '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 mb-1'>
                                                            Описание
                                                        </div>
                                                        <div className='text-sm text-gray-700'>
                                                            {product.description || '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 mb-1'>
                                                            Количество
                                                        </div>
                                                        <div className='text-sm text-gray-700'>
                                                            {product.pivot_quantity ||
                                                                product.quantity ||
                                                                0}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 mb-1'>
                                                            Цена
                                                        </div>
                                                        <div className='text-sm font-semibold text-gray-700'>
                                                            {formatNumber(
                                                                product.pivot_price ||
                                                                    product.price ||
                                                                    0
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-sm text-slate-500'>Нет товаров</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedDetail && detailType === 'payment' && (
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        ID
                                    </div>
                                    <div className='text-sm font-bold text-gray-700'>
                                        {selectedDetail.id}
                                    </div>
                                </div>
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        UUID
                                    </div>
                                    <div className='text-sm text-gray-700'>
                                        {selectedDetail.uuid || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        Название
                                    </div>
                                    <div className='text-sm font-semibold text-gray-700'>
                                        {selectedDetail.name || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        Тип платежа
                                    </div>
                                    <div className='text-sm text-gray-700'>
                                        {selectedDetail.payment_type_id === 1
                                            ? '$'
                                            : selectedDetail.payment_type_id === 2
                                            ? '$'
                                            : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        Статус продажи
                                    </div>
                                    <div className='text-sm text-gray-700'>
                                        {selectedDetail.sales_stage || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        Пользователь
                                    </div>
                                    <div className='text-sm text-gray-700'>
                                        {selectedDetail.user?.username || '-'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className='text-xs text-slate-400 font-medium uppercase mb-2'>
                                    Компании
                                </div>
                                <div className='space-y-2'>
                                    {selectedDetail.companies &&
                                    selectedDetail.companies.length > 0 ? (
                                        selectedDetail.companies.map((company, index) => (
                                            <div
                                                key={index}
                                                className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                                            >
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <div>
                                                        <div className='text-xs text-slate-400 mb-1'>
                                                            Название
                                                        </div>
                                                        <div className='text-sm font-semibold text-gray-700'>
                                                            {company.name || '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 mb-1'>
                                                            Телефон
                                                        </div>
                                                        <div className='text-sm text-gray-700'>
                                                            {company.phone || '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 mb-1'>
                                                            Адрес
                                                        </div>
                                                        <div className='text-sm text-gray-700'>
                                                            {company.address || '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 mb-1'>
                                                            Сумма
                                                        </div>
                                                        <div className='text-sm font-semibold text-gray-700'>
                                                            {formatNumber(
                                                                company.pivot?.amount || 0
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-sm text-slate-500'>Нет компаний</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Create Payment Modal */}
                <Modal
                    isOpen={isCreatePaymentModalOpen}
                    onClose={() => {
                        setIsCreatePaymentModalOpen(false)
                        setPaymentAmount('')
                        setSelectedSaleId('')
                    }}
                    title='Создать платеж'
                    maxWidth='max-w-md'
                >
                    <form onSubmit={handleCreatePayment} className='space-y-4'>
                        <Select
                            label='Продажа'
                            required
                            options={companySales.map((sale) => ({
                                value: sale.id,
                                label: `#${sale.id} - ${formatNumber(
                                    sale.summa || 0
                                )} (${formatDate(sale.date || sale.created_at)})`,
                            }))}
                            value={selectedSaleId}
                            onChange={setSelectedSaleId}
                            placeholder='Выберите продажу'
                        />
                        <Input
                            label='Сумма'
                            name='amount'
                            type='text'
                            value={formatPriceInput(paymentAmount)}
                            onChange={(e) => {
                                const value = e.target.value
                                // Форматируем введенное значение
                                const formattedValue = formatPriceInput(value)
                                const numericValue = parseFormattedNumber(formattedValue)
                                // Allow numbers with optional decimal point and decimal digits
                                // Also allow empty string for clearing the field
                                // Allow numbers ending with dot (e.g., "123.")
                                if (
                                    numericValue === '' ||
                                    /^\d+\.?$|^\d+\.\d+$/.test(numericValue)
                                ) {
                                    setPaymentAmount(numericValue)
                                }
                            }}
                            placeholder='Введите сумму'
                            required
                        />
                        <div className='flex gap-3 justify-end pt-4'>
                            <Button
                                type='button'
                                variant='secondary'
                                onClick={() => {
                                    setIsCreatePaymentModalOpen(false)
                                    setPaymentAmount('')
                                    setSelectedSaleId('')
                                }}
                                disabled={isSubmittingPayment}
                            >
                                Отмена
                            </Button>
                            <Button
                                type='submit'
                                variant='primary'
                                disabled={isSubmittingPayment || !paymentAmount || !selectedSaleId}
                            >
                                {isSubmittingPayment ? 'Создание...' : 'Создать'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <SuccessModal
                    isOpen={isSuccessOpen}
                    onClose={() => setIsSuccessOpen(false)}
                    title='Успешно'
                    message={successMessage}
                />

                <ErrorModal
                    isOpen={isErrorOpen}
                    onClose={() => setIsErrorOpen(false)}
                    title='Xatolik'
                    message={error?.message || "Noma'lum xatolik yuz berdi"}
                    statusCode={error?.statusCode}
                    errors={error?.errors}
                />
            </div>
        </Layout>
    )
}

export default CompanyDetails
