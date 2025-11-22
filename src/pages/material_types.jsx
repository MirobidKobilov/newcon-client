import React, { useState, useEffect } from 'react'
import Layout from '../layout/layout'
import { api } from '../utils/api'
import Input from '../components/UI/Input'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import SuccessModal from '../components/UI/SuccessModal'
import Pagination from '../components/UI/Pagination'

const MaterialTypes = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [viewMode, setViewMode] = useState('table')
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const fetchItems = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const response = await api('get', { page: currentPage, size: pageSize }, '/material_types/list')
        if (response?.data) {
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

        let response
        if (isEditMode) {
            response = await api('put', formData, `/material_types/update/${editingItemId}`)
        } else {
            response = await api('post', formData, '/material_types/create')
        }

        if (response?.data) {
            await fetchItems(page, size)

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingItemId(null)
            setFormData({
                name: '',
            })

            setSuccessMessage(
                isEditMode ? 'Тип материала успешно обновлен' : 'Тип материала успешно создан'
            )
            setIsSuccessOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (item) => {
        setIsEditMode(true)
        setEditingItemId(item.id)
        setFormData({
            name: item.name,
        })
        setIsModalOpen(true)
    }

    const handleDelete = (itemId) => {
        setDeletingItemId(itemId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        const response = await api('delete', {}, `/material_types/delete/${deletingItemId}`)

        if (response?.data) {
            await fetchItems(page, size)

            setSuccessMessage('Тип материала успешно удален')
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
        })
        setIsModalOpen(true)
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="text-2xl text-slate-400">
                                NEWCON <span className="text-gray-700">/ Типы материалов</span>
                            </div>
                        </div>
                        <Button onClick={handleCreateNew} variant="primary">
                            + Создать тип материала
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Типы материалов</h2>
                            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Таблица</button>
                                <button onClick={() => setViewMode('cards')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Карточки</button>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'table' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        ID
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Тип
                                    </th>
                                    <th className="text-right p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500">
                                            Загрузка...
                                        </td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500">
                                            Нет данных
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
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
                                                    {item.name}
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    )}

                    {viewMode === 'cards' && (
                        <div className="p-6">
                            {loading ? (
                                <div className="text-center text-slate-500 py-12">Загрузка...</div>
                            ) : items.length === 0 ? (
                                <div className="text-center text-slate-500 py-12">Нет данных</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium mb-1">ID: {item.id}</div>
                                                    <h3 className="text-lg font-bold text-gray-700">{item.name}</h3>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={() => handleEdit(item)} variant="secondary" className="btn-sm btn-circle" title="Редактировать">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                                    </Button>
                                                    <Button onClick={() => handleDelete(item.id)} variant="secondary" className="btn-sm btn-circle hover:bg-red-50" title="Удалить">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                    </Button>
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
                    title={isEditMode ? 'Редактирование типа материала' : 'Создание типа материала'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Input
                                label="Тип"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Введите тип"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsModalOpen(false)}
                                disabled={submitting}
                            >
                                Отмена
                            </Button>
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
                        </div>
                    </form>
                </Modal>

                <ConfirmDialog
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title="Удаление типа материала"
                    message="Вы уверены, что хотите удалить этот тип материала? Это действие нельзя отменить."
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

export default MaterialTypes
