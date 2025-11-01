import React, { useState, useEffect } from 'react'
import Layout from '../layout/layout'
import { api } from '../utils/api'
import Input from '../components/UI/Input'
import Select from '../components/UI/Select'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import SuccessModal from '../components/UI/SuccessModal'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [roles, setRoles] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingUserId, setEditingUserId] = useState(null)
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        password: '',
        role: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingUserId, setDeletingUserId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [viewMode, setViewMode] = useState('table')

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            const response = await api('get', {}, '/users/list')
            if (response?.data) {
                setUsers(response.data.data)
            }
            setLoading(false)
        }
        fetchUsers()
    }, [])

    useEffect(() => {
        const fetchRoles = async () => {
            const response = await api('get', {}, '/roles/list')
            if (response?.data) {
                setRoles(response.data.data || [])
            }
        }
        fetchRoles()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleRoleChange = (roleId) => {
        setFormData((prev) => ({
            ...prev,
            role: roleId,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        const payload = {
            username: formData.username,
            phone: formData.phone,
            role: [formData.role],
        }

        // Добавляем password только если он не пустой
        if (formData.password !== '') {
            payload.password = formData.password
        }

        let response
        if (isEditMode) {
            response = await api('put', payload, `/users/update/${editingUserId}`)
        } else {
            response = await api('post', payload, '/users/create')
        }

        if (response?.data) {
            const usersResponse = await api('get', {}, '/users/list')
            if (usersResponse?.data) {
                setUsers(usersResponse.data.data)
            }

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingUserId(null)
            setFormData({
                username: '',
                phone: '',
                password: '',
                role: '',
            })

            setSuccessMessage(
                isEditMode ? 'Пользователь успешно обновлен' : 'Пользователь успешно создан'
            )
            setIsSuccessOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (user) => {
        setIsEditMode(true)
        setEditingUserId(user.id)
        setFormData({
            username: user.username,
            phone: user.phone || '',
            password: '',
            role: user.roles && user.roles.length > 0 ? user.roles[0] : '',
        })
        setIsModalOpen(true)
    }

    const handleDelete = (userId) => {
        setDeletingUserId(userId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        const response = await api('delete', {}, `/users/delete/${deletingUserId}`)

        if (response?.data) {
            const usersResponse = await api('get', {}, '/users/list')
            if (usersResponse?.data) {
                setUsers(usersResponse.data.data)
            }

            setSuccessMessage('Пользователь успешно удален')
            setIsSuccessOpen(true)
        }

        setDeleting(false)
        setIsConfirmOpen(false)
        setDeletingUserId(null)
    }

    const handleCreateNew = () => {
        setIsEditMode(false)
        setEditingUserId(null)
        setFormData({
            username: '',
            phone: '',
            password: '',
            role: '',
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

    const RoleBadge = ({ role }) => (
        <div className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
            <span className="text-xs font-semibold">{role}</span>
        </div>
    )

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="text-2xl text-slate-400">
                                NEWCON <span className="text-gray-700">/ Пользователи</span>
                            </div>
                        </div>
                        <Button onClick={handleCreateNew} variant="primary">
                            + Создать пользователя
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Пользователи</h2>
                            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        ID
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Пользователь
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Телефон
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Роли
                                    </th>
                                    <th className="text-right p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500">
                                            Загрузка...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500">
                                            Нет данных
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-200 hover:bg-gray-50"
                                        >
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-gray-700">
                                                    {user.id}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-gray-700">
                                                    {user.username}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600">
                                                    {formatUzPhoneDisplay(user.phone) || '-'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map((role, index) => (
                                                            <RoleBadge key={index} role={role} />
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-slate-400">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        onClick={() => handleEdit(user)}
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
                                                        onClick={() => handleDelete(user.id)}
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
                            ) : users.length === 0 ? (
                                <div className="text-center text-slate-500 py-12">Нет данных</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium mb-1">ID: {user.id}</div>
                                                    <h3 className="text-lg font-bold text-gray-700">{user.username}</h3>
                                                    <div className="text-sm text-slate-600 mt-1">{formatUzPhoneDisplay(user.phone) || '-'}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleEdit(user)}
                                                        variant="secondary"
                                                        className="btn-sm btn-circle"
                                                        title="Редактировать"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(user.id)}
                                                        variant="secondary"
                                                        className="btn-sm btn-circle hover:bg-red-50"
                                                        title="Удалить"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-600">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <div className="text-xs text-slate-400 font-medium uppercase mb-1">Роли</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map((role, index) => (
                                                            <span key={index} className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-semibold">{role}</span>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-slate-400">-</span>
                                                    )}
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
                    title={isEditMode ? 'Редактирование пользователя' : 'Создание пользователя'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Input
                                label="Имя пользователя"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Введите имя пользователя"
                                required
                            />

                            <Input
                                label="Номер телефона"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                maskType="uz-phone"
                                placeholder="+998 (90) 123-45-67"
                                required
                            />

                            <Input
                                label={
                                    isEditMode
                                        ? 'Пароль (оставьте пустым, если не хотите менять)'
                                        : 'Пароль'
                                }
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Введите пароль"
                                required={!isEditMode}
                            />

                            <Select
                                label="Роль"
                                options={roles.map((role) => ({
                                    value: role.id,
                                    label: role.name,
                                }))}
                                value={formData.role}
                                onChange={handleRoleChange}
                                placeholder="Выберите роль"
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
                    title="Удаление пользователя"
                    message="Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить."
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

export default Users