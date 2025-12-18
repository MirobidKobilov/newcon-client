import React, { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import Input from '../components/UI/Input'
import Modal from '../components/UI/Modal'
import Pagination from '../components/UI/Pagination'
import SuccessModal from '../components/UI/SuccessModal'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Roles = () => {
    const [items, setItems] = useState([])
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        permission: [],
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
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [showComingSoon, setShowComingSoon] = useState(true)

    const fetchRoles = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const rolesResponse = await api('get', { index: currentPage, size: pageSize }, '/roles/list')
        if (rolesResponse?.data) {
            setItems(rolesResponse.data.data || [])
            // Handle pagination metadata
            if (rolesResponse.data.total !== undefined) {
                setTotalItems(rolesResponse.data.total)
                setTotalPages(Math.ceil(rolesResponse.data.total / pageSize))
            } else if (rolesResponse.data.meta) {
                setTotalItems(rolesResponse.data.meta.total || 0)
                setTotalPages(rolesResponse.data.meta.last_page || 1)
            } else {
                const items = rolesResponse.data.data || []
                setTotalItems(items.length)
                setTotalPages(1)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchRoles(page, size)
            const permissionsResponse = await api('get', {}, '/permissions/list')
            if (permissionsResponse?.data) {
                setPermissions(permissionsResponse.data.data || [])
            }
        }
        fetchData()
    }, [page, size])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePermissionToggle = (permissionId) => {
        setFormData((prev) => {
            const isSelected = prev.permission.includes(permissionId)
            return {
                ...prev,
                permission: isSelected
                    ? prev.permission.filter((id) => id !== permissionId)
                    : [...prev.permission, permissionId],
            }
        })
    }

    const handleSelectAll = () => {
        setFormData((prev) => ({
            ...prev,
            permission: permissions.map((p) => p.id),
        }))
    }

    const handleUnselectAll = () => {
        setFormData((prev) => ({
            ...prev,
            permission: [],
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        let response
        if (isEditMode) {
            response = await api('put', formData, `/roles/update/${editingItemId}`)
        } else {
            response = await api('post', formData, '/roles/create')
        }

        if (response?.data) {
            await fetchRoles(page, size)

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingItemId(null)
            setFormData({
                name: '',
                permission: [],
            })

            setSuccessMessage(isEditMode ? 'Роль успешно обновлена' : 'Роль успешно создана')
            setIsSuccessOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (item) => {
        setIsEditMode(true)
        setEditingItemId(item.id)
        setFormData({
            name: item.name,
            permission: item.permissions ? item.permissions.map((p) => p.id) : [],
        })
        setIsModalOpen(true)
    }

    const handleDelete = (itemId) => {
        setDeletingItemId(itemId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        const response = await api('delete', {}, `/roles/delete/${deletingItemId}`)

        if (response?.data) {
            await fetchRoles(page, size)

            setSuccessMessage('Роль успешно удалена')
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
            permission: [],
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
                                NEWCON <span className='text-gray-700'>/ Роли</span>
                            </div>
                        </div>
                        {!showComingSoon && (
                            <Button
                                onClick={handleCreateNew}
                                variant='primary'
                                className='w-full sm:w-auto text-sm px-3 py-2 min-h-[40px] md:text-sm md:px-3 md:py-2 md:min-h-[40px]'
                            >
                                + Создать роль
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
                    <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4 sm:mb-4 sm:mb-6 overflow-hidden'>
                        <div className='p-3 sm:p-4 md:p-6 border-b border-slate-200'>
                            <div className='flex items-center justify-between mb-3 sm:mb-4'>
                                <h2 className='text-base sm:text-lg font-bold text-gray-700'>
                                    Роли
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
                                            <th className='text-right p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan='4'
                                                    className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                                >
                                                    Загрузка...
                                                </td>
                                            </tr>
                                        ) : items.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan='4'
                                                    className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
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
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                            {item.id}
                                                        </div>
                                                    </td>
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                            {item.name}
                                                        </div>
                                                    </td>
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='flex gap-1 sm:gap-2 justify-end'>
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
                                                                onClick={() =>
                                                                    handleDelete(item.id)
                                                                }
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
                                                        <h3 className='text-base sm:text-lg font-bold text-gray-700'>
                                                            {item.name}
                                                        </h3>
                                                    </div>
                                                    <div className='flex gap-2'>
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
                                                {item.permissions &&
                                                    item.permissions.length > 0 && (
                                                        <div className='mt-2'>
                                                            <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                                Разрешения
                                                            </div>
                                                            <div className='flex flex-wrap gap-1'>
                                                                {item.permissions.map((p) => (
                                                                    <span
                                                                        key={p.id}
                                                                        className='inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700'
                                                                    >
                                                                        {p.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
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
                        onClose={() => setIsModalOpen(false)}
                        title={isEditMode ? 'Редактирование роли' : 'Создание роли'}
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

                                <div>
                                    <div className='flex items-center justify-between mb-2'>
                                        <label className='block'>
                                            <span className='text-sm font-medium text-gray-700'>
                                                Разрешения
                                            </span>
                                            <span className='text-xs text-gray-500 ml-2'>
                                                ({formData.permission.length} выбрано)
                                            </span>
                                        </label>
                                        <div className='flex gap-2'>
                                            <Button
                                                type='button'
                                                variant='secondary'
                                                onClick={handleSelectAll}
                                                className='btn-sm'
                                            >
                                                Выбрать все
                                            </Button>
                                            <Button
                                                type='button'
                                                variant='secondary'
                                                onClick={handleUnselectAll}
                                                className='btn-sm'
                                            >
                                                Снять все
                                            </Button>
                                        </div>
                                    </div>
                                    <div className='space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3'>
                                        {permissions.length > 0 ? (
                                            permissions.map((permission) => (
                                                <label
                                                    key={permission.id}
                                                    className={`flex items-start gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer border transition-colors ${
                                                        formData.permission.includes(permission.id)
                                                            ? 'bg-blue-50 border-blue-200'
                                                            : 'border-transparent'
                                                    }`}
                                                >
                                                    <input
                                                        type='checkbox'
                                                        checked={formData.permission.includes(
                                                            permission.id
                                                        )}
                                                        onChange={() =>
                                                            handlePermissionToggle(permission.id)
                                                        }
                                                        className='checkbox checkbox-sm mt-0.5'
                                                    />
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='mb-1'>
                                                            <span className='text-sm font-medium text-gray-900'>
                                                                {permission.description ||
                                                                    permission.name}
                                                            </span>
                                                        </div>
                                                        <div className='flex items-center gap-2 mt-1'>
                                                            <span className='text-xs text-gray-500'>
                                                                {permission.name}
                                                            </span>
                                                            <span className='text-gray-300'>•</span>
                                                            <span className='text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded'>
                                                                {permission.slug}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))
                                        ) : (
                                            <div className='text-sm text-gray-500 text-center py-4'>
                                                Нет доступных разрешений
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                )}

                {!showComingSoon && (
                    <ConfirmDialog
                        isOpen={isConfirmOpen}
                        onClose={() => setIsConfirmOpen(false)}
                        onConfirm={confirmDelete}
                        title='Удаление роли'
                        message='Вы уверены, что хотите удалить эту роль? Это действие нельзя отменить.'
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

export default Roles
