'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  index: number
  onClick?: (product: Product) => void
  className?: string
  brandLogo?: string | null // Add brandLogo prop
}

export function ProductCard({ product, index, onClick, className, brandLogo }: ProductCardProps) {
  // 確保圖片 URL 永遠有效
  const imageUrl = product.image_url && product.image_url.trim() !== ''
    ? product.image_url
    : 'https://via.placeholder.com/400x400?text=No+Image'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`relative group cursor-pointer ${className || ''}`}
      onClick={() => onClick?.(product)}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300">

        {/* Product Image */}
        <div className="relative w-full h-full p-6 flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Brand Logo & JP Name Overlay */}
        <div className="absolute top-3 left-3 z-[20] max-w-[85%]">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-black/5">
            {/* Logo */}
            <div className="relative w-6 h-6 shrink-0 rounded-full overflow-hidden bg-white border border-gray-100">
              {brandLogo ? (
                <Image
                  src={brandLogo}
                  alt={product.brand}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
                  {product.brand.slice(0, 1)}
                </div>
              )}
            </div>

            {/* JP Name - Prioritize japanese_name if available */}
            <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
              {product.japanese_name || product.name}
            </span>
          </div>
        </div>

        {/* Hover Overlay Hint (Optional, keeps it minimal but interactive) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
    </motion.div>
  )
}
