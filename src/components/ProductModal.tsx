'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ProductModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
    brandLogo?: string | null // Added brandLogo prop
}

export function ProductModal({ product, isOpen, onClose, brandLogo }: ProductModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // Removed body scroll lock to prevent layout shift/vibration

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && product && (
                <>
                    {/* Backdrop - Simple Fade */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Modal Container - No Scale/Slide Effects, Just Fade */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 w-full rounded-3xl shadow-2xl relative border border-white/20 overflow-hidden flex flex-col md:flex-row"
                            style={{ width: '85vw', height: '85vh', maxWidth: '1400px' }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-gray-100/50 hover:bg-gray-200 text-gray-800 dark:text-white rounded-full transition-colors z-20 backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Image Section - Centered, proportional */}
                            <div className="w-full md:w-1/2 h-[35%] md:h-full relative bg-gray-50 flex items-center justify-center p-4 md:p-8">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={product.image_url || 'https://via.placeholder.com/600x600?text=No+Image'}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>

                                {/* Brand Tag Overlay with Logo */}
                                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                                    <div className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-black/80 backdrop-blur-md rounded-full shadow-lg border border-white/10">
                                        {/* Logo */}
                                        <div className="relative w-4 h-4 md:w-5 md:h-5 shrink-0 rounded-full overflow-hidden bg-white">
                                            {brandLogo ? (
                                                <Image
                                                    src={brandLogo}
                                                    alt={product.brand}
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200" />
                                            )}
                                        </div>
                                        <span className="text-white text-xs md:text-sm font-bold">
                                            {product.brand}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="w-full md:w-1/2 p-5 md:p-10 flex flex-col h-[65%] md:h-full overflow-y-auto custom-scrollbar">
                                {/* Header */}
                                <div className="mb-4 md:mb-6">
                                    <h2 className="text-2xl md:text-4xl font-extrabold text-foreground leading-tight mb-2">
                                        {product.name}
                                    </h2>

                                    {product.japanese_name && (
                                        <h3 className="text-sm md:text-xl text-muted-foreground font-medium mb-3 md:mb-4">
                                            {product.japanese_name}
                                        </h3>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                                        {product.is_new && (
                                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-sm">NEW</span>
                                        )}
                                        {product.is_limited && (
                                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-amber-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-sm">LIMITED</span>
                                        )}
                                        {product.is_seasonal && (
                                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-green-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-sm">SEASONAL</span>
                                        )}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-2 mb-6 md:mb-10 pb-4 md:pb-8 border-b border-gray-100">
                                    <span className="text-3xl md:text-5xl font-black text-primary">
                                        ¥{product.price.toLocaleString()}
                                    </span>
                                    <span className="text-sm md:text-xl text-muted-foreground font-medium">
                                        {product.currency}
                                    </span>
                                </div>

                                {/* Spacer (Since description is removed) */}
                                <div className="flex-grow" />

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 md:gap-4 mt-auto">
                                    {/* Link to Brand Website */}
                                    {product.source_url && (
                                        <a
                                            href={product.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center w-full py-3 md:py-4 bg-foreground text-background hover:bg-primary hover:text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                        >
                                            前往官網查看
                                            <ExternalLink className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:rotate-45 transition-transform" />
                                        </a>
                                    )}

                                    {/* Availability Info */}
                                    <div className="bg-muted/30 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                                            <span className="font-semibold text-xs md:text-sm">發售日期</span>
                                        </div>
                                        <span className="text-sm md:text-lg font-bold text-foreground">
                                            {product.available_start_date ? new Date(product.available_start_date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) : '現正發售中'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
