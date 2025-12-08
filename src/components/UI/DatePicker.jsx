import React, { useEffect, useRef, useState } from 'react'

const DatePicker = ({
    label,
    required,
    value,
    onChange,
    name,
    placeholder,
    className = '',
    dropdownDirection = 'down',
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [displayValue, setDisplayValue] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const calendarRef = useRef(null)

    const formatDateDDMMYYYY = (date) => {
        if (!date || isNaN(date.getTime())) return ''
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
    }

    const formatDateYYYYMMDD = (date) => {
        if (!date || isNaN(date.getTime())) return ''
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Parse value (can be yyyy-mm-dd or dd-mm-yyyy)
    useEffect(() => {
        if (value) {
            let date
            // Try parsing as yyyy-mm-dd first (API format)
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                const [year, month, day] = value.split('-')
                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            }
            // Try parsing as dd-mm-yyyy (display format)
            else if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
                const [day, month, year] = value.split('-')
                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            }

            if (date && !isNaN(date.getTime())) {
                setSelectedDate(date)
                setDisplayValue(formatDateDDMMYYYY(date))
                setCurrentMonth(date.getMonth())
                setCurrentYear(date.getFullYear())
            } else {
                setSelectedDate(null)
                setDisplayValue('')
            }
        } else {
            setSelectedDate(null)
            setDisplayValue('')
        }
    }, [value])

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleInputChange = (e) => {
        const inputValue = e.target.value
        // Allow only digits and dashes
        const cleaned = inputValue.replace(/[^\d-]/g, '')

        // Format as dd-mm-yyyy while typing
        let formatted = cleaned.replace(/\D/g, '')
        if (formatted.length > 0) {
            if (formatted.length <= 2) {
                formatted = formatted
            } else if (formatted.length <= 4) {
                formatted = `${formatted.slice(0, 2)}-${formatted.slice(2)}`
            } else {
                formatted = `${formatted.slice(0, 2)}-${formatted.slice(2, 4)}-${formatted.slice(
                    4,
                    8
                )}`
            }
        }

        setDisplayValue(formatted)

        // Try to parse and validate
        if (formatted.length === 10) {
            const [day, month, year] = formatted.split('-')
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            if (
                !isNaN(date.getTime()) &&
                parseInt(day) === date.getDate() &&
                parseInt(month) === date.getMonth() + 1 &&
                parseInt(year) === date.getFullYear()
            ) {
                setSelectedDate(date)
                const yyyyMMdd = formatDateYYYYMMDD(date)
                if (onChange) {
                    onChange({ target: { name, value: yyyyMMdd } })
                }
            }
        }
    }

    const handleDateSelect = (day) => {
        const date = new Date(currentYear, currentMonth, day)
        setSelectedDate(date)
        setDisplayValue(formatDateDDMMYYYY(date))
        setIsOpen(false)

        const yyyyMMdd = formatDateYYYYMMDD(date)
        if (onChange) {
            onChange({ target: { name, value: yyyyMMdd } })
        }
    }

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay()
    }

    const monthNames = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
    ]

    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear)
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
        const days = []

        // Adjust for Monday as first day (0 = Sunday, 1 = Monday)
        const startDay = firstDay === 0 ? 6 : firstDay - 1

        // Empty cells for days before the first day of the month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className='w-10 h-10'></div>)
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day)
            const isSelected =
                selectedDate &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
            const isToday = date.toDateString() === new Date().toDateString()

            days.push(
                <button
                    key={day}
                    type='button'
                    onClick={() => handleDateSelect(day)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                            ? 'bg-blue-600 text-white'
                            : isToday
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                    {day}
                </button>
            )
        }

        return days
    }

    return (
        <div className='relative' ref={calendarRef}>
            <label className='block mb-1.5'>
                <span className='text-sm font-medium text-gray-700'>
                    {label} {required && <span className='text-red-500'>*</span>}
                </span>
            </label>
            <div className='relative'>
                <input
                    type='text'
                    name={name}
                    value={displayValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder || 'dd-mm-yyyy'}
                    className={`input input-bordered w-full border-gray-300 focus:border-gray-500 placeholder:text-gray-400 text-gray-900 bg-white ${className}`}
                    style={{ outline: 0 }}
                />
                <button
                    type='button'
                    onClick={() => setIsOpen(!isOpen)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={2}
                        stroke='currentColor'
                        className='w-5 h-5'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'
                        />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div
                    className={`absolute z-50 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 ${
                        dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
                    }`}
                >
                    {/* Calendar Header */}
                    <div className='flex items-center justify-between mb-4'>
                        <button
                            type='button'
                            onClick={handlePrevMonth}
                            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                                strokeWidth={2}
                                stroke='currentColor'
                                className='w-5 h-5'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M15.75 19.5L8.25 12l7.5-7.5'
                                />
                            </svg>
                        </button>
                        <div className='text-lg font-semibold text-gray-800'>
                            {monthNames[currentMonth]} {currentYear}
                        </div>
                        <button
                            type='button'
                            onClick={handleNextMonth}
                            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                                strokeWidth={2}
                                stroke='currentColor'
                                className='w-5 h-5'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M8.25 4.5l7.5 7.5-7.5 7.5'
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className='grid grid-cols-7 gap-1 mb-2'>
                        {dayNames.map((day) => (
                            <div
                                key={day}
                                className='text-center text-xs font-medium text-gray-500 py-1'
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className='grid grid-cols-7 gap-1'>{renderCalendar()}</div>

                    {/* Today Button */}
                    <div className='mt-4 pt-4 border-t border-gray-200'>
                        <button
                            type='button'
                            onClick={() => {
                                const today = new Date()
                                handleDateSelect(today.getDate())
                                setCurrentMonth(today.getMonth())
                                setCurrentYear(today.getFullYear())
                            }}
                            className='w-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                        >
                            Сегодня
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DatePicker
