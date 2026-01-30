'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilter } from '@/components/ProductFilter'
import { Pagination } from '@/components/Pagination'
import { ProductModal } from '@/components/ProductModal'
import { Product, Brand } from '@/types/product' // Updated import
import { db } from '@/lib/supabase'
import { AlertCircle, Loader2, ArrowUp } from 'lucide-react'


export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedBrand = searchParams.get('brand') || 'All'
  const currentPage = Number(searchParams.get('page')) || 1

  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([]) // Store brands
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Custom Background Style
  const [customBgStyle, setCustomBgStyle] = useState<Object>({})

  const itemsPerPage = 20

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load Products and Brands
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Parallel Fetch
        const [productsData, brandsData] = await Promise.all([
          db.products.getAll() as Promise<Product[]>,
          db.brands.getAll() as Promise<Brand[]>
        ])

        setProducts(productsData)
        setBrands(brandsData)

        if (productsData.length > 0) {
          const dates = productsData.map(p => new Date(p.created_at || p.updated_at).getTime())
          const maxDate = new Date(Math.max(...dates))
          setLastUpdateTime(maxDate.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }))
        }
      } catch (err) {
        console.error('載入資料失敗:', err)
        setError('無法載入資料，請稍後再試')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const uniqueBrands = Array.from(new Set(products.map(p => p.brand))).sort()

  // Filter Products & Set Background Color
  useEffect(() => {
    let result = products
    if (selectedBrand !== 'All') {
      result = products.filter(product => product.brand === selectedBrand)

      // Find Brand Color
      const brandInfo = brands.find(b => b.name === selectedBrand)
      const brandColor = brandInfo?.colors?.[0]

      if (brandColor) {
        setCustomBgStyle({
          background: `linear-gradient(135deg, ${brandColor}15 0%, ${brandColor}30 100%)`, // Light tint
          transition: 'background 0.8s ease-in-out'
        })
      } else {
        // Fallback if no specific brand color found
        setCustomBgStyle({
          background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
          transition: 'background 0.8s ease-in-out'
        })
      }

    } else {
      // Default Background
      setCustomBgStyle({
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        transition: 'background 0.8s ease-in-out'
      })
    }
    setFilteredProducts(result)
  }, [products, brands, selectedBrand])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  useEffect(() => {
    if (!loading && products.length > 0 && currentPage > totalPages && totalPages > 0) {
      updateUrl(selectedBrand, 1)
    }
  }, [loading, products, currentPage, totalPages, selectedBrand])

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const updateUrl = (brand: string, page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (brand && brand !== 'All') {
      params.set('brand', brand)
    } else {
      params.delete('brand')
    }
    if (page && page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleBrandChange = (brand: string) => {
    updateUrl(brand, 1)
  }

  const handlePageChange = (page: number) => {
    updateUrl(selectedBrand, page)
    const gridElement = document.getElementById('product-grid')
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProduct(null), 300)
  }

  return (
    <div
      className="min-h-screen text-foreground selection:bg-primary/20 transition-all duration-700 ease-in-out"
      style={customBgStyle} // Apply dynamic background
    >



      {/* Main Content */}
      <main id="product-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Sticky Header for Filters */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: showScrollTop ? -100 : 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 md:py-4 mb-8 border-b"
        >
          <div className="w-full overflow-hidden">
            {/* Removed "最新商品" header text as requested */}

            {!loading && (
              <ProductFilter
                brands={uniqueBrands}
                selectedBrand={selectedBrand}
                onBrandChange={handleBrandChange}
              />
            )}
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="ml-3 text-lg font-medium text-muted-foreground">尋找美食中...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <span className="ml-3 text-lg font-medium text-destructive">{error}</span>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-3xl">
                <p className="text-muted-foreground text-xl font-medium">
                  {selectedBrand === 'All'
                    ? '目前沒有產品資料'
                    : `目前沒有 ${selectedBrand} 的產品`
                  }
                </p>
              </div>
            ) : (
              <>
                <motion.div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-2">
                  <p className="text-muted-foreground">
                    共 <span className="font-bold text-foreground">{filteredProducts.length}</span> 項美味選擇
                  </p>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </motion.div>

                {/* UNIFORM GRID (Max 3 columns) */}
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" // Changed to lg:grid-cols-3 and gap-8
                >
                  {paginatedProducts.map((product, index) => {
                    const productBrand = brands.find(b => b.name === product.brand)
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        onClick={handleProductClick}
                        brandLogo={productBrand?.favicon_url}
                      />
                    )
                  })}
                </motion.div>

                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-muted/50 border-t mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="font-serif text-2xl font-bold mb-4">日本新品追蹤</h3>
            {lastUpdateTime && (
              <p className="text-sm text-muted-foreground">
                最後更新時間：{lastUpdateTime}
              </p>
            )}
            <p className="mt-8 text-xs text-muted-foreground/60">
              © 2026 Japan Food Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>

      {/* Scroll Top */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8,
          pointerEvents: showScrollTop ? 'auto' : 'none'
        }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-4 bg-primary text-primary-foreground rounded-full shadow-xl hover:bg-primary/90 transition-all z-50"
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        brandLogo={selectedProduct ? brands.find(b => b.name === selectedProduct.brand)?.favicon_url : null}
      />
    </div>
  )
}
