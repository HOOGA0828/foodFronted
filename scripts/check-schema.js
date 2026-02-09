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
    console.log('=== 檢查 Products 結構 ===')
    const { data: sample, error } = await supabase
        .from('products')
        .select('*')
        .limit(1)

    if (error) {
        console.log('❌ Error:', error)
        return
    }

    if (sample && sample.length > 0) {
        console.log('欄位列表:')
        console.log(Object.keys(sample[0]).sort().join(', '))
        console.log('\n完整樣本資料:')
        console.log(JSON.stringify(sample[0], null, 2))
    }

    console.log('\n=== 檢查所有產品（不加過濾條件）===')
    const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('id, name, status, metadata')

    if (allError) {
        console.log('❌ Error:', allError)
    } else {
        console.log(`總共有 ${allProducts.length} 個產品`)
        allProducts.forEach(p => {
            console.log(`  - ${p.name} (status: ${p.status}, brand: ${p.metadata?.brand_info?.name})`)
        })
    }

    console.log('\n=== 檢查 Brands ===')
    const { data: brands } = await supabase.from('brands').select('id, name, slug')
    console.log(`總共有 ${brands?.length || 0} 個品牌`)
    brands?.forEach(b => console.log(`  - ${b.name} (${b.slug})`))
}

checkData()
