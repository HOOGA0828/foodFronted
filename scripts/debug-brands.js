
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

    const url = envVars.NEXT_PUBLIC_SUPABASE_URL
    const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log(`Connecting to: ${url.substring(0, 20)}...`)

    const supabase = createClient(url, key)

    supabase.from('brands').select('id, name, favicon_url').then(({ data, error }) => {
        if (error) {
            console.error('DB Error:', error.message)
            return
        }

        console.log(`Total brands found: ${data.length}`)

        // Filter for Starbucks / Yoshinoya specifically
        const targets = data.filter(b =>
            b.name.toLowerCase().includes('starbucks') ||
            b.name.includes('星巴克') ||
            b.name.toLowerCase().includes('yoshinoya') ||
            b.name.includes('吉野家')
        )

        console.log('--- TARGET BRANDS ---')
        if (targets.length === 0) {
            console.log('No matching brands found (Starbucks/Yoshinoya).')
        }
        targets.forEach(b => {
            console.log(`Brand: ${b.name}`)
            console.log(`Favicon: ${b.favicon_url === null ? 'NULL' : `'${b.favicon_url}'`}`)
            console.log('---')
        })

        console.log('--- BRANDS WITH ICONS ---')
        const withIcons = data.filter(b => b.favicon_url && b.favicon_url.length > 5)
        withIcons.forEach(b => {
            console.log(`[${b.name}]: ${b.favicon_url.substring(0, 30)}...`)
        })
    })
} catch (err) {
    console.error('Setup Error:', err)
}
