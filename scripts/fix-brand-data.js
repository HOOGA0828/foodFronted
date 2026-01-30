
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')

async function fixData() {
    try {
        // 1. Setup Env
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

        console.log('--- STARTING DATA FIX (V2) ---')

        // 2. Fetch Products by NAME (since 'brand' column doesn't exist)
        const { data: products, error: fetchErr } = await supabase
            .from('products')
            .select('*')
            // Filter by English or Chinese names to catch them all
            .or('name.ilike.%Yoshinoya%,name.ilike.%吉野家%,name.ilike.%Starbucks%,name.ilike.%星巴克%')

        if (fetchErr) {
            console.error('Fetch Error:', fetchErr)
            return
        }

        console.log(`Found ${products.length} items to check.`)

        for (const p of products) {
            let updates = {}
            let needsUpdate = false
            let currentBrandName = p.metadata?.brand_info?.name || ''

            // --- Logic for YOSHINOYA ---
            if (p.name.toLowerCase().includes('yoshinoya') ||
                p.name.includes('吉野家') ||
                currentBrandName.toLowerCase().includes('yoshinoya')) {

                console.log(`Processing [Yoshinoya]: ${p.name}`)

                // Fix Metadata Brand Name -> "吉野家"
                if (currentBrandName !== '吉野家') {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: {
                            ...p.metadata?.brand_info,
                            name: '吉野家', // FORCE CHINESE NAME
                            displayName: '吉野家'
                        }
                    }
                    needsUpdate = true
                    console.log(`  -> Will update brand to "吉野家"`)
                }

                // Reactivate (Un-expire)
                if (p.is_expired === true) {
                    updates.is_expired = false
                    needsUpdate = true
                    console.log(`  -> Will un-expire`)
                }
                if (p.status === 'ignored') {
                    updates.status = 'active'
                    needsUpdate = true
                    console.log(`  -> Will set status to active`)
                }
            }

            // --- Logic for STARBUCKS ---
            if (p.name.toLowerCase().includes('starbucks') ||
                p.name.includes('星巴克') ||
                currentBrandName.toLowerCase().includes('starbucks')) {

                console.log(`Processing [Starbucks]: ${p.name}`)

                // Fix Metadata Brand Name -> "星巴克"
                if (currentBrandName !== '星巴克') {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: {
                            ...p.metadata?.brand_info,
                            name: '星巴克', // FORCE CHINESE NAME
                            displayName: '星巴克'
                        }
                    }
                    needsUpdate = true
                    console.log(`  -> Will update brand to "星巴克"`)
                }
            }

            // Apply Updates
            if (needsUpdate) {
                const { error: updateErr } = await supabase
                    .from('products')
                    .update(updates)
                    .eq('id', p.id)

                if (updateErr) {
                    console.error(`  [X] Failed to update ${p.id}:`, updateErr.message)
                } else {
                    console.log(`  [✓] Updated successfully.`)
                }
            } else {
                console.log(`  [-] No changes needed for ${p.name}`)
            }
        }

        console.log('--- FIX COMPLETE ---')

    } catch (err) {
        console.error('Script Error:', err)
    }
}

fixData()
