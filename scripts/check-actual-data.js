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

async function checkData() {
    console.log('=== 檢查 Brands 資料 ===')
    const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*')

    if (brandsError) {
        console.log('❌ Brands Error:', brandsError)
    } else {
        console.log(`✅ 總共有 ${brands.length} 個品牌`)
        brands.forEach(b => {
            console.log(`  - ${b.name} (slug: ${b.slug})`)
        })
    }

    console.log('\n=== 檢查 Products 資料 ===')
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')

    if (productsError) {
        console.log('❌ Products Error:', productsError)
    } else {
        console.log(`✅ 總共有 ${products.length} 個產品`)

        // 按品牌分組
        const byBrand = {}
        products.forEach(p => {
            const brandName = p.metadata?.brand_info?.name || '未知'
            if (!byBrand[brandName]) byBrand[brandName] = []
            byBrand[brandName].push(p)
        })

        Object.keys(byBrand).forEach(brandName => {
            console.log(`\n  品牌: ${brandName} (${byBrand[brandName].length} 個產品)`)
            byBrand[brandName].forEach(p => {
                console.log(`    - ${p.name}`)
                console.log(`      status: ${p.status}, is_expired: ${p.is_expired}`)
                console.log(`      brand_id: ${p.brand_id}`)
                console.log(`      metadata.brand_info:`, p.metadata?.brand_info)
            })
        })
    }

    console.log('\n=== 測試前端查詢邏輯 ===')
    const { data: frontendQuery, error: frontendError } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'ignored')
        .eq('is_expired', false)
        .order('available_start_date', { ascending: false, nullsFirst: false })

    if (frontendError) {
        console.log('❌ Frontend Query Error:', frontendError)
    } else {
        console.log(`✅ 前端查詢結果: ${frontendQuery.length} 個產品`)
        if (frontendQuery.length > 0) {
            console.log('\n前 3 個產品:')
            frontendQuery.slice(0, 3).forEach(p => {
                console.log(`  - ${p.name} (${p.metadata?.brand_info?.name})`)
            })
        } else {
            console.log('⚠️ 前端查詢結果為空！可能原因：')
            console.log('   1. 所有產品的 status = "ignored"')
            console.log('   2. 所有產品的 is_expired = true')
            console.log('   3. 沒有 available_start_date')
        }
    }
}

checkData()
