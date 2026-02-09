require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkImages() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, image_urls, thumbnail_url, metadata, source_url')
        .limit(3)

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('檢查產品圖片資料：\n')
    data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(`   image_urls: ${JSON.stringify(product.image_urls)}`)
        console.log(`   thumbnail_url: ${product.thumbnail_url}`)
        console.log(`   metadata.imageUrl: ${product.metadata?.imageUrl}`)
        console.log(`   source_url: ${product.source_url}`)
        console.log('')
    })

    // 統計
    const hasImage = data.filter(p =>
        (p.image_urls && p.image_urls.length > 0) ||
        p.thumbnail_url ||
        p.metadata?.imageUrl
    ).length

    console.log(`\n總計：${data.length} 筆產品，${hasImage} 筆有圖片資料`)
}

checkImages()
