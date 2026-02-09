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

    console.log('=== Testing Products Table ===')
    supabase.from('products')
        .select('id, name, brand_id')
        .limit(3)
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ Products Error:', error.code, error.message)
            } else {
                console.log('✅ Products Count:', data?.length || 0)
                console.log('Products:', JSON.stringify(data, null, 2))
            }

            console.log('\n=== Testing Brands Table ===')
            return supabase.from('brands')
                .select('id, name, slug')
                .limit(5)
        })
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ Brands Error:', error.code, error.message)
            } else {
                console.log('✅ Brands Count:', data?.length || 0)
                console.log('Brands:', JSON.stringify(data, null, 2))
            }

            console.log('\n=== Check 7-Eleven Products ===')
            return supabase.from('products')
                .select('id, name, brand_id, status, is_expired')
                .limit(10)
        })
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ 7-Eleven Products Error:', error.code, error.message)
            } else {
                console.log('✅ Total Products:', data?.length || 0)
                console.log('Sample:', JSON.stringify(data, null, 2))
            }
        })
        .catch(err => {
            console.error('❌ Unexpected Error:', err)
        })

} catch (err) {
    console.error('❌ Setup Error:', err.message)
}
