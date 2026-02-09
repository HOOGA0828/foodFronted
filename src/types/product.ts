// 產品分類枚舉
export enum ProductCategory {
  ALL = '全部',
  CONVENIENCE_STORE = 'convenience_store',
  RESTAURANT_CHAIN = 'restaurant_chain',
  DESSERT = 'dessert',
  OTHER = 'other'
}

// 從 Supabase 取得的原始資料介面
export interface SupabaseProduct {
  id: string
  name: string
  name_en?: string | null
  name_jp?: string | null
  description?: string | null
  description_en?: string | null
  description_jp?: string | null
  brand_id: string
  category_id?: string | null
  available_start_date?: string | null
  available_end_date?: string | null
  price: number
  original_price?: number | null
  currency: string
  image_urls?: string[] | null
  thumbnail_url?: string | null
  video_urls?: string[] | null
  status: string
  is_limited_edition: boolean
  is_region_limited: boolean
  available_regions?: string[] | null
  tags?: string[] | null
  subcategories?: string[] | null
  specifications: Record<string, any>
  nutrition_info: Record<string, any>
  allergens: string[]
  source_url?: string | null
  source_identifier?: string | null
  crawled_from?: string | null
  scraped_at?: string | null
  last_verified_at?: string | null
  release_date?: string | null
  is_new_product: boolean
  metadata: {
    brand_info?: {
      name: string
      category: string
      displayName?: string
    }
    crawled_at?: string
    price_note?: string
    original_name?: string
  }
  crawl_metadata: Record<string, any>
  created_at: string
  updated_at: string
  colors?: string[] // 品牌代表色
}

// 產品介面定義
export interface Product {
  // 基本資訊
  id: string
  brand_id: string      // 品牌 ID
  name: string          // 產品名稱
  japanese_name?: string // 日文名稱
  brand: string         // 品牌名稱
  category: ProductCategory // 分類

  // 價格資訊
  price: number         // 價格
  original_price?: number // 原價（有折扣時使用）
  currency: string      // 貨幣單位

  // 時間資訊
  release_date: string  // 發售日期 (ISO 8601 格式)
  available_start_date?: string // 可用開始日期
  available_end_date?: string   // 可用結束日期

  // 圖片與描述
  image_url?: string    // 產品圖片 URL
  image_urls?: string[] // 多張圖片 URL
  description?: string  // 產品描述

  // 狀態標記
  is_new: boolean       // 是否為新品
  is_limited: boolean   // 是否為期間限定
  is_seasonal: boolean  // 是否為季節性商品

  // 其他資訊
  status: string        // 產品狀態
  tags?: string[]       // 標籤
  source_url?: string   // 來源網址
  crawled_from?: string // 爬取來源

  // 元資料
  created_at: string    // 建立時間
  updated_at: string    // 更新時間
  colors?: string[]     // 品牌顏色
}

export interface Brand {
  id: string
  name: string
  colors?: string[]
  favicon_url?: string
  logo_url?: string
}

// 將 SupabaseProduct 轉換為 Product 的工具函數
export function transformSupabaseProduct(supabaseProduct: SupabaseProduct): Product {
  // 取得品牌名稱 - 優先使用 displayName
  const brand = supabaseProduct.metadata?.brand_info?.displayName ||
    supabaseProduct.metadata?.brand_info?.name ||
    '未知品牌'

  // 取得分類
  const categoryString = supabaseProduct.metadata?.brand_info?.category || 'other'
  const category = Object.values(ProductCategory).includes(categoryString as ProductCategory)
    ? categoryString as ProductCategory
    : ProductCategory.OTHER

  // 取得圖片 URL
  const image_url = supabaseProduct.image_urls?.[0] ||
    supabaseProduct.thumbnail_url ||
    'https://via.placeholder.com/400x400?text=No+Image'

  // 取得發售日期
  const release_date = supabaseProduct.available_start_date ||
    supabaseProduct.release_date ||
    supabaseProduct.created_at

  // 判斷是否為季節性商品（根據標籤或其他邏輯）
  const is_seasonal = supabaseProduct.tags?.some(tag =>
    tag.includes('季節') || tag.includes('限定') || tag.includes('期間')
  ) || false

  return {
    id: supabaseProduct.id,
    brand_id: supabaseProduct.brand_id,
    name: supabaseProduct.name || '未知產品', // Default to scraped name (likely Chinese)
    japanese_name: supabaseProduct.name_jp || undefined, // Japanese name if available
    brand,
    category,

    price: supabaseProduct.price || 0,  // 確保 price 永遠是數字
    original_price: supabaseProduct.original_price || undefined,
    currency: supabaseProduct.currency || 'JPY',  // 確保 currency 永遠是字符串

    release_date,
    available_start_date: supabaseProduct.available_start_date || undefined,
    available_end_date: supabaseProduct.available_end_date || undefined,

    image_url,
    image_urls: supabaseProduct.image_urls || undefined,
    description: supabaseProduct.description || undefined,

    is_new: supabaseProduct.is_new_product,
    is_limited: supabaseProduct.is_limited_edition,
    is_seasonal,

    status: supabaseProduct.status,
    tags: supabaseProduct.tags || undefined,
    source_url: supabaseProduct.source_url || undefined,
    crawled_from: supabaseProduct.crawled_from || undefined,

    created_at: supabaseProduct.created_at,
    updated_at: supabaseProduct.updated_at,
    colors: supabaseProduct.colors || []
  }
}

// 產品篩選器介面
export interface ProductFilters {
  category?: ProductCategory
  priceRange?: {
    min: number
    max: number
  }
  isNew?: boolean
  isLimited?: boolean
  isSeasonal?: boolean
  searchQuery?: string
}

// 產品列表回應介面
export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// 產品統計資訊
export interface ProductStats {
  totalProducts: number
  newProductsThisWeek: number
  limitedProducts: number
  seasonalProducts: number
  categoriesCount: Record<ProductCategory, number>
}