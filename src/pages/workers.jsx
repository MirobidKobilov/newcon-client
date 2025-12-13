import React, { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import DatePicker from '../components/UI/DatePicker'
import ErrorModal from '../components/UI/ErrorModal'
import Input from '../components/UI/Input'
import Modal from '../components/UI/Modal'
import Pagination from '../components/UI/Pagination'
import SuccessModal from '../components/UI/SuccessModal'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Workers = () => {
    const [workers, setWorkers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingWorkerId, setEditingWorkerId] = useState(null)
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        position: '',
        address: '',
        date_of_birth: '',
        salary: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingWorkerId, setDeletingWorkerId] = useState(null)
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

    const fetchWorkers = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const response = await api('get', { page: currentPage, size: pageSize }, '/workers/list')
        if (response.success && response.data) {
            setWorkers(response.data.data || [])
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
                message: response.error || 'Ошибка при загрузке работников',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchWorkers(page, size)
    }, [page, size])

    const formatDateInput = (value) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '')

        // Limit to 8 digits (yyyyMMdd)
        const limited = digits.slice(0, 8)

        // Format as yyyy-mm-dd
        if (limited.length <= 4) {
            return limited
        } else if (limited.length <= 6) {
            return `${limited.slice(0, 4)}-${limited.slice(4)}`
        } else {
            return `${limited.slice(0, 4)}-${limited.slice(4, 6)}-${limited.slice(6, 8)}`
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Auto-format date_of_birth field
        if (name === 'date_of_birth') {
            const formatted = formatDateInput(value)
            setFormData((prev) => ({
                ...prev,
                [name]: formatted,
            }))
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
        setError(null)

        // Validate date_of_birth format (yyyy-mm-dd)
        if (formData.date_of_birth) {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/
            if (!datePattern.test(formData.date_of_birth)) {
                setError({
                    message: 'Дата рождения должна быть в формате yyyy-mm-dd',
                    statusCode: 400,
                    errors: { date_of_birth: ['Формат должен быть yyyy-mm-dd'] },
                })
                setIsErrorOpen(true)
                setSubmitting(false)
                return
            }
        }

        const payload = {
            full_name: formData.full_name,
            phone: formData.phone,
            position: formData.position || null,
            address: formData.address || null,
            date_of_birth: String(formData.date_of_birth),
            salary: formData.salary ? Number(formData.salary) : null,
        }

        let response
        if (isEditMode) {
            response = await api('put', payload, `/workers/update/${editingWorkerId}`)
        } else {
            response = await api('post', payload, '/workers/create')
        }

        if (response.success && response.data) {
            await fetchWorkers(page, size)

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingWorkerId(null)
            setFormData({
                full_name: '',
                phone: '',
                position: '',
                address: '',
                date_of_birth: '',
                salary: '',
            })

            setSuccessMessage(isEditMode ? 'Работник успешно обновлен' : 'Работник успешно создан')
            setIsSuccessOpen(true)
        } else {
            setError({
                message:
                    response.error ||
                    (isEditMode
                        ? 'Ошибка при обновлении работника'
                        : 'Ошибка при создании работника'),
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (worker) => {
        setIsEditMode(true)
        setEditingWorkerId(worker.id)
        setFormData({
            full_name: worker.full_name || '',
            phone: worker.phone || '',
            position: worker.position || '',
            address: worker.address || '',
            date_of_birth: worker.date_of_birth || '',
            salary: worker.salary ? String(worker.salary) : '',
        })
        setIsModalOpen(true)
    }

    const handleDelete = (workerId) => {
        setDeletingWorkerId(workerId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        setError(null)
        const response = await api('delete', {}, `/workers/delete/${deletingWorkerId}`)

        if (response.success && response.data) {
            await fetchWorkers(page, size)

            setSuccessMessage('Работник успешно удален')
            setIsSuccessOpen(true)
        } else {
            setError({
                message: response.error || 'Ошибка при удалении работника',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }

        setDeleting(false)
        setIsConfirmOpen(false)
        setDeletingWorkerId(null)
    }

    const handleCreateNew = () => {
        setIsEditMode(false)
        setEditingWorkerId(null)
        setFormData({
            full_name: '',
            phone: '',
            position: '',
            address: '',
            date_of_birth: '',
            salary: '',
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

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return dateString
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            return `${day}-${month}-${year}`
        } catch {
            return dateString
        }
    }

    const formatSalary = (salary) => {
        if (!salary) return '-'
        return new Intl.NumberFormat('ru-RU').format(salary) + ' $'
    }

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6'>
                <div className='mb-4 sm:mb-6'>
                    <div className='mb-6 flex justify-end'>
                        <Button
                            onClick={handleCreateNew}
                            variant='primary'
                            className='w-full sm:w-auto text-sm px-3 py-2 min-h-[40px] md:text-sm md:px-3 md:py-2 md:min-h-[40px]'
                        >
                            + Создать работника
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4 sm:mb-4 sm:mb-6'>
                    <div className='p-3 sm:p-4 md:p-6 border-b border-slate-200'>
                        <div className='flex items-center justify-between mb-3 sm:mb-4'>
                            <h2 className='text-base sm:text-lg font-bold text-gray-700'>
                                Работники
                            </h2>
                            <div className='hidden md:flex gap-1 sm:gap-2 bg-gray-100 p-0.5 sm:p-1 rounded-lg'>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                        viewMode === 'table'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Таблица
                                </button>
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
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
                                            ФИО
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Телефон
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Должность
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Адрес
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Дата рождения
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Зарплата
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
                                                colSpan='8'
                                                className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                            >
                                                Загрузка...
                                            </td>
                                        </tr>
                                    ) : workers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan='8'
                                                className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                            >
                                                Нет данных
                                            </td>
                                        </tr>
                                    ) : (
                                        workers.map((worker) => (
                                            <tr
                                                key={worker.id}
                                                className='border-b border-slate-200 hover:bg-gray-50'
                                            >
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                        {worker.id}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                        {worker.full_name || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm text-slate-600'>
                                                        {formatUzPhoneDisplay(worker.phone) || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm text-slate-600'>
                                                        {worker.position || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm text-slate-600'>
                                                        {worker.address || '-'}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-xs sm:text-sm text-slate-600'>
                                                        {formatDate(worker.date_of_birth)}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='text-sm font-semibold text-gray-700'>
                                                        {formatSalary(worker.salary)}
                                                    </div>
                                                </td>
                                                <td className='p-2 sm:p-3 md:p-4'>
                                                    <div className='flex gap-1 sm:gap-2 justify-end'>
                                                        <Button
                                                            onClick={() => handleEdit(worker)}
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
                                                            onClick={() => handleDelete(worker.id)}
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
                                <div className='text-center text-slate-500 py-12'>Загрузка...</div>
                            ) : workers.length === 0 ? (
                                <div className='text-center text-slate-500 py-12'>Нет данных</div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {workers.map((worker) => (
                                        <div
                                            key={worker.id}
                                            className='bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow'
                                        >
                                            <div className='flex justify-between items-start mb-3'>
                                                <div>
                                                    <div className='text-xs text-slate-400 font-medium mb-1'>
                                                        ID: {worker.id}
                                                    </div>
                                                    <h3 className='text-base sm:text-lg font-bold text-gray-700'>
                                                        {worker.full_name || '-'}
                                                    </h3>
                                                    <div className='text-xs sm:text-sm text-slate-600 mt-1'>
                                                        {formatUzPhoneDisplay(worker.phone) || '-'}
                                                    </div>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <Button
                                                        onClick={() => handleEdit(worker)}
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
                                                        onClick={() => handleDelete(worker.id)}
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
                                            <div className='mt-4 space-y-2'>
                                                <div>
                                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                        Должность
                                                    </div>
                                                    <div className='text-sm text-gray-700'>
                                                        {worker.position || '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                        Адрес
                                                    </div>
                                                    <div className='text-sm text-gray-700'>
                                                        {worker.address || '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                        Дата рождения
                                                    </div>
                                                    <div className='text-sm text-gray-700'>
                                                        {formatDate(worker.date_of_birth)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                        Зарплата
                                                    </div>
                                                    <div className='text-sm font-semibold text-gray-700'>
                                                        {formatSalary(worker.salary)}
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
                    title={isEditMode ? 'Редактирование работника' : 'Создание работника'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className='space-y-4'>
                            <Input
                                label='ФИО'
                                type='text'
                                name='full_name'
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder='Введите ФИО'
                                required
                            />

                            <Input
                                label='Номер телефона'
                                type='tel'
                                name='phone'
                                value={formData.phone}
                                onChange={handleInputChange}
                                maskType='uz-phone'
                                placeholder='+998 (90) 123-45-67'
                                required
                            />

                            <Input
                                label='Должность'
                                type='text'
                                name='position'
                                value={formData.position}
                                onChange={handleInputChange}
                                placeholder='Введите должность'
                            />

                            <Input
                                label='Адрес'
                                type='text'
                                name='address'
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder='Введите адрес'
                            />

                            <DatePicker
                                label='Дата рождения'
                                name='date_of_birth'
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                placeholder='dd-mm-yyyy'
                                required
                                dropdownDirection='up'
                            />

                            <Input
                                label='Зарплата'
                                type='number'
                                name='salary'
                                value={formData.salary}
                                onChange={handleInputChange}
                                placeholder='Введите зарплату'
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
                    title='Удаление работника'
                    message='Вы уверены, что хотите удалить этого работника? Это действие нельзя отменить.'
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

export default Workers
