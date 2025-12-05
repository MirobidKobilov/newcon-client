// Format date to dd-mm-yyyy for display
export const formatDateDDMMYYYY = (dateString) => {
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

// Format date to yyyy-mm-dd for API (backend format)
export const formatDateYYYYMMDD = (dateValue) => {
    if (!dateValue) return ''
    // If already in yyyy-mm-dd format string, return as is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue
    }
    // Otherwise, format it to yyyy-mm-dd string
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Parse dd-mm-yyyy to Date object
export const parseDDMMYYYY = (dateString) => {
    if (!dateString) return null
    const parts = dateString.split('-')
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const year = parseInt(parts[2], 10)
        const date = new Date(year, month, day)
        if (!isNaN(date.getTime())) {
            return date
        }
    }
    return null
}
