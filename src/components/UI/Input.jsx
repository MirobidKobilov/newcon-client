const Input = ({ label, required, className = '', ...props }) => {
    return (
        <div>
            <label className="block mb-1.5">
                <span className="text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </span>
            </label>
            <input
                className={`input input-bordered w-full border-gray-300 focus:border-gray-500 placeholder:text-gray-400 text-gray-900 ${className}`}
                {...props}
                style={{outline: 0}}
            />
        </div>
    )
}

export default Input
