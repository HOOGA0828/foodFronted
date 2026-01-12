// 這是一個獨立的測試腳本，用於測試 Supabase 連線
// 使用方法: node setup-supabase.js

const { createClient } = require('@supabase/supabase-js')

// 請填入您的實際 Supabase 設定
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

async function testSupabaseConnection() {
  console.log('🔍 測試 Supabase 連線...\n')

  if (SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.log('❌ 請先設定您的 Supabase 資訊:')
    console.log('1. 前往 https://supabase.com/dashboard')
    console.log('2. 選擇您的專案')
    console.log('3. 點擊 Settings > API')
    console.log('4. 複製以下資訊:')
    console.log('   - Project URL')
    console.log('   - anon public 金鑰')
    console.log('\n然後編輯此檔案中的 SUPABASE_URL 和 SUPABASE_ANON_KEY\n')
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    console.log('📍 連接到:', SUPABASE_URL)

    // 測試連線 - 取得所有表格
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (tablesError) {
      console.log('❌ 無法取得表格資訊:', tablesError.message)
      return
    }

    console.log('✅ 連線成功!\n')
    console.log('📋 您的資料庫表格:')
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`)
    })

    // 檢查是否有 products 表格
    const hasProductsTable = tables.some(t => t.table_name === 'products')

    if (hasProductsTable) {
      console.log('\n🔍 發現 products 表格，正在檢查資料結構...')

      // 取得 products 表格的結構
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(3)

      if (productsError) {
        console.log('❌ 無法取得 products 資料:', productsError.message)
      } else if (products && products.length > 0) {
        console.log(`✅ 找到 ${products.length} 筆產品資料`)
        console.log('\n📊 資料結構範例:')
        console.log(JSON.stringify(products[0], null, 2))
      } else {
        console.log('⚠️  products 表格是空的')
      }
    } else {
      console.log('\n❌ 沒有找到 products 表格')
      console.log('💡 請在您的 Supabase 專案中建立 products 表格')
    }

    console.log('\n🎯 下一步:')
    console.log('1. 將您的 SUPABASE_URL 和 SUPABASE_ANON_KEY 加入 .env.local 檔案')
    console.log('2. 如果資料結構不同，請調整我們的程式碼')

  } catch (error) {
    console.log('❌ 連線失敗:', error.message)
  }
}

testSupabaseConnection()