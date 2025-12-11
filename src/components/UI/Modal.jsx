const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl', maxHeight = '' }) => {
    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`} data-theme='light'>
            <div
                className={`modal-box rounded-2xl w-[95vw] sm:w-full ${maxWidth} ${maxHeight} bg-white p-0 overflow-hidden border-none max-h-[90vh] overflow-y-auto`}
            >
                {title && (
                    <div className='px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 sticky top-0 bg-white z-10'>
                        <h3 className='font-semibold text-base sm:text-lg text-gray-900 pr-8'>
                            {title}
                        </h3>
                    </div>
                )}
                <button
                    className='absolute right-3 sm:right-4 top-3 sm:top-4 w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-50'
                    onClick={onClose}
                    type='button'
                    aria-label='Close modal'
                >
                    ✕
                </button>
                <div className='px-4 sm:px-6 py-4 sm:py-5 h-full overflow-visible'>{children}</div>
            </div>
            <form method='dialog' className='modal-backdrop'>
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    )
}

export default Modal
