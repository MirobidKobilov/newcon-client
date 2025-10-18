import React, { useState, useEffect } from 'react'
import Layout from '../layout/layout'
import { api } from '../utils/api'
import Input from '../components/UI/Input'
import Select from '../components/UI/Select'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import SuccessModal from '../components/UI/SuccessModal'

const Sales = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [formData, setFormData] = useState({
        company_id: '',
        sales_type_id: '',
        summa: '',
        products: [{ product_id: '', quantity: '' }],
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [companies, setCompanies] = useState([])
    const [salesTypes, setSalesTypes] = useState([])
    const [products, setProducts] = useState([])
    const [currentStep, setCurrentStep] = useState(1)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            // Fetch sales list
            const salesResponse = await api('get', {}, '/sales/list')
            if (salesResponse?.data) {
                setItems(salesResponse.data.data)
            }

            // Fetch companies
            const companiesResponse = await api('get', {}, '/companies/list')
            if (companiesResponse?.data) {
                setCompanies(companiesResponse.data.data)
            }

            // Fetch products
            const productsResponse = await api('get', {}, '/products/list')
            if (productsResponse?.data) {
                setProducts(productsResponse.data.data)
            }

            // Sales types
            setSalesTypes([
                { id: 1, name: 'cash' },
                { id: 2, name: 'cart' },
            ])

            setLoading(false)
        }
        fetchData()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleProductChange = (index, field, value) => {
        const newProducts = [...formData.products]
        newProducts[index][field] = value
        setFormData((prev) => ({
            ...prev,
            products: newProducts,
        }))
    }

    const addProduct = () => {
        setFormData((prev) => ({
            ...prev,
            products: [...prev.products, { product_id: '', quantity: '' }],
        }))
    }

    const removeProduct = (index) => {
        if (formData.products.length > 1) {
            const newProducts = formData.products.filter((_, i) => i !== index)
            setFormData((prev) => ({
                ...prev,
                products: newProducts,
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        // Prepare data in the correct format
        const submitData = {
            company_id: parseInt(formData.company_id),
            sales_type_id: parseInt(formData.sales_type_id),
            summa: parseFloat(formData.summa),
            products: formData.products.map((p) => ({
                product_id: parseInt(p.product_id),
                quantity: parseFloat(p.quantity),
            })),
        }

        let response
        if (isEditMode) {
            response = await api('put', submitData, `/sales/update/${editingItemId}`)
        } else {
            response = await api('post', submitData, '/sales/create')
        }

        if (response?.data) {
            const itemsResponse = await api('get', {}, '/sales/list')
            if (itemsResponse?.data) {
                setItems(itemsResponse.data.data)
            }

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingItemId(null)
            setCurrentStep(1)
            setFormData({
                company_id: '',
                sales_type_id: '',
                summa: '',
                products: [{ product_id: '', quantity: '' }],
            })

            setSuccessMessage(isEditMode ? 'Продажа успешно обновлена' : 'Продажа успешно создана')
            setIsSuccessOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (item) => {
        setIsEditMode(true)
        setEditingItemId(item.id)
        setFormData({
            company_id: item.company_id || '',
            sales_type_id: item.sales_type_id || '',
            summa: item.summa || '',
            products: item.products || [{ product_id: '', quantity: '' }],
        })
        setCurrentStep(1)
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
        setFormData({
            company_id: '',
            sales_type_id: '',
            summa: '',
            products: [{ product_id: '', quantity: '' }],
        })
        setCurrentStep(1)
        setIsModalOpen(true)
    }

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const canProceedToStep2 = () => {
        return formData.company_id && formData.sales_type_id
    }

    const canProceedToStep3 = () => {
        return formData.products.every((p) => p.product_id && p.quantity)
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="text-2xl text-slate-400">
                                NEWCON <span className="text-gray-700">/ Продажи</span>
                            </div>
                        </div>
                        <Button onClick={handleCreateNew} variant="primary">
                            + Создать продажу
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Продажи</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        ID
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Компания
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Тип продажи
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Товары
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Сумма
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Дата
                                    </th>
                                    <th className="text-right p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-500">
                                            Загрузка...
                                        </td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-500">
                                            Нет данных
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => {
                                        const company = companies.find(
                                            (c) => c.id === item.company_id
                                        )
                                        const salesType = salesTypes.find(
                                            (t) => t.id === item.sales_type_id
                                        )
                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-b border-slate-200 hover:bg-gray-50"
                                            >
                                                <td className="p-4">
                                                    <div className="text-sm font-bold text-gray-700">
                                                        {item.id}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-bold text-gray-700">
                                                        {company?.name || item.company_name || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-600">
                                                        {salesType?.name ||
                                                            item.sales_type_name ||
                                                            '-'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-600">
                                                        {item.products && item.products.length > 0
                                                            ? item.products
                                                                  .map((p) => {
                                                                      const product = products.find(
                                                                          (pr) =>
                                                                              pr.id === p.product_id
                                                                      )
                                                                      return `${
                                                                          product?.name ||
                                                                          p.product_name ||
                                                                          'Товар'
                                                                      } (${p.quantity})`
                                                                  })
                                                                  .join(', ')
                                                            : item.product_name || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-600 font-semibold">
                                                        {item.summa || item.total_amount || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-600">
                                                        {item.date || item.created_at || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            onClick={() => handleEdit(item)}
                                                            variant="secondary"
                                                            className="btn-sm btn-circle"
                                                            title="Редактировать"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="w-4 h-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                                />
                                                            </svg>
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDelete(item.id)}
                                                            variant="secondary"
                                                            className="btn-sm btn-circle hover:bg-red-50"
                                                            title="Удалить"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="w-4 h-4 text-red-600"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
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

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setCurrentStep(1)
                    }}
                    title={isEditMode ? 'Редактирование продажи' : 'Создание продажи'}
                >
                    <form onSubmit={handleSubmit}>
                        {/* Step Indicator */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                            currentStep >= 1
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        1
                                    </div>
                                    <div className="flex-1 h-1 mx-2 bg-gray-200">
                                        <div
                                            className={`h-full transition-all ${
                                                currentStep > 1 ? 'bg-blue-500' : 'bg-gray-200'
                                            }`}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex items-center flex-1">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                            currentStep >= 2
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        2
                                    </div>
                                    <div className="flex-1 h-1 mx-2 bg-gray-200">
                                        <div
                                            className={`h-full transition-all ${
                                                currentStep > 2 ? 'bg-blue-500' : 'bg-gray-200'
                                            }`}
                                        ></div>
                                    </div>
                                </div>
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                        currentStep >= 3
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    3
                                </div>
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-xs text-gray-600">Основная информация</span>
                                <span className="text-xs text-gray-600">Товары</span>
                                <span className="text-xs text-gray-600">Сумма</span>
                            </div>
                        </div>

                        {/* Step 1: Company and Sales Type */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <Select
                                    label="Компания"
                                    required
                                    options={companies.map((c) => ({ value: c.id, label: c.name }))}
                                    value={formData.company_id}
                                    onChange={(value) =>
                                        setFormData((prev) => ({ ...prev, company_id: value }))
                                    }
                                    placeholder="Выберите компанию"
                                />

                                <Select
                                    label="Тип продажи"
                                    required
                                    options={salesTypes.map((t) => ({
                                        value: t.id,
                                        label: t.name,
                                    }))}
                                    value={formData.sales_type_id}
                                    onChange={(value) =>
                                        setFormData((prev) => ({ ...prev, sales_type_id: value }))
                                    }
                                    placeholder="Выберите тип продажи"
                                />
                            </div>
                        )}

                        {/* Step 2: Products */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        Выберите товары
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={addProduct}
                                        className="text-sm"
                                    >
                                        + Добавить товар
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {formData.products.map((product, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <Select
                                                        label="Товар"
                                                        required
                                                        options={products.map((p) => ({
                                                            value: p.id,
                                                            label: p.name,
                                                        }))}
                                                        value={product.product_id}
                                                        onChange={(value) =>
                                                            handleProductChange(
                                                                index,
                                                                'product_id',
                                                                value
                                                            )
                                                        }
                                                        placeholder="Выберите товар"
                                                    />
                                                    <Input
                                                        label="Количество"
                                                        type="number"
                                                        value={product.quantity}
                                                        onChange={(e) =>
                                                            handleProductChange(
                                                                index,
                                                                'quantity',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Введите количество"
                                                        required
                                                    />
                                                </div>
                                                {formData.products.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProduct(index)}
                                                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Удалить товар"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="w-5 h-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Total Amount */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        Итоговая информация
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Компания:</span>
                                            <span className="font-semibold text-gray-800">
                                                {companies.find((c) => c.id === formData.company_id)
                                                    ?.name || '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Тип продажи:</span>
                                            <span className="font-semibold text-gray-800">
                                                {salesTypes.find(
                                                    (t) => t.id === formData.sales_type_id
                                                )?.name || '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Товаров:</span>
                                            <span className="font-semibold text-gray-800">
                                                {formData.products.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label="Общая сумма"
                                    type="number"
                                    name="summa"
                                    value={formData.summa}
                                    onChange={handleInputChange}
                                    placeholder="Введите общую сумму"
                                    required
                                />
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between gap-2 mt-6 pt-4 border-t border-gray-200">
                            <div>
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={prevStep}
                                        disabled={submitting}
                                    >
                                        ← Назад
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        setCurrentStep(1)
                                    }}
                                    disabled={submitting}
                                >
                                    Отмена
                                </Button>
                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={nextStep}
                                        disabled={
                                            (currentStep === 1 && !canProceedToStep2()) ||
                                            (currentStep === 2 && !canProceedToStep3())
                                        }
                                    >
                                        Далее →
                                    </Button>
                                ) : (
                                    <Button type="submit" variant="primary" disabled={submitting}>
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <span className="loading loading-spinner loading-sm"></span>
                                                {isEditMode ? 'Сохранение...' : 'Создание...'}
                                            </span>
                                        ) : isEditMode ? (
                                            'Сохранить'
                                        ) : (
                                            'Создать'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </Modal>

                <ConfirmDialog
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title="Удаление продажи"
                    message="Вы уверены, что хотите удалить эту продажу? Это действие нельзя отменить."
                    confirmText="Удалить"
                    cancelText="Отмена"
                    confirmVariant="primary"
                    isLoading={deleting}
                />

                <SuccessModal
                    isOpen={isSuccessOpen}
                    onClose={() => setIsSuccessOpen(false)}
                    title="Успешно"
                    message={successMessage}
                />
            </div>
        </Layout>
    )
}

export default Sales
