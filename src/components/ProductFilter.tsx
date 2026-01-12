'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ProductCategory } from '@/types/product'
import { Filter, Store, UtensilsCrossed, Cake, MoreHorizontal } from 'lucide-react'

interface ProductFilterProps {
  selectedCategory: ProductCategory
  onCategoryChange: (category: ProductCategory) => void
}

export function ProductFilter({ selectedCategory, onCategoryChange }: ProductFilterProps) {
  const categories = [
    {
      key: ProductCategory.ALL,
      label: '全部',
      icon: Filter,
      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    },
    {
      key: ProductCategory.CONVENIENCE_STORE,
      label: '超商',
      icon: Store,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      key: ProductCategory.RESTAURANT_CHAIN,
      label: '連鎖餐廳',
      icon: UtensilsCrossed,
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      key: ProductCategory.DESSERT,
      label: '甜點',
      icon: Cake,
      color: 'bg-pink-100 text-pink-700 hover:bg-pink-200'
    },
    {
      key: ProductCategory.OTHER,
      label: '其他',
      icon: MoreHorizontal,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    }
  ]

  // 將顯示名稱轉換為英文鍵值
  const getCategoryKey = (label: string) => {
    const keyMap = {
      '全部': ProductCategory.ALL,
      '超商': ProductCategory.CONVENIENCE_STORE,
      '連鎖餐廳': ProductCategory.RESTAURANT_CHAIN,
      '甜點': ProductCategory.DESSERT,
      '其他': ProductCategory.OTHER
    }
    return keyMap[label as keyof typeof keyMap] || ProductCategory.ALL
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category, index) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.key

          return (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.key)}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-md'
                    : category.color
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}