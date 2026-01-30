'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Filter, Store } from 'lucide-react'

interface ProductFilterProps {
  brands: string[]
  selectedBrand: string
  onBrandChange: (brand: string) => void
}

export function ProductFilter({ brands, selectedBrand, onBrandChange }: ProductFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 max-w-full"
    >
      <div className="flex flex-nowrap overflow-x-auto md:flex-wrap md:justify-center gap-2 px-4 md:px-0 pb-2 md:pb-0 scrollbar-hide">
        {/* 全部選項 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0"
        >
          <Button
            variant={selectedBrand === 'All' ? "default" : "outline"}
            size="sm"
            onClick={() => onBrandChange('All')}
            className={`flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${selectedBrand === 'All'
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Filter className="w-4 h-4" />
            全部
          </Button>
        </motion.div>

        {/* 品牌列表 */}
        {brands.map((brand, index) => {
          const isSelected = selectedBrand === brand

          return (
            <motion.div
              key={brand}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (index + 1) * 0.05 }}
              className="shrink-0"
            >
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onBrandChange(brand)}
                className={`flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${isSelected
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                  }`}
              >
                <Store className="w-4 h-4" />
                {brand}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
