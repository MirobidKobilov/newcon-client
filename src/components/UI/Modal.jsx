const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`} data-theme="light">
            <div
                className={`modal-box rounded-2xl ${maxWidth} bg-white p-0 overflow-hidden border-none`}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
                    </div>
                )}
                <button
                    className="absolute right-4 top-4 w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    onClick={onClose}
                    type="button"
                >
                    ✕
                </button>
                <div className="px-6 py-5">{children}</div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    )
}

export default Modal
