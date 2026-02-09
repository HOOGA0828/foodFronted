require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkImages() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(2)

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('前 2 筆產品的完整資料：\n')
    data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(JSON.stringify(product, null, 2))
        console.log('\n' + '='.repeat(80) + '\n')
    })
}

checkImages()
