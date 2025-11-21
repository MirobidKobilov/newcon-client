import React, { useEffect, useMemo, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import Modal from '../components/UI/Modal'
import Select from '../components/UI/Select'
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
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [companies, setCompanies] = useState([])
    const [products, setProducts] = useState([])
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewingItem, setViewingItem] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [paymentData, setPaymentData] = useState({
        payment_type_id: '',
        sales_stage: '',
    })
    const [paymentTypes] = useState([
        { id: 1, name: 'Доллары' },
        { id: 2, name: 'Сум' },
    ])
    const [salesStages] = useState([
        { value: 'Ожидание платежа', label: 'Ожидание платежа' },
        { value: 'Оплачено', label: 'Оплачено' },
    ])
    const [viewMode, setViewMode] = useState('table')
    const [currentStep, setCurrentStep] = useState(1)
    const [createdSaleId, setCreatedSaleId] = useState(null)

    const productsPayload = useMemo(() => {
        return (formData.products || [])
            .filter((p) => p.product_id && p.quantity && p.price)
            .map((p) => {
                const productId = Number(p.product_id)
                const quantity = Number(p.quantity)
                const price = Number(p.price) || 0

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            // Fetch sales list
            const salesResponse = await api('get', {}, '/sales/list')
            if (salesResponse?.data) {
                setItems(salesResponse.data.data || [])
            }

            // Fetch companies
            const companiesResponse = await api('get', {}, '/companies/list')
            if (companiesResponse?.data) {
                setCompanies(companiesResponse.data.data || [])
            }

            // Fetch products
            const productsResponse = await api('get', {}, '/products/list')
            if (productsResponse?.data) {
                setProducts(productsResponse.data.data || [])
            }

            setLoading(false)
        }
        fetchData()
    }, [])

    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '0'
        // Округляем до целого числа для сум
        const roundedNum = Math.round(Number(num))
        return roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    const parseFormattedNumber = (str) => {
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
            // Only allow numbers
            if (numericValue === '' || /^\d+$/.test(numericValue)) {
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
                // In edit mode, only update the sale
                const saleData = {
                    company_id: parseInt(formData.company_id),
                    summa: saleTotalAmount,
                    products: productsPayload,
                }

                const saleResponse = await api('put', saleData, `/sales/update/${editingItemId}`)

                if (saleResponse?.data) {
                    // Refresh sales list
                    const itemsResponse = await api('get', {}, '/sales/list')
                    if (itemsResponse?.data) {
                        setItems(itemsResponse.data.data || [])
                    }

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
                    })
                    setPaymentData({
                        payment_type_id: '',
                        sales_stage: '',
                    })

                    setSuccessMessage('Продажа успешно обновлена')
                    setIsSuccessOpen(true)
                }
            } else {
                // In create mode, step 1: create sale
                if (currentStep === 1) {
                    const saleData = {
                        company_id: parseInt(formData.company_id),
                        summa: saleTotalAmount,
                        products: productsPayload,
                    }

                    const saleResponse = await api('post', saleData, '/sales/create')

                    if (saleResponse?.data) {
                        const newSaleId = saleResponse.data.data?.id || saleResponse.data.id
                        setCreatedSaleId(newSaleId)
                        setCurrentStep(2)
                    }
                } else if (currentStep === 2) {
                    // Step 2: create payment
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
                        payment_type_id: parseInt(paymentData.payment_type_id),
                        sales_stage: paymentData.sales_stage,
                        sales: [
                            {
                                company_id: parseInt(formData.company_id),
                                amount: saleTotalAmount,
                            },
                        ],
                    }

                    const paymentResponse = await api('post', paymentSubmitData, '/payments/create')

                    if (paymentResponse?.data) {
                        // Refresh sales list
                        const itemsResponse = await api('get', {}, '/sales/list')
                        if (itemsResponse?.data) {
                            setItems(itemsResponse.data.data || [])
                        }

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
                        })
                        setPaymentData({
                            payment_type_id: '',
                            sales_stage: '',
                        })

                        setSuccessMessage('Продажа и платеж успешно созданы')
                        setIsSuccessOpen(true)
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

        // Convert products array (might have full objects or just IDs)
        const productsData = item.products
            ? item.products.map((p) => ({
                  product_id: p.id || p.product_id,
                  quantity: p.quantity,
                  price: p.price || '',
              }))
            : []

        setFormData({
            company_id: companyId,
            summa: item.summa || '',
            products: productsData,
        })

        // Try to get payment data if available (from related payment)
        // Note: This assumes the sale might have payment info, adjust based on your API
        setPaymentData({
            payment_type_id: item.payment_type_id || '',
            sales_stage: item.sales_stage || '',
        })

        setSearchQuery('')
        setIsModalOpen(true)
    }

    const handleDelete = (itemId) => {
        setDeletingItemId(itemId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        const response = await api('delete', {}, `/sales/delete/${deletingItemId}`)

        if (response?.data) {
            const itemsResponse = await api('get', {}, '/sales/list')
            if (itemsResponse?.data) {
                setItems(itemsResponse.data.data)
            }

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
        })
        setPaymentData({
            payment_type_id: '',
            sales_stage: '',
        })
        setSearchQuery('')
        setIsModalOpen(true)
    }

    const canSubmit = () => {
        const hasValidProducts =
            formData.company_id &&
            formData.products.length > 0 &&
            formData.products.every((p) => p.product_id && p.quantity && p.price)

        // In edit mode, payment fields are optional
        if (isEditMode) {
            return hasValidProducts
        }

        // In create mode, step 1: only sale data required
        if (currentStep === 1) {
            return hasValidProducts
        }

        // Step 2: payment fields are required
        if (currentStep === 2) {
            return paymentData.payment_type_id && paymentData.sales_stage
        }

        return false
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
            <div className='min-h-screen bg-gray-50 p-4 lg:p-6'>
                <div className='mb-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                        <div>
                            <div className='text-2xl text-slate-400'>
                                NEWCON <span className='text-gray-700'>/ Продажи</span>
                            </div>
                        </div>
                        <Button onClick={handleCreateNew} variant='primary'>
                            + Создать продажу
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm mb-6 overflow-hidden'>
                    <div className='p-6 border-b border-slate-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-bold text-gray-700'>Продажи</h2>
                            <div className='flex gap-2 bg-gray-100 p-1 rounded-lg'>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        viewMode === 'table'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
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
                                    Карточки
                                </button>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'table' && (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b border-slate-200'>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            ID
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Компания
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Товары
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Сумма
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Дата
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
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
                                                    <td className='p-4'>
                                                        <div className='text-sm font-bold text-gray-700'>
                                                            {item.id}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm font-bold text-gray-700'>
                                                            {company?.name || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm text-slate-600'>
                                                            {item.products &&
                                                            item.products.length > 0
                                                                ? item.products
                                                                      .map((p) => {
                                                                          // Product object now has name directly
                                                                          return `${
                                                                              p.name || 'Товар'
                                                                          } (${p.quantity})`
                                                                      })
                                                                      .join(', ')
                                                                : '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm text-slate-600 font-semibold'>
                                                            {Number(item.summa).toLocaleString() ||
                                                                '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm text-slate-600'>
                                                            {item.date || item.created_at || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <button
                                                            onClick={() => handleView(item)}
                                                            className='px-3 py-1.5 text-xs cursor-pointer font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
                                                        >
                                                            Просмотр
                                                        </button>
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
                                                        <h3 className='text-lg font-bold text-gray-700'>
                                                            {company?.name || '-'}
                                                        </h3>
                                                        <div className='text-sm text-slate-600 mt-1'>
                                                            {(item.products || [])
                                                                .map(
                                                                    (p) =>
                                                                        `${p.name || 'Товар'} (${
                                                                            p.quantity
                                                                        })`
                                                                )
                                                                .join(', ') || '-'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleView(item)}
                                                        className='px-3 py-1.5 text-xs cursor-pointer font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
                                                    >
                                                        Просмотр
                                                    </button>
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
                                                            {item.date || item.created_at || '-'}
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
                        {/* Step Indicator - Only show in create mode */}
                        {!isEditMode && (
                            <div className='mb-6'>
                                <div className='flex items-center justify-center gap-4'>
                                    <div className='flex items-center gap-2'>
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                                currentStep >= 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}
                                        >
                                            1
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${
                                                currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'
                                            }`}
                                        >
                                            Создание продажи
                                        </span>
                                    </div>
                                    <div className='w-16 h-0.5 bg-gray-200'>
                                        <div
                                            className={`h-full transition-all ${
                                                currentStep >= 2
                                                    ? 'bg-blue-600 w-full'
                                                    : 'bg-gray-200 w-0'
                                            }`}
                                        ></div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                                currentStep >= 2
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}
                                        >
                                            2
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${
                                                currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'
                                            }`}
                                        >
                                            Создание платежа
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='grid grid-cols-3 gap-6'>
                            {/* Left Side - Form Content */}
                            <div className='col-span-2'>
                                <div className='space-y-6'>
                                    {/* Step 1: Sale Creation or Edit Mode */}
                                    {(currentStep === 1 || isEditMode) && (
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
                                                    disabled={currentStep === 2}
                                                />
                                            </div>

                                            <div>
                                                <div className='flex items-center justify-between mb-3'>
                                                    <h3 className='text-lg font-semibold text-gray-700'>
                                                        Выберите товары и укажите количество
                                                    </h3>
                                                    <span className='text-sm text-gray-500'>
                                                        Выбрано: {formData.products.length}
                                                    </span>
                                                </div>
                                                {/* Search Input */}
                                                <div className='relative mb-4'>
                                                    <input
                                                        type='text'
                                                        placeholder='Поиск товара...'
                                                        value={searchQuery}
                                                        onChange={(e) =>
                                                            setSearchQuery(e.target.value)
                                                        }
                                                        className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
                                                        disabled={currentStep === 2}
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
                                                <div className='grid grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2'>
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
                                                            const unitPrice = Number(product.price)
                                                            const selectedQuantity =
                                                                Number(selectedProduct?.quantity) ||
                                                                0
                                                            const selectedTotal = isSelected
                                                                ? (Number.isFinite(unitPrice)
                                                                      ? unitPrice
                                                                      : 0) * selectedQuantity
                                                                : 0
                                                            const formattedUnitPrice =
                                                                Number.isFinite(unitPrice)
                                                                    ? unitPrice.toLocaleString()
                                                                    : '-'
                                                            const formattedSelectedTotal =
                                                                Number.isFinite(selectedTotal)
                                                                    ? selectedTotal.toLocaleString()
                                                                    : '0'

                                                            return (
                                                                <div
                                                                    key={product.id}
                                                                    className={`p-4 border-2 rounded-lg transition-all ${
                                                                        isSelected
                                                                            ? 'border-blue-500 bg-blue-50'
                                                                            : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                >
                                                                    <div className='flex items-start justify-between mb-3 relative'>
                                                                        <h4 className='font-semibold text-gray-800 text-sm flex-1'>
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
                                                                                className='p-1 absolute top-0 right-0 text-red-500 hover:bg-red-100 rounded transition-colors'
                                                                                title='Удалить'
                                                                                disabled={
                                                                                    currentStep ===
                                                                                    2
                                                                                }
                                                                            >
                                                                                <svg
                                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                                    fill='none'
                                                                                    viewBox='0 0 24 24'
                                                                                    strokeWidth={2}
                                                                                    stroke='currentColor'
                                                                                    className='w-4 h-4'
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap='round'
                                                                                        strokeLinejoin='round'
                                                                                        d='M6 18L18 6M6 6l12 12'
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <p className='text-xs text-gray-500 mb-2 min-h-[32px]'>
                                                                        {product.description ||
                                                                            'Описание товара'}
                                                                    </p>
                                                                    <div className='text-xs text-gray-500 mb-2'>
                                                                        Рекомендуемая цена:{' '}
                                                                        {formattedUnitPrice} сум
                                                                    </div>
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
                                                                                className={`flex-1 px-3 py-2 border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                                                                    isSelected
                                                                                        ? 'border-blue-500 focus:ring-blue-200'
                                                                                        : 'border-gray-300 focus:ring-gray-200'
                                                                                }`}
                                                                                disabled={
                                                                                    currentStep ===
                                                                                    2
                                                                                }
                                                                            />
                                                                            <span className='text-xs text-gray-500'>
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
                                                                                        handleProductChange(
                                                                                            selectedIndex,
                                                                                            'price',
                                                                                            value
                                                                                        )
                                                                                    }}
                                                                                    className='flex-1 px-3 py-2 border border-blue-500 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all'
                                                                                    required
                                                                                    disabled={
                                                                                        currentStep ===
                                                                                        2
                                                                                    }
                                                                                />
                                                                                <span className='text-xs text-gray-500'>
                                                                                    сум
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Step 2: Payment Creation - Only show in create mode */}
                                    {!isEditMode && currentStep === 2 && (
                                        <div className='border-t border-gray-200 pt-6'>
                                            <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                                                Информация об оплате
                                            </h3>
                                            <div className='space-y-4'>
                                                <Select
                                                    label='Тип оплаты'
                                                    required
                                                    options={paymentTypes.map((t) => ({
                                                        value: t.id,
                                                        label: t.name,
                                                    }))}
                                                    value={paymentData.payment_type_id}
                                                    onChange={(value) =>
                                                        setPaymentData((prev) => ({
                                                            ...prev,
                                                            payment_type_id: value,
                                                        }))
                                                    }
                                                    placeholder='Выберите тип оплаты'
                                                    searchable={false}
                                                />

                                                <Select
                                                    label='Статус продажи'
                                                    required
                                                    options={salesStages}
                                                    value={paymentData.sales_stage}
                                                    onChange={(value) =>
                                                        setPaymentData((prev) => ({
                                                            ...prev,
                                                            sales_stage: value,
                                                        }))
                                                    }
                                                    placeholder='Выберите статус'
                                                    searchable={false}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side - Information Panel */}
                            <div className='col-span-1 bg-gray-50 rounded-lg p-4 h-full overflow-y-auto max-h-[70vh]'>
                                <h3 className='text-sm font-bold text-gray-700 mb-4 uppercase'>
                                    Информация о продаже
                                </h3>

                                {/* Company Info */}
                                <div className='mb-4 pb-4 border-b border-gray-200'>
                                    <p className='text-xs text-gray-500 mb-1 uppercase'>Компания</p>
                                    {formData.company_id ? (
                                        <>
                                            <p className='text-sm font-semibold text-gray-800 mb-2'>
                                                {companies.find((c) => c.id === formData.company_id)
                                                    ?.name || '-'}
                                            </p>
                                            {(() => {
                                                const company = companies.find(
                                                    (c) => c.id === formData.company_id
                                                )
                                                return company ? (
                                                    <div className='space-y-1 text-xs text-gray-600'>
                                                        {company.phone && <p>📞 {company.phone}</p>}
                                                        {company.address && (
                                                            <p>� {company.address}</p>
                                                        )}
                                                        {company.deposit !== undefined && (
                                                            <p>
                                                                💰 Депозит:{' '}
                                                                {Number(
                                                                    company.deposit
                                                                ).toLocaleString()}{' '}
                                                                сум
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : null
                                            })()}
                                        </>
                                    ) : (
                                        <p className='text-xs text-gray-400'>Не выбрана</p>
                                    )}
                                </div>

                                {/* Products List */}
                                <div className='mb-4 pb-4 border-b border-gray-200'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <p className='text-xs text-gray-500 uppercase'>Товары</p>
                                        <span className='text-xs text-gray-400'>
                                            {formData.products?.length || 0} шт.
                                        </span>
                                    </div>
                                    {formData.products && formData.products.length > 0 ? (
                                        <div className='space-y-3'>
                                            {formData.products.map((product, index) => {
                                                const productInfo = products.find(
                                                    (p) =>
                                                        Number(p.id) === Number(product.product_id)
                                                )
                                                const quantity = Number(product.quantity) || 0
                                                const price = Number(product.price) || 0
                                                const total = quantity * price
                                                const unitPrice = productInfo?.price || 0
                                                const recommendedTotal = quantity * unitPrice

                                                return (
                                                    <div
                                                        key={index}
                                                        className='bg-white p-3 rounded-lg border border-gray-200 shadow-sm'
                                                    >
                                                        <div className='flex items-start justify-between mb-2'>
                                                            <p className='text-xs font-semibold text-gray-800 flex-1'>
                                                                {productInfo?.name || 'Товар'}
                                                            </p>
                                                            {productInfo?.price && (
                                                                <span className='text-xs text-gray-400 ml-2'>
                                                                    Рек. цена:{' '}
                                                                    {formatNumber(unitPrice)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {productInfo?.description && (
                                                            <p className='text-xs text-gray-500 mb-2 line-clamp-2'>
                                                                {productInfo.description}
                                                            </p>
                                                        )}
                                                        <div className='space-y-1'>
                                                            <div className='flex justify-between text-xs text-gray-600'>
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
                                                                    сум
                                                                </span>
                                                            </div>
                                                            <div className='flex justify-between items-center pt-1 border-t border-gray-100'>
                                                                <span className='text-xs text-gray-500'>
                                                                    Сумма:
                                                                </span>
                                                                <span className='text-xs font-bold text-blue-600'>
                                                                    {formatNumber(total)} сум
                                                                </span>
                                                            </div>
                                                            {productInfo?.price &&
                                                                price !== unitPrice && (
                                                                    <div className='text-xs text-gray-400'>
                                                                        Рекомендуемая:{' '}
                                                                        {formatNumber(
                                                                            recommendedTotal
                                                                        )}{' '}
                                                                        сум
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p className='text-xs text-gray-400'>Нет товаров</p>
                                    )}
                                </div>

                                {/* Payment Info - Only show in create mode */}
                                {!isEditMode && (
                                    <div className='mb-4 pb-4 border-b border-gray-200'>
                                        <p className='text-xs text-gray-500 mb-2 uppercase'>
                                            Оплата
                                        </p>
                                        <div className='space-y-2 text-xs'>
                                            <div>
                                                <span className='text-gray-500'>Тип оплаты: </span>
                                                <span className='font-semibold text-gray-800'>
                                                    {paymentData.payment_type_id
                                                        ? paymentTypes.find(
                                                              (t) =>
                                                                  t.id ===
                                                                  Number(
                                                                      paymentData.payment_type_id
                                                                  )
                                                          )?.name || '-'
                                                        : 'Не выбран'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className='text-gray-500'>Статус: </span>
                                                <span className='font-semibold text-gray-800'>
                                                    {paymentData.sales_stage || 'Не выбран'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Total Amount */}
                                <div className='pt-2'>
                                    <div className='bg-blue-50 rounded-lg p-3 border border-blue-200'>
                                        <div className='flex justify-between items-center mb-1'>
                                            <p className='text-sm font-bold text-gray-700'>
                                                Итого:
                                            </p>
                                            <p className='text-xl font-bold text-blue-600'>
                                                {formatNumber(saleTotalAmount)} сум
                                            </p>
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            {formData.products?.length || 0}{' '}
                                            {formData.products?.length === 1 ? 'товар' : 'товаров'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className='flex justify-between gap-2 mt-6 pt-4 border-t border-gray-200'>
                            <div>
                                {!isEditMode && currentStep === 2 && (
                                    <Button
                                        type='button'
                                        variant='secondary'
                                        onClick={() => setCurrentStep(1)}
                                        disabled={submitting}
                                    >
                                        Назад
                                    </Button>
                                )}
                            </div>
                            <div className='flex gap-2'>
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
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type='submit'
                                    variant='primary'
                                    disabled={submitting || !canSubmit()}
                                >
                                    {submitting ? (
                                        <span className='flex items-center gap-2'>
                                            <span className='loading loading-spinner loading-sm'></span>
                                            {isEditMode
                                                ? 'Обновление...'
                                                : currentStep === 1
                                                ? 'Создание продажи...'
                                                : 'Создание платежа...'}
                                        </span>
                                    ) : isEditMode ? (
                                        'Обновить продажу'
                                    ) : currentStep === 1 ? (
                                        'Создать продажу'
                                    ) : (
                                        'Создать платеж'
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
                            <div className='bg-gray-50 rounded-lg p-4'>
                                <h3 className='text-sm font-bold text-gray-700 mb-3 uppercase'>
                                    Основная информация
                                </h3>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <p className='text-xs text-gray-500 mb-1'>ID продажи</p>
                                        <p className='text-sm font-semibold text-gray-800'>
                                            #{viewingItem.id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500 mb-1'>Сумма</p>
                                        <p className='text-lg font-bold text-blue-600'>
                                            {Number(viewingItem.summa).toLocaleString()} сум
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500 mb-1'>Дата создания</p>
                                        <p className='text-sm font-semibold text-gray-800'>
                                            {viewingItem.created_at || viewingItem.date || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className='bg-gray-50 rounded-lg p-4'>
                                <h3 className='text-sm font-bold text-gray-700 mb-3 uppercase'>
                                    Информация о компании
                                </h3>
                                <div className='space-y-3'>
                                    <div>
                                        <p className='text-xs text-gray-500 mb-1'>
                                            Название компании
                                        </p>
                                        <p className='text-sm font-semibold text-gray-800'>
                                            {viewingItem.company?.name || '-'}
                                        </p>
                                    </div>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <p className='text-xs text-gray-500 mb-1'>Телефон</p>
                                            <p className='text-sm font-semibold text-gray-800'>
                                                {viewingItem.company?.phone || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-xs text-gray-500 mb-1'>Депозит</p>
                                            <p className='text-sm font-semibold text-gray-800'>
                                                {viewingItem.company?.deposit
                                                    ? Number(
                                                          viewingItem.company.deposit
                                                      ).toLocaleString() + ' сум'
                                                    : 'Не указан'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500 mb-1'>Адрес</p>
                                        <p className='text-sm font-semibold text-gray-800'>
                                            {viewingItem.company?.address || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Products Info */}
                            <div className='bg-gray-50 rounded-lg p-4'>
                                <h3 className='text-sm font-bold text-gray-700 mb-3 uppercase'>
                                    Товары
                                </h3>
                                {viewingItem.products && viewingItem.products.length > 0 ? (
                                    <div className='text-sm text-gray-700'>
                                        {viewingItem.products
                                            .map(
                                                (product) =>
                                                    `${product.name || 'Товар'} (${
                                                        product.quantity
                                                    } шт.)`
                                            )
                                            .join(', ')}
                                    </div>
                                ) : (
                                    <p className='text-sm text-gray-500'>Нет товаров</p>
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
