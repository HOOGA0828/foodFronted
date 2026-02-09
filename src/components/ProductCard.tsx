import { motion } from 'framer-motion'
import { Product } from '@/types/product'

import { X } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onClick: (product: Product) => void
  // Keeping these optional to avoid breaking existing usage if passed, but index/brandLogo are less critical in new design
  index?: number
  brandLogo?: string | null
  showDelete?: boolean
  onDelete?: (product: Product) => void
}

export function ProductCard({ product, onClick, brandLogo, showDelete, onDelete }: ProductCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)" }}
      className="group bg-card text-card-foreground rounded-2xl overflow-hidden shadow-sm border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
      onClick={() => onClick(product)}
    >
      {/* Delete Button */}
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(product)
          }}
          className="absolute top-2 right-2 z-50 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          title="刪除"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 border-b border-border/50">
        <img
          src={product.image_url || 'https://placehold.co/400x300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image'
          }}
        />

        {/* Brand Tag - Pill Shape */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur shadow-sm rounded-full border border-black/5">
          {brandLogo ? (
            <img src={brandLogo} alt={product.brand} className="w-4 h-4 object-contain" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-primary/80"></div>
          )}
          <span className="text-[11px] font-bold text-gray-700 tracking-wide">{product.brand}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-3 bg-white">
        <div>
          <h3 className="font-bold text-base text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
          {product.japanese_name && (
            <p className="text-xs text-muted-foreground line-clamp-1">{product.japanese_name}</p>
          )}
        </div>

        <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Price</span>
            <span className="text-lg font-bold text-primary font-serif">
              ¥{product.price}
            </span>
          </div>

          <span className="text-xs font-medium text-gray-400 group-hover:text-primary transition-colors flex items-center">
            查看詳情 →
          </span>
        </div>
      </div>
    </motion.div>
  )
}
