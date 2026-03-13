import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') }); // Also load .env.local

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the 'dist' directory (frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Database Initialization
// SQLite has been removed to improve deployment speeds.
// We are purely using Supabase now.

// --- PRODUCT ROUTES ---

app.get('/api/products', async (req, res) => {
    try {
        console.log('[GET /api/products] Fetching products from Supabase...');
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('[Supabase Error] Fetch failed:', error.message);
            return res.status(500).json({ error: 'Ürünler yüklenemedi: ' + error.message });
        }

        console.log(`[Supabase] Successfully fetched ${data.length} products.`);
        const mapped = data.map(p => ({
            ...p,
            images: p.images || [],
            modelUrl: p.modelurl,
            videoUrl: p.videourl,
            colors: p.colors || [],
            fabricProperties: p.fabric_properties || undefined,
            discountPrice: p.discount_price || undefined
        }));
        res.json(mapped);
    } catch (error) {
        console.error('[Fatal Error] /api/products:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        time: new Date().toISOString(),
        env: {
            supabaseUrl: !!supabaseUrl,
            supabaseKey: !!supabaseKey
        }
    });
});

app.post('/api/products', async (req, res) => {
    const bodySize = JSON.stringify(req.body).length;
    console.log(`[POST /api/products] Received request. Body size: ${(bodySize / 1024).toFixed(2)} KB`);

    const { name, price, category, description, stock, images, modelUrl, dimensions, videoUrl, colors, fabricProperties } = req.body;
    
    try {
        if (!name || isNaN(price)) {
            return res.status(400).json({ error: 'Eksik bilgi: İsim ve fiyat zorunludur.' });
        }

        // Generate a UUID for the product to satisfy Supabase's non-null constraint
        const productId = crypto.randomUUID();

        // 1. Save to Supabase (Source of Truth)
        const dbProduct = {
            id: productId,
            name,
            price,
            category,
            description,
            stock,
            images: images || [],
            modelurl: modelUrl,
            dimensions: dimensions || { width: 100, height: 100, depth: 100 },
            videourl: videoUrl,
            colors: colors || [],
            fabric_properties: fabricProperties || null
        };

        console.log(`[Supabase] Inserting product: ${name} (${productId})`);
        const { data: supData, error: supError } = await supabase
            .from('products')
            .insert([dbProduct])
            .select()
            .single();

        if (supError) {
            console.error('[Supabase Error] Insert failed:', supError);
            return res.status(500).json({ 
                error: `Supabase Hatası: ${supError.message}`, 
                code: supError.code,
                hint: supError.hint 
            });
        }

        console.log(`[Supabase] Insert success: ${name}`);

        // No local SQLite mirroring anymore

        res.status(201).json({ success: true, ...supData });
    } catch (error) {
        console.error('[Route Error] Add Product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Delete from Supabase
        const { error: supError } = await supabase.from('products').delete().eq('id', id);
        if (supError) throw supError;

        // SQLite deletion removed

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE product
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const bodySize = JSON.stringify(req.body).length;
    console.log(`[PUT /api/products/${id}] Received request. Body size: ${(bodySize / 1024).toFixed(2)} KB`);

    const { name, price, category, description, stock, images, modelUrl, dimensions, videoUrl, colors, fabricProperties } = req.body;
    
    try {
        const dbProduct = {
            id, // Include ID for upsert to work correctly
            name,
            price,
            category,
            description,
            stock,
            images: images || [],
            modelurl: modelUrl,
            dimensions: dimensions || null,
            videourl: videoUrl,
            colors: colors || [],
            fabric_properties: fabricProperties || null
        };

        console.log(`[Supabase] Upserting product: ${name} (${id})`);
        
        // Use UPSERT instead of UPDATE + EQ to handle local-only SQLite products (IDs like "3")
        // No .single() here to avoid coercion error if nothing happens
        const { data: supDataArr, error: supError } = await supabase
            .from('products')
            .upsert(dbProduct)
            .select();

        if (supError) {
            console.error('[Supabase Error] Upsert failed:', supError);
            return res.status(500).json({ 
                error: `Supabase Hatası: ${supError.message}`, 
                code: supError.code,
                hint: supError.hint 
            });
        }

        const supData = supDataArr && supDataArr.length > 0 ? supDataArr[0] : null;
        console.log(`[Supabase] Upsert success: ${name}`, supData ? 'Row returned' : 'No row returned');
        
        // SQLite mirroring removed

        res.json({ success: true, ...(supData || dbProduct) });
    } catch (error) {
        console.error('[Route Error] Update Product:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- ORDER ROUTES ---

app.post('/api/orders', async (req, res) => {
    const { customerName, customerEmail, customerPhone, address, total, items } = req.body;
    const id = 'ORD-' + Date.now();
    const createdAt = new Date().toISOString();
    try {
        const { error } = await supabase
            .from('orders')
            .insert([{
                id,
                customername: customerName,
                customeremail: customerEmail,
                customerphone: customerPhone,
                address,
                total,
                items,
                createdat: createdAt,
                status: 'pending'
            }]);

        if (error) throw error;
        
        res.status(201).json({ success: true, orderId: id });
    } catch (error) {
        console.error('[Supabase Error] Create Order:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('createdat', { ascending: false });

        if (error) throw error;

        const parsedOrders = orders.map(o => ({
            ...o,
            customerName: o.customername,
            customerEmail: o.customeremail,
            customerPhone: o.customerphone,
            createdAt: o.createdat
        }));
        res.json(parsedOrders);
    } catch (error) {
        console.error('[Supabase Error] Get Orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- AI PROXY ROUTES ---

// Gemini Proxy
app.post('/api/ai/generate-description', async (req, res) => {
    const { name, category } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not found' });
    }

    try {
        // We'll call Gemini API here or just proxy the request
        // For now, let's keep it simple and assume the frontend might still call it,
        // but this is where it SHOULD go.
        res.json({ message: 'AI proxy ready - implement logic' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// n8n Proxy
app.post('/api/ai/image-to-3d', async (req, res) => {
    const { imageUrl } = req.body;
    const webhookUrl = 'https://n8n.polmarkai.pro/webhook-test/image-to-3d';

    try {
        const response = await axios.post(webhookUrl, { imageUrl });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- QNB FINANSBANK PAYMENT ROUTES ---

app.post('/api/payment/qnb/initiate', async (req, res) => {
    try {
        const {
            email,
            payment_amount,
            merchant_oid,
            user_name,
            user_address,
            user_phone,
            user_basket
        } = req.body;

        const mbrId = process.env.QNB_MBR_ID || "5";
        const clientId = process.env.QNB_MERCHANT_ID;
        const terminalId = process.env.QNB_TERMINAL_ID;
        const userCode = process.env.QNB_USER_CODE || clientId;
        const userPass = process.env.QNB_USER_PASS;
        const merchantPass = process.env.QNB_MERCHANT_PASS;
        const storeType = process.env.QNB_STORE_TYPE || "3d";

        const backendBaseUrl = (process.env.BACKEND_URL || 'https://avyna.com.tr').replace(/\/$/, '');
        const okUrl = `${backendBaseUrl}/payment-success`;
        const failUrl = `${backendBaseUrl}/payment-fail`;
 
        const rnd = crypto.randomBytes(10).toString('hex');
        const installment = "0";
        const txnType = "Auth";
        const currency = "949"; // TRY

        // QNB Hash Order (from documentation): 
        // MbrId + MrcOrderId + PurchAmount + OkUrl + FailUrl + TxnType + InstallmentCount + Rnd + MerchantPass
        const hashStr = mbrId + merchant_oid + payment_amount + okUrl + failUrl + txnType + installment + rnd + merchantPass;
        console.log('Hash String (masked):', hashStr.replace(merchantPass, '***'));
 
        // CRITICAL: QNB requires SHA1 Base64
        const hash = crypto.createHash('sha1').update(hashStr, 'utf8').digest('base64');
        console.log('Generated Hash (SHA1 Base64):', hash);

        // 3DHost Model - NO CARD DETAILS!
        const params = {
            MbrId: mbrId,
            MerchantId: clientId,
            UserCode: userCode,
            UserPass: userPass,
            SecureType: "3DHost", // Fixed to 3DHost
            TxnType: txnType,
            InstallmentCount: installment,
            Currency: currency,
            OkUrl: okUrl,
            FailUrl: failUrl,
            OrderId: merchant_oid,
            PurchAmount: payment_amount,
            Lang: "TR",
            Rnd: rnd,
            Hash: hash
        };

        const gatewayUrl = process.env.QNB_GATEWAY_URL || 'https://vpos.qnb.com.tr/Gateway/3dHost.aspx';

        console.log('Gateway URL:', gatewayUrl);
        console.log('Params (masked):', { ...params, UserPass: '***', Hash: '***' });

        // Create HTML form that auto-submits to bank's page
        const formHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Ödeme Sayfasına Yönlendiriliyor...</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .loader {
            text-align: center;
            color: white;
        }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <p>Güvenli ödeme sayfasına yönlendiriliyorsunuz...</p>
    </div>
    <form id="paymentForm" action="${gatewayUrl}" method="POST">
        ${Object.entries(params).map(([key, value]) => 
            `<input type="hidden" name="${key}" value="${value}">`
        ).join('\n        ')}
    </form>
    <script>
        document.getElementById('paymentForm').submit();
    </script>
</body>
</html>`;

        res.send(formHtml);

    } catch (error) {
        console.error('QNB Initiation Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// QNB Callback
app.post('/api/payment/qnb/callback', async (req, res) => {
    console.log('QNB Callback received:', req.body);
    res.send('OK');
});

// Handle Bank POST redirects back to our site
app.post('/payment-success', async (req, res) => {
    // QNB sends parameters in PascalCase or lowercase depending on version
    let oid = req.body.OrderId || req.body.oid || req.body.OrderId;
    const response = req.body.Response || req.body.response;
    
    console.log('Payment successful callback received:', req.body);

    // If it's a 32-char string without dashes, reconstruct the UUID for Supabase
    if (oid && oid.length === 32 && !oid.includes('-')) {
        oid = oid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
    }
    
    console.log('Processed Order ID:', oid);

    // Attempt to update order status in Supabase using REST API
    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey && oid) {
            await axios.patch(`${supabaseUrl}/rest/v1/orders?id=eq.${oid}`,
                { status: 'paid' },
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    }
                }
            ).catch(err => console.log('Supabase Update Warning (likely RLS):', err.message));
        }
    } catch (err) {
        console.error('Error updating order status in Supabase:', err.message);
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success`);
});

app.post('/payment-fail', (req, res) => {
    // QNB Finansbank typically sends: OrderId, Response, AuthCode, ProcReturnCode, ErrMsg, HostRefNum
    let oid = req.body.OrderId || req.body.oid;
    
    // If it's a 32-char string without dashes, reconstruct the UUID
    if (oid && oid.length === 32 && !oid.includes('-')) {
        oid = oid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
    }

    const errmsg = req.body.ErrMsg || req.body.errmsg || req.body.mdErrorMsg || 'İşlem banka tarafından reddedildi.';
    const responseCode = req.body.ProcReturnCode || req.body.Response || 'Error';

    console.log('Payment failed callback received:', req.body);
    console.log('Order ID:', oid, 'Response Code:', responseCode, 'Error:', errmsg);
    
    // Redirect to frontend with error message in query params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = new URL(`${frontendUrl}/payment-fail`);
    redirectUrl.searchParams.append('error', errmsg);
    redirectUrl.searchParams.append('code', responseCode);
    if (oid) redirectUrl.searchParams.append('oid', oid);
    
    res.redirect(redirectUrl.toString());
});

// Fallback to index.html for any other routes (SPA routing)
// Specific routes for payment pages (needed for SPA to work after redirect)
app.get('/payment-success', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/payment-fail', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Catch-all for other SPA routes
// Catch-all for other SPA routes (Middleware approach for compatibility)
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/payment-success') || req.path.startsWith('/payment-fail')) {
        return next();
    }
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
