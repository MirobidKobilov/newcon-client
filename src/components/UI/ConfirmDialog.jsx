import Button from './Button'

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Подтверждение',
    message,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    confirmVariant = 'primary',
    isLoading = false,
}) => {
    const handleConfirm = () => {
        onConfirm()
    }

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`} data-theme="light">
            <div className="modal-box rounded-2xl max-w-md bg-white p-0 overflow-hidden border-none">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
                </div>
                <div className="px-6 py-5">
                    <p className="text-gray-700">{message}</p>
                </div>
                <div className="flex justify-end gap-2 px-6 pb-5">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={confirmVariant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="loading loading-spinner loading-sm"></span>
                                Удаление...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    )
}

export default ConfirmDialog
