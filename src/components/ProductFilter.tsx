'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Filter, Store } from 'lucide-react'

import { Brand } from '@/types/product'

interface ProductFilterProps {
  brands: Brand[]
  selectedBrand: string
  onBrandChange: (brand: string) => void
  disabled?: boolean
}

export function ProductFilter({ brands, selectedBrand, onBrandChange, disabled }: ProductFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 max-w-full"
    >
      <div className="flex flex-nowrap overflow-x-auto md:flex-wrap md:justify-center gap-3 px-4 md:px-0 pb-4 md:pb-0 scrollbar-hide py-2">
        {/* 全部選項 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0"
        >
          <button
            onClick={() => onBrandChange('All')}
            disabled={disabled}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm
              ${selectedBrand === 'All'
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-primary border border-gray-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
              `}
          >
            <Filter className="w-3.5 h-3.5" />
            全部
          </button>
        </motion.div>

        {/* 品牌列表 */}
        {brands.map((brand, index) => {
          const isSelected = selectedBrand === brand.name

          return (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (index + 1) * 0.03 }}
              className="shrink-0"
            >
              <button
                onClick={() => onBrandChange(brand.name)}
                disabled={disabled}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm
                  ${isSelected
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-primary border border-gray-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                  `}
              >
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-4 h-4 object-contain rounded-sm" />
                ) : (
                  <Store className="w-3.5 h-3.5 opacity-70" />
                )}
                {brand.name}
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
