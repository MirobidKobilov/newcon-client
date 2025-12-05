import React, { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { Context } from './context'
import Actions from './pages/actions'
import Companies from './pages/companies'
import Dashboard from './pages/dashboard'
import Expances from './pages/expances'
import Login from './pages/login'
import MaterialTypes from './pages/material_types'
import Materials from './pages/materials'
import Payments from './pages/payments'
import Permissions from './pages/permissions'
import Products from './pages/products'
import Roles from './pages/roles'
import Salaries from './pages/salaries'
import Sales from './pages/sales'
import Users from './pages/users'
import Workers from './pages/workers'
import { api } from './utils/api'

const App = () => {
    const navigate = useNavigate()

    const [userInfo, setUserInfo] = useState(null)
    const [menu, setMenu] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isLogin, setIsLogin] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (localStorage.getItem('token')) {
                setIsLogin(true)

                try {
                    const menuResponse = await api('get', {}, '/menu')
                    if (
                        menuResponse.success &&
                        menuResponse.status === 200 &&
                        menuResponse.data?.data
                    ) {
                        const data = menuResponse.data.data
                        setMenu(data.menu || {})
                        setUserInfo({
                            username: data.username,
                            phone: data.phone,
                            id: data.id,
                            roles: data.roles || [],
                            permissions: data.permissions || [],
                        })
                    } else {
                        console.error(
                            'Ошибка при получении данных:',
                            menuResponse.error,
                            'Status:',
                            menuResponse.statusCode
                        )
                    }
                } catch (error) {
                    console.error('Ошибка при получении данных:', error)
                }
            } else {
                setIsLogin(false)
                localStorage.removeItem('token')
                navigate('/login')
            }
            setLoading(false)
        }

        fetchData()
    }, [navigate])

    return (
        <Context.Provider
            value={{
                userInfo,
                setUserInfo,
                menu,
                setMenu,
                loading,
                isLogin,
                setIsLogin,
            }}
        >
            <div className='bg-[#F8F9FA]'>
                <Routes>
                    <Route path='/' element={<Dashboard />} />
                    <Route path='/users' element={<Users />} />
                    <Route path='/products' element={<Products />} />
                    <Route path='/permissions' element={<Permissions />} />
                    <Route path='/roles' element={<Roles />} />
                    <Route path='/material_types' element={<MaterialTypes />} />
                    <Route path='/materials' element={<Materials />} />
                    <Route path='/companies' element={<Companies />} />
                    <Route path='/sales' element={<Sales />} />
                    <Route path='/payments' element={<Payments />} />
                    <Route path='/expances' element={<Expances />} />
                    <Route path='/workers' element={<Workers />} />
                    <Route path='/salaries' element={<Salaries />} />
                    <Route path='/actions' element={<Actions />} />
                    <Route path='/login' element={<Login />} />
                </Routes>
            </div>
        </Context.Provider>
    )
}

export default App
