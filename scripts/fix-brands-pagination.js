
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

        console.log('--- PAGINATED FIX ---')

        const PAGE_SIZE = 1000
        let page = 0
        let totalUpdated = 0
        let totalScanned = 0
        let hasMore = true

        while (hasMore) {
            const start = page * PAGE_SIZE
            const end = start + PAGE_SIZE - 1
            console.log(`Scanning range ${start} to ${end}...`)

            const { data: products, error } = await supabase
                .from('products')
                .select('id, name, metadata, status, is_expired')
                .range(start, end)

            if (error) {
                console.error('Fetch Error:', error)
                break
            }

            if (!products || products.length === 0) {
                console.log('No more products.')
                hasMore = false
                break
            }

            totalScanned += products.length

            for (const p of products) {
                const metaName = p.metadata?.brand_info?.name || ''
                const pName = p.name || ''

                const isYoshinoya = metaName.toLowerCase().includes('yoshinoya') ||
                    metaName.includes('吉野家') ||
                    pName.toLowerCase().includes('yoshinoya') ||
                    pName.includes('吉野家')

                // Also double check Starbucks just in case
                const isStarbucks = metaName.toLowerCase().includes('starbucks') ||
                    metaName.includes('星巴克') ||
                    pName.toLowerCase().includes('starbucks') ||
                    pName.includes('星巴克')

                if (isYoshinoya || isStarbucks) {
                    let updates = {}
                    let needsUpdate = false

                    if (isYoshinoya) {
                        if (metaName !== '吉野家') {
                            updates.metadata = {
                                ...p.metadata,
                                brand_info: { ...p.metadata?.brand_info, name: '吉野家', displayName: '吉野家' }
                            }
                            needsUpdate = true
                        }
                    } else if (isStarbucks) {
                        if (metaName !== '星巴克') {
                            updates.metadata = {
                                ...p.metadata,
                                brand_info: { ...p.metadata?.brand_info, name: '星巴克', displayName: '星巴克' }
                            }
                            needsUpdate = true
                        }
                    }

                    // Un-expire logic
                    if (p.is_expired === true || p.status === 'ignored') {
                        updates.is_expired = false
                        updates.status = 'active'
                        needsUpdate = true
                    }

                    if (needsUpdate) {
                        // console.log(`found target [${p.name}]`)
                        const { error: upErr } = await supabase.from('products').update(updates).eq('id', p.id)
                        if (upErr) console.error(`Failed ${p.id}:`, upErr.message)
                        else totalUpdated++
                    }
                }
            }

            page++
            if (products.length < PAGE_SIZE) {
                hasMore = false
            }
        }

        console.log(`DONE. Scanned: ${totalScanned}, Updated: ${totalUpdated}`)

    } catch (err) {
        console.error('Script Error:', err)
    }
}

fixData()
