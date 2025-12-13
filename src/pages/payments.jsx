import React, { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import Input from '../components/UI/Input'
import Modal from '../components/UI/Modal'
import Pagination from '../components/UI/Pagination'
import Select from '../components/UI/Select'
import SuccessModal from '../components/UI/SuccessModal'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Payments = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        payment_type_id: '',
        sales: [],
    })
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewingItem, setViewingItem] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [companiesList, setCompaniesList] = useState([])
    const [paymentTypes] = useState([
        { value: 1, label: 'Сум' },
        { value: 2, label: 'Доллары' },
    ])
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768 ? 'table' : 'cards'
        }
        return 'table'
    })
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [showComingSoon, setShowComingSoon] = useState(true)

    const fetchPayments = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const paymentsResponse = await api(
            'get',
            { page: currentPage, size: pageSize },
            '/payments/list'
        )
        if (paymentsResponse?.data) {
            setItems(paymentsResponse.data.data || [])
            // Handle pagination metadata
            if (paymentsResponse.data.total !== undefined) {
                setTotalItems(paymentsResponse.data.total)
                setTotalPages(Math.ceil(paymentsResponse.data.total / pageSize))
            } else if (paymentsResponse.data.meta) {
                setTotalItems(paymentsResponse.data.meta.total || 0)
                setTotalPages(paymentsResponse.data.meta.last_page || 1)
            } else {
                const items = paymentsResponse.data.data || []
                setTotalItems(items.length)
                setTotalPages(1)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            // Fetch payments list with pagination
            await fetchPayments(page, size)

            // Fetch companies list (no pagination needed for dropdown)
            const companiesResponse = await api('get', {}, '/companies/list')
            if (companiesResponse?.data) {
                const companiesData = companiesResponse.data.data || []
                setCompaniesList(companiesData)
            }

            setLoading(false)
        }
        fetchData()
    }, [page, size])

    const formatNumber = (num) => {
        if (num === null || num === undefined || num === '' || isNaN(num)) return ''
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSaleChange = (index, field, value) => {
        const newSales = [...formData.sales]
        newSales[index][field] = value
        setFormData((prev) => ({
            ...prev,
            sales: newSales,
        }))
    }

    const addSale = () => {
        setFormData((prev) => ({
            ...prev,
            sales: [...prev.sales, { company_id: '', amount: '' }],
        }))
    }

    const removeSale = (index) => {
        const newSales = formData.sales.filter((_, i) => i !== index)
        setFormData((prev) => ({
            ...prev,
            sales: newSales,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        // Prepare data
        const submitData = {
            name: formData.name,
            payment_type_id: parseInt(formData.payment_type_id),
            sales: formData.sales.map((s) => ({
                company_id: parseInt(s.company_id),
                amount: parseFloat(s.amount),
            })),
        }

        let response
        if (isEditMode) {
            response = await api('put', submitData, `/payments/update/${editingItemId}`)
        } else {
            response = await api('post', submitData, '/payments/create')
        }

        if (response?.data) {
            await fetchPayments(page, size)

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingItemId(null)
            setFormData({
                name: '',
                payment_type_id: '',
                sales: [],
            })

            setSuccessMessage(isEditMode ? 'Платеж успешно обновлен' : 'Платеж успешно создан')
            setIsSuccessOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (item) => {
        setIsEditMode(true)
        setEditingItemId(item.id)

        setFormData({
            name: item.name || '',
            payment_type_id: item.payment_type_id || '',
            sales: item.sales || [],
        })
        setIsModalOpen(true)
    }

    const handleView = (item) => {
        setViewingItem(item)
        setIsViewModalOpen(true)
    }

    const handleDelete = (itemId) => {
        setDeletingItemId(itemId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        const response = await api('delete', {}, `/payments/delete/${deletingItemId}`)

        if (response?.data) {
            await fetchPayments(page, size)

            setSuccessMessage('Платеж успешно удален')
            setIsSuccessOpen(true)
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
            payment_type_id: '',
            sales: [],
        })
        setIsModalOpen(true)
    }

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6'>
                <div className='mb-4 sm:mb-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6'>
                        <div>
                            <div className='text-lg sm:text-xl md:text-2xl text-slate-400'>
                                NEWCON <span className='text-gray-700'>/ Платежи</span>
                            </div>
                        </div>
                        {!showComingSoon && (
                            <Button
                                onClick={handleCreateNew}
                                variant='primary'
                                className='w-full sm:w-auto text-sm px-3 py-2 min-h-[40px] md:text-sm md:px-3 md:py-2 md:min-h-[40px]'
                            >
                                + Создать платеж
                            </Button>
                        )}
                    </div>
                </div>

                {showComingSoon ? (
                    <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4 sm:mb-4 sm:mb-6 overflow-hidden'>
                        <div className='p-12 text-center'>
                            <div className='text-2xl font-bold text-gray-700 mb-2'>Скоро...</div>
                            <div className='text-sm text-slate-500'>
                                Эта страница находится в разработке
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4 sm:mb-4 sm:mb-6'>
                        <div className='p-3 sm:p-4 md:p-6 border-b border-slate-200'>
                            <div className='flex items-center justify-between mb-3 sm:mb-4'>
                                <h2 className='text-base sm:text-lg font-bold text-gray-700'>
                                    Платежи
                                </h2>
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

                        {viewMode === 'table' && (
                            <div className='overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6'>
                                <table className='w-full min-w-[600px]'>
                                    <thead>
                                        <tr className='border-b border-slate-200'>
                                            <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                                ID
                                            </th>
                                            <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                                Название
                                            </th>
                                            <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                                Валюта
                                            </th>
                                            <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                                Продажи
                                            </th>
                                            <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan='5'
                                                    className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                                >
                                                    Загрузка...
                                                </td>
                                            </tr>
                                        ) : !items || items.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan='5'
                                                    className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                                >
                                                    Нет данных
                                                </td>
                                            </tr>
                                        ) : (
                                            items.map((item) => {
                                                const paymentType = paymentTypes.find(
                                                    (t) => t.value === item.payment_type_id
                                                )
                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className='border-b border-slate-200 hover:bg-gray-50'
                                                    >
                                                        <td className='p-2 sm:p-3 md:p-4'>
                                                            <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                                {item.id}
                                                            </div>
                                                        </td>
                                                        <td className='p-2 sm:p-3 md:p-4'>
                                                            <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                                {item.name || '-'}
                                                            </div>
                                                        </td>
                                                        <td className='p-2 sm:p-3 md:p-4'>
                                                            <div className='text-xs sm:text-sm text-slate-600'>
                                                                {paymentType?.label || '-'}
                                                            </div>
                                                        </td>
                                                        <td className='p-2 sm:p-3 md:p-4'>
                                                            <div className='text-xs sm:text-sm text-slate-600'>
                                                                {item.sales && item.sales.length > 0
                                                                    ? item.sales
                                                                          .map(
                                                                              (s) =>
                                                                                  `#${
                                                                                      s.id ||
                                                                                      s.sale_id
                                                                                  } (${formatNumber(
                                                                                      s.summa ||
                                                                                          s.amount
                                                                                  )})`
                                                                          )
                                                                          .join(', ')
                                                                    : '-'}
                                                            </div>
                                                        </td>
                                                        <td className='p-2 sm:p-3 md:p-4'>
                                                            <div className='flex items-center gap-2'>
                                                                <button
                                                                    onClick={() => handleView(item)}
                                                                    className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                                                    title='Просмотр'
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
                                                                </button>
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
                            <div className='p-6'>
                                {loading ? (
                                    <div className='text-center text-slate-500 py-12'>
                                        Загрузка...
                                    </div>
                                ) : items.length === 0 ? (
                                    <div className='text-center text-slate-500 py-12'>
                                        Нет данных
                                    </div>
                                ) : (
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {items.map((item) => {
                                            const paymentType = paymentTypes.find(
                                                (t) => t.value === item.payment_type_id
                                            )
                                            return (
                                                <div
                                                    key={item.id}
                                                    className='bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow'
                                                >
                                                    <div className='flex justify-between items-start mb-3'>
                                                        <div>
                                                            <div className='text-xs text-slate-400 font-medium mb-1'>
                                                                ID: {item.id}
                                                            </div>
                                                            <h3 className='text-base sm:text-lg font-bold text-gray-700'>
                                                                {item.name || '-'}
                                                            </h3>
                                                            <div className='text-xs sm:text-sm text-slate-600 mt-1'>
                                                                {paymentType?.label || '-'}
                                                            </div>
                                                        </div>
                                                        <div className='flex gap-2'>
                                                            <button
                                                                onClick={() => handleView(item)}
                                                                className='btn btn-ghost btn-sm'
                                                                title='Просмотр'
                                                            >
                                                                <svg
                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                    fill='none'
                                                                    viewBox='0 0 24 24'
                                                                    strokeWidth={2}
                                                                    stroke='currentColor'
                                                                    className='w-5 h-5 text-blue-600'
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
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className='text-xs sm:text-sm text-slate-600'>
                                                        {item.sales && item.sales.length > 0 ? (
                                                            item.sales.map((s, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className='flex justify-between py-1 border-b last:border-b-0 border-gray-100'
                                                                >
                                                                    <span className='text-gray-700'>
                                                                        #{s.id || s.sale_id}
                                                                    </span>
                                                                    <span className='font-medium'>
                                                                        {formatNumber(
                                                                            s.summa || s.amount
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span>-</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {!showComingSoon && totalItems > 0 && (
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

                {!showComingSoon && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false)
                        }}
                        title={isEditMode ? 'Редактирование платежа' : 'Создание платежа'}
                        maxWidth='max-w-4xl'
                    >
                        <form onSubmit={handleSubmit}>
                            <div className='space-y-4'>
                                <div>
                                    <div className='flex items-center justify-between mb-2'>
                                        <label className='block text-sm font-medium text-gray-700'>
                                            Продажи
                                        </label>
                                        <Button
                                            type='button'
                                            variant='secondary'
                                            onClick={addSale}
                                            className='text-xs'
                                        >
                                            + Добавить продажу
                                        </Button>
                                    </div>

                                    {formData.sales.length === 0 ? (
                                        <div className='text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg'>
                                            Нет продаж. Нажмите "Добавить продажу" чтобы добавить.
                                        </div>
                                    ) : (
                                        <div className='max-h-60 overflow-y-auto'>
                                            <div className='space-y-3'>
                                                {formData.sales.map((sale, index) => (
                                                    <div
                                                        key={index}
                                                        className='flex gap-2 items-end p-3 bg-gray-50 rounded-lg'
                                                    >
                                                        <div className='flex-1'>
                                                            <Select
                                                                label='Компания'
                                                                required
                                                                options={(companiesList || []).map(
                                                                    (c) => ({
                                                                        value: c.id,
                                                                        label: c.name || 'Компания',
                                                                    })
                                                                )}
                                                                value={sale.company_id}
                                                                onChange={(value) =>
                                                                    handleSaleChange(
                                                                        index,
                                                                        'company_id',
                                                                        value
                                                                    )
                                                                }
                                                                placeholder='Выберите компанию'
                                                                searchable={true}
                                                            />
                                                        </div>
                                                        <div className='flex-1'>
                                                            <Input
                                                                label='Сумма'
                                                                type='text'
                                                                required
                                                                value={
                                                                    sale.amount !== '' &&
                                                                    sale.amount !== undefined &&
                                                                    sale.amount !== null
                                                                        ? formatNumber(sale.amount)
                                                                        : ''
                                                                }
                                                                onChange={(e) => {
                                                                    const numericValue =
                                                                        e.target.value.replace(
                                                                            /\s/g,
                                                                            ''
                                                                        )
                                                                    if (
                                                                        numericValue === '' ||
                                                                        /^\d*\.?\d*$/.test(
                                                                            numericValue
                                                                        )
                                                                    ) {
                                                                        handleSaleChange(
                                                                            index,
                                                                            'amount',
                                                                            numericValue
                                                                        )
                                                                    }
                                                                }}
                                                                placeholder='Введите сумму'
                                                            />
                                                        </div>
                                                        <button
                                                            type='button'
                                                            onClick={() => removeSale(index)}
                                                            className='mb-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                                            title='Удалить'
                                                        >
                                                            <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                width='24'
                                                                height='24'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                className='w-5 h-5 text-red-600'
                                                            >
                                                                <path
                                                                    d='M7.99999 6L8.54414 4.36754C8.81637 3.55086 9.58064 3 10.4415 3H13.5585C14.4193 3 15.1836 3.55086 15.4558 4.36754L16 6M7.99999 6H5.61802C4.87464 6 4.39114 6.78231 4.72359 7.44721L5.21262 8.42527C5.40205 8.80413 5.5091 9.2188 5.52674 9.64201L5.88019 18.1249C5.94714 19.7318 7.26931 21 8.87759 21H15.1224C16.7307 21 18.0528 19.7318 18.1198 18.1249L18.4732 9.64202C18.4909 9.21881 18.5979 8.80413 18.7874 8.42527L19.2764 7.44721C19.6088 6.78231 19.1253 6 18.382 6H16M7.99999 6H16M14.4399 16.5L14.6899 10.5M9.56004 16.5L9.31004 10.5'
                                                                    stroke='currentColor'
                                                                    strokeWidth='1.5'
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Input
                                    label='Название (Чтобы легко найти платеж)'
                                    type='text'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder='Введите название платежа'
                                    required
                                />

                                <Select
                                    label='Валюта'
                                    required
                                    options={paymentTypes}
                                    value={formData.payment_type_id}
                                    onChange={(value) =>
                                        setFormData((prev) => ({ ...prev, payment_type_id: value }))
                                    }
                                    placeholder='Выберите валюту'
                                    searchable={false}
                                />
                            </div>

                            <div className='flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200'>
                                <Button
                                    type='button'
                                    variant='secondary'
                                    onClick={() => {
                                        setIsModalOpen(false)
                                    }}
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
                )}

                {!showComingSoon && (
                    <Modal
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                        title='Просмотр платежа'
                        maxWidth='max-w-4xl'
                    >
                        {viewingItem && (
                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4 pb-4 border-b border-gray-200'>
                                    <div>
                                        <div className='text-xs text-gray-500 mb-1'>ID</div>
                                        <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                            {viewingItem.id}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='text-xs text-gray-500 mb-1'>Название</div>
                                        <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                            {viewingItem.name || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='text-xs text-gray-500 mb-1'>Валюта</div>
                                        <div className='text-sm text-gray-700'>
                                            {paymentTypes.find(
                                                (t) => t.value === viewingItem.payment_type_id
                                            )?.label || '-'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className='text-xs sm:text-sm font-bold text-gray-700 mb-3'>
                                        Продажи
                                    </h3>
                                    {viewingItem.sales && viewingItem.sales.length > 0 ? (
                                        <div className='space-y-4'>
                                            {viewingItem.sales.map((sale, index) => (
                                                <div
                                                    key={index}
                                                    className='bg-gray-50 rounded-lg p-4 space-y-3'
                                                >
                                                    <div className='flex justify-between items-start'>
                                                        <div>
                                                            <div className='text-xs text-gray-500 mb-1'>
                                                                ID продажи
                                                            </div>
                                                            <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                                #{sale.id}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className='text-xs text-gray-500 mb-1'>
                                                                Сумма
                                                            </div>
                                                            <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                                {formatNumber(sale.summa || 0)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className='text-xs text-gray-500 mb-1'>
                                                                Дата
                                                            </div>
                                                            <div className='text-sm text-gray-700'>
                                                                {(() => {
                                                                    const dateStr = sale.created_at
                                                                    if (!dateStr) return '-'
                                                                    try {
                                                                        const date = new Date(
                                                                            dateStr
                                                                        )
                                                                        if (isNaN(date.getTime()))
                                                                            return dateStr
                                                                        const day = String(
                                                                            date.getDate()
                                                                        ).padStart(2, '0')
                                                                        const month = String(
                                                                            date.getMonth() + 1
                                                                        ).padStart(2, '0')
                                                                        const year =
                                                                            date.getFullYear()
                                                                        return `${day}-${month}-${year}`
                                                                    } catch {
                                                                        return dateStr
                                                                    }
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {sale.company && (
                                                        <div className='pt-3 border-t border-gray-200'>
                                                            <div className='text-xs font-bold text-gray-600 mb-2'>
                                                                Компания
                                                            </div>
                                                            <div className='flex flex-col gap-3'>
                                                                <div>
                                                                    <div className='text-xs text-gray-500'>
                                                                        Название
                                                                    </div>
                                                                    <div className='text-sm text-gray-700'>
                                                                        {sale.company.name || '-'}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className='text-xs text-gray-500'>
                                                                        Телефон
                                                                    </div>
                                                                    <div className='text-sm text-gray-700'>
                                                                        {sale.company.phone || '-'}
                                                                    </div>
                                                                </div>
                                                                <div className='col-span-2'>
                                                                    <div className='text-xs text-gray-500'>
                                                                        Адрес
                                                                    </div>
                                                                    <div className='text-sm text-gray-700'>
                                                                        {sale.company.address ||
                                                                            '-'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {sale.products && sale.products.length > 0 && (
                                                        <div className='pt-3 border-t border-gray-200'>
                                                            <div className='text-xs font-bold text-gray-600 mb-2'>
                                                                Продукты
                                                            </div>
                                                            <div className='space-y-2'>
                                                                {sale.products.map(
                                                                    (product, pIndex) => (
                                                                        <div
                                                                            key={pIndex}
                                                                            className='bg-white rounded p-3 flex justify-between items-start'
                                                                        >
                                                                            <div className='flex-1'>
                                                                                <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                                                    {product.name ||
                                                                                        '-'}
                                                                                </div>
                                                                                <div className='text-xs text-gray-500 mt-1'>
                                                                                    {product.description ||
                                                                                        '-'}
                                                                                </div>
                                                                            </div>
                                                                            <div className='text-sm text-gray-700 ml-4'>
                                                                                Кол-во:{' '}
                                                                                {product.quantity ||
                                                                                    0}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='text-sm text-gray-500 text-center py-4'>
                                            Нет продаж
                                        </div>
                                    )}
                                </div>

                                <div className='flex justify-end pt-4 border-t border-gray-200'>
                                    <Button
                                        type='button'
                                        variant='secondary'
                                        onClick={() => setIsViewModalOpen(false)}
                                    >
                                        Закрыть
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Modal>
                )}

                {!showComingSoon && (
                    <ConfirmDialog
                        isOpen={isConfirmOpen}
                        onClose={() => setIsConfirmOpen(false)}
                        onConfirm={confirmDelete}
                        title='Удаление платежа'
                        message='Вы уверены, что хотите удалить этот платеж? Это действие нельзя отменить.'
                        confirmText='Удалить'
                        cancelText='Отмена'
                        confirmVariant='primary'
                        isLoading={deleting}
                    />
                )}

                <SuccessModal
                    isOpen={isSuccessOpen}
                    onClose={() => setIsSuccessOpen(false)}
                    title='Успешно'
                    message={successMessage}
                />
            </div>
        </Layout>
    )
}

export default Payments
