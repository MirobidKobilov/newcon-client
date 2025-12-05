import Button from './Button'

const SuccessModal = ({ isOpen, onClose, title = 'Успешно', message }) => {
    return (
        <>
            <style>{`
                dialog.success-modal-override.modal {
                    z-index: 9999 !important;
                }
                dialog.success-modal-override.modal .modal-box {
                    z-index: 10000 !important;
                    position: relative !important;
                }
                dialog.success-modal-override.modal form.modal-backdrop {
                    z-index: 9998 !important;
                }
            `}</style>
            <dialog
                className={`modal ${isOpen ? 'modal-open' : ''} success-modal-override`}
                data-theme='light'
            >
                <div className='modal-box rounded-2xl max-w-md bg-white p-0 overflow-hidden border-none'>
                    <div className='px-6 py-6 text-center'>
                        <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4'>
                            <svg
                                className='h-6 w-6 text-green-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M5 13l4 4L19 7'
                                />
                            </svg>
                        </div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
                        <p className='text-gray-600 mb-6'>{message}</p>
                        <Button
                            type='button'
                            variant='primary'
                            onClick={onClose}
                            className='w-full'
                        >
                            Закрыть
                        </Button>
                    </div>
                </div>
                <form method='dialog' className='modal-backdrop'>
                    <button onClick={onClose}>close</button>
                </form>
            </dialog>
        </>
    )
}

export default SuccessModal
