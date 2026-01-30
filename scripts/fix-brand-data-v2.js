
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')

async function fixData() {
    try {
        // Setup
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

        console.log('--- FIXING YOSHINOYA ---')

        // 1. Fetch Yoshinoya Candidates by NAME (English or Chinese)
        const { data: yProducts, error: yErr } = await supabase
            .from('products')
            .select('*')
            .or('name.ilike.%Yoshinoya%,name.ilike.%吉野家%')

        if (yErr) {
            console.error('Yoshinoya Fetch Error:', yErr)
        } else {
            console.log(`Found ${yProducts.length} Yoshinoya items.`)
            for (const p of yProducts) {
                const currentMetaName = p.metadata?.brand_info?.name
                const updates = {}
                let needsUpdate = false

                // Fix Metadata to '吉野家'
                if (currentMetaName !== '吉野家') {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: { ...p.metadata?.brand_info, name: '吉野家', displayName: '吉野家' }
                    }
                    needsUpdate = true
                }

                // Un-expire logic
                if (p.is_expired === true || p.status === 'ignored') {
                    updates.is_expired = false
                    updates.status = 'active'
                    needsUpdate = true
                }

                if (needsUpdate) {
                    process.stdout.write(`Updating ${p.name.substring(0, 20)}... `)
                    const { error: upErr } = await supabase.from('products').update(updates).eq('id', p.id)
                    if (upErr) console.log('FAIL:', upErr.message)
                    else console.log('OK')
                }
            }
        }

        console.log('\n--- FIXING STARBUCKS ---')

        // 2. Fetch Starbucks Candidates
        const { data: sProducts, error: sErr } = await supabase
            .from('products')
            .select('*')
            .or('name.ilike.%Starbucks%,name.ilike.%星巴克%')

        if (sErr) {
            console.error('Starbucks Fetch Error:', sErr)
        } else {
            console.log(`Found ${sProducts.length} Starbucks items.`)
            for (const p of sProducts) {
                const currentMetaName = p.metadata?.brand_info?.name
                const updates = {}
                let needsUpdate = false

                // Fix Metadata to '星巴克'
                if (currentMetaName !== '星巴克') {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: { ...p.metadata?.brand_info, name: '星巴克', displayName: '星巴克' }
                    }
                    needsUpdate = true
                }

                // Un-expire logic
                if (p.is_expired === true || p.status === 'ignored') {
                    updates.is_expired = false
                    updates.status = 'active'
                    needsUpdate = true
                }

                if (needsUpdate) {
                    process.stdout.write(`Updating ${p.name.substring(0, 20)}... `)
                    const { error: upErr } = await supabase.from('products').update(updates).eq('id', p.id)
                    if (upErr) console.log('FAIL:', upErr.message)
                    else console.log('OK')
                }
            }
        }

    } catch (err) {
        console.error('Script Error:', err)
    }
}

fixData()
