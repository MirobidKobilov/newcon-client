import { useState, useEffect } from 'react'
import Layout from '../layout/layout'
import { t } from '../utils/translations'
import { api } from '../utils/api'

const Actions = () => {
    const [actions, setActions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActions()
    }, [])

    const fetchActions = async () => {
        try {
            setLoading(true)
            const response = await api('get', {}, '/actions/list')
            if (response.status === 200) {
                setActions(response.data.data || [])
            }
        } catch (error) {
            console.error('Error fetching actions:', error)
        } finally {
            setLoading(false)
        }
    }

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
            </div>
        </Layout>
    )
}

export default Actions
