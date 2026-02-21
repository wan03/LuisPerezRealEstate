const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('rls_test.log', msg + '\n');
}

// Load env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqzkbcyzahefgvodkmpz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
    log('No Anon Key found');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRLS() {
    log('1. Signing In...');
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'agent@example.com',
        password: 'password123'
    });

    if (authError) {
        log('Auth Failed: ' + JSON.stringify(authError));
        process.exit(1);
    }
    log('Signed in as: ' + session.user.id);

    // 2. Try to Insert Profile
    const clientId = crypto.randomUUID();
    log('2. Inserting Profile: ' + clientId);
    const { error: profileError } = await supabase.from('profiles').insert({
        id: clientId,
        full_name: 'RLS Test Client',
        role: 'client'
    });

    if (profileError) {
        log('Profile Insert Failed: ' + JSON.stringify(profileError));
    } else {
        log('Profile Insert Success!');
    }

    // 3. Try to Insert Transaction
    log('3. Inserting Transaction...');
    const { error: txError } = await supabase.from('transactions').insert({
        client_id: clientId,
        custom_property_name: 'RLS Test Property',
        status: 'lead',
        estimated_value: 100000,
        commission_rate: 3.0
    });

    if (txError) {
        log('Transaction Insert Failed: ' + JSON.stringify(txError));
    } else {
        log('Transaction Insert Success!');
    }
}

testRLS().catch(err => log('Fatal Error: ' + err.message));
