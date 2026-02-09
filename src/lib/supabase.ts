import { createClient } from '@supabase/supabase-js'
import { Product, SupabaseProduct, transformSupabaseProduct, ProductCategory, Brand } from '@/types/product'

// 建立 Supabase 客戶端實例的函數
function createSupabaseClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 檢查環境變數是否存在且有效
    if (!supabaseUrl || !supabaseAnonKey ||
      supabaseUrl === 'your_supabase_project_url' ||
      supabaseAnonKey === 'your_supabase_anon_key') {
      console.log('⚠️ Supabase 環境變數未設定或使用預設值，將使用模擬資料')
      return null
    }

    // 驗證 URL 格式
    try {
      new URL(supabaseUrl)
    } catch {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL 不是有效的 URL:', supabaseUrl)
      return null
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  } catch (error) {
    console.error('❌ 建立 Supabase 客戶端失敗:', error)
    return null
  }
}

// 建立 Supabase 客戶端實例
export const supabase = createSupabaseClient()

// 模擬資料（用於開發環境）
const mockProducts = [
  {
    id: '1',
    name: '季節限定草莓聖代',
    brand: '星乃珈琲店',
    category: ProductCategory.DESSERT,
    price: 650,
    original_price: 700,
    currency: 'JPY',
    release_date: '2025-01-15',
    available_start_date: '2025-01-15T00:00:00Z',
    image_url: 'https://via.placeholder.com/400x400?text=Strawberry+Parfait',
    description: '使用新鮮季節草莓製作的夢幻聖代，搭配香草冰淇淋與手工餅乾',
    is_new: true,
    is_limited: true,
    is_seasonal: true,
    status: 'available',
    tags: ['新品', '季節限定'],
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z'
  },
  {
    id: '2',
    name: '牛丼飯糰',
    brand: '吉野家',
    category: ProductCategory.RESTAURANT_CHAIN,
    price: 180,
    currency: 'JPY',
    release_date: '2025-01-12',
    available_start_date: '2025-01-12T00:00:00Z',
    image_url: 'https://via.placeholder.com/400x400?text=Beef+Bowl+Onigiri',
    description: '將經典牛丼變身為方便攜帶的飯糰，滿滿牛肉與洋蔥的豐富口感',
    is_new: true,
    is_limited: false,
    is_seasonal: false,
    status: 'available',
    tags: ['新品'],
    crawled_from: 'Yoshinoya',
    created_at: '2025-01-08T00:00:00Z',
    updated_at: '2025-01-08T00:00:00Z'
  },
  {
    id: '3',
    name: '期間限定抹茶拿鐵',
    brand: '7-Eleven',
    category: ProductCategory.CONVENIENCE_STORE,
    price: 150,
    original_price: 180,
    currency: 'JPY',
    release_date: '2025-01-08',
    available_start_date: '2025-01-08T00:00:00Z',
    image_url: 'https://via.placeholder.com/400x400?text=Matcha+Latte',
    description: '來自京都的優質抹茶粉末調製，苦澀中帶有甘甜的完美平衡',
    is_new: false,
    is_limited: true,
    is_seasonal: true,
    status: 'available',
    tags: ['期間限定', '抹茶'],
    crawled_from: '7-Eleven',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-05T00:00:00Z'
  }
]

// 資料庫查詢函數
export const db = {
  // 產品相關查詢
  products: {
    // 取得所有產品
    async getAll() {
      if (!supabase) {
        // 開發模式：返回模擬資料
        console.log('使用模擬資料（開發模式）')
        return new Promise(resolve => setTimeout(() => resolve(mockProducts), 500))
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'ignored')
        .neq('status', 'sold_out')
        .order('available_start_date', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('取得產品資料失敗:', error)
        throw error
      }

      // 轉換資料格式
      const transformedData = data?.map(transformSupabaseProduct) || []
      return transformedData
    },

    // 依分類取得產品
    async getByCategory(category: string) {
      if (!supabase) {
        // 開發模式：過濾模擬資料
        return new Promise(resolve => {
          setTimeout(() => {
            const filtered = category === '全部'
              ? mockProducts
              : mockProducts.filter(p => p.category === category)
            resolve(filtered)
          }, 300)
        })
      }

      // 取得所有資料，然後在客戶端篩選
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'ignored')
        .neq('status', 'sold_out')
        .order('available_start_date', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('依分類取得產品失敗:', error)
        throw error
      }

      // 在客戶端篩選分類
      let filteredData = data
      if (category !== '全部') {
        filteredData = data?.filter(item =>
          item.metadata?.brand_info?.category === category
        ) || []
      }

      // 轉換資料格式
      const transformedData = filteredData?.map(transformSupabaseProduct) || []
      return transformedData
    },

    // 搜尋產品
    async search(query: string) {
      if (!supabase) {
        // 開發模式：搜尋模擬資料
        return new Promise(resolve => {
          setTimeout(() => {
            const filtered = mockProducts.filter(p =>
              p.name.includes(query) || p.brand.includes(query)
            )
            resolve(filtered)
          }, 300)
        })
      }

      // 取得所有資料，然後在客戶端搜尋
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'ignored')
        .neq('status', 'sold_out')
        .order('available_start_date', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('搜尋產品失敗:', error)
        throw error
      }

      // 在客戶端搜尋
      const filteredData = data?.filter(item =>
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.metadata?.brand_info?.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      ) || []

      // 轉換資料格式
      const transformedData = filteredData?.map(transformSupabaseProduct) || []
      return transformedData
    },

    // 更新產品狀態
    async updateProductStatus(id: string, status: string) {
      if (!supabase) {
        console.log(`[開發模式] 更新產品 ${id} 狀態為 ${status}`)
        return
      }

      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', id)

      if (error) {
        console.error('更新產品狀態失敗:', error)
        throw error
      }
    }
  },

  // 品牌相關查詢
  brands: {
    async getAll() {
      if (!supabase) {
        return []
      }

      const { data, error } = await supabase
        .from('brands')
        .select('id, name, colors, favicon_url, logo_url')

      if (error) {
        console.error('取得品牌資料失敗:', error)
        return []
      }

      return data as Brand[]
    }
  }
}