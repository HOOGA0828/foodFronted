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

async function checkBrandMatching() {
    console.log('=== 檢查品牌名稱匹配問題 ===\n')

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'ignored')
        .limit(3)

    const { data: brands } = await supabase
        .from('brands')
        .select('*')

    console.log('Products 的品牌資訊:')
    products?.forEach(p => {
        console.log(`  產品: ${p.name}`)
        console.log(`    brand_id: ${p.brand_id}`)
        console.log(`    metadata.brand_info.name: ${p.metadata?.brand_info?.name}`)
        console.log(`    metadata.brand_info.displayName: ${p.metadata?.brand_info?.displayName}`)
    })

    console.log('\nBrands 表的品牌:')
    brands?.forEach(b => {
        console.log(`  - ID: ${b.id}`)
        console.log(`    name: ${b.name}`)
        console.log(`    slug: ${b.slug}`)
        console.log(`    favicon_url: ${b.favicon_url || '無'}`)
        console.log(`    colors: ${b.colors?.join(', ') || '無'}`)
    })

    console.log('\n=== 問題診斷 ===')
    const productBrandId = products?.[0]?.brand_id
    const matchingBrand = brands?.find(b => b.id === productBrandId)

    if (matchingBrand) {
        console.log('✅ product.brand_id 可以對應到 brands 表')
        console.log(`   產品的 brand_id: ${productBrandId}`)
        console.log(`   對應的品牌名稱: ${matchingBrand.name}`)
    } else {
        console.log('❌ product.brand_id 無法對應到 brands 表')
        console.log(`   產品的 brand_id: ${productBrandId}`)
    }

    console.log('\n前端應該使用的邏輯:')
    console.log('  1. 從 products 拿到 brand_id')
    console.log('  2. 用 brand_id 去 brands 表查詢品牌名稱')
    console.log('  3. 或者使用 metadata.brand_info.displayName')
}

checkBrandMatching()
