import axios from 'axios'

const api_url = import.meta.env.VITE_API_URL

const api = async (method = 'get', data = {}, path = '', contentType = 'application/json') => {
    try {
        if (!path || path.includes('undefined')) {
            throw new Error('Invalid path provided')
        }

        const url = `${api_url}${path}`
        const token = localStorage.getItem('token')
        const headers = {
            'Content-Type': contentType,
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        const config = {
            method: method.toLowerCase(),
            url,
            headers,
        }

        if (method.toLowerCase() === 'get') {
            config.params = data
        } else {
            config.data = data
        }

        const response = await axios(config)
        return {
            success: true,
            status: response.status,
            data: response.data,
            response: response,
        }
    } catch (error) {
        // Handle 401 unauthorized - redirect to login
        if (
            error.response &&
            error.response.status === 401 &&
            window.location.pathname !== '/login'
        ) {
            localStorage.removeItem('token')
            window.location.href = '/login'
            return {
                success: false,
                status: 401,
                data: null,
                error: error.response?.data?.message || 'Авторизация не пройдена',
                statusCode: 401,
                response: error.response,
            }
        }

        // Extract error message from response
        let errorMessage = 'Произошла ошибка при выполнении запроса'
        let statusCode = null
        let errorDetails = null

        if (error.response) {
            statusCode = error.response.status
            const errorData = error.response.data

            if (errorData) {
                // Check for validation errors object (Laravel-style)
                if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
                    // This is a validation errors object with field-specific errors
                    errorDetails = errorData.errors
                    // Use the main message if available, otherwise format errors
                    if (errorData.message) {
                        errorMessage = errorData.message
                    } else {
                        // Format all validation errors
                        const allErrors = []
                        Object.keys(errorData.errors).forEach((field) => {
                            const fieldErrors = errorData.errors[field]
                            if (Array.isArray(fieldErrors)) {
                                allErrors.push(...fieldErrors)
                            } else if (typeof fieldErrors === 'string') {
                                allErrors.push(fieldErrors)
                            }
                        })
                        errorMessage = allErrors.length > 0 ? allErrors.join('\n') : 'Ошибка валидации'
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message
                } else if (errorData.error) {
                    errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error)
                } else if (errorData.detail) {
                    errorMessage = errorData.detail
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData
                } else if (errorData.errors && Array.isArray(errorData.errors)) {
                    errorMessage = errorData.errors.join(', ')
                } else if (typeof errorData === 'object') {
                    // Try to extract meaningful error from object
                    const errorKeys = Object.keys(errorData)
                    if (errorKeys.length > 0) {
                        const firstError = errorData[errorKeys[0]]
                        if (Array.isArray(firstError)) {
                            errorMessage = firstError.join(', ')
                        } else if (typeof firstError === 'string') {
                            errorMessage = firstError
                        } else {
                            errorMessage = JSON.stringify(errorData)
                        }
                    }
                }
            } else {
                // No data in response, use status text
                errorMessage = error.response.statusText || `Ошибка ${statusCode}`
            }
        } else if (error.request) {
            errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.'
        } else if (error.message) {
            errorMessage = error.message
        }

        return {
            success: false,
            status: statusCode || 0,
            data: null,
            error: errorMessage,
            errors: errorDetails, // Field-specific validation errors
            statusCode: statusCode,
            response: error.response || null,
        }
    }
}

export { api }
