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
        return response
    } catch (error) {
        if (
            error.response &&
            error.response.status === 401 &&
            window.location.pathname !== '/login'
        ) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }

        return error.response || error
    }
}

export { api }