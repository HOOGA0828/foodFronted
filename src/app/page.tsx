'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilter } from '@/components/ProductFilter'
import { Product, ProductCategory } from '@/types/product'
import { db } from '@/lib/supabase'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function Home() {
  // 狀態管理
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(ProductCategory.ALL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 載入產品資料
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await db.products.getAll() as Product[]
        setProducts(data)
        setFilteredProducts(data)
      } catch (err) {
        console.error('載入產品資料失敗:', err)
        setError('無法載入產品資料，請稍後再試')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // 篩選產品
  useEffect(() => {
    if (selectedCategory === ProductCategory.ALL) {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory))
    }
  }, [products, selectedCategory])

  // 處理分類篩選
  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 頁面標題 */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              日本新品追蹤
            </h1>
            <p className="text-lg text-gray-600">
              追蹤日本連鎖餐飲與超商的最新商品資訊
            </p>
          </div>
        </div>
      </motion.header>

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 分類篩選器 */}
        <ProductFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* 載入狀態 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            <span className="ml-2 text-gray-600">載入中...</span>
          </div>
        )}

        {/* 錯誤狀態 */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-2 text-red-600">{error}</span>
          </div>
        )}

        {/* 產品列表 */}
        {!loading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {selectedCategory === ProductCategory.ALL
                    ? '目前沒有產品資料'
                    : `目前沒有 ${selectedCategory} 類別的產品`
                  }
                </p>
              </div>
            ) : (
              <>
                {/* 產品統計 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 text-center"
                >
                  <p className="text-gray-600">
                    共找到 <span className="font-semibold text-gray-900">{filteredProducts.length}</span> 項產品
                  </p>
                </motion.div>

                {/* 產品網格 */}
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </motion.div>
              </>
            )}
          </>
        )}
      </main>

      {/* 頁尾 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white border-t border-gray-200 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 日本新品追蹤系統. 所有權利保留.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
