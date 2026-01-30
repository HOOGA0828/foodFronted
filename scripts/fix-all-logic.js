
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')

async function fixAll() {
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

        console.log('--- FETCHING BRANDS ---')
        const { data: brands, error: bErr } = await supabase.from('brands').select('id, name')
        if (bErr) { console.error(bErr); return }
        console.log('Known Brands:', brands.map(b => b.name).join(', '))

        console.log('\n--- FETCHING ALL PRODUCTS ---')
        const { data: products, error: pErr } = await supabase
            .from('products')
            .select('*')
            .limit(3000)

        if (pErr) { console.error(pErr); return }

        console.log(`Scanning ${products.length} products...`)
        let updatesCount = 0

        for (const p of products) {
            let metaName = p.metadata?.brand_info?.name || ''
            let pName = p.name || ''
            let targetBrand = null

            // LOGIC MAP: (Add rules here)
            const textToMatch = (metaName + ' ' + pName).toLowerCase()

            // 1. Lawson
            if (textToMatch.includes('lawson')) {
                const b = brands.find(x => x.name.toLowerCase() === 'lawson')
                if (b) targetBrand = b.name
            }
            // 2. FamilyMart
            if (textToMatch.includes('familymart') || textToMatch.includes('全家')) {
                const b = brands.find(x => x.name.toLowerCase().includes('familymart') || x.name.includes('全家'))
                if (b) targetBrand = b.name
            }
            // 3. McDonald's
            if (textToMatch.includes('mcdonald') || textToMatch.includes('麥當勞')) {
                const b = brands.find(x => x.name.toLowerCase().includes('mcdonald') || x.name.includes('麥當勞'))
                if (b) targetBrand = b.name
            }
            // 4. Sukiya
            if (textToMatch.includes('sukiya') || textToMatch.includes('すき家') || textToMatch.includes('食其家')) {
                const b = brands.find(x => x.name.toLowerCase().includes('sukiya') || x.name.includes('すき家'))
                if (b) targetBrand = b.name
            }
            // 5. Starbucks
            if (textToMatch.includes('starbucks') || textToMatch.includes('星巴克')) {
                const b = brands.find(x => x.name.toLowerCase().includes('starbucks') || x.name.includes('星巴克'))
                if (b) targetBrand = b.name
            }
            // 6. Yoshinoya
            if (textToMatch.includes('yoshinoya') || textToMatch.includes('吉野家')) {
                const b = brands.find(x => x.name.toLowerCase().includes('yoshinoya') || x.name.includes('吉野家'))
                if (b) targetBrand = b.name
            }
            // 7. KFC
            if (textToMatch.includes('kfc') || textToMatch.includes('肯德基')) {
                const b = brands.find(x => x.name.toLowerCase().includes('kfc') || x.name.includes('肯德基'))
                if (b) targetBrand = b.name
            }
            // 8. Mos Burger
            if (textToMatch.includes('mos') || textToMatch.includes('摩斯')) {
                const b = brands.find(x => x.name.toLowerCase().includes('mos') || x.name.includes('摩斯'))
                if (b) targetBrand = b.name
            }
            // 9. 7-Eleven (Often 7-11 or Seven)
            if (textToMatch.includes('7-eleven') || textToMatch.includes('seven')) {
                const b = brands.find(x => x.name.includes('7-Eleven'))
                if (b) targetBrand = b.name
            }


            if (targetBrand) {
                let needsUpdate = false
                let updates = {}

                // Fix Brand Mapping
                if (metaName !== targetBrand) {
                    updates.metadata = {
                        ...p.metadata,
                        brand_info: {
                            ...p.metadata?.brand_info,
                            name: targetBrand,
                            displayName: targetBrand
                        }
                    }
                    // Also update top-level brand if it exists in your schema? 
                    // (User mentioned 'brand' column earlier, though logs said it didn't exist? Check later. Safe to omit if using metadata.)
                    needsUpdate = true
                }

                // Fix Hidden Status
                if (p.is_expired === true || p.status === 'ignored') {
                    updates.is_expired = false
                    updates.status = 'active'
                    needsUpdate = true
                }

                if (needsUpdate) {
                    // console.log(`Fixing ${p.id} -> ${targetBrand}`)
                    const { error } = await supabase.from('products').update(updates).eq('id', p.id)
                    if (error) console.error(`Failed ${p.id}:`, error.message)
                    else updatesCount++
                }
            }
        }

        console.log(`\nDONE. Updated ${updatesCount} products to match authoritative brand names.`)

    } catch (err) {
        console.error('Script Error:', err)
    }
}

fixAll()
