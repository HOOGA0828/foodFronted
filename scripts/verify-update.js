
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

    // Search for "肉多" which was in "肉多牛蛋"
    supabase.from('products').select('name, metadata, status, is_expired')
        .ilike('name', '%肉多%')
        .then(({ data, error }) => {
            if (error) { console.log('ERR', error); return }

            const result = data.map(p => ({
                name: p.name,
                brandMeta: p.metadata?.brand_info?.name,
                status: p.status,
                expired: p.is_expired
            }))

            console.log('[[[' + JSON.stringify(result) + ']]]')
        })

} catch (err) { }
