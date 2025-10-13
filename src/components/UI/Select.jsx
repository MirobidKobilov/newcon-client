const Select = ({ label, required, options, value, onChange, placeholder }) => {
    const selectedOption = options.find((opt) => opt.value === value)

    return (
        <div>
            <label className="block mb-1.5">
                <span className="text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </span>
            </label>
            <div className="dropdown dropdown-bottom w-full">
                <label
                    tabIndex={0}
                    className="btn border-gray-300 btn-outline w-full justify-between normal-case font-normal"
                >
                    <span className={selectedOption ? 'text-gray-900' : 'text-gray-700'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <span className="text-gray-400">▼</span>
                </label>
                <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full mt-1 max-h-60 overflow-auto flex-nowrap"
                >
                    {options.map((option) => (
                        <li key={option.value}>
                            <a
                                onClick={() => {
                                    onChange(option.value)
                                    document.activeElement.blur()
                                }}
                                className={`text-gray-600 ${
                                    value === option.value ? 'active' : ''
                                }`}
                            >
                                {option.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Select
