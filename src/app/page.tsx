'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilter } from '@/components/ProductFilter'
import { Pagination } from '@/components/Pagination'
import { ProductModal } from '@/components/ProductModal'
import { ProductDeleteModal } from '@/components/ProductDeleteModal'
import { Header } from '@/components/Header'

import { Product, Brand } from '@/types/product' // Updated import
import { db } from '@/lib/supabase'
import { shuffleArray } from '@/lib/utils'
import { AlertCircle, Loader2, ArrowUp } from 'lucide-react'


function HomeContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedBrandName = searchParams.get('brand') || 'All'
  const currentPage = Number(searchParams.get('page')) || 1
  const mode = searchParams.get('mode')

  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
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
    if (selectedBrandName !== 'All') {
      // Find Brand ID based on Name from URL
      const brandInfo = brands.find(b => b.name === selectedBrandName)

      if (brandInfo) {
        // Filter by ID for robustness
        result = products.filter(product => product.brand_id === brandInfo.id)

        const brandColor = brandInfo.colors?.[0]
        if (brandColor) {
          setCustomBgStyle({
            background: `linear-gradient(135deg, ${brandColor}15 0%, ${brandColor}30 100%)`, // Light tint
            transition: 'background 0.8s ease-in-out'
          })
        } else {
          setCustomBgStyle({
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            transition: 'background 0.8s ease-in-out'
          })
        }
      } else {
        // Fallback if brand name in URL is invalid or not found
        result = []
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
      // Randomize for 'All'
      if (products.length > 0) {
        result = shuffleArray(products)
      }
    }
    setFilteredProducts(result)
  }, [products, brands, selectedBrandName])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  useEffect(() => {
    if (!loading && products.length > 0 && currentPage > totalPages && totalPages > 0) {
      updateUrl(selectedBrandName, 1)
    }
  }, [loading, products, currentPage, totalPages, selectedBrandName])

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
    updateUrl(selectedBrandName, page)
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

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (productId: string) => {
    await db.products.updateProductStatus(productId, 'ignored')
    // Optimistic update
    setProducts(products.filter(p => p.id !== productId))
    setFilteredProducts(filteredProducts.filter(p => p.id !== productId))
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      {/* Main Content */}
      <main id="product-grid" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">

        {/* Filter Section */}
        <div className="mb-8">
          {!loading && (
            <ProductFilter
              brands={brands.filter(b => products.some(p => p.brand_id === b.id))}
              selectedBrand={selectedBrandName}
              onBrandChange={handleBrandChange}
            />
          )}
        </div>

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
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                <p className="text-muted-foreground text-xl font-medium">
                  {selectedBrandName === 'All'
                    ? '目前沒有產品資料'
                    : `目前沒有 ${selectedBrandName} 的產品`
                  }
                </p>
              </div>
            ) : (
              <>
                <motion.div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-1">
                  <p className="text-sm text-gray-500">
                    共 <span className="font-bold text-gray-800">{filteredProducts.length}</span> 項美食
                  </p>
                  <p className="text-xs text-gray-400">
                    最後更新時間：{lastUpdateTime}
                  </p>
                </motion.div>

                {/* Grid Layout - 3 Columns for larger screens */}
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                  {paginatedProducts.map((product, index) => {
                    const productBrand = brands.find(b => b.id === product.brand_id)
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={handleProductClick}

                        brandLogo={productBrand?.logo_url}
                        showDelete={mode === 'delete'}
                        onDelete={handleDeleteClick}
                      />
                    )
                  })}
                </motion.div>

                <div className="mt-16 flex justify-center">
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



      {/* Scroll Top - Golden Accent */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8,
          pointerEvents: showScrollTop ? 'auto' : 'none'
        }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-xl hover:bg-yellow-600 transition-all z-50 ring-4 ring-white/30"
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        brandLogo={selectedProduct ? brands.find(b => b.id === selectedProduct.brand_id)?.logo_url : null}
      />

      {/* Delete Confirmation Modal */}
      <ProductDeleteModal
        product={productToDelete}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
