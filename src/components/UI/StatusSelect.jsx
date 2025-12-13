import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const StatusSelect = ({
    options,
    value,
    onChange,
    onStatusChange,
    itemId,
    changingStatus = false,
    showSuccess = false,
}) => {
    const selectedOption = options.find((opt) => opt.value === value)
    const [isOpen, setIsOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const selectRef = useRef(null)
    const dropdownRef = useRef(null)
    const [showCheckAnimation, setShowCheckAnimation] = useState(false)

    useEffect(() => {
        if (showSuccess) {
            setShowCheckAnimation(true)
            const timer = setTimeout(() => {
                setShowCheckAnimation(false)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [showSuccess])

    const updatePosition = () => {
        if (selectRef.current) {
            const rect = selectRef.current.getBoundingClientRect()
            const minWidth = 200
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: Math.max(rect.width * 1.5, minWidth),
            })
        }
    }

    const handleOpen = () => {
        setIsOpen(true)
        setTimeout(updatePosition, 0)
    }

    const handleClose = () => {
        setIsOpen(false)
    }

    const handleSelect = async (optionValue) => {
        if (optionValue === value) {
            handleClose()
            return
        }

        // Keep dropdown open during status change
        if (onStatusChange) {
            await onStatusChange(itemId, optionValue)
            // Keep dropdown open for 1.5 seconds to show success animation, then close
            setTimeout(() => {
                handleClose()
                document.activeElement.blur()
            }, 1500)
        } else {
            onChange(optionValue)
            handleClose()
            document.activeElement.blur()
        }
    }

    useEffect(() => {
        if (isOpen) {
            updatePosition()
            const handleResize = () => updatePosition()
            const handleScroll = () => updatePosition()
            window.addEventListener('resize', handleResize)
            window.addEventListener('scroll', handleScroll, true)
            return () => {
                window.removeEventListener('resize', handleResize)
                window.removeEventListener('scroll', handleScroll, true)
            }
        }
    }, [isOpen])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isOpen &&
                selectRef.current &&
                !selectRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                handleClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [isOpen])

    const getStatusColor = (statusValue) => {
        if (statusValue === 'PAID') {
            return 'bg-green-100 text-green-700'
        }
        return 'bg-yellow-100 text-yellow-700'
    }

    const dropdownContent = isOpen && (
        <div
            ref={dropdownRef}
            className='fixed bg-white rounded-lg shadow-lg border border-gray-200 max-h-72 overflow-hidden flex flex-col z-[9999]'
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
            }}
        >
            <ul className='p-1 sm:p-2 max-h-60 overflow-auto'>
                {options.length > 0 ? (
                    options.map((option) => (
                        <li key={option.value}>
                            <a
                                onClick={() => handleSelect(option.value)}
                                className={`relative block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 hover:bg-slate-100 active:bg-slate-200 cursor-pointer ${
                                    value === option.value ? 'bg-teal-50 text-teal-700' : ''
                                } ${
                                    changingStatus && value === option.value
                                        ? 'opacity-50 cursor-wait'
                                        : ''
                                }`}
                            >
                                <span className='flex items-center justify-between'>
                                    <span>{option.label}</span>
                                    {showCheckAnimation && value === option.value && (
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            strokeWidth={3}
                                            stroke='currentColor'
                                            className='w-4 h-4 text-green-600 animate-check-draw flex-shrink-0 ml-2'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                d='M4.5 12.75l6 6 9-13.5'
                                            />
                                        </svg>
                                    )}
                                </span>
                            </a>
                        </li>
                    ))
                ) : (
                    <li className='px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 text-center'>
                        Нет опций
                    </li>
                )}
            </ul>
        </div>
    )

    return (
        <>
            <style>{`
                @keyframes checkDraw {
                    0% {
                        opacity: 0;
                        transform: translateX(-15px) scale(0.5);
                    }
                    50% {
                        opacity: 0.8;
                        transform: translateX(-5px) scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                .animate-check-draw {
                    animation: checkDraw 0.5s ease-out forwards;
                }
            `}</style>
            <div ref={selectRef} className='relative inline-block'>
                <button
                    type='button'
                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${getStatusColor(
                        value
                    )} ${
                        changingStatus
                            ? 'opacity-50 cursor-wait'
                            : 'cursor-pointer hover:opacity-80'
                    } flex items-center gap-1`}
                    onClick={() => (isOpen ? handleClose() : handleOpen())}
                    disabled={changingStatus}
                >
                    <span>{selectedOption ? selectedOption.label : value}</span>
                    {!changingStatus && !showCheckAnimation && (
                        <span className='text-[10px]'>▼</span>
                    )}
                    {changingStatus && <span className='loading loading-spinner loading-xs'></span>}
                </button>
                {isOpen && createPortal(dropdownContent, document.body)}
            </div>
        </>
    )
}

export default StatusSelect
