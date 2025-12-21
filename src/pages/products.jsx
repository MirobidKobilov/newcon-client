import React, { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import ErrorModal from '../components/UI/ErrorModal'
import Input from '../components/UI/Input'
import Modal from '../components/UI/Modal'
import Pagination from '../components/UI/Pagination'
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
        status: '',
        quantity: 0,
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768 ? 'table' : 'cards'
        }
        return 'table'
    })
    const [error, setError] = useState(null)
    const [isErrorOpen, setIsErrorOpen] = useState(false)
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const fetchItems = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const response = await api('get', { index: currentPage, size: pageSize }, '/products/list')
        if (response.success && response.data) {
            setItems(response.data.data || [])
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
        } else {
            setError({
                message: response.error || 'Ошибка при загрузке продуктов',
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

        // Prepare form data with numeric quantity
        const submitData = {
            ...formData,
            quantity: Number(formData.quantity) || 0,
        }

        let response
        if (isEditMode) {
            response = await api('put', submitData, `/products/update/${editingItemId}`)
        } else {
            response = await api('post', submitData, '/products/create')
        }

        if (response.success && response.data) {
            await fetchItems(page, size)

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingItemId(null)
            setFormData({
                name: '',
                description: '',
                status: '',
                quantity: 0,
            })

            setSuccessMessage(isEditMode ? 'Продукт успешно обновлен' : 'Продукт успешно создан')
            setIsSuccessOpen(true)
        } else {
            setError({
                message:
                    response.error ||
                    (isEditMode
                        ? 'Ошибка при обновлении продукта'
                        : 'Ошибка при создании продукта'),
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
            name: item.name || '',
            description: item.description || '',
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
        setError(null)
        const response = await api('delete', {}, `/products/delete/${deletingItemId}`)

        if (response.success && response.data) {
            await fetchItems(page, size)

            setSuccessMessage('Продукт успешно удален')
            setIsSuccessOpen(true)
        } else {
            setError({
                message: response.error || 'Ошибка при удалении продукта',
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
            description: '',
            status: 1,
            quantity: 0,
        })
        setIsModalOpen(true)
    }

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
                <div className='mb-4 sm:mb-6'>
                    <div className='mb-6 flex justify-end'>
                        <Button
                            onClick={handleCreateNew}
                            variant='primary'
                            className='w-full sm:w-auto text-sm px-3 py-2 min-h-[40px] md:text-sm md:px-3 md:py-2 md:min-h-[40px]'
                        >
                            + Создать продукт
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm mb-4 sm:mb-6 overflow-hidden'>
                    <div className='p-3 sm:p-4 md:p-6 border-b border-slate-200'>
                        <div className='flex items-center justify-between mb-3 sm:mb-4'>
                            <h2 className='text-base sm:text-lg font-bold text-gray-700'>
                                Продукты
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
                                        <th className='text-left p-3 text-slate-400 text-xs font-bold uppercase'>
                                            ID
                                        </th>
                                        <th className='text-left p-3 text-slate-400 text-xs font-bold uppercase'>
                                            Название
                                        </th>
                                        <th className='text-left p-3 text-slate-400 text-xs font-bold uppercase'>
                                            Описание
                                        </th>
                                        <th className='text-left p-3 text-slate-400 text-xs font-bold uppercase'>
                                            Статус
                                        </th>
                                        <th className='text-right p-3 text-slate-400 text-xs font-bold uppercase'>
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan='5'
                                                className='p-6 text-center text-slate-500 text-sm'
                                            >
                                                Загрузка...
                                            </td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan='5'
                                                className='p-6 text-center text-slate-500 text-sm'
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
                                                <td className='p-3'>
                                                    <div className='text-sm font-bold text-gray-700'>
                                                        {item.id}
                                                    </div>
                                                </td>
                                                <td className='p-3'>
                                                    <div className='text-sm font-bold text-gray-700'>
                                                        {item.name}
                                                    </div>
                                                </td>
                                                <td className='p-3'>
                                                    <div className='text-sm text-slate-600'>
                                                        {item.description || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-3'>
                                                    {item.status === 1 ? (
                                                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                            Активно
                                                        </span>
                                                    ) : item.status === 2 ? (
                                                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                                            Неактивно
                                                        </span>
                                                    ) : (
                                                        <span className='text-sm text-slate-600'>
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className='p-3'>
                                                    <div className='flex gap-2 justify-end'>
                                                        <Button
                                                            onClick={() => handleEdit(item)}
                                                            variant='secondary'
                                                            className='btn-sm btn-circle min-h-[40px] min-w-[40px] flex items-center justify-center !p-0 !px-0 !pb-0'
                                                            title='Редактировать'
                                                        >
                                                            <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                fill='none'
                                                                viewBox='0 0 24 24'
                                                                strokeWidth={2.5}
                                                                stroke='currentColor'
                                                                className='w-5 h-5 text-gray-700 flex-shrink-0'
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
                                                            className='btn-sm btn-circle min-h-[40px] min-w-[40px] hover:bg-red-50 flex items-center justify-center !p-0 !px-0 !pb-0'
                                                            title='Удалить'
                                                        >
                                                            <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                className='w-5 h-5 text-red-600 flex-shrink-0'
                                                            >
                                                                <path
                                                                    d='M7.99999 6L8.54414 4.36754C8.81637 3.55086 9.58064 3 10.4415 3H13.5585C14.4193 3 15.1836 3.55086 15.4558 4.36754L16 6M7.99999 6H5.61802C4.87464 6 4.39114 6.78231 4.72359 7.44721L5.21262 8.42527C5.40205 8.80413 5.5091 9.2188 5.52674 9.64201L5.88019 18.1249C5.94714 19.7318 7.26931 21 8.87759 21H15.1224C16.7307 21 18.0528 19.7318 18.1198 18.1249L18.4732 9.64202C18.4909 9.21881 18.5979 8.80413 18.7874 8.42527L19.2764 7.44721C19.6088 6.78231 19.1253 6 18.382 6H16M7.99999 6H16M14.4399 16.5L14.6899 10.5M9.56004 16.5L9.31004 10.5'
                                                                    stroke='currentColor'
                                                                    strokeWidth='1.5'
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
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
                        <div className='p-4 sm:p-6'>
                            {loading ? (
                                <div className='text-center text-slate-500 py-12 text-lg'>
                                    Загрузка...
                                </div>
                            ) : items.length === 0 ? (
                                <div className='text-center text-slate-500 py-12 text-lg'>
                                    Нет данных
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 gap-4 sm:gap-6'>
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className='bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow'
                                        >
                                            <div className='flex justify-between items-start mb-4'>
                                                <div className='flex-1'>
                                                    <h3 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>
                                                        {item.name}
                                                    </h3>
                                                    <div className='text-base sm:text-lg text-slate-600'>
                                                        {item.description || '-'}
                                                    </div>
                                                </div>
                                                <div className='flex gap-3'>
                                                    <Button
                                                        onClick={() => handleEdit(item)}
                                                        variant='secondary'
                                                        className='btn-lg btn-circle min-h-[44px] min-w-[44px] flex items-center justify-center !p-0 !px-0 !pb-0'
                                                        title='Редактировать'
                                                    >
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            fill='none'
                                                            viewBox='0 0 24 24'
                                                            strokeWidth={2.5}
                                                            stroke='currentColor'
                                                            className='w-5 h-5 text-gray-700'
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
                                                        className='btn-lg btn-circle min-h-[44px] min-w-[44px] hover:bg-red-50 flex items-center justify-center !p-0 !px-0 !pb-0'
                                                        title='Удалить'
                                                    >
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            width='24'
                                                            height='24'
                                                            viewBox='0 0 24 24'
                                                            fill='none'
                                                            className='w-6 h-6 text-red-600 flex-shrink-0'
                                                        >
                                                            <path
                                                                d='M7.99999 6L8.54414 4.36754C8.81637 3.55086 9.58064 3 10.4415 3H13.5585C14.4193 3 15.1836 3.55086 15.4558 4.36754L16 6M7.99999 6H5.61802C4.87464 6 4.39114 6.78231 4.72359 7.44721L5.21262 8.42527C5.40205 8.80413 5.5091 9.2188 5.52674 9.64201L5.88019 18.1249C5.94714 19.7318 7.26931 21 8.87759 21H15.1224C16.7307 21 18.0528 19.7318 18.1198 18.1249L18.4732 9.64202C18.4909 9.21881 18.5979 8.80413 18.7874 8.42527L19.2764 7.44721C19.6088 6.78231 19.1253 6 18.382 6H16M7.99999 6H16M14.4399 16.5L14.6899 10.5M9.56004 16.5L9.31004 10.5'
                                                                stroke='currentColor'
                                                                strokeWidth='1.5'
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                            />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className='mt-4 pt-4 border-t border-slate-200'>
                                                <div className='text-sm text-slate-500 font-semibold uppercase mb-2'>
                                                    Статус
                                                </div>
                                                <div className='text-lg sm:text-xl text-gray-800 font-semibold'>
                                                    {item.status === 1
                                                        ? 'Активно'
                                                        : item.status === 2
                                                        ? 'Неактивно'
                                                        : '-'}
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

export default Products
