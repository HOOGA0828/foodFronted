
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')

async function verify() {
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

        const { data: brands } = await supabase.from('brands').select('name')
        const validNames = new Set(brands.map(b => b.name))

        const { data: products } = await supabase.from('products').select('name, metadata').limit(2000)

        console.log('--- ALIGNMENT CHECK ---')
        let aligned = 0
        let misaligned = 0
        const issues = {}

        products.forEach(p => {
            const bName = p.metadata?.brand_info?.name
            if (validNames.has(bName)) {
                aligned++
            } else {
                misaligned++
                if (!issues[bName]) issues[bName] = 0
                issues[bName]++
            }
        })

        console.log(`Aligned Products: ${aligned}`)
        console.log(`Misaligned Products: ${misaligned}`)

        if (misaligned > 0) {
            console.log('Misaligned Brands found in Products:')
            Object.entries(issues).forEach(([name, count]) => {
                console.log(`  "${name}": ${count} items`)
            })
        }

    } catch (err) { }
}

verify()
