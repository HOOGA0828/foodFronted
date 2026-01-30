
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

        const { data: products } = await supabase
            .from('products')
            .select('name, metadata, status, is_expired')

        let yCount = 0
        let sCount = 0

        products.forEach(p => {
            const b = p.metadata?.brand_info?.name
            if (b === '吉野家') {
                yCount++
                if (p.is_expired) console.log('WARNING: Yoshinoya item still expired!')
            }
            if (b === '星巴克') {
                sCount++
                if (p.is_expired) console.log('WARNING: Starbucks item still expired!')
            }
        })

        console.log(`Final Counts:`)
        console.log(`Yoshinoya (吉野家): ${yCount}`)
        console.log(`Starbucks (星巴克): ${sCount}`)

    } catch (err) { }
}

verify()
