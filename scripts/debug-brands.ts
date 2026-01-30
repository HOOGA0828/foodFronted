
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Connecting to Supabase...')
console.log('URL:', supabaseUrl)
// Don't log the full key for security, just check if it exists
console.log('Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkBrands() {
    console.log('Fetching brands...')
    const { data, error } = await supabase
        .from('brands')
        .select('id, name, colors, favicon_url')

    if (error) {
        console.error('Error fetching brands:', error)
        return
    }

    console.log(`Found ${data.length} brands:`)
    data.forEach(brand => {
        console.log(`[${brand.name}]`)
        console.log(`  favicon_url: "${brand.favicon_url}"`)
        console.log(`  Type of details:`, typeof brand.favicon_url)
        console.log('---')
    })
}

checkBrands().then(() => {
    console.log('Done.')
    process.exit(0)
}).catch(err => {
    console.error('Script failed:', err)
    process.exit(1)
})
