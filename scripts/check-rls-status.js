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

    console.log('=== Environment Check ===')
    console.log('Supabase URL:', envVars.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
    console.log('Anon Key:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (starts with: ' + envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...)' : '❌ Missing')

    // 嘗試使用 service_role key (如果有的話)
    const hasServiceKey = !!envVars.SUPABASE_SERVICE_ROLE_KEY
    console.log('Service Role Key:', hasServiceKey ? '✅ Available' : '⚠️ Not set')

    console.log('\n=== Testing with ANON key ===')
    const supabaseAnon = createClient(
        envVars.NEXT_PUBLIC_SUPABASE_URL,
        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    supabaseAnon.from('products')
        .select('id')
        .limit(1)
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ ANON key cannot read products:', error.code, error.message)
            } else {
                console.log('✅ ANON key can read products')
            }

            return supabaseAnon.from('brands').select('id').limit(1)
        })
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ ANON key cannot read brands:', error.code, error.message)
            } else {
                console.log('✅ ANON key can read brands')
            }

            // 如果有 service key，測試它
            if (hasServiceKey) {
                console.log('\n=== Testing with SERVICE_ROLE key ===')
                const supabaseService = createClient(
                    envVars.NEXT_PUBLIC_SUPABASE_URL,
                    envVars.SUPABASE_SERVICE_ROLE_KEY
                )

                return supabaseService.from('products')
                    .select('id, name, brand_id')
                    .limit(3)
                    .then(({ data, error }) => {
                        if (error) {
                            console.log('❌ SERVICE key error:', error.code, error.message)
                        } else {
                            console.log('✅ SERVICE key can read products:', data?.length || 0, 'items')
                            if (data && data.length > 0) {
                                console.log('Sample data:', JSON.stringify(data[0], null, 2))
                            }
                        }

                        return supabaseService.from('brands').select('*').limit(3)
                    })
                    .then(({ data, error }) => {
                        if (error) {
                            console.log('❌ SERVICE key cannot read brands:', error.code, error.message)
                        } else {
                            console.log('✅ SERVICE key can read brands:', data?.length || 0, 'items')
                            if (data && data.length > 0) {
                                console.log('Brands:', JSON.stringify(data, null, 2))
                            }
                        }
                    })
            }
        })
        .catch(err => {
            console.error('❌ Unexpected Error:', err)
        })

} catch (err) {
    console.error('❌ Setup Error:', err.message)
}
