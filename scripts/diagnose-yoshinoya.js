
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')
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

    console.log('--- DIAGNOSING YOSHINOYA (V2) ---')

    // 1. Fetch ALL products (or a large batch) and filter in JS to avoid complex JSONB queries
    supabase.from('products')
        .select('id, name, metadata, status, is_expired')
        .then(({ data: products, error }) => {
            if (error) {
                console.error('Products Error:', error)
                return
            }

            // Filter for Yoshinoya in name OR metadata
            const targets = products.filter(p => {
                const nameMatch = p.name.includes('吉野家') || p.name.toLowerCase().includes('yoshinoya')
                const brandMatch = p.metadata?.brand_info?.name?.includes('吉野家') ||
                    p.metadata?.brand_info?.name?.toLowerCase().includes('yoshinoya')
                return nameMatch || brandMatch
            })

            console.log(`Found ${targets.length} Yoshinoya-related products:`)
            targets.forEach(p => {
                const brandName = p.metadata?.brand_info?.name || 'UNKNOWN'
                console.log(`- [${p.name}]`)
                console.log(`  Brand Inside Metadata: "${brandName}"`)
                console.log(`  Status: ${p.status}`)
                console.log(`  Expired: ${p.is_expired}`)
                console.log('---')
            })

            // 2. Check Brands Table for Name Match
            supabase.from('brands').select('*').then(({ data: brands }) => {
                const brandTargets = brands.filter(b => b.name.includes('吉野家') || b.name.toLowerCase().includes('yoshinoya'))
                console.log('\n--- BRAND TABLE DEFINITIONS ---')
                brandTargets.forEach(b => {
                    console.log(`- DB Name: "[${b.name}]"`)
                    console.log(`  Favicon: ${b.favicon_url}`)
                })
            })
        })

} catch (err) {
    console.error('Setup Error:', err)
}
