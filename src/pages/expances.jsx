import React, { useState, useEffect } from 'react'
import Layout from '../layout/layout'
import { api } from '../utils/api'
import Input from '../components/UI/Input'
import Select from '../components/UI/Select'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'
import SuccessModal from '../components/UI/SuccessModal'

const Expances = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        reason: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true)
            const response = await api('get', {}, '/expances/list')
            if (response?.data) {
                setItems(response.data.data)
            }
            setLoading(false)
        }
        fetchItems()
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await api('get', {}, '/users/list')
            if (response?.data) {
                setUsers(response.data.data || [])
            }
        }
        fetchUsers()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleUserChange = (userId) => {
        setFormData((prev) => ({
            ...prev,
            user_id: userId,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        const response = await api('post', formData, '/expances/create')

        if (response?.data) {
            const itemsResponse = await api('get', {}, '/expances/list')
            if (itemsResponse?.data) {
                setItems(itemsResponse.data.data)
            }

            setIsModalOpen(false)
            setFormData({
                user_id: '',
                amount: '',
                reason: '',
            })

            setSuccessMessage('Расход успешно создан')
            setIsSuccessOpen(true)
        }

        setSubmitting(false)
    }

    const handleCreateNew = () => {
        setFormData({
            user_id: '',
            amount: '',
            reason: '',
        })
        setIsModalOpen(true)
    }

    // Вычисление статистики
    const totalExpenses = items.reduce((sum, item) => sum + Number(item.amount), 0)
    const totalCount = items.length

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="text-2xl text-slate-400">
                                NEWCON <span className="text-gray-700">/ Расходы</span>
                            </div>
                        </div>
                        <Button onClick={handleCreateNew} variant="primary">
                            + Создать расход
                        </Button>
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <p className="text-slate-500 text-sm font-medium mb-2">Всего расходов</p>
                        <p className="text-3xl font-bold text-gray-700">
                            {totalExpenses.toLocaleString()}{' '}
                            <span className="text-lg text-slate-400">сум</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <p className="text-slate-500 text-sm font-medium mb-2">
                            Количество транзакций
                        </p>
                        <p className="text-3xl font-bold text-gray-700">{totalCount}</p>
                    </div>
                </div>

                {/* Таблица расходов */}
                <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Расходы</h2>
                    </div>

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
                                        Причина
                                    </th>
                                    <th className="text-left p-4 text-slate-400 text-[10px] font-bold uppercase">
                                        Сумма
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">
                                            Загрузка...
                                        </td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">
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
                                                    {item.user?.username || '-'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600">
                                                    {item.user?.phone || '-'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600 max-w-xs truncate">
                                                    {item.reason || '-'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-gray-700">
                                                    {Number(item.amount).toLocaleString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Создание расхода"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Select
                                label="Пользователь"
                                options={users.map((user) => ({
                                    value: user.id,
                                    label: user.username,
                                }))}
                                value={formData.user_id}
                                onChange={handleUserChange}
                                placeholder="Выберите пользователя"
                                required
                            />
                            <Input
                                label="Сумма"
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="Введите сумму"
                                required
                            />
                            <Input
                                label="Причина"
                                type="text"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Введите причину расхода"
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
                                        Создание...
                                    </span>
                                ) : (
                                    'Создать'
                                )}
                            </Button>
                        </div>
                    </form>
                </Modal>

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

export default Expances
