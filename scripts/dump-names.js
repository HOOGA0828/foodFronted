
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')

async function dumpNames() {
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

        const { data: products } = await supabase
            .from('products')
            .select('name')
            .range(0, 2000)

        const names = products.map(p => p.name).join('\n')
        fs.writeFileSync('all_product_names.txt', names)

        console.log(`Dumped ${products.length} names.`)

    } catch (err) { }
}

dumpNames()
