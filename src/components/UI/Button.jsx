const Button = ({ children, variant = 'primary', type = 'button', className = '', ...props }) => {
    const variants = {
        primary: 'text-white bg-teal-600 border-none hover:bg-teal-700',
        secondary: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50',
    }

    return (
        <button type={type} style={{outline: 0}} className={`btn shadow-none rounded-xl pb-[3px] ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    )
}

export default Button