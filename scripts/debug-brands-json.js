
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

    supabase.from('brands').select('name, favicon_url').then(({ data, error }) => {
        if (error) {
            console.error('DB_ERR')
            return
        }
        const targets = data.filter(b =>
            b.name.toLowerCase().includes('starbucks') ||
            b.name.includes('星巴克') ||
            b.name.toLowerCase().includes('yoshinoya') ||
            b.name.includes('吉野家')
        )
        console.log('[[[' + JSON.stringify(targets) + ']]]')
    })
} catch (err) {
    console.error('SETUP_ERR')
}
