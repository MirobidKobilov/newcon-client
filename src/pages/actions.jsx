import { useState, useEffect } from 'react'
import Layout from '../layout/layout'
import { t } from '../utils/translations'
import { api } from '../utils/api'
import Pagination from '../components/UI/Pagination'

const Actions = () => {
    const [actions, setActions] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const fetchActions = async (currentPage = page, pageSize = size) => {
        try {
            setLoading(true)
            const response = await api('get', { page: currentPage, size: pageSize }, '/actions/list')
            if (response.status === 200 || response.success) {
                setActions(response.data.data || [])
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
        } catch (error) {
            console.error('Error fetching actions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActions(page, size)
    }, [page, size])

    const getActionTypeLabel = (actionTypeId) => {
        const labels = {
            1: 'Пользователь создан',
            2: 'Пользователь обновлен',
            3: 'Пользователь удален',
            4: 'Пользователь восстановлен',
            5: 'Пользователь удален навсегда',
            6: 'Продукт создан',
            7: 'Продукт обновлен',
            8: 'Продукт удален',
            9: 'Продукт восстановлен',
            10: 'Продукт удален навсегда',
            11: 'Материал создан',
            12: 'Материал обновлен',
            13: 'Материал удален',
            14: 'Оплата создана',
            15: 'Оплата обновлена',
        }
        return labels[actionTypeId] || 'Действие'
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diff = Math.floor((now - date) / 1000)

        if (diff < 60) return 'только что'
        if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
        if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
        return date.toLocaleDateString('ru-RU')
    }

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('actions.title', 'Действия')}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {t('actions.description', 'История действий')}
                        </p>
                    </div>
                </div>

                {/* Actions List */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-500">
                                {t('common.loading', 'Загрузка...')}
                            </p>
                        </div>
                    ) : actions.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">🔔</div>
                            <p className="text-slate-500">
                                {t('actions.noActions', 'Нет уведомлений')}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-200">
                            {actions.map((action) => (
                                <div
                                    key={action.id}
                                    className="p-4 hover:bg-gray-50 transition-all duration-200"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {action.message ||
                                                            getActionTypeLabel(
                                                                action.action_type_id
                                                            )}
                                                    </p>
                                                    {action.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {action.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {action.user?.username || 'Система'}
                                                        {action.user?.phone &&
                                                            ` (${action.user.phone})`}
                                                        {action.created_at && (
                                                            <>
                                                                {' • '}
                                                                {formatTime(action.created_at)}
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
            </div>
        </Layout>
    )
}

export default Actions
