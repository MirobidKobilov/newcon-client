import React, { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import ErrorModal from '../components/UI/ErrorModal'
import Input from '../components/UI/Input'
import Modal from '../components/UI/Modal'
import Pagination from '../components/UI/Pagination'
import SuccessModal from '../components/UI/SuccessModal'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Companies = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [viewMode, setViewMode] = useState('table')
    const [error, setError] = useState(null)
    const [isErrorOpen, setIsErrorOpen] = useState(false)
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [companySales, setCompanySales] = useState([])
    const [companyPayments, setCompanyPayments] = useState([])
    const [loadingDebtData, setLoadingDebtData] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedDetail, setSelectedDetail] = useState(null)
    const [detailType, setDetailType] = useState(null) // 'sale' or 'payment'
    const [companyDebts, setCompanyDebts] = useState({})
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const fetchItems = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const response = await api('get', { page: currentPage, size: pageSize }, '/companies/list')
        if (response.success && response.data) {
            const companiesData = response.data.data || []
            setItems(companiesData)

            // Handle pagination metadata
            if (response.data.total !== undefined) {
                setTotalItems(response.data.total)
                setTotalPages(Math.ceil(response.data.total / pageSize))
            } else if (response.data.meta) {
                setTotalItems(response.data.meta.total || 0)
                setTotalPages(response.data.meta.last_page || 1)
            } else {
                const items = response.data.data || []
                setTotalItems(items.length)
                setTotalPages(1)
            }

            // Calculate debts for all companies - fetch data once
            const debts = {}

            // Fetch all sales and payments once
            const salesResponse = await api('get', {}, '/sales/list')
            const paymentsResponse = await api('get', {}, '/payments/list')

            const sales =
                salesResponse.success && salesResponse.data ? salesResponse.data.data || [] : []
            const payments =
                paymentsResponse.success && paymentsResponse.data
                    ? paymentsResponse.data.data || []
                    : []

            // Calculate debt for each company
            companiesData.forEach((company) => {
                // Calculate total sales for this company
                const companySales = sales.filter((s) => s.company_id === company.id)
                const totalSales = companySales.reduce(
                    (sum, sale) => sum + (Number(sale.summa) || 0),
                    0
                )

                // Calculate total payments for this company
                let totalPayments = 0
                payments.forEach((payment) => {
                    if (payment.sales && Array.isArray(payment.sales)) {
                        payment.sales.forEach((sale) => {
                            if (sale.company_id === company.id) {
                                totalPayments += Number(sale.amount || sale.summa || 0)
                            }
                        })
                    }
                })

                debts[company.id] = totalSales - totalPayments
            })

            setCompanyDebts(debts)
        } else {
            setError({
                message: response.error || 'Ошибка при загрузке компаний',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchItems(page, size)
    }, [page, size])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        let response
        if (isEditMode) {
            response = await api('put', formData, `/companies/update/${editingItemId}`)
        } else {
            response = await api('post', formData, '/companies/create')
        }

        if (response.success && response.data) {
            await fetchItems(page, size)

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingItemId(null)
            setFormData({
                name: '',
                phone: '',
                address: '',
            })

            setSuccessMessage(
                isEditMode ? 'Компания успешно обновлена' : 'Компания успешно создана'
            )
            setIsSuccessOpen(true)
        } else {
            setError({
                message:
                    response.error ||
                    (isEditMode
                        ? 'Ошибка при обновлении компании'
                        : 'Ошибка при создании компании'),
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (item) => {
        setIsEditMode(true)
        setEditingItemId(item.id)
        setFormData({
            name: item.name,
            phone: item.phone || '',
            address: item.address || '',
        })
        setIsModalOpen(true)
    }

    const handleDelete = (itemId) => {
        setDeletingItemId(itemId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        setError(null)
        const response = await api('delete', {}, `/companies/delete/${deletingItemId}`)

        if (response.success && response.data) {
            await fetchItems(page, size)

            setSuccessMessage('Компания успешно удалена')
            setIsSuccessOpen(true)
        } else {
            setError({
                message: response.error || 'Ошибка при удалении компании',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }

        setDeleting(false)
        setIsConfirmOpen(false)
        setDeletingItemId(null)
    }

    const handleCreateNew = () => {
        setIsEditMode(false)
        setEditingItemId(null)
        setFormData({
            name: '',
            phone: '',
            address: '',
        })
        setIsModalOpen(true)
    }

    const formatUzPhoneDisplay = (raw) => {
        if (!raw) return ''
        const digits = String(raw).replace(/\D/g, '')
        if (!digits) return ''

        let rest = digits
        if (rest.startsWith('998')) rest = rest.slice(3)
        rest = rest.slice(0, 9)

        const a = rest.slice(0, 2)
        const b = rest.slice(2, 5)
        const c = rest.slice(5, 7)
        const d = rest.slice(7, 9)

        let out = '+998'
        if (a) out += ` (${a}`
        if (a.length === 2) out += ')'
        if (b) out += ` ${b}`
        if (c) out += `-${c}`
        if (d) out += `-${d}`
        return out
    }

    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '0'
        return Math.round(Number(num))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    const handleDebtClick = async (company) => {
        setSelectedCompany(company)
        setLoadingDebtData(true)
        setIsDebtModalOpen(true)

        try {
            // Fetch sales and payments for this company from the overall-debt endpoint
            const response = await api('get', {}, `/companies/overall-debt/${company.id}`)
            if (response.success && response.data && response.data.data) {
                const data = response.data.data
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
                    message: response.error || 'Ошибка при загрузке данных о долге',
                    statusCode: response.statusCode,
                    errors: response.errors,
                })
                setIsErrorOpen(true)
            }
        } catch (err) {
            console.error('Error fetching debt data:', err)
            setCompanySales([])
            setCompanyPayments([])
            setError({
                message: 'Ошибка при загрузке данных о долге',
            })
            setIsErrorOpen(true)
        } finally {
            setLoadingDebtData(false)
        }
    }

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-4 lg:p-6'>
                <div className='mb-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                        <div>
                            <div className='text-2xl text-slate-400'>
                                NEWCON <span className='text-gray-700'>/ Компании</span>
                            </div>
                        </div>
                        <Button onClick={handleCreateNew} variant='primary'>
                            + Создать компанию
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm mb-6 overflow-hidden'>
                    <div className='p-6 border-b border-slate-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-bold text-gray-700'>Компании</h2>

                            {/* Tab Buttons */}
                            <div className='flex gap-2 bg-gray-100 p-1 rounded-lg'>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        viewMode === 'table'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth={1.5}
                                        stroke='currentColor'
                                        className='w-5 h-5 inline-block mr-1'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5'
                                        />
                                    </svg>
                                    Таблица
                                </button>
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        viewMode === 'cards'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth={1.5}
                                        stroke='currentColor'
                                        className='w-5 h-5 inline-block mr-1'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
                                        />
                                    </svg>
                                    Карточки
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    {viewMode === 'table' && (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b border-slate-200'>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            ID
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Название
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Телефон
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Адрес
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Debt overall
                                        </th>
                                        <th className='text-right p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan='6'
                                                className='p-8 text-center text-slate-500'
                                            >
                                                Загрузка...
                                            </td>
                                        </tr>
                                    ) : !items || items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan='6'
                                                className='p-8 text-center text-slate-500'
                                            >
                                                Нет данных
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className='border-b border-slate-200 hover:bg-gray-50'
                                            >
                                                <td className='p-4'>
                                                    <div className='text-sm font-bold text-gray-700'>
                                                        {item.id}
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <button
                                                        onClick={() => handleDebtClick(item)}
                                                        className='text-sm font-bold text-gray-700 hover:text-blue-600 hover:underline cursor-pointer'
                                                    >
                                                        {item.name}
                                                    </button>
                                                </td>
                                                <td className='p-4'>
                                                    <div className='text-sm text-slate-600'>
                                                        {formatUzPhoneDisplay(item.phone) || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <div className='text-sm text-slate-600'>
                                                        {item.address || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <div className='text-sm font-semibold text-gray-700'>
                                                        {formatNumber(companyDebts[item.id] || 0)}
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <div className='flex gap-2 justify-end'>
                                                        <Button
                                                            onClick={() => handleDebtClick(item)}
                                                            variant='secondary'
                                                            className='btn-sm btn-circle'
                                                            title='Просмотр деталей'
                                                        >
                                                            <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                fill='none'
                                                                viewBox='0 0 24 24'
                                                                strokeWidth={1.5}
                                                                stroke='currentColor'
                                                                className='w-4 h-4'
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
                                                        <Button
                                                            onClick={() => handleEdit(item)}
                                                            variant='secondary'
                                                            className='btn-sm btn-circle'
                                                            title='Редактировать'
                                                        >
                                                            <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                fill='none'
                                                                viewBox='0 0 24 24'
                                                                strokeWidth={1.5}
                                                                stroke='currentColor'
                                                                className='w-4 h-4'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
                                                                />
                                                            </svg>
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDelete(item.id)}
                                                            variant='secondary'
                                                            className='btn-sm btn-circle hover:bg-red-50'
                                                            title='Удалить'
                                                        >
                                                            <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                fill='none'
                                                                viewBox='0 0 24 24'
                                                                strokeWidth={1.5}
                                                                stroke='currentColor'
                                                                className='w-4 h-4 text-red-600'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
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

                    {/* Cards View */}
                    {viewMode === 'cards' && (
                        <div className='p-6'>
                            {loading ? (
                                <div className='text-center text-slate-500 py-12'>Загрузка...</div>
                            ) : items.length === 0 ? (
                                <div className='text-center text-slate-500 py-12'>Нет данных</div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className='bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow'
                                        >
                                            <div className='flex justify-between items-start mb-4'>
                                                <div className='flex-1'>
                                                    <div className='text-xs text-slate-400 font-medium mb-1'>
                                                        ID: {item.id}
                                                    </div>
                                                    <h3 className='text-lg font-bold text-gray-700 mb-2'>
                                                        {item.name}
                                                    </h3>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <Button
                                                        onClick={() => handleEdit(item)}
                                                        variant='secondary'
                                                        className='btn-sm btn-circle'
                                                        title='Редактировать'
                                                    >
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            fill='none'
                                                            viewBox='0 0 24 24'
                                                            strokeWidth={1.5}
                                                            stroke='currentColor'
                                                            className='w-4 h-4'
                                                        >
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
                                                            />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(item.id)}
                                                        variant='secondary'
                                                        className='btn-sm btn-circle hover:bg-red-50'
                                                        title='Удалить'
                                                    >
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            fill='none'
                                                            viewBox='0 0 24 24'
                                                            strokeWidth={1.5}
                                                            stroke='currentColor'
                                                            className='w-4 h-4 text-red-600'
                                                        >
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                                                            />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className='space-y-3'>
                                                <div>
                                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                        Телефон
                                                    </div>
                                                    <div className='text-sm text-gray-700 flex items-center gap-2'>
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            fill='none'
                                                            viewBox='0 0 24 24'
                                                            strokeWidth={1.5}
                                                            stroke='currentColor'
                                                            className='w-4 h-4 text-slate-400'
                                                        >
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                d='M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z'
                                                            />
                                                        </svg>
                                                        {formatUzPhoneDisplay(item.phone) || '-'}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                        Адрес
                                                    </div>
                                                    <div className='text-sm text-gray-700 flex items-center gap-2'>
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            fill='none'
                                                            viewBox='0 0 24 24'
                                                            strokeWidth={1.5}
                                                            stroke='currentColor'
                                                            className='w-4 h-4 text-slate-400'
                                                        >
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'
                                                            />
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'
                                                            />
                                                        </svg>
                                                        {item.address || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {totalItems > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        pageSize={size}
                        totalItems={totalItems}
                        onPageChange={(newPage) => setPage(newPage)}
                        onSizeChange={(newSize) => {
                            setSize(newSize)
                            setPage(1)
                        }}
                        loading={loading}
                    />
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditMode ? 'Редактирование компании' : 'Создание компании'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className='space-y-4'>
                            <Input
                                label='Название'
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder='Введите название'
                                required
                            />

                            <Input
                                label='Телефон'
                                type='tel'
                                name='phone'
                                value={formData.phone}
                                onChange={handleInputChange}
                                maskType='uz-phone'
                                placeholder='+998 (90) 123-45-67'
                            />

                            <Input
                                label='Адрес'
                                type='text'
                                name='address'
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder='Введите адрес'
                            />
                        </div>

                        <div className='flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200'>
                            <Button
                                type='button'
                                variant='secondary'
                                onClick={() => setIsModalOpen(false)}
                                disabled={submitting}
                            >
                                Отмена
                            </Button>
                            <Button type='submit' variant='primary' disabled={submitting}>
                                {submitting ? (
                                    <span className='flex items-center gap-2'>
                                        <span className='loading loading-spinner loading-sm'></span>
                                        {isEditMode ? 'Сохранение...' : 'Создание...'}
                                    </span>
                                ) : isEditMode ? (
                                    'Сохранить'
                                ) : (
                                    'Создать'
                                )}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <ConfirmDialog
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title='Удаление компании'
                    message='Вы уверены, что хотите удалить эту компанию? Это действие нельзя отменить.'
                    confirmText='Удалить'
                    cancelText='Отмена'
                    confirmVariant='primary'
                    isLoading={deleting}
                />

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

                {/* Debt Details Modal */}
                {isDebtModalOpen && (
                    <dialog
                        className={`modal ${isDebtModalOpen ? 'modal-open' : ''}`}
                        data-theme='light'
                    >
                        <div className='modal-box rounded-2xl bg-white p-0 overflow-hidden border-none m-[25px] w-[calc(100%-50px)] h-[calc(100vh-50px)] max-w-none'>
                            {/* Header with Breadcrumb */}
                            <div className='px-6 py-4 border-b border-gray-200'>
                                {/* Breadcrumb */}
                                <nav className='mb-4' aria-label='Breadcrumb'>
                                    <ol className='flex items-center space-x-2 text-sm'>
                                        <li>
                                            <button
                                                onClick={() => setIsDebtModalOpen(false)}
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
                                                Детали - {selectedCompany?.name || ''}
                                            </span>
                                        </li>
                                    </ol>
                                </nav>
                                <h3 className='font-semibold text-lg text-gray-900'>
                                    Детали - {selectedCompany?.name || ''}
                                </h3>
                            </div>
                            <button
                                className='absolute right-4 top-4 w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-50'
                                onClick={() => setIsDebtModalOpen(false)}
                                type='button'
                            >
                                ✕
                            </button>
                            <div className='px-6 py-5 h-[calc(100%-80px)] overflow-auto'>
                                {loadingDebtData ? (
                                    <div className='text-center py-12 text-slate-500'>
                                        Загрузка...
                                    </div>
                                ) : (
                                    <div className='flex gap-6 h-full'>
                                        {/* Left Section - Sales */}
                                        <div className='w-1/2 flex flex-col'>
                                            <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                                                Продажи
                                            </h3>
                                            <div className='relative flex-1 overflow-hidden'>
                                                <div className='overflow-x-auto overflow-y-auto h-full'>
                                                    <table className='w-full'>
                                                        <thead className='sticky top-0 bg-white z-10'>
                                                            <tr className='border-b border-slate-200'>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    ID
                                                                </th>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Товары
                                                                </th>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Сумма
                                                                </th>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Дата
                                                                </th>
                                                                <th className='text-right p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Действия
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {companySales.length === 0 ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan='5'
                                                                        className='p-8 text-center text-slate-500'
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
                                                                        <td className='p-3'>
                                                                            <div className='text-sm font-bold text-gray-700'>
                                                                                {sale.id}
                                                                            </div>
                                                                        </td>
                                                                        <td className='p-3'>
                                                                            <div className='text-sm text-slate-600'>
                                                                                {sale.products &&
                                                                                sale.products
                                                                                    .length > 0
                                                                                    ? sale.products
                                                                                          .map(
                                                                                              (
                                                                                                  p
                                                                                              ) => {
                                                                                                  return `${
                                                                                                      p.name ||
                                                                                                      'Товар'
                                                                                                  } (${
                                                                                                      p.pivot_quantity ||
                                                                                                      p.quantity ||
                                                                                                      0
                                                                                                  })`
                                                                                              }
                                                                                          )
                                                                                          .join(
                                                                                              ', '
                                                                                          )
                                                                                    : '-'}
                                                                            </div>
                                                                        </td>
                                                                        <td className='p-3'>
                                                                            <div className='text-sm text-slate-600 font-semibold'>
                                                                                {formatNumber(
                                                                                    sale.summa || 0
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className='p-3'>
                                                                            <div className='text-sm text-slate-600'>
                                                                                {(() => {
                                                                                    const dateStr =
                                                                                        sale.date ||
                                                                                        sale.created_at
                                                                                    if (!dateStr)
                                                                                        return '-'
                                                                                    try {
                                                                                        const date =
                                                                                            new Date(
                                                                                                dateStr
                                                                                            )
                                                                                        if (
                                                                                            isNaN(
                                                                                                date.getTime()
                                                                                            )
                                                                                        )
                                                                                            return dateStr
                                                                                        const day =
                                                                                            String(
                                                                                                date.getDate()
                                                                                            ).padStart(
                                                                                                2,
                                                                                                '0'
                                                                                            )
                                                                                        const month =
                                                                                            String(
                                                                                                date.getMonth() +
                                                                                                    1
                                                                                            ).padStart(
                                                                                                2,
                                                                                                '0'
                                                                                            )
                                                                                        const year =
                                                                                            date.getFullYear()
                                                                                        return `${day}-${month}-${year}`
                                                                                    } catch {
                                                                                        return dateStr
                                                                                    }
                                                                                })()}
                                                                            </div>
                                                                        </td>
                                                                        <td className='p-3'>
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
                                                                                    className='btn-sm btn-circle'
                                                                                    title='Показать детали'
                                                                                >
                                                                                    <svg
                                                                                        xmlns='http://www.w3.org/2000/svg'
                                                                                        fill='none'
                                                                                        viewBox='0 0 24 24'
                                                                                        strokeWidth={
                                                                                            1.5
                                                                                        }
                                                                                        stroke='currentColor'
                                                                                        className='w-4 h-4'
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
                                            </div>
                                        </div>

                                        {/* Right Section - Payments */}
                                        <div className='w-1/2 flex flex-col'>
                                            <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                                                Оплаченные платежи
                                            </h3>
                                            <div className='relative flex-1 overflow-hidden'>
                                                <div className='overflow-x-auto overflow-y-auto h-full'>
                                                    <table className='w-full'>
                                                        <thead className='sticky top-0 bg-white z-10'>
                                                            <tr className='border-b border-slate-200'>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    ID
                                                                </th>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Название
                                                                </th>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Тип платежа
                                                                </th>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Сумма
                                                                </th>
                                                                <th className='text-left p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Дата
                                                                </th>
                                                                <th className='text-right p-3 text-slate-400 text-[10px] font-bold uppercase'>
                                                                    Действия
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {companyPayments.length === 0 ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan='6'
                                                                        className='p-8 text-center text-slate-500'
                                                                    >
                                                                        Нет данных
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                companyPayments.map((payment) => {
                                                                    const paymentType =
                                                                        payment.payment_type_id ===
                                                                        1
                                                                            ? '$'
                                                                            : payment.payment_type_id ===
                                                                              2
                                                                            ? '$'
                                                                            : '-'
                                                                    // Get amount from companies pivot
                                                                    const companyPayment =
                                                                        payment.companies?.find(
                                                                            (c) =>
                                                                                c.id ===
                                                                                selectedCompany?.id
                                                                        )
                                                                    const amount =
                                                                        companyPayment?.pivot
                                                                            ?.amount || 0

                                                                    return (
                                                                        <tr
                                                                            key={payment.id}
                                                                            className='border-b border-slate-200 hover:bg-gray-50'
                                                                        >
                                                                            <td className='p-3'>
                                                                                <div className='text-sm font-bold text-gray-700'>
                                                                                    {payment.id}
                                                                                </div>
                                                                            </td>
                                                                            <td className='p-3'>
                                                                                <div className='text-sm font-bold text-gray-700'>
                                                                                    {payment.name ||
                                                                                        '-'}
                                                                                </div>
                                                                            </td>
                                                                            <td className='p-3'>
                                                                                <div className='text-sm text-slate-600'>
                                                                                    {paymentType}
                                                                                </div>
                                                                            </td>
                                                                            <td className='p-3'>
                                                                                <div className='text-sm text-slate-600 font-semibold'>
                                                                                    {formatNumber(
                                                                                        amount
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className='p-3'>
                                                                                <div className='text-sm text-slate-600'>
                                                                                    {(() => {
                                                                                        const dateStr =
                                                                                            payment.date ||
                                                                                            payment.created_at
                                                                                        if (
                                                                                            !dateStr
                                                                                        )
                                                                                            return '-'
                                                                                        try {
                                                                                            const date =
                                                                                                new Date(
                                                                                                    dateStr
                                                                                                )
                                                                                            if (
                                                                                                isNaN(
                                                                                                    date.getTime()
                                                                                                )
                                                                                            )
                                                                                                return dateStr
                                                                                            const day =
                                                                                                String(
                                                                                                    date.getDate()
                                                                                                ).padStart(
                                                                                                    2,
                                                                                                    '0'
                                                                                                )
                                                                                            const month =
                                                                                                String(
                                                                                                    date.getMonth() +
                                                                                                        1
                                                                                                ).padStart(
                                                                                                    2,
                                                                                                    '0'
                                                                                                )
                                                                                            const year =
                                                                                                date.getFullYear()
                                                                                            return `${day}-${month}-${year}`
                                                                                        } catch {
                                                                                            return dateStr
                                                                                        }
                                                                                    })()}
                                                                                </div>
                                                                            </td>
                                                                            <td className='p-3'>
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
                                                                                        className='btn-sm btn-circle'
                                                                                        title='Показать детали'
                                                                                    >
                                                                                        <svg
                                                                                            xmlns='http://www.w3.org/2000/svg'
                                                                                            fill='none'
                                                                                            viewBox='0 0 24 24'
                                                                                            strokeWidth={
                                                                                                1.5
                                                                                            }
                                                                                            stroke='currentColor'
                                                                                            className='w-4 h-4'
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
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <form method='dialog' className='modal-backdrop'>
                            <button onClick={() => setIsDebtModalOpen(false)}>close</button>
                        </form>
                    </dialog>
                )}

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
                                <div>
                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                        Дата создания
                                    </div>
                                    <div className='text-sm text-gray-700'>
                                        {(() => {
                                            const dateStr =
                                                selectedDetail.created_at || selectedDetail.date
                                            if (!dateStr) return '-'
                                            try {
                                                const date = new Date(dateStr)
                                                if (isNaN(date.getTime())) return dateStr
                                                const day = String(date.getDate()).padStart(2, '0')
                                                const month = String(date.getMonth() + 1).padStart(
                                                    2,
                                                    '0'
                                                )
                                                const year = date.getFullYear()
                                                return `${day}-${month}-${year}`
                                            } catch {
                                                return dateStr
                                            }
                                        })()}
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
            </div>
        </Layout>
    )
}

export default Companies
