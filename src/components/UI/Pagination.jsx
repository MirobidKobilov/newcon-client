import React from 'react'

const Pagination = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onSizeChange,
    loading = false,
}) => {
    const pageSizeOptions = [10, 20, 50, 100]

    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i)
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i)
                }
            }
        }

        return pages
    }

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    return (
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border-t border-slate-200 bg-white'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto'>
                <div className='text-xs sm:text-sm text-slate-600 whitespace-nowrap'>
                    Показано <span className='font-semibold text-gray-800'>{startItem}</span> -{' '}
                    <span className='font-semibold text-gray-800'>{endItem}</span> из{' '}
                    <span className='font-semibold text-gray-800'>{totalItems}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='text-xs sm:text-sm text-slate-600 whitespace-nowrap'>
                        Размер:
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => onSizeChange(Number(e.target.value))}
                        disabled={loading}
                        className='px-2 sm:px-3 py-1 sm:py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-end'>
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1 || loading}
                    className='px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-slate-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    title='Первая страница'
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={2}
                        stroke='currentColor'
                        className='w-3.5 h-3.5 sm:w-4 sm:h-4'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5'
                        />
                    </svg>
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className='px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-slate-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    title='Предыдущая страница'
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={2}
                        stroke='currentColor'
                        className='w-3.5 h-3.5 sm:w-4 sm:h-4'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M15.75 19.5L8.25 12l7.5-7.5'
                        />
                    </svg>
                </button>

                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        disabled={loading}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                                ? 'bg-teal-500 text-white'
                                : 'bg-white text-gray-700 border border-slate-300 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className='px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-slate-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    title='Следующая страница'
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={2}
                        stroke='currentColor'
                        className='w-3.5 h-3.5 sm:w-4 sm:h-4'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M8.25 4.5l7.5 7.5-7.5 7.5'
                        />
                    </svg>
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || loading}
                    className='px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-slate-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    title='Последняя страница'
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={2}
                        stroke='currentColor'
                        className='w-3.5 h-3.5 sm:w-4 sm:h-4'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5'
                        />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default Pagination
