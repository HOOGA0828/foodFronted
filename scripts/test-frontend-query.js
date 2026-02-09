const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
        let value = match[2].trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }
        envVars[match[1].trim()] = value
    }
})

const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testFrontendQuery() {
    console.log('=== 模擬前端查詢 ===\n')

    // 模擬前端的 products.getAll() 查詢
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'ignored')
        .order('available_start_date', { ascending: false, nullsFirst: false })

    if (error) {
        console.log('❌ 查詢失敗:', error)
        return
    }

    console.log(`✅ 成功取得 ${products.length} 個產品\n`)

    // 統計各品牌產品數量
    const brandCounts = {}
    products.forEach(p => {
        const brandName = p.metadata?.brand_info?.name || '未知'
        if (!brandCounts[brandName]) brandCounts[brandName] = 0
        brandCounts[brandName]++
    })

    console.log('各品牌產品數量:')
    Object.entries(brandCounts).forEach(([brand, count]) => {
        console.log(`  - ${brand}: ${count} 個產品`)
    })

    // 顯示 7-Eleven 的產品
    const sevenProducts = products.filter(p =>
        p.metadata?.brand_info?.name === '7-Eleven' ||
        p.metadata?.brand_info?.displayName?.includes('7-Eleven')
    )

    console.log(`\n7-Eleven 產品共 ${sevenProducts.length} 個:`)
    sevenProducts.forEach(p => {
        console.log(`  - ${p.name}`)
        console.log(`    價格: ¥${p.price}`)
        console.log(`    圖片: ${p.image_urls?.[0] || '無'}`)
    })

    // 測試 brands 查詢
    console.log('\n=== 測試 Brands 查詢 ===')
    const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('id, name, colors, favicon_url')

    if (brandsError) {
        console.log('❌ Brands 查詢失敗:', brandsError)
    } else {
        console.log(`✅ 成功取得 ${brands.length} 個品牌`)
        const sevenBrand = brands.find(b => b.name === '7-Eleven')
        if (sevenBrand) {
            console.log('\n7-Eleven 品牌資訊:')
            console.log(`  名稱: ${sevenBrand.name}`)
            console.log(`  Logo: ${sevenBrand.favicon_url || '無'}`)
            console.log(`  顏色: ${sevenBrand.colors?.join(', ') || '無'}`)
        }
    }
}

testFrontendQuery()
