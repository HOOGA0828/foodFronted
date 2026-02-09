'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Product } from '@/types/product'

interface ProductDeleteModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
    onConfirm: (productId: string) => Promise<void>
}

export function ProductDeleteModal({ product, isOpen, onClose, onConfirm }: ProductDeleteModalProps) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleConfirm = async () => {
        if (!product) return

        if (password !== '51102') {
            setError('密碼錯誤')
            return
        }

        try {
            setIsLoading(true)
            setError('')
            await onConfirm(product.id)
            onClose()
            setPassword('') // Reset password on success
        } catch (err) {
            console.error('Delete failed:', err)
            setError('刪除失敗，請稍後再試')
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && product && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
                        >
                            {/* Header */}
                            <div className="bg-red-50 p-6 flex justify-between items-start border-b border-red-100">
                                <div>
                                    <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                                        <AlertCircle className="w-6 h-6" />
                                        確認刪除產品
                                    </h3>
                                    <p className="text-red-500 text-sm mt-1">此動作將隱藏該產品</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white rounded-full hover:bg-red-100 text-red-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-6">
                                    <p className="text-gray-600 mb-2">您即將刪除：</p>
                                    <p className="font-bold text-gray-800 text-lg">{product.name}</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        請輸入管理員密碼
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value)
                                                setError('')
                                            }}
                                            onKeyDown={handleKeyDown}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                            placeholder="輸入密碼..."
                                            autoFocus
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 pt-0 flex gap-3 justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            處理中...
                                        </>
                                    ) : (
                                        '確認刪除'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
