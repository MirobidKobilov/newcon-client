import React, { useEffect, useState } from 'react'
import Dashboard from './pages/dashboard'
import Users from './pages/users'
import Products from './pages/products'
import Permissions from './pages/permissions'
import Roles from './pages/roles'
import MaterialTypes from './pages/material_types'
import Materials from './pages/materials'
import Companies from './pages/companies'
import Sales from './pages/sales'
import Payments from './pages/payments'
import Expances from './pages/expances'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/login'
import { Context } from './context'
import { api } from './utils/api'

const App = () => {
    const navigate = useNavigate()

    const [userInfo, setUserInfo] = useState(null)
    const [menu, setMenu] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isLogin, setIsLogin] = useState(false)

    useEffect(() => {
        const fetchMenu = async () => {
            if (localStorage.getItem('token')) {
                setIsLogin(true)

                try {
                    const menuResponse = await api('get', {}, '/menu')
                    if (menuResponse.status === 200 && menuResponse.data.data) {
                        setMenu(menuResponse.data.data)
                    }
                } catch (menuError) {
                    console.error('Ошибка при получении меню:', menuError)
                }
            } else {
                setIsLogin(false)
                localStorage.removeItem('token')
                navigate('/login')
            }
        }

        fetchMenu()
    }, [navigate])

    return (
        <Context.Provider
            value={{ userInfo, setUserInfo, menu, setMenu, loading, isLogin, setIsLogin }}
        >
            <div className="bg-[#F8F9FA]">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/permissions" element={<Permissions />} />
                    <Route path="/roles" element={<Roles />} />
                    <Route path="/material_types" element={<MaterialTypes />} />
                    <Route path="/materials" element={<Materials />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/expances" element={<Expances />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Context.Provider>
    )
}

export default App
