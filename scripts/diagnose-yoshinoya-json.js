
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

    supabase.from('products')
        .select('name, metadata, status, is_expired')
        .then(({ data: products, error }) => {
            if (error) { console.log('ERR'); return }

            const targets = products.filter(p => {
                const n = p.name || ''
                const b = p.metadata?.brand_info?.name || ''
                return n.includes('吉野家') || n.toLowerCase().includes('yoshinoya') ||
                    b.includes('吉野家') || b.toLowerCase().includes('yoshinoya')
            })

            const result = targets.map(p => ({
                name: p.name,
                brandMeta: p.metadata?.brand_info?.name,
                status: p.status,
                expired: p.is_expired
            }))

            console.log('[[[' + JSON.stringify(result) + ']]]')
        })

} catch (err) { }
