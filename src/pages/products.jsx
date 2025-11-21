import React, { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import Input from '../components/UI/Input'
import Modal from '../components/UI/Modal'
import Select from '../components/UI/Select'
import SuccessModal from '../components/UI/SuccessModal'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Products = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        status: '',
        quantity: 0,
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [viewMode, setViewMode] = useState('table')

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true)
            const response = await api('get', {}, '/products/list')
            if (response?.data) {
                setItems(response.data.data)
            }
            setLoading(false)
        }
        fetchItems()
    }, [])

    const formatPrice = (price) => {
        if (price === null || price === undefined || price === '' || isNaN(price)) return '-'
        const numPrice = Number(price)
        if (isNaN(numPrice)) return '-'
        return numPrice.toLocaleString('ru-RU')
    }

    const formatNumber = (num) => {
        if (num === null || num === undefined || num === '' || isNaN(num)) return ''
        const numValue = Number(num)
        if (isNaN(numValue)) return ''
        return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    const parseFormattedNumber = (str) => {
        return str.replace(/\s/g, '')
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === 'price') {
            // Remove spaces and allow only numbers
            const numericValue = parseFormattedNumber(value)
            // Only allow numbers and decimal point
            if (numericValue === '' || /^\d*\.?\d*$/.test(numericValue)) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: numericValue,
                }))
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        // Prepare form data with numeric price and quantity
        const submitData = {
            ...formData,
            price: formData.price ? parseFloat(formData.price) || 0 : '',
            quantity: Number(formData.quantity) || 0,
        }

        let response
        if (isEditMode) {
            response = await api('put', submitData, `/products/update/${editingItemId}`)
        } else {
            response = await api('post', submitData, '/products/create')
        }

        if (response?.data) {
            const itemsResponse = await api('get', {}, '/products/list')
            if (itemsResponse?.data) {
                setItems(itemsResponse.data.data)
            }

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingItemId(null)
            setFormData({
                name: '',
                description: '',
                price: '',
                status: '',
                quantity: 0,
            })

            setSuccessMessage(isEditMode ? 'Продукт успешно обновлен' : 'Продукт успешно создан')
            setIsSuccessOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (item) => {
        setIsEditMode(true)
        setEditingItemId(item.id)
        setFormData({
            name: item.name || '',
            description: item.description || '',
            price: item.price || '',
            status: item.status || '',
            quantity: item.quantity || 0,
        })
        setIsModalOpen(true)
    }

    const handleDelete = (itemId) => {
        setDeletingItemId(itemId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        const response = await api('delete', {}, `/products/delete/${deletingItemId}`)

        if (response?.data) {
            const itemsResponse = await api('get', {}, '/products/list')
            if (itemsResponse?.data) {
                setItems(itemsResponse.data.data)
            }

            setSuccessMessage('Продукт успешно удален')
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
            description: '',
            price: '',
            status: 1,
            quantity: 0,
        })
        setIsModalOpen(true)
    }

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-4 lg:p-6'>
                <div className='mb-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                        <div>
                            <div className='text-2xl text-slate-400'>
                                NEWCON <span className='text-gray-700'>/ Продукты</span>
                            </div>
                        </div>
                        <Button onClick={handleCreateNew} variant='primary'>
                            + Создать продукт
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm mb-6 overflow-hidden'>
                    <div className='p-6 border-b border-slate-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-bold text-gray-700'>Продукты</h2>
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
                                            Название
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Описание
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Цена
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Статус
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
                                    ) : items.length === 0 ? (
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
                                                    <div className='text-sm font-bold text-gray-700'>
                                                        {item.name}
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <div className='text-sm text-slate-600'>
                                                        {item.description || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <div className='text-sm text-slate-600'>
                                                        {formatPrice(item.price)}
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    {item.status === 1 ? (
                                                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                            Активно
                                                        </span>
                                                    ) : item.status === 2 ? (
                                                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                                            Неактивно
                                                        </span>
                                                    ) : (
                                                        <span className='text-sm text-slate-600'>
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className='p-4'>
                                                    <div className='flex gap-2 justify-end'>
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
                                            <div className='flex justify-between items-start mb-3'>
                                                <div>
                                                    <div className='text-xs text-slate-400 font-medium mb-1'>
                                                        ID: {item.id}
                                                    </div>
                                                    <h3 className='text-lg font-bold text-gray-700'>
                                                        {item.name}
                                                    </h3>
                                                    <div className='text-sm text-slate-600 mt-1'>
                                                        {item.description || '-'}
                                                    </div>
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
                                            <div className='grid grid-cols-2 gap-3 text-sm'>
                                                <div>
                                                    <div className='text-xs text-slate-400 uppercase mb-1'>
                                                        Цена
                                                    </div>
                                                    <div className='text-gray-700'>
                                                        {formatPrice(item.price)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className='text-xs text-slate-400 uppercase mb-1'>
                                                        Статус
                                                    </div>
                                                    <div className='text-gray-700'>
                                                        {item.status === 1
                                                            ? 'Активно'
                                                            : item.status === 2
                                                            ? 'Неактивно'
                                                            : '-'}
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

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditMode ? 'Редактирование продукта' : 'Создание продукта'}
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
                                label='Описание'
                                type='text'
                                name='description'
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder='Введите описание'
                            />

                            <Input
                                label='Цена'
                                type='text'
                                name='price'
                                value={formatNumber(formData.price)}
                                onChange={handleInputChange}
                                placeholder='Введите цену'
                            />

                            {isEditMode && (
                                <Select
                                    label='Статус'
                                    value={formData.status}
                                    onChange={(value) =>
                                        setFormData((prev) => ({ ...prev, status: value }))
                                    }
                                    options={[
                                        { value: 1, label: 'Активно' },
                                        { value: 2, label: 'Неактивно' },
                                    ]}
                                    placeholder='Выберите статус'
                                />
                            )}
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
                    title='Удаление продукта'
                    message='Вы уверены, что хотите удалить этот продукт? Это действие нельзя отменить.'
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
            </div>
        </Layout>
    )
}

export default Products
