import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../components/UI/Button'
import ErrorModal from '../components/UI/ErrorModal'
import Input from '../components/UI/Input'
import Modal from '../components/UI/Modal'
import Pagination from '../components/UI/Pagination'
import Select from '../components/UI/Select'
import SuccessModal from '../components/UI/SuccessModal'
import { Context } from '../context'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Expances = () => {
    const { userInfo } = useContext(Context)
    const [searchParams, setSearchParams] = useSearchParams()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        reason: '',
        type: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [viewMode, setViewMode] = useState('table')
    const [error, setError] = useState(null)
    const [isErrorOpen, setIsErrorOpen] = useState(false)
    const [filterUserId, setFilterUserId] = useState(searchParams.get('user_id') || '')
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [calculating, setCalculating] = useState(false)
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    // Check if user has calculate_expances permission
    const hasCalculateExpensesPermission =
        userInfo?.permissions?.includes('calculate_expances') || false

    const fetchItems = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const params = { page: currentPage, size: pageSize }
        if (filterUserId) {
            params.user_id = filterUserId
        }
        const response = await api('get', params, '/expances/list')
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
                message: response.error || 'Ошибка при загрузке расходов',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchItems(page, size)
    }, [filterUserId, page, size])

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await api('get', {}, '/users/list')
            if (response.success && response.data) {
                setUsers(response.data.data || [])
            } else {
                setError({
                    message: response.error || 'Ошибка при загрузке пользователей',
                    statusCode: response.statusCode,
                    errors: response.errors,
                })
                setIsErrorOpen(true)
            }
        }
        fetchUsers()
    }, [])

    useEffect(() => {
        const fetchCalculatedExpenses = async () => {
            if (!hasCalculateExpensesPermission) return

            setCalculating(true)
            const response = await api('get', {}, '/expances/calculate-expances')
            if (response.success && response.data) {
                setTotalExpenses(Number(response.data.expences_total_amount) || 0)
                setTotalCount(Number(response.data.expences_count) || 0)
            } else {
                setError({
                    message: response.error || 'Ошибка при загрузке статистики расходов',
                    statusCode: response.statusCode,
                    errors: response.errors,
                })
                setIsErrorOpen(true)
            }
            setCalculating(false)
        }
        fetchCalculatedExpenses()
    }, [hasCalculateExpensesPermission])

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

    const handleAmountChange = (e) => {
        const numericValue = e.target.value.replace(/\s/g, '')
        if (numericValue === '' || /^\d*\.?\d*$/.test(numericValue)) {
            setFormData((prev) => ({
                ...prev,
                amount: numericValue,
            }))
        }
    }

    const handleUserChange = (userId) => {
        setFormData((prev) => ({
            ...prev,
            user_id: userId,
        }))
    }

    const handleFilterUserChange = (userId) => {
        setFilterUserId(userId)
        const newSearchParams = new URLSearchParams(searchParams)
        if (userId) {
            newSearchParams.set('user_id', userId)
        } else {
            newSearchParams.delete('user_id')
        }
        setSearchParams(newSearchParams)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const submitData = {
            ...formData,
            amount: parseFloat(formData.amount) || 0,
            type: formData.type,
        }
        const response = await api('post', submitData, '/expances/create')

        if (response.success && response.data) {
            await fetchItems(page, size)

            // Обновить статистику после создания расхода
            if (hasCalculateExpensesPermission) {
                const calcResponse = await api('get', {}, '/expances/calculate-expances')
                if (calcResponse.success && calcResponse.data) {
                    setTotalExpenses(Number(calcResponse.data.expences_total_amount) || 0)
                    setTotalCount(Number(calcResponse.data.expences_count) || 0)
                }
            }

            setIsModalOpen(false)
            setFormData({
                user_id: '',
                amount: '',
                reason: '',
                type: '',
            })

            setSuccessMessage('Расход успешно создан')
            setIsSuccessOpen(true)
        } else {
            setError({
                message: response.error || 'Ошибка при создании расхода',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }

        setSubmitting(false)
    }

    const handleCreateNew = () => {
        setFormData({
            user_id: '',
            amount: '',
            reason: '',
            type: '',
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
                                NEWCON <span className='text-gray-700'>/ Расходы</span>
                            </div>
                        </div>
                        <Button
                            onClick={handleCreateNew}
                            variant='primary'
                            className='w-full sm:w-auto'
                        >
                            + Создать расход
                        </Button>
                    </div>
                </div>

                {/* Статистика - показывать только для пользователей с правом calculate_expances */}
                {hasCalculateExpensesPermission && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6'>
                        <div className='bg-white rounded-2xl shadow-sm p-6'>
                            <p className='text-slate-500 text-sm font-medium mb-2'>
                                Всего расходов
                            </p>
                            {calculating ? (
                                <p className='text-3xl font-bold text-gray-700'>
                                    <span className='loading loading-spinner loading-sm'></span>
                                </p>
                            ) : (
                                <p className='text-3xl font-bold text-gray-700'>
                                    {totalExpenses.toLocaleString()}{' '}
                                    <span className='text-lg text-slate-400'>$</span>
                                </p>
                            )}
                        </div>

                        <div className='bg-white rounded-2xl shadow-sm p-6'>
                            <p className='text-slate-500 text-sm font-medium mb-2'>
                                Количество транзакций
                            </p>
                            {calculating ? (
                                <p className='text-3xl font-bold text-gray-700'>
                                    <span className='loading loading-spinner loading-sm'></span>
                                </p>
                            ) : (
                                <p className='text-3xl font-bold text-gray-700'>{totalCount}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Таблица/Карточки расходов */}
                <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4 sm:mb-4 sm:mb-6 overflow-hidden'>
                    <div className='p-3 sm:p-4 md:p-6 border-b border-slate-200'>
                        <div className='flex flex-col gap-4'>
                            <h2 className='text-base sm:text-lg font-bold text-gray-700'>
                                Расходы
                            </h2>
                            <div className='flex flex-col sm:flex-row items-stretch sm:items-end gap-4'>
                                <div className='flex-1 max-w-full sm:max-w-xs'>
                                    <Select
                                        label='Фильтр по пользователю'
                                        options={[
                                            { value: '', label: 'Все пользователи' },
                                            ...users.map((user) => ({
                                                value: user.id,
                                                label: user.username,
                                            })),
                                        ]}
                                        value={filterUserId}
                                        onChange={handleFilterUserChange}
                                        placeholder='Выберите пользователя'
                                    />
                                </div>
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
                                            Пользователь
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Телефон
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Тип
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Описание
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Сумма
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan='6'
                                                className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                            >
                                                Загрузка...
                                            </td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan='6'
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
                                                        {item.user?.username || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm text-slate-600'>
                                                        {item.user?.phone || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm text-slate-600'>
                                                        {item.type || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm text-slate-600 max-w-xs truncate'>
                                                        {item.reason || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                        {Number(item.amount).toLocaleString()}
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
                                                    <h3 className='text-base sm:text-lg font-bold text-gray-700'>
                                                        {item.user?.username || '-'}
                                                    </h3>
                                                    <div className='text-xs sm:text-sm text-slate-600 mt-1'>
                                                        {item.user?.phone || '-'}
                                                    </div>
                                                </div>
                                                <div className='text-right'>
                                                    <div className='text-xs text-slate-400 uppercase mb-1'>
                                                        Сумма
                                                    </div>
                                                    <div className='text-gray-700 font-semibold'>
                                                        {Number(item.amount).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mb-3'>
                                                <div className='text-xs text-slate-400 uppercase mb-1'>
                                                    Тип
                                                </div>
                                                <div className='text-sm text-gray-700'>
                                                    {item.type || '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className='text-xs text-slate-400 uppercase mb-1'>
                                                    Описание
                                                </div>
                                                <div className='text-sm text-gray-700'>
                                                    {item.reason || '-'}
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
                    title='Создание расхода'
                >
                    <form onSubmit={handleSubmit}>
                        <div className='space-y-4'>
                            <Select
                                label='Пользователь'
                                options={users.map((user) => ({
                                    value: user.id,
                                    label: user.username,
                                }))}
                                value={formData.user_id}
                                onChange={handleUserChange}
                                placeholder='Выберите пользователя'
                                required
                            />
                            <Select
                                label='Тип расхода'
                                options={[
                                    { value: 'Обед', label: 'Обед' },
                                    { value: 'Расходы компании', label: 'Расходы компании' },
                                    { value: 'Личный', label: 'Личный' },
                                    { value: 'Сырье', label: 'Сырье' },
                                ]}
                                value={formData.type}
                                onChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        type: value,
                                    }))
                                }
                                placeholder='Выберите тип расхода'
                                required
                            />
                            <Input
                                label='Сумма'
                                type='text'
                                name='amount'
                                value={
                                    formData.amount !== '' &&
                                    formData.amount !== undefined &&
                                    formData.amount !== null
                                        ? formatNumber(formData.amount)
                                        : ''
                                }
                                onChange={handleAmountChange}
                                placeholder='Введите сумму'
                                required
                            />
                            <Input
                                label='Описание'
                                type='text'
                                name='reason'
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder='Введите описание расхода'
                                required
                            />
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

export default Expances
