import Button from './Button'

const ErrorModal = ({ isOpen, onClose, title = 'Xatolik', message, statusCode, errors }) => {
    // Format field names for display (convert snake_case to Title Case)
    const formatFieldName = (fieldName) => {
        return fieldName
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`} data-theme="light">
            <div className="modal-box rounded-2xl max-w-lg bg-white p-0 overflow-hidden border-none">
                <div className="px-6 py-6">
                    <div className="text-center mb-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                        {statusCode && (
                            <div className="mb-3">
                                <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-lg">
                                    Status: {statusCode}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Main error message */}
                    {message && (
                        <div className="mb-4">
                            <p className="text-gray-700 text-sm font-medium whitespace-pre-wrap">
                                {message}
                            </p>
                        </div>
                    )}

                    {/* Field-specific validation errors */}
                    {errors && typeof errors === 'object' && Object.keys(errors).length > 0 && (
                        <div className="mb-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-red-800 mb-3">
                                    Validation xatolari:
                                </h4>
                                <ul className="space-y-2">
                                    {Object.keys(errors).map((field) => {
                                        const fieldErrors = errors[field]
                                        const errorList = Array.isArray(fieldErrors)
                                            ? fieldErrors
                                            : [fieldErrors]

                                        return (
                                            <li key={field} className="text-sm">
                                                <div className="font-medium text-red-700 mb-1">
                                                    {formatFieldName(field)}:
                                                </div>
                                                <ul className="ml-4 space-y-1">
                                                    {errorList.map((errorMsg, index) => (
                                                        <li
                                                            key={index}
                                                            className="text-red-600 flex items-start"
                                                        >
                                                            <span className="mr-2">•</span>
                                                            <span>{errorMsg}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        <Button
                            type="button"
                            variant="primary"
                            onClick={onClose}
                            className="w-full"
                        >
                            Yopish
                        </Button>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    )
}

export default ErrorModal

