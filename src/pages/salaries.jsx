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
    const [viewMode, setViewMode] = useState('table')
    const [error, setError] = useState(null)
    const [isErrorOpen, setIsErrorOpen] = useState(false)
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const fetchSalaries = async (currentPage = page, pageSize = size) => {
        setLoading(true)
        const response = await api('get', { page: currentPage, size: pageSize }, '/salaries/list')
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
        if (num === null || num === undefined || num === '' || isNaN(num)) return ''
        // Округляем до целого числа для $
        const roundedNum = Math.round(Number(num))
        return roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    const parseFormattedNumber = (str) => {
        return str.replace(/\s/g, '')
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Auto-format salary field
        if (name === 'salary') {
            const numericValue = parseFormattedNumber(value)
            // Only allow numbers
            if (numericValue === '' || /^\d+$/.test(numericValue)) {
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
            salary: formData.salary ? Number(parseFormattedNumber(formData.salary)) : null,
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
            <div className='min-h-screen bg-gray-50 p-4 lg:p-6'>
                <div className='mb-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                        <div>
                            <div className='text-2xl text-slate-400'>
                                NEWCON <span className='text-gray-700'>/ Зарплаты</span>
                            </div>
                        </div>
                        <Button onClick={handleCreateNew} variant='primary'>
                            + Создать зарплату
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm mb-6 overflow-hidden'>
                    <div className='p-6 border-b border-slate-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-bold text-gray-700'>Зарплаты</h2>
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
                                            Работник
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Телефон
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Должность
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Зарплата
                                        </th>
                                        <th className='text-left p-4 text-slate-400 text-[10px] font-bold uppercase'>
                                            Дата создания
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
                                                colSpan='7'
                                                className='p-8 text-center text-slate-500'
                                            >
                                                Загрузка...
                                            </td>
                                        </tr>
                                    ) : salaries.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan='7'
                                                className='p-8 text-center text-slate-500'
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
                                                    <td className='p-4'>
                                                        <div className='text-sm font-bold text-gray-700'>
                                                            {salary.id}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm font-bold text-gray-700'>
                                                            {worker?.full_name || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm text-slate-600'>
                                                            {worker?.phone || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm text-slate-600'>
                                                            {worker?.position || '-'}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm font-semibold text-gray-700'>
                                                            {formatSalary(salary.salary)}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm text-slate-600'>
                                                            {formatDate(salary.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='flex gap-2 justify-end'>
                                                            <Button
                                                                onClick={() => handleEdit(salary)}
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
                                                                onClick={() =>
                                                                    handleDelete(salary.id)
                                                                }
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
                                                        <h3 className='text-lg font-bold text-gray-700'>
                                                            {worker?.full_name || '-'}
                                                        </h3>
                                                        <div className='text-sm text-slate-600 mt-1'>
                                                            {worker?.phone || '-'}
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <Button
                                                            onClick={() => handleEdit(salary)}
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
                                                            onClick={() => handleDelete(salary.id)}
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
