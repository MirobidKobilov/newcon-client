const Input = ({ label, required, className = '', maskType, onChange, name, value, ...props }) => {
    const formatUzPhone = (raw) => {
        const digits = (raw || '').replace(/\D/g, '')

        let rest = digits
        if (rest.startsWith('998')) {
            rest = rest.slice(3)
        }
        // limit to 9 digits after country code
        rest = rest.slice(0, 9)

        const part1 = rest.slice(0, 2)
        const part2 = rest.slice(2, 5)
        const part3 = rest.slice(5, 7)
        const part4 = rest.slice(7, 9)

        let formatted = '+998'
        if (part1.length) formatted += ` (${part1}`
        if (part1.length === 2) formatted += ')'
        if (part2.length) formatted += (part1.length === 2 ? ' ' : ' ') + part2
        if (part3.length) formatted += '-' + part3
        if (part4.length) formatted += '-' + part4

        return formatted
    }

    const handleChange = (e) => {
        if (maskType === 'uz-phone') {
            const masked = formatUzPhone(e.target.value)
            if (onChange) {
                onChange({ target: { name, value: masked } })
            }
        } else {
            onChange && onChange(e)
        }
    }

    const displayedValue = maskType === 'uz-phone' ? formatUzPhone(value) : value

    return (
        <div>
            <label className='block mb-1.5'>
                <span className='text-xs sm:text-sm font-medium text-gray-700'>
                    {label} {required && <span className='text-red-500'>*</span>}
                </span>
            </label>
            <input
                className={`input input-bordered w-full border-gray-300 focus:border-gray-500 placeholder:text-gray-400 text-gray-900 text-sm sm:text-base ${className}`}
                name={name}
                value={displayedValue}
                onChange={handleChange}
                {...props}
                style={{ outline: 0 }}
            />
        </div>
    )
}

export default Input
