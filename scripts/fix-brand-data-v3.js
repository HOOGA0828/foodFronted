
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')

async function fixData() {
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

        console.log('--- FETCHING ALL PRODUCTS ---')

        // Fetch ALL products (limit 2000 to be safe) to filter in JS
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .limit(2000)

        if (error) {
            console.error('Fetch Error:', error)
            return
        }

        console.log(`Scanned ${products.length} products.`)

        let updateCount = 0

        for (const p of products) {
            const metaName = p.metadata?.brand_info?.name || ''
            let updates = {}
            let needsUpdate = false
            let isTarget = false

            // --- YOSHINOYA CHECK ---
            if (metaName === 'Yoshinoya' || metaName === '吉野家') {
                isTarget = true
                if (metaName !== '吉野家') {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: { ...p.metadata?.brand_info, name: '吉野家', displayName: '吉野家' }
                    }
                    needsUpdate = true
                }
            }

            // --- STARBUCKS CHECK ---
            if (metaName === 'Starbucks' || metaName === '星巴克') {
                isTarget = true
                if (metaName !== '星巴克') {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: { ...p.metadata?.brand_info, name: '星巴克', displayName: '星巴克' }
                    }
                    needsUpdate = true
                }
            }

            // --- COMMON: UN-EXPIRE ---
            if (isTarget) {
                if (p.is_expired === true || p.status === 'ignored') {
                    updates.is_expired = false
                    updates.status = 'active'
                    needsUpdate = true
                }
            }

            if (needsUpdate) {
                // console.log(`Updating [${p.name}]...`)
                const { error: upErr } = await supabase.from('products').update(updates).eq('id', p.id)
                if (upErr) console.error(`Failed ${p.id}:`, upErr.message)
                else updateCount++
            }
        }

        console.log(`Updates applied: ${updateCount}`)

    } catch (err) {
        console.error('Script Error:', err)
    }
}

fixData()
