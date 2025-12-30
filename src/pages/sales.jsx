import React, { useEffect, useMemo, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import Modal from '../components/UI/Modal'
import Pagination from '../components/UI/Pagination'
import Select from '../components/UI/Select'
import StatusSelect from '../components/UI/StatusSelect'
import SuccessModal from '../components/UI/SuccessModal'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Sales = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [formData, setFormData] = useState({
        company_id: '',
        summa: '',
        products: [],
        status: 'PENDING_PAYMENT',
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [companies, setCompanies] = useState([])
    const [statusChangingItemId, setStatusChangingItemId] = useState(null)
    const [changingStatus, setChangingStatus] = useState(false)
    const [statusSuccessItemId, setStatusSuccessItemId] = useState(null)
    const [products, setProducts] = useState([])
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewingItem, setViewingItem] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [paymentData, setPaymentData] = useState({
        payment_type_id: '',
    })
    const [paymentTypes] = useState([
        { id: 1, name: 'Сум' },
        { id: 2, name: 'Доллары' },
    ])
    const statusOptions = [
        { value: 'PENDING_PAYMENT', label: 'Ожидает оплаты' },
        { value: 'PAID', label: 'Оплачено' },
    ]
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768 ? 'table' : 'cards'
        }
        return 'table'
    })
    const [currentStep, setCurrentStep] = useState(1)
    const [createdSaleId, setCreatedSaleId] = useState(null)
    const [saleIdToViewAfterCreate, setSaleIdToViewAfterCreate] = useState(null)
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const productsPayload = useMemo(() => {
        return (formData.products || [])
            .filter((p) => p.product_id && p.quantity && p.price)
            .map((p) => {
                const productId = Number(p.product_id)
                const quantity = Number(p.quantity)
                const price = parseFloat(p.price) || 0

                return {
                    product_id: productId,
                    quantity: quantity || 0,
                    price: price,
                }
            })
    }, [formData.products])

    // Automatically calculate summa from products (quantity * price for each product)
    const saleTotalAmount = useMemo(() => {
        if (!productsPayload.length) return 0
        return productsPayload.reduce((total, product) => {
            const quantity = Number(product.quantity) || 0
            const price = Number(product.price) || 0
            return total + quantity * price
        }, 0)
    }, [productsPayload])

    const fetchSales = async (currentPage = page, pageSize = size) => {
        setLoading(true)

        // Fetch sales list with pagination
        const salesResponse = await api(
            'get',
            { index: currentPage, size: pageSize },
            '/sales/list'
        )
        if (salesResponse?.data) {
            setItems(salesResponse.data.data || [])
            // Handle pagination metadata
            if (salesResponse.data.total !== undefined) {
                setTotalItems(salesResponse.data.total)
                setTotalPages(Math.ceil(salesResponse.data.total / pageSize))
            } else if (salesResponse.data.meta) {
                setTotalItems(salesResponse.data.meta.total || 0)
                setTotalPages(salesResponse.data.meta.last_page || 1)
            } else {
                const items = salesResponse.data.data || []
                setTotalItems(items.length)
                setTotalPages(1)
            }
        }

        setLoading(false)
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            // Fetch sales list with pagination
            await fetchSales(page, size)

            // Fetch companies (no pagination needed for dropdown)
            const companiesResponse = await api('get', {}, '/companies/list')
            if (companiesResponse?.data) {
                setCompanies(companiesResponse.data.data || [])
            }

            // Fetch products (no pagination needed for dropdown)
            const productsResponse = await api('get', {}, '/products/list')
            if (productsResponse?.data) {
                setProducts(productsResponse.data.data || [])
            }

            setLoading(false)
        }
        fetchData()
    }, [page, size])

    // Auto-open view modal after creating a sale
    useEffect(() => {
        if (saleIdToViewAfterCreate && items.length > 0 && !loading) {
            const saleToView = items.find((item) => item.id === saleIdToViewAfterCreate)
            if (saleToView) {
                setViewingItem(saleToView)
                setIsViewModalOpen(true)
                setSaleIdToViewAfterCreate(null) // Reset after opening
            } else if (page !== 1) {
                // If sale not found and not on first page, switch to first page
                // The sale will be found after the page loads
                setPage(1)
            } else {
                // If on first page and sale not found, reset the flag
                // (sale might be on a different page or there was an error)
                setSaleIdToViewAfterCreate(null)
            }
        }
    }, [items, saleIdToViewAfterCreate, loading, page])

    const formatNumber = (num) => {
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
        return formatNumber(cleaned)
    }

    const parseFormattedNumber = (str) => {
        // Убираем только пробелы, сохраняя точку
        return str.replace(/\s/g, '')
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleProductChange = (index, field, value) => {
        const newProducts = [...formData.products]
        // Remove spaces for numeric fields (price) before storing
        if (field === 'price') {
            const numericValue = parseFormattedNumber(value)
            // Allow numbers with optional decimal point and decimal digits
            // Also allow empty string for clearing the field
            // Allow numbers ending with dot (e.g., "123.")
            if (numericValue === '' || /^\d+\.?$|^\d+\.\d+$/.test(numericValue)) {
                newProducts[index][field] = numericValue
            } else {
                return // Don't update if invalid
            }
        } else {
            newProducts[index][field] = value
        }
        setFormData((prev) => ({
            ...prev,
            products: newProducts,
        }))
    }

    const removeProduct = (index) => {
        const newProducts = formData.products.filter((_, i) => i !== index)
        setFormData((prev) => ({
            ...prev,
            products: newProducts,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            if (isEditMode) {
                // In edit mode, only update the company
                const saleData = {
                    company_id: parseInt(formData.company_id),
                }

                const saleResponse = await api('put', saleData, `/sales/update/${editingItemId}`)

                if (saleResponse?.data) {
                    // Refresh sales list
                    await fetchSales(page, size)

                    setIsModalOpen(false)
                    setIsEditMode(false)
                    setEditingItemId(null)
                    setSearchQuery('')
                    setCurrentStep(1)
                    setCreatedSaleId(null)
                    setFormData({
                        company_id: '',
                        summa: '',
                        products: [],
                        status: 'PENDING_PAYMENT',
                    })
                    setPaymentData({
                        payment_type_id: '',
                    })

                    setSuccessMessage('Продажа успешно обновлена')
                    setIsSuccessOpen(true)
                }
            } else {
                // In create mode: create sale and payment automatically
                const saleData = {
                    company_id: parseInt(formData.company_id),
                    summa: saleTotalAmount,
                    products: productsPayload,
                    status: formData.status || 'PENDING_PAYMENT',
                }

                const saleResponse = await api('post', saleData, '/sales/create')

                if (saleResponse?.data) {
                    const newSaleId = saleResponse.data.data?.id || saleResponse.data.id

                    // Automatically create payment with payment_type_id "$" (dollars, id: 2)
                    const company = companies.find((c) => c.id === formData.company_id)
                    const companyName = company?.name || 'Компания'
                    const currentDate = new Date().toLocaleDateString('ru-RU')
                    const productsNames = formData.products
                        .map((p) => {
                            const product = products.find((prod) => prod.id === p.product_id)
                            return product?.name || 'Товар'
                        })
                        .join(', ')
                    const generatedName = `${companyName}, ${currentDate}, ${productsNames}`

                    const paymentSubmitData = {
                        name: generatedName,
                        payment_type_id: 2, // "$" (dollars)
                        amount: saleTotalAmount,
                    }

                    const paymentResponse = await api('post', paymentSubmitData, '/payments/create')

                    if (paymentResponse?.data) {
                        // Save the created sale ID before resetting
                        const saleIdToView = newSaleId

                        // Refresh sales list
                        await fetchSales(page, size)

                        setIsModalOpen(false)
                        setIsEditMode(false)
                        setEditingItemId(null)
                        setSearchQuery('')
                        setCurrentStep(1)
                        setCreatedSaleId(null)
                        setFormData({
                            company_id: '',
                            summa: '',
                            products: [],
                            status: 'PENDING_PAYMENT',
                        })
                        setPaymentData({
                            payment_type_id: '',
                        })

                        setSuccessMessage('Продажа и платеж успешно созданы')
                        setIsSuccessOpen(true)

                        // Set flag to open view modal after items are updated
                        if (saleIdToView) {
                            setSaleIdToViewAfterCreate(saleIdToView)
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error submitting sale:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleView = (item) => {
        setViewingItem(item)
        setIsViewModalOpen(true)
    }

    const handleEdit = (item) => {
        setIsEditMode(true)
        setEditingItemId(item.id)

        // Convert nested company object to company_id
        const companyId = item.company?.id || item.company_id || ''

        setFormData({
            company_id: companyId,
            summa: item.summa || '',
            products: [],
            status: item.status || 'PENDING_PAYMENT',
        })

        setSearchQuery('')
        setIsModalOpen(true)
    }

    const handleStatusChange = async (itemId, newStatus) => {
        setStatusChangingItemId(itemId)
        setChangingStatus(true)
        setStatusSuccessItemId(null)

        try {
            const response = await api('put', { status: newStatus }, `/sales/update/${itemId}`)

            if (response?.data) {
                setStatusSuccessItemId(itemId)
                await fetchSales(page, size)
                setTimeout(() => {
                    setStatusSuccessItemId(null)
                }, 2000)
            }
        } catch (error) {
            console.error('Error changing status:', error)
        } finally {
            setChangingStatus(false)
            setStatusChangingItemId(null)
        }
    }

    const handleDelete = (itemId) => {
        setDeletingItemId(itemId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        const response = await api('delete', {}, `/sales/delete/${deletingItemId}`)

        if (response?.data) {
            await fetchSales(page, size)

            setSuccessMessage('Продажа успешно удалена')
            setIsSuccessOpen(true)
        }

        setDeleting(false)
        setIsConfirmOpen(false)
        setDeletingItemId(null)
    }

    const handleCreateNew = () => {
        setIsEditMode(false)
        setEditingItemId(null)
        setCurrentStep(1)
        setCreatedSaleId(null)
        setFormData({
            company_id: '',
            summa: '',
            products: [],
            status: 'PENDING_PAYMENT',
        })
        setPaymentData({
            payment_type_id: '',
        })
        setSearchQuery('')
        setIsModalOpen(true)
    }

    const canSubmit = () => {
        const hasValidProducts =
            formData.company_id &&
            formData.products.length > 0 &&
            formData.products.every((p) => p.product_id && p.quantity && p.price)

        // In edit mode, only company is required
        if (isEditMode) {
            return formData.company_id
        }

        // In create mode: only sale data required (payment is created automatically)
        return hasValidProducts
    }

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target
        setPaymentData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6'>
                <div className='mb-4 sm:mb-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6'>
                        <div>
                            <div className='text-lg sm:text-xl md:text-2xl text-slate-400'>
                                NEWCON <span className='text-gray-700'>/ Продажи</span>
                            </div>
                        </div>
                        <Button
                            onClick={handleCreateNew}
                            variant='primary'
                            className='w-full sm:w-auto text-sm px-3 py-2 min-h-[40px] md:text-sm md:px-3 md:py-2 md:min-h-[40px]'
                        >
                            + Создать продажу
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4 sm:mb-4 sm:mb-6 overflow-hidden'>
                    <div className='p-3 sm:p-4 md:p-6 border-b border-slate-200'>
                        <div className='flex items-center justify-between mb-3 sm:mb-4'>
                            <h2 className='text-base sm:text-lg font-bold text-gray-700'>
                                Продажи
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
                            <table className='w-full min-w-[800px]'>
                                <thead>
                                    <tr className='border-b border-slate-200'>
                                        <th className='text-left p-1.5 sm:p-2 md:p-3 lg:p-4 text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap'>
                                            ID
                                        </th>
                                        <th className='text-left p-1.5 sm:p-2 md:p-3 lg:p-4 text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap'>
                                            Компания
                                        </th>
                                        <th className='text-left p-1.5 sm:p-2 md:p-3 lg:p-4 text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap'>
                                            Товары
                                        </th>
                                        <th className='text-left p-1.5 sm:p-2 md:p-3 lg:p-4 text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap'>
                                            Кол-во
                                        </th>
                                        <th className='text-left p-1.5 sm:p-2 md:p-3 lg:p-4 text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap'>
                                            Сумма
                                        </th>
                                        <th className='text-left p-1.5 sm:p-2 md:p-3 lg:p-4 text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap'>
                                            Дата
                                        </th>
                                        <th className='text-left p-1.5 sm:p-2 md:p-3 lg:p-4 text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap'>
                                            Статус
                                        </th>
                                        <th className='text-left p-1.5 sm:p-2 md:p-3 lg:p-4 text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap'>
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan='8'
                                                className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                            >
                                                Загрузка...
                                            </td>
                                        </tr>
                                    ) : !items || items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan='8'
                                                className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                            >
                                                Нет данных
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item) => {
                                            // Use nested company object or fallback to company_id lookup
                                            const company =
                                                item.company ||
                                                companies.find((c) => c.id === item.company_id)
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className='border-b border-slate-200 hover:bg-gray-50'
                                                >
                                                    <td className='p-1.5 sm:p-2 md:p-3 lg:p-4'>
                                                        <div className='text-[10px] sm:text-xs md:text-sm font-bold text-gray-700'>
                                                            {item.id}
                                                        </div>
                                                    </td>
                                                    <td className='p-1.5 sm:p-2 md:p-3 lg:p-4'>
                                                        <div className='text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 truncate max-w-[120px] sm:max-w-none'>
                                                            {company?.name || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-1.5 sm:p-2 md:p-3 lg:p-4'>
                                                        <div className='text-[10px] sm:text-xs md:text-sm text-slate-600 line-clamp-2'>
                                                            {item.products &&
                                                            item.products.length > 0
                                                                ? item.products
                                                                      .map((p) => p.name || 'Товар')
                                                                      .join(', ')
                                                                : '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-1.5 sm:p-2 md:p-3 lg:p-4'>
                                                        <div className='text-[10px] sm:text-xs md:text-sm text-slate-600'>
                                                            {item.products &&
                                                            item.products.length > 0
                                                                ? item.products
                                                                      .map((p) => {
                                                                          const quantity =
                                                                              p.pivot_quantity ||
                                                                              p.quantity ||
                                                                              0
                                                                          return formatNumber(
                                                                              quantity
                                                                          )
                                                                      })
                                                                      .join(', ')
                                                                : '-'}{' '}
                                                            шт.
                                                        </div>
                                                    </td>
                                                    <td className='p-1.5 sm:p-2 md:p-3 lg:p-4'>
                                                        <div className='text-[10px] sm:text-xs md:text-sm text-slate-600 font-semibold whitespace-nowrap'>
                                                            {Number(item.summa).toLocaleString() ||
                                                                '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-1.5 sm:p-2 md:p-3 lg:p-4'>
                                                        <div className='text-[10px] sm:text-xs md:text-sm text-slate-600 whitespace-nowrap'>
                                                            {(() => {
                                                                const dateStr =
                                                                    item.date || item.created_at
                                                                if (!dateStr) return '-'
                                                                try {
                                                                    const date = new Date(dateStr)
                                                                    if (isNaN(date.getTime()))
                                                                        return dateStr
                                                                    const day = String(
                                                                        date.getDate()
                                                                    ).padStart(2, '0')
                                                                    const month = String(
                                                                        date.getMonth() + 1
                                                                    ).padStart(2, '0')
                                                                    const year = date.getFullYear()
                                                                    return `${day}-${month}-${year}`
                                                                } catch {
                                                                    return dateStr
                                                                }
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className='p-1.5 sm:p-2 md:p-3 lg:p-4'>
                                                        <StatusSelect
                                                            options={statusOptions}
                                                            value={item.status || 'PENDING_PAYMENT'}
                                                            onStatusChange={handleStatusChange}
                                                            itemId={item.id}
                                                            changingStatus={
                                                                statusChangingItemId === item.id &&
                                                                changingStatus
                                                            }
                                                            showSuccess={
                                                                statusSuccessItemId === item.id
                                                            }
                                                        />
                                                    </td>
                                                    <td className='p-1.5 sm:p-2 md:p-3 lg:p-4'>
                                                        <div className='flex gap-1 sm:gap-2'>
                                                            <button
                                                                onClick={() => handleView(item)}
                                                                className='p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation'
                                                                title='Просмотр'
                                                            >
                                                                <svg
                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                    fill='none'
                                                                    viewBox='0 0 24 24'
                                                                    strokeWidth={2}
                                                                    stroke='currentColor'
                                                                    className='w-3.5 h-3.5 sm:w-4 sm:h-4'
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
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className='p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors touch-manipulation'
                                                                title='Редактировать'
                                                            >
                                                                <svg
                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                    fill='none'
                                                                    viewBox='0 0 24 24'
                                                                    strokeWidth={2}
                                                                    stroke='currentColor'
                                                                    className='w-3.5 h-3.5 sm:w-4 sm:h-4'
                                                                >
                                                                    <path
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
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
                                <div className='text-center text-slate-500 py-12'>Загрузка...</div>
                            ) : items.length === 0 ? (
                                <div className='text-center text-slate-500 py-12'>Нет данных</div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {items.map((item) => {
                                        const company =
                                            item.company ||
                                            companies.find((c) => c.id === item.company_id)
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
                                                            {company?.name || '-'}
                                                        </h3>
                                                        <div className='text-xs sm:text-sm text-slate-600 mt-1'>
                                                            {(item.products || [])
                                                                .map((p) => {
                                                                    const quantity =
                                                                        p.pivot_quantity ||
                                                                        p.quantity ||
                                                                        0
                                                                    return `${
                                                                        p.name || 'Товар'
                                                                    } (${quantity})`
                                                                })
                                                                .join(', ') || '-'}
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2'>
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
                                                                className='w-3 h-3 sm:w-4 sm:h-4'
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
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                                                            title='Редактировать'
                                                        >
                                                            <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                fill='none'
                                                                viewBox='0 0 24 24'
                                                                strokeWidth={2}
                                                                stroke='currentColor'
                                                                className='w-3 h-3 sm:w-4 sm:h-4'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className='mb-3'>
                                                    <div className='text-xs text-slate-400 uppercase mb-1'>
                                                        Статус
                                                    </div>
                                                    <StatusSelect
                                                        options={statusOptions}
                                                        value={item.status || 'PENDING_PAYMENT'}
                                                        onStatusChange={handleStatusChange}
                                                        itemId={item.id}
                                                        changingStatus={
                                                            statusChangingItemId === item.id &&
                                                            changingStatus
                                                        }
                                                        showSuccess={
                                                            statusSuccessItemId === item.id
                                                        }
                                                    />
                                                </div>
                                                <div className='grid grid-cols-2 gap-3 text-sm'>
                                                    <div>
                                                        <div className='text-xs text-slate-400 uppercase mb-1'>
                                                            Сумма
                                                        </div>
                                                        <div className='text-gray-700 font-semibold'>
                                                            {Number(item.summa).toLocaleString() ||
                                                                '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 uppercase mb-1'>
                                                            Дата
                                                        </div>
                                                        <div className='text-gray-700'>
                                                            {(() => {
                                                                const dateStr =
                                                                    item.date || item.created_at
                                                                if (!dateStr) return '-'
                                                                try {
                                                                    const date = new Date(dateStr)
                                                                    if (isNaN(date.getTime()))
                                                                        return dateStr
                                                                    const day = String(
                                                                        date.getDate()
                                                                    ).padStart(2, '0')
                                                                    const month = String(
                                                                        date.getMonth() + 1
                                                                    ).padStart(2, '0')
                                                                    const year = date.getFullYear()
                                                                    return `${day}-${month}-${year}`
                                                                } catch {
                                                                    return dateStr
                                                                }
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
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
                    onClose={() => {
                        setIsModalOpen(false)
                        setSearchQuery('')
                        setCurrentStep(1)
                        setCreatedSaleId(null)
                    }}
                    title={isEditMode ? 'Редактирование продажи' : 'Создание продажи'}
                    maxWidth='max-w-7xl'
                    maxHeight='h-[90vh]'
                >
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
                            {/* Left Side - Form Content */}
                            <div className='lg:col-span-2'>
                                <div className='space-y-4 sm:space-y-6'>
                                    {/* Sale Creation or Edit Mode */}
                                    <>
                                        <div>
                                            <Select
                                                label='Компания'
                                                required
                                                options={(companies || []).map((c) => ({
                                                    value: c.id,
                                                    label: c.name,
                                                }))}
                                                value={formData.company_id}
                                                onChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        company_id: value,
                                                    }))
                                                }
                                                placeholder='Выберите компанию'
                                                searchable={true}
                                            />
                                        </div>

                                        {!isEditMode && (
                                            <div>
                                                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3'>
                                                    <h3 className='text-base sm:text-lg font-semibold text-gray-700'>
                                                        Выберите товары и укажите количество
                                                    </h3>
                                                    <span className='text-xs sm:text-sm text-gray-500'>
                                                        Выбрано: {formData.products.length}
                                                    </span>
                                                </div>
                                                {/* Search Input */}
                                                <div className='relative mb-3 sm:mb-4'>
                                                    <input
                                                        type='text'
                                                        placeholder='Поиск товара...'
                                                        value={searchQuery}
                                                        onChange={(e) =>
                                                            setSearchQuery(e.target.value)
                                                        }
                                                        className='w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
                                                    />
                                                    <svg
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        fill='none'
                                                        viewBox='0 0 24 24'
                                                        strokeWidth={2}
                                                        stroke='currentColor'
                                                        className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
                                                        />
                                                    </svg>
                                                </div>
                                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-[350px] sm:max-h-[400px] overflow-y-auto pr-2'>
                                                    {(products || [])
                                                        .filter((product) =>
                                                            product.name
                                                                .toLowerCase()
                                                                .includes(searchQuery.toLowerCase())
                                                        )
                                                        .map((product) => {
                                                            const selectedProduct =
                                                                formData.products.find(
                                                                    (p) =>
                                                                        Number(p.product_id) ===
                                                                        Number(product.id)
                                                                )
                                                            const selectedIndex =
                                                                formData.products.findIndex(
                                                                    (p) =>
                                                                        Number(p.product_id) ===
                                                                        Number(product.id)
                                                                )
                                                            const isSelected =
                                                                selectedProduct !== undefined
                                                            const selectedQuantity =
                                                                Number(selectedProduct?.quantity) ||
                                                                0

                                                            return (
                                                                <div
                                                                    key={product.id}
                                                                    className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                                                                        isSelected
                                                                            ? 'border-blue-500 bg-blue-50'
                                                                            : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                >
                                                                    <div className='flex items-start justify-between mb-2 sm:mb-3 relative'>
                                                                        <h4 className='font-semibold text-gray-800 text-xs sm:text-sm flex-1 pr-6'>
                                                                            {product.name}
                                                                        </h4>
                                                                        {isSelected && (
                                                                            <button
                                                                                type='button'
                                                                                onClick={() =>
                                                                                    removeProduct(
                                                                                        selectedIndex
                                                                                    )
                                                                                }
                                                                                className='p-1.5 sm:p-1 absolute top-0 right-0 text-red-500 hover:bg-red-100 rounded transition-colors touch-manipulation'
                                                                                title='Удалить'
                                                                                disabled={
                                                                                    currentStep ===
                                                                                    2
                                                                                }
                                                                            >
                                                                                <svg
                                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                                    width='24'
                                                                                    height='24'
                                                                                    viewBox='0 0 24 24'
                                                                                    fill='none'
                                                                                    className='w-4 h-4 sm:w-3 sm:h-3 text-red-600'
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
                                                                        )}
                                                                    </div>
                                                                    <p className='text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 min-h-[24px] sm:min-h-[32px] line-clamp-2'>
                                                                        {product.description ||
                                                                            'Описание товара'}
                                                                    </p>
                                                                    <div className='space-y-2'>
                                                                        <div className='flex items-center gap-2'>
                                                                            <input
                                                                                type='number'
                                                                                min='0'
                                                                                placeholder='0'
                                                                                value={
                                                                                    selectedProduct?.quantity ||
                                                                                    ''
                                                                                }
                                                                                onChange={(e) => {
                                                                                    const value =
                                                                                        e.target
                                                                                            .value
                                                                                    if (
                                                                                        value ===
                                                                                            '' ||
                                                                                        value ===
                                                                                            '0'
                                                                                    ) {
                                                                                        // Remove product if quantity is 0 or empty
                                                                                        if (
                                                                                            isSelected
                                                                                        ) {
                                                                                            removeProduct(
                                                                                                selectedIndex
                                                                                            )
                                                                                        }
                                                                                    } else {
                                                                                        if (
                                                                                            isSelected
                                                                                        ) {
                                                                                            // Update existing product
                                                                                            handleProductChange(
                                                                                                selectedIndex,
                                                                                                'quantity',
                                                                                                value
                                                                                            )
                                                                                        } else {
                                                                                            // Add new product
                                                                                            setFormData(
                                                                                                (
                                                                                                    prev
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    products:
                                                                                                        [
                                                                                                            ...prev.products,
                                                                                                            {
                                                                                                                product_id:
                                                                                                                    product.id,
                                                                                                                quantity:
                                                                                                                    value,
                                                                                                                price: '',
                                                                                                            },
                                                                                                        ],
                                                                                                })
                                                                                            )
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                className={`flex-1 px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                                                                    isSelected
                                                                                        ? 'border-blue-500 focus:ring-blue-200'
                                                                                        : 'border-gray-300 focus:ring-gray-200'
                                                                                }`}
                                                                            />
                                                                            <span className='text-[10px] sm:text-xs text-gray-500 whitespace-nowrap'>
                                                                                шт.
                                                                            </span>
                                                                        </div>
                                                                        {isSelected && (
                                                                            <div className='flex items-center gap-2'>
                                                                                <input
                                                                                    type='text'
                                                                                    placeholder='Цена'
                                                                                    value={
                                                                                        selectedProduct?.price
                                                                                            ? formatNumber(
                                                                                                  selectedProduct.price
                                                                                              )
                                                                                            : ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) => {
                                                                                        const value =
                                                                                            e.target
                                                                                                .value
                                                                                        // Форматируем введенное значение
                                                                                        const formattedValue =
                                                                                            formatPriceInput(
                                                                                                value
                                                                                            )
                                                                                        handleProductChange(
                                                                                            selectedIndex,
                                                                                            'price',
                                                                                            formattedValue
                                                                                        )
                                                                                    }}
                                                                                    className='flex-1 px-2 sm:px-3 py-2 border border-blue-500 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all'
                                                                                    required
                                                                                />
                                                                                <span className='text-[10px] sm:text-xs text-gray-500 whitespace-nowrap'>
                                                                                    $
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                </div>
                            </div>

                            {/* Right Side - Information Panel */}
                            <div className='lg:col-span-1 bg-gray-50 rounded-lg p-3 sm:p-4 h-full overflow-y-auto max-h-[50vh] lg:max-h-[70vh]'>
                                <h3 className='text-xs sm:text-sm font-bold text-gray-700 mb-3 sm:mb-4 uppercase'>
                                    Информация о продаже
                                </h3>

                                {/* Company Info */}
                                <div className='mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200'>
                                    <p className='text-[10px] sm:text-xs text-gray-500 mb-1 uppercase'>
                                        Компания
                                    </p>
                                    {formData.company_id ? (
                                        <>
                                            <p className='text-xs sm:text-sm font-semibold text-gray-800 mb-2'>
                                                {companies.find((c) => c.id === formData.company_id)
                                                    ?.name || '-'}
                                            </p>
                                            {(() => {
                                                const company = companies.find(
                                                    (c) => c.id === formData.company_id
                                                )
                                                return company ? (
                                                    <div className='space-y-1 text-[10px] sm:text-xs text-gray-600'>
                                                        {company.phone && <p>📞 {company.phone}</p>}
                                                        {company.address && (
                                                            <p className='break-words'>
                                                                📍 {company.address}
                                                            </p>
                                                        )}
                                                        {company.deposit !== undefined && (
                                                            <p>
                                                                💰 Депозит:{' '}
                                                                {Number(
                                                                    company.deposit
                                                                ).toLocaleString()}{' '}
                                                                $
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : null
                                            })()}
                                        </>
                                    ) : (
                                        <p className='text-[10px] sm:text-xs text-gray-400'>
                                            Не выбрана
                                        </p>
                                    )}
                                </div>

                                {/* Products List */}
                                <div className='mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <p className='text-[10px] sm:text-xs text-gray-500 uppercase'>
                                            Товары
                                        </p>
                                        <span className='text-[10px] sm:text-xs text-gray-400'>
                                            {formData.products?.length || 0} шт.
                                        </span>
                                    </div>
                                    {formData.products && formData.products.length > 0 ? (
                                        <div className='space-y-2 sm:space-y-3'>
                                            {formData.products.map((product, index) => {
                                                const productInfo = products.find(
                                                    (p) =>
                                                        Number(p.id) === Number(product.product_id)
                                                )
                                                const quantity = Number(product.quantity) || 0
                                                const price = Number(product.price) || 0
                                                const total = quantity * price

                                                return (
                                                    <div
                                                        key={index}
                                                        className='bg-white p-2 sm:p-3 rounded-lg border border-gray-200 shadow-sm'
                                                    >
                                                        <div className='flex items-start justify-between mb-2'>
                                                            <p className='text-[10px] sm:text-xs font-semibold text-gray-800 flex-1'>
                                                                {productInfo?.name || 'Товар'}
                                                            </p>
                                                        </div>
                                                        {productInfo?.description && (
                                                            <p className='text-[10px] sm:text-xs text-gray-500 mb-2 line-clamp-2'>
                                                                {productInfo.description}
                                                            </p>
                                                        )}
                                                        <div className='space-y-1'>
                                                            <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-[10px] sm:text-xs text-gray-600'>
                                                                <span>
                                                                    Количество:{' '}
                                                                    <strong>{quantity}</strong> шт.
                                                                </span>
                                                                <span>
                                                                    Цена:{' '}
                                                                    <strong>
                                                                        {price
                                                                            ? formatNumber(price)
                                                                            : '0'}
                                                                    </strong>{' '}
                                                                    $
                                                                </span>
                                                            </div>
                                                            <div className='flex justify-between items-center pt-1 border-t border-gray-100'>
                                                                <span className='text-[10px] sm:text-xs text-gray-500'>
                                                                    Сумма:
                                                                </span>
                                                                <span className='text-[10px] sm:text-xs font-bold text-blue-600'>
                                                                    {formatNumber(total)} $
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p className='text-[10px] sm:text-xs text-gray-400'>
                                            Нет товаров
                                        </p>
                                    )}
                                </div>

                                {/* Total Amount */}
                                <div className='pt-2'>
                                    <div className='bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200'>
                                        <div className='flex justify-between items-center mb-1'>
                                            <p className='text-xs sm:text-sm font-bold text-gray-700'>
                                                Итого:
                                            </p>
                                            <p className='text-lg sm:text-xl font-bold text-blue-600'>
                                                {formatNumber(saleTotalAmount)} $
                                            </p>
                                        </div>
                                        <div className='text-[10px] sm:text-xs text-gray-500'>
                                            {formData.products?.length || 0}{' '}
                                            {formData.products?.length === 1 ? 'товар' : 'товаров'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 mt-4 sm:mt-6 pt-4 border-t border-gray-200'>
                            <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                                <Button
                                    type='button'
                                    variant='secondary'
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        setSearchQuery('')
                                        setCurrentStep(1)
                                        setCreatedSaleId(null)
                                    }}
                                    disabled={submitting}
                                    className='w-full sm:w-auto'
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type='submit'
                                    variant='primary'
                                    disabled={submitting || !canSubmit()}
                                    className='w-full sm:w-auto'
                                >
                                    {submitting ? (
                                        <span className='flex items-center gap-2'>
                                            <span className='loading loading-spinner loading-sm'></span>
                                            <span className='hidden sm:inline'>
                                                {isEditMode
                                                    ? 'Обновление...'
                                                    : 'Создание продажи...'}
                                            </span>
                                            <span className='sm:hidden'>
                                                {isEditMode ? 'Обновление...' : 'Создание...'}
                                            </span>
                                        </span>
                                    ) : isEditMode ? (
                                        <span>
                                            <span className='hidden sm:inline'>
                                                Обновить продажу
                                            </span>
                                            <span className='sm:hidden'>Обновить</span>
                                        </span>
                                    ) : (
                                        <span>
                                            <span className='hidden sm:inline'>
                                                Создать продажу
                                            </span>
                                            <span className='sm:hidden'>Создать</span>
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Modal>

                <ConfirmDialog
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title='Удаление продажи'
                    message='Вы уверены, что хотите удалить эту продажу? Это действие нельзя отменить.'
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

                <Modal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false)
                        setViewingItem(null)
                    }}
                    title='Детали продажи'
                    maxWidth='max-w-4xl'
                >
                    {viewingItem && (
                        <div className='space-y-6'>
                            {/* Main Info */}
                            <div className='bg-gray-50 rounded-lg p-3 sm:p-4'>
                                <h3 className='text-xs sm:text-sm font-bold text-gray-700 mb-3 uppercase'>
                                    Основная информация
                                </h3>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                                    <div>
                                        <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                            ID продажи
                                        </p>
                                        <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                            #{viewingItem.id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                            Сумма
                                        </p>
                                        <p className='text-sm sm:text-base lg:text-lg font-bold text-blue-600'>
                                            {Number(viewingItem.summa).toLocaleString()} $
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                            Дата создания
                                        </p>
                                        <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                            {(() => {
                                                const dateStr =
                                                    viewingItem.created_at || viewingItem.date
                                                if (!dateStr) return '-'
                                                try {
                                                    const date = new Date(dateStr)
                                                    if (isNaN(date.getTime())) return dateStr
                                                    const day = String(date.getDate()).padStart(
                                                        2,
                                                        '0'
                                                    )
                                                    const month = String(
                                                        date.getMonth() + 1
                                                    ).padStart(2, '0')
                                                    const year = date.getFullYear()
                                                    return `${day}-${month}-${year}`
                                                } catch {
                                                    return dateStr
                                                }
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                            Статус
                                        </p>
                                        <p className='text-xs sm:text-sm font-semibold'>
                                            <span
                                                className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                                    viewingItem.status === 'PAID'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {viewingItem.status === 'PAID'
                                                    ? 'Оплачено'
                                                    : viewingItem.status === 'PENDING_PAYMENT'
                                                    ? 'Ожидает оплаты'
                                                    : viewingItem.status || 'Ожидает оплаты'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className='bg-gray-50 rounded-lg p-3 sm:p-4'>
                                <h3 className='text-xs sm:text-sm font-bold text-gray-700 mb-3 uppercase'>
                                    Информация о компании
                                </h3>
                                <div className='space-y-3'>
                                    <div>
                                        <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                            Название компании
                                        </p>
                                        <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                            {viewingItem.company?.name || '-'}
                                        </p>
                                    </div>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                                        <div>
                                            <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                                Телефон
                                            </p>
                                            <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                                {viewingItem.company?.phone || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                                Депозит
                                            </p>
                                            <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                                {viewingItem.company?.deposit
                                                    ? Number(
                                                          viewingItem.company.deposit
                                                      ).toLocaleString() + ' $'
                                                    : 'Не указан'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                            Адрес
                                        </p>
                                        <p className='text-xs sm:text-sm font-semibold text-gray-800 break-words'>
                                            {viewingItem.company?.address || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* User Info */}
                            {viewingItem.user && (
                                <div className='bg-gray-50 rounded-lg p-3 sm:p-4'>
                                    <h3 className='text-xs sm:text-sm font-bold text-gray-700 mb-3 uppercase'>
                                        Кто создал продажу
                                    </h3>
                                    <div className='space-y-3'>
                                        <div>
                                            <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                                Имя пользователя
                                            </p>
                                            <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                                {viewingItem.user.username || '-'}
                                            </p>
                                        </div>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                                            <div>
                                                <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                                    Телефон
                                                </p>
                                                <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                                    {viewingItem.user.phone || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className='text-[10px] sm:text-xs text-gray-500 mb-1'>
                                                    Роли
                                                </p>
                                                <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                                    {viewingItem.user.roles &&
                                                    viewingItem.user.roles.length > 0
                                                        ? viewingItem.user.roles
                                                              .map((r) => r.name)
                                                              .join(', ')
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Products Info */}
                            <div className='bg-gray-50 rounded-lg p-3 sm:p-4'>
                                <h3 className='text-xs sm:text-sm font-bold text-gray-700 mb-3 uppercase'>
                                    Товары
                                </h3>
                                {viewingItem.products && viewingItem.products.length > 0 ? (
                                    <div className='space-y-2 sm:space-y-3'>
                                        {viewingItem.products.map((product, index) => {
                                            const quantity =
                                                product.pivot_quantity || product.quantity || 0
                                            const price = product.pivot_price || product.price || 0
                                            const total = quantity * price
                                            return (
                                                <div
                                                    key={index}
                                                    className='bg-white p-2 sm:p-3 rounded-lg border border-gray-200'
                                                >
                                                    <div className='flex items-start justify-between mb-2'>
                                                        <div className='flex-1'>
                                                            <p className='text-xs sm:text-sm font-semibold text-gray-800'>
                                                                {product.name || 'Товар'}
                                                            </p>
                                                            {product.description && (
                                                                <p className='text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-2'>
                                                                    {product.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] sm:text-xs text-gray-600 pt-2 border-t border-gray-100'>
                                                        <div>
                                                            <span className='text-gray-500'>
                                                                Количество:{' '}
                                                            </span>
                                                            <strong>{quantity}</strong> шт.
                                                        </div>
                                                        <div>
                                                            <span className='text-gray-500'>
                                                                Цена:{' '}
                                                            </span>
                                                            <strong>
                                                                {Number(price).toLocaleString()}
                                                            </strong>{' '}
                                                            $
                                                        </div>
                                                        <div>
                                                            <span className='text-gray-500'>
                                                                Сумма:{' '}
                                                            </span>
                                                            <strong className='text-blue-600'>
                                                                {Number(total).toLocaleString()}
                                                            </strong>{' '}
                                                            $
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className='text-xs sm:text-sm text-gray-500'>Нет товаров</p>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </Layout>
    )
}

export default Sales
