import { useState } from 'react'

const Select = ({ label, required, options, value, onChange, placeholder, searchable = true }) => {
    const selectedOption = options.find((opt) => opt.value === value)
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const filteredOptions = searchable
        ? options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : options

    const handleOpen = () => {
        setIsOpen(true)
        setSearchQuery('')
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

    return (
        <div>
            {label && (
                <label className="block mb-1.5">
                    <span className="text-sm font-medium text-gray-700">
                        {label} {required && <span className="text-red-500">*</span>}
                    </span>
                </label>
            )}
            <div className={`dropdown dropdown-bottom w-full ${isOpen ? 'dropdown-open' : ''}`}>
                <label
                    tabIndex={0}
                    className="btn border-gray-300 btn-outline w-full justify-between normal-case font-normal bg-white hover:bg-white active:bg-white"
                    onClick={() => (isOpen ? handleClose() : handleOpen())}
                >
                    <span className={selectedOption ? 'text-gray-900' : 'text-gray-700'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <span className="text-gray-400">▼</span>
                </label>
                <div
                    tabIndex={0}
                    className="dropdown-content menu p-0 shadow bg-white rounded-box w-full mt-1 max-h-72 overflow-hidden flex-nowrap z-50"
                >
                    {searchable && options.length > 3 && (
                        <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Поиск..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
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
                                        className={`text-gray-800 hover:bg-slate-100 active:bg-slate-200 ${
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
            </div>
        </div>
    )
}

export default Select
