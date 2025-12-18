import React, { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import ErrorModal from '../components/UI/ErrorModal'
import Modal from '../components/UI/Modal'
import Pagination from '../components/UI/Pagination'
import Select from '../components/UI/Select'
import SuccessModal from '../components/UI/SuccessModal'
import Layout from '../layout/layout'
import { api } from '../utils/api'

const Salaries = () => {
    const [salaries, setSalaries] = useState([])
    const [workers, setWorkers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingSalaryId, setEditingSalaryId] = useState(null)
    const [formData, setFormData] = useState({
        worker_id: '',
        salary: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deletingSalaryId, setDeletingSalaryId] = useState(null)
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

    const fetchSalaries = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const response = await api('get', { index: currentPage, size: pageSize }, '/salaries/list')
        if (response.success && response.data) {
            // Handle response structure with worker_salaries array
            const salariesData = response.data.worker_salaries || response.data.data || []
            setSalaries(salariesData)
            // Handle pagination metadata
            if (response.data.total !== undefined) {
                setTotalItems(response.data.total)
                setTotalPages(Math.ceil(response.data.total / pageSize))
            } else if (response.data.meta) {
                setTotalItems(response.data.meta.total || 0)
                setTotalPages(response.data.meta.last_page || 1)
            } else {
                setTotalItems(salariesData.length)
                setTotalPages(1)
            }
        } else {
            setError({
                message: response.error || 'Ошибка при загрузке зарплат',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }
        setLoading(false)
    }

    const fetchWorkers = async () => {
        const response = await api('get', {}, '/workers/list')
        if (response.success && response.data) {
            setWorkers(response.data.data || [])
        } else {
            setError({
                message: response.error || 'Ошибка при загрузке работников',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            await fetchSalaries(page, size)
            await fetchWorkers()
            setLoading(false)
        }
        fetchData()
    }, [page, size])

    const formatNumber = (num) => {
        if (num === null || num === undefined || num === '') return ''
        const numStr = String(num).trim()
        if (numStr === '') return ''

        // Проверяем, заканчивается ли строка на точку
        const endsWithDot = numStr.endsWith('.')

        // Разделяем на целую и дробную части
        const parts = numStr.split('.')
        let integerPart = parts[0] || ''
        const decimalPart = parts.length > 1 ? parts[1] : ''

        // Если целая часть пустая и есть точка, используем '0'
        if (integerPart === '' && (endsWithDot || decimalPart !== '')) {
            integerPart = '0'
        }

        // Проверяем валидность целой части (должна содержать только цифры)
        if (integerPart !== '' && !/^\d+$/.test(integerPart)) {
            return ''
        }

        // Проверяем валидность дробной части (должна содержать только цифры или быть пустой)
        if (decimalPart !== '' && !/^\d*$/.test(decimalPart)) {
            return ''
        }

        // Если целая часть все еще пустая, возвращаем пустую строку
        if (integerPart === '') {
            return ''
        }

        // Форматируем целую часть с пробелами
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

        // Объединяем с дробной частью или точкой
        if (endsWithDot || decimalPart !== '') {
            return `${formattedInteger}.${decimalPart}`
        }
        return formattedInteger
    }

    const formatPriceInput = (value) => {
        // Убираем все недопустимые символы, кроме цифр и точки
        let cleaned = value.replace(/[^\d.]/g, '')

        // Разрешаем только одну точку
        const parts = cleaned.split('.')
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('')
        }

        // Форматируем число
        return formatNumber(cleaned)
    }

    const parseFormattedNumber = (str) => {
        // Убираем только пробелы, сохраняя точку
        return str.replace(/\s/g, '')
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Auto-format salary field
        if (name === 'salary') {
            // Форматируем введенное значение
            const formattedValue = formatPriceInput(value)
            const numericValue = parseFormattedNumber(formattedValue)
            // Allow numbers with optional decimal point and decimal digits
            // Also allow empty string for clearing the field
            // Allow numbers ending with dot (e.g., "123.")
            if (numericValue === '' || /^\d+\.?$|^\d+\.\d+$/.test(numericValue)) {
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

    const handleWorkerChange = (workerId) => {
        setFormData((prev) => ({
            ...prev,
            worker_id: workerId,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const payload = {
            worker_id: parseInt(formData.worker_id),
            salary: formData.salary ? parseFloat(parseFormattedNumber(formData.salary)) : null,
        }

        let response
        if (isEditMode) {
            response = await api('put', payload, `/salaries/update/${editingSalaryId}`)
        } else {
            response = await api('post', payload, '/salaries/create')
        }

        if (response.success && response.data) {
            await fetchSalaries(page, size)

            setIsModalOpen(false)
            setIsEditMode(false)
            setEditingSalaryId(null)
            setFormData({
                worker_id: '',
                salary: '',
            })

            setSuccessMessage(
                isEditMode ? 'Зарплата успешно обновлена' : 'Зарплата успешно создана'
            )
            setIsSuccessOpen(true)
        } else {
            setError({
                message:
                    response.error ||
                    (isEditMode
                        ? 'Ошибка при обновлении зарплаты'
                        : 'Ошибка при создании зарплаты'),
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }

        setSubmitting(false)
    }

    const handleEdit = (salary) => {
        setIsEditMode(true)
        setEditingSalaryId(salary.id)
        setFormData({
            worker_id: salary.worker_id || salary.worker?.id || '',
            salary: salary.salary ? String(salary.salary) : '',
        })
        setIsModalOpen(true)
    }

    const handleDelete = (salaryId) => {
        setDeletingSalaryId(salaryId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        setError(null)
        const response = await api('delete', {}, `/salaries/delete/${deletingSalaryId}`)

        if (response.success && response.data) {
            await fetchSalaries(page, size)

            setSuccessMessage('Зарплата успешно удалена')
            setIsSuccessOpen(true)
        } else {
            setError({
                message: response.error || 'Ошибка при удалении зарплаты',
                statusCode: response.statusCode,
                errors: response.errors,
            })
            setIsErrorOpen(true)
        }

        setDeleting(false)
        setIsConfirmOpen(false)
        setDeletingSalaryId(null)
    }

    const handleCreateNew = () => {
        setIsEditMode(false)
        setEditingSalaryId(null)
        setFormData({
            worker_id: '',
            salary: '',
        })
        setIsModalOpen(true)
    }

    const formatSalary = (salary) => {
        if (!salary) return '-'
        const numSalary = typeof salary === 'string' ? parseFloat(salary) : salary
        return new Intl.NumberFormat('ru-RU').format(numSalary) + ' $'
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

    return (
        <Layout>
            <div className='min-h-screen bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6'>
                <div className='mb-4 sm:mb-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6'>
                        <div>
                            <div className='text-lg sm:text-xl md:text-2xl text-slate-400'>
                                NEWCON <span className='text-gray-700'>/ Зарплаты</span>
                            </div>
                        </div>
                        <Button
                            onClick={handleCreateNew}
                            variant='primary'
                            className='w-full sm:w-auto text-sm px-3 py-2 min-h-[40px] md:text-sm md:px-3 md:py-2 md:min-h-[40px]'
                        >
                            + Создать зарплату
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4 sm:mb-4 sm:mb-6 overflow-hidden'>
                    <div className='p-3 sm:p-4 md:p-6 border-b border-slate-200'>
                        <div className='flex items-center justify-between mb-3 sm:mb-4'>
                            <h2 className='text-base sm:text-lg font-bold text-gray-700'>
                                Зарплаты
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
                                            Работник
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Телефон
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Должность
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Зарплата
                                        </th>
                                        <th className='text-left p-2 sm:p-3 md:p-4 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase'>
                                            Дата создания
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
                                                colSpan='7'
                                                className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                            >
                                                Загрузка...
                                            </td>
                                        </tr>
                                    ) : salaries.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan='7'
                                                className='p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm'
                                            >
                                                Нет данных
                                            </td>
                                        </tr>
                                    ) : (
                                        salaries.map((salary) => {
                                            const worker =
                                                salary.worker ||
                                                workers.find((w) => w.id === salary.worker_id)
                                            return (
                                                <tr
                                                    key={salary.id}
                                                    className='border-b border-slate-200 hover:bg-gray-50'
                                                >
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                            {salary.id}
                                                        </div>
                                                    </td>
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='text-xs sm:text-sm font-bold text-gray-700'>
                                                            {worker?.full_name || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='text-xs sm:text-sm text-slate-600'>
                                                            {worker?.phone || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='text-xs sm:text-sm text-slate-600'>
                                                            {worker?.position || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='text-sm font-semibold text-gray-700'>
                                                            {formatSalary(salary.salary)}
                                                        </div>
                                                    </td>
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='text-xs sm:text-sm text-slate-600'>
                                                            {formatDate(salary.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className='p-2 sm:p-3 md:p-4'>
                                                        <div className='flex gap-1 sm:gap-2 justify-end'>
                                                            <Button
                                                                onClick={() => handleEdit(salary)}
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
                                                                    handleDelete(salary.id)
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
                            ) : salaries.length === 0 ? (
                                <div className='text-center text-slate-500 py-12'>Нет данных</div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {salaries.map((salary) => {
                                        const worker =
                                            salary.worker ||
                                            workers.find((w) => w.id === salary.worker_id)
                                        return (
                                            <div
                                                key={salary.id}
                                                className='bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow'
                                            >
                                                <div className='flex justify-between items-start mb-3'>
                                                    <div>
                                                        <div className='text-xs text-slate-400 font-medium mb-1'>
                                                            ID: {salary.id}
                                                        </div>
                                                        <h3 className='text-base sm:text-lg font-bold text-gray-700'>
                                                            {worker?.full_name || '-'}
                                                        </h3>
                                                        <div className='text-xs sm:text-sm text-slate-600 mt-1'>
                                                            {worker?.phone || '-'}
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <Button
                                                            onClick={() => handleEdit(salary)}
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
                                                            onClick={() => handleDelete(salary.id)}
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
                                                            {worker?.position || '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                            Зарплата
                                                        </div>
                                                        <div className='text-sm font-semibold text-gray-700'>
                                                            {formatSalary(salary.salary)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-slate-400 font-medium uppercase mb-1'>
                                                            Дата создания
                                                        </div>
                                                        <div className='text-sm text-gray-700'>
                                                            {formatDate(salary.created_at)}
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
                    title={isEditMode ? 'Редактирование зарплаты' : 'Создание зарплаты'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className='space-y-4'>
                            <Select
                                label='Работник'
                                required
                                options={(workers || []).map((w) => ({
                                    value: w.id,
                                    label: w.full_name || `ID: ${w.id}`,
                                }))}
                                value={formData.worker_id}
                                onChange={handleWorkerChange}
                                placeholder='Выберите работника'
                                searchable={true}
                            />

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Зарплата <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='salary'
                                    value={formData.salary ? formatNumber(formData.salary) : ''}
                                    onChange={handleInputChange}
                                    placeholder='Введите зарплату'
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
                                    required
                                />
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

                <ConfirmDialog
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title='Удаление зарплаты'
                    message='Вы уверены, что хотите удалить эту зарплату? Это действие нельзя отменить.'
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

export default Salaries
