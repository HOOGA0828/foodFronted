
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

        console.log('--- FETCHING PRODUCTS (V4) ---')

        const { data: products, error } = await supabase
            .from('products')
            .select('id, name, metadata, status, is_expired') // Select specific cols like diagnose script

        if (error) {
            console.error('Fetch Error:', error)
            return
        }

        console.log(`Scanned ${products.length} products.`)

        let updateCount = 0

        for (const p of products) {
            const metaName = p.metadata?.brand_info?.name || ''
            const pName = p.name || ''

            // Fuzzy match to see if we finding ANYTHING
            const isYoshinoya = metaName.toLowerCase().includes('yoshinoya') ||
                metaName.includes('吉野家') ||
                pName.toLowerCase().includes('yoshinoya') ||
                pName.includes('吉野家')

            const isStarbucks = metaName.toLowerCase().includes('starbucks') ||
                metaName.includes('星巴克') ||
                pName.toLowerCase().includes('starbucks') ||
                pName.includes('星巴克')

            if (isYoshinoya || isStarbucks) {
                console.log(`[MATCH] ${pName}`)
                console.log(`   MetaBrand: '${metaName}'`)

                let updates = {}
                let needsUpdate = false

                // FORCE UPDATE if it's not the Chinese name
                if (isYoshinoya && metaName !== '吉野家') {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: { ...p.metadata?.brand_info, name: '吉野家', displayName: '吉野家' }
                    }
                    needsUpdate = true
                    console.log('   -> Set Brand: 吉野家')
                }
                if (isStarbucks && metaName !== '星巴克') {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: { ...p.metadata?.brand_info, name: '星巴克', displayName: '星巴克' }
                    }
                    needsUpdate = true
                    console.log('   -> Set Brand: 星巴克')
                }

                // UN-EXPIRE
                if (p.is_expired === true || p.status === 'ignored') {
                    updates.is_expired = false
                    updates.status = 'active'
                    needsUpdate = true
                    console.log('   -> Set Active')
                }

                if (needsUpdate) {
                    const { error: upErr } = await supabase.from('products').update(updates).eq('id', p.id)
                    if (upErr) console.error(`   [FAIL] ${upErr.message}`)
                    else {
                        console.log(`   [OK] Updated`)
                        updateCount++
                    }
                } else {
                    console.log('   [SKIP] No changes needed')
                }
            }
        }

        console.log(`Total Updates: ${updateCount}`)

    } catch (err) {
        console.error('Script Error:', err)
    }
}

fixData()
