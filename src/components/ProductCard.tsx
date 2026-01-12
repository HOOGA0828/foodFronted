'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product, ProductCategory } from '@/types/product'
import { Calendar, Store, Star } from 'lucide-react'

interface ProductCardProps {
  product: Product
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  // 確保圖片 URL 永遠有效
  const imageUrl = product.image_url && product.image_url.trim() !== ''
    ? product.image_url
    : 'https://via.placeholder.com/400x400?text=No+Image'

  // 格式化價格
  const formatPrice = (price: number) => {
    if (price === 0 || price === null || price === undefined) {
      return '價格待定'
    }
    return `¥${price.toLocaleString()}`
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 取得分類顏色
  const getCategoryColor = (category: ProductCategory) => {
    const colors = {
      [ProductCategory.CONVENIENCE_STORE]: 'bg-blue-100 text-blue-800',
      [ProductCategory.RESTAURANT_CHAIN]: 'bg-green-100 text-green-800',
      [ProductCategory.DESSERT]: 'bg-pink-100 text-pink-800',
      [ProductCategory.OTHER]: 'bg-gray-100 text-gray-800',
      [ProductCategory.ALL]: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors[ProductCategory.OTHER]
  }

  // 分類顯示名稱
  const getCategoryDisplayName = (category: ProductCategory) => {
    const displayNames = {
      [ProductCategory.CONVENIENCE_STORE]: '超商',
      [ProductCategory.RESTAURANT_CHAIN]: '連鎖餐廳',
      [ProductCategory.DESSERT]: '甜點',
      [ProductCategory.OTHER]: '其他',
      [ProductCategory.ALL]: '全部'
    }
    return displayNames[category] || displayNames[ProductCategory.OTHER]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // 如果圖片載入失敗，使用預設圖片
              const target = e.target as HTMLImageElement;
              if (target.src !== 'https://via.placeholder.com/400x400?text=No+Image') {
                target.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }
            }}
          />

          {/* 新品標籤 */}
          {product.is_new && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              新品
            </Badge>
          )}

          {/* 期間限定標籤 */}
          {product.is_limited && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
              期間限定
            </Badge>
          )}

          {/* 季節性商品標籤 */}
          {product.is_seasonal && (
            <Badge className="absolute bottom-2 left-2 bg-purple-500 text-white">
              季節限定
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* 分類標籤 */}
          <Badge className={`mb-2 ${getCategoryColor(product.category)}`}>
            {getCategoryDisplayName(product.category)}
          </Badge>

          {/* 品牌名稱 */}
          <p className="text-sm text-gray-600 mb-1">{product.brand}</p>

          {/* 產品名稱 */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* 價格 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
            <span className="text-sm text-gray-600">
              {product.currency}
            </span>
          </div>

          {/* 發售日期 */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(product.available_start_date || product.release_date)}</span>
          </div>

          {/* 產品描述（如果有） */}
          {product.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {product.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}