export const translations = {
    menu: {
        dashboard: 'Главная',
        products: 'Продукты',
        users: 'Пользователи',
        permissions: 'Разрешения',
        roles: 'Роли',
        material_types: 'Типы материалов',
        materials: 'Материалы',
        companies: 'Компании',
        sales: 'Продажи',
        payments: 'Платежи',
        expances: 'Расходы',
        workers: 'Работники',
        salaries: 'Зарплаты',
        settings: 'Справочник',
    },
    actions: {
        list: 'Список',
        create: 'Создать',
        update: 'Редактировать',
        delete: 'Удалить',
        save: 'Сохранить',
        cancel: 'Отменить',
        edit: 'Изменить',
        view: 'Просмотр',
        search: 'Поиск',
        title: 'Действия и уведомления',
        description: 'История действий и системных уведомлений',
        markAllRead: 'Отметить все как прочитанные',
        noActions: 'Нет уведомлений',
    },
    common: {
        loading: 'Загрузка...',
        error: 'Ошибка',
        success: 'Успешно',
        confirm: 'Подтвердить',
        yes: 'Да',
        no: 'Нет',
        logout: 'Выйти',
    },
}

export const t = (key, defaultValue = '') => {
    const keys = key.split('.')
    let value = translations

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k]
        } else {
            return defaultValue || key
        }
    }

    return typeof value === 'string' ? value : defaultValue || key
}

export default translations
