
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')

async function diagnose() {
    try {
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

        console.log('--- BRAND TABLE DEFINITIONS ---')
        const { data: brands, error: bErr } = await supabase.from('brands').select('name, favicon_url')
        if (bErr) { console.error(bErr); return }

        brands.sort((a, b) => a.name.localeCompare(b.name)).forEach(b => {
            const hasLogo = b.favicon_url && b.favicon_url.startsWith('http')
            console.log(`Brand: "[${b.name}]" | Logo: ${hasLogo ? 'YES' : 'NO'}`)
        })

        console.log('\n--- PRODUCT DATA SAMPLES ---')
        const { data: products, error: pErr } = await supabase.from('products').select('name, metadata').limit(500)

        // Group by brand name found in metadata
        const productBrands = {}
        products.forEach(p => {
            const b = p.metadata?.brand_info?.name || 'UNDEFINED'
            if (!productBrands[b]) productBrands[b] = 0
            productBrands[b]++
        })

        Object.entries(productBrands).forEach(([name, count]) => {
            console.log(`Product Brand: "[${name}]" (Count: ${count})`)
        })

    } catch (err) {
        console.error('Script Error:', err)
    }
}

diagnose()
