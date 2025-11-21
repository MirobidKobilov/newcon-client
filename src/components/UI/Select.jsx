import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const Select = ({ label, required, options, value, onChange, placeholder, searchable = true }) => {
    const selectedOption = options.find((opt) => opt.value === value)
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const selectRef = useRef(null)
    const dropdownRef = useRef(null)

    const filteredOptions = searchable
        ? options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : options

    const updatePosition = () => {
        if (selectRef.current) {
            const rect = selectRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            })
        }
    }

    const handleOpen = () => {
        setIsOpen(true)
        setSearchQuery('')
        setTimeout(updatePosition, 0)
    }

    const handleClose = () => {
        setIsOpen(false)
        setSearchQuery('')
    }

    const handleSelect = (optionValue) => {
        onChange(optionValue)
        handleClose()
        document.activeElement.blur()
    }

    useEffect(() => {
        if (isOpen) {
            updatePosition()
            const handleResize = () => updatePosition()
            const handleScroll = () => updatePosition()
            window.addEventListener('resize', handleResize)
            window.addEventListener('scroll', handleScroll, true)
            return () => {
                window.removeEventListener('resize', handleResize)
                window.removeEventListener('scroll', handleScroll, true)
            }
        }
    }, [isOpen])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isOpen &&
                selectRef.current &&
                !selectRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                handleClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [isOpen])

    const dropdownContent = isOpen && (
        <div
            ref={dropdownRef}
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 max-h-72 overflow-hidden flex flex-col z-[9999]"
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
            }}
        >
            {searchable && options.length > 3 && (
                <div className="p-2 sticky top-0 bg-white border-b border-gray-200 z-10">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            autoFocus
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                    </div>
                </div>
            )}
            <ul className="p-2 max-h-60 overflow-auto">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <li key={option.value}>
                            <a
                                onClick={() => handleSelect(option.value)}
                                className={`block px-4 py-2 text-gray-800 hover:bg-slate-100 active:bg-slate-200 cursor-pointer ${
                                    value === option.value ? 'bg-teal-50 text-teal-700' : ''
                                }`}
                            >
                                {option.label}
                            </a>
                        </li>
                    ))
                ) : (
                    <li className="px-4 py-2 text-sm text-gray-400 text-center">
                        Ничего не найдено
                    </li>
                )}
            </ul>
        </div>
    )

    return (
        <div ref={selectRef} className="relative w-full">
            {label && (
                <label className="block mb-1.5">
                    <span className="text-sm font-medium text-gray-700">
                        {label} {required && <span className="text-red-500">*</span>}
                    </span>
                </label>
            )}
            <button
                type="button"
                className="btn border-gray-300 btn-outline w-full justify-between normal-case font-normal bg-white hover:bg-white active:bg-white"
                onClick={() => (isOpen ? handleClose() : handleOpen())}
            >
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-700'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="text-gray-400">▼</span>
            </button>
            {isOpen && createPortal(dropdownContent, document.body)}
        </div>
    )
}

export default Select
