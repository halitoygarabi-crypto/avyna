
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkIdConstraint() {
    let output = '--- ID CONSTRAINT CHECK ---\n';
    
    // Test 1: Insert WITHOUT id
    output += 'Test 1: Inserting WITHOUT id column...\n';
    const p1 = {
        name: 'TEST_NO_ID_' + Date.now(),
        price: 1,
        category: 'Test',
        description: 'Test',
        stock: 1,
        images: []
    };
    const { error: error1 } = await supabase.from('products').insert([p1]);
    if (error1) {
        output += `Test 1 FAILED: ${error1.message} (${error1.code})\n`;
    } else {
        output += 'Test 1 SUCCESS: Database has a default for "id".\n';
        await supabase.from('products').delete().eq('name', p1.name);
    }

    // Test 2: Insert WITH explicit UUID
    output += '\nTest 2: Inserting WITH explicit id (UUID)...\n';
    const p2 = {
        id: crypto.randomUUID(),
        name: 'TEST_WITH_ID_' + Date.now(),
        price: 1,
        category: 'Test',
        description: 'Test',
        stock: 1,
        images: []
    };
    const { error: error2 } = await supabase.from('products').insert([p2]);
    if (error2) {
        output += `Test 2 FAILED: ${error2.message} (${error2.code})\n`;
    } else {
        output += 'Test 2 SUCCESS: Explicit ID works.\n';
        await supabase.from('products').delete().eq('name', p2.name);
    }

    // Test 3: Insert with NULL id
    output += '\nTest 3: Inserting with id: null...\n';
    const p3 = {
        id: null,
        name: 'TEST_NULL_ID_' + Date.now(),
        price: 1,
        category: 'Test',
        description: 'Test',
        stock: 1,
        images: []
    };
    const { error: error3 } = await supabase.from('products').insert([p3]);
    if (error3) {
        output += `Test 3 FAILED (as expected?): ${error3.message} (${error3.code})\n`;
    } else {
        output += 'Test 3 SUCCESS: Database accepts null id (weird?).\n';
        await supabase.from('products').delete().eq('name', p3.name);
    }

    const fs = await import('fs');
    fs.writeFileSync('id_results.txt', output);
    console.log('Results written to id_results.txt');
}

checkIdConstraint();
