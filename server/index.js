import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the 'dist' directory (frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Database Initialization
const db = new Database('database.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    description TEXT,
    stock INTEGER DEFAULT 0,
    imageUrl TEXT,
    modelUrl TEXT,
    dimensions TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerName TEXT,
    customerEmail TEXT,
    customerPhone TEXT,
    address TEXT,
    total REAL,
    status TEXT DEFAULT 'pending',
    items TEXT,
    createdAt TEXT
  );
`);

// --- PRODUCT ROUTES ---

app.get('/api/products', (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
        // Parse dimensions and images if they exist
        const parsedProducts = products.map(p => ({
            ...p,
            dimensions: p.dimensions ? JSON.parse(p.dimensions) : null,
            images: p.imageUrl ? JSON.parse(p.imageUrl) : []
        }));
        res.json(parsedProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products', (req, res) => {
    const { id, name, price, category, description, stock, imageUrl, modelUrl, dimensions } = req.body;
    try {
        const stmt = db.prepare(`
      INSERT INTO products (id, name, price, category, description, stock, imageUrl, modelUrl, dimensions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id || Date.now().toString(), name, price, category, description, stock, imageUrl, modelUrl, JSON.stringify(dimensions));
        res.status(201).json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        stmt.run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ORDER ROUTES ---

app.post('/api/orders', (req, res) => {
    const { customerName, customerEmail, customerPhone, address, total, items } = req.body;
    const id = 'ORD-' + Date.now();
    const createdAt = new Date().toISOString();
    try {
        const stmt = db.prepare(`
      INSERT INTO orders (id, customerName, customerEmail, customerPhone, address, total, items, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, customerName, customerEmail, customerPhone, address, total, JSON.stringify(items), createdAt);
        res.status(201).json({ success: true, orderId: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders', (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
        const parsedOrders = orders.map(o => ({
            ...o,
            items: JSON.parse(o.items)
        }));
        res.json(parsedOrders);
    } catch (error) {
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
            user_basket,
            pan,        // Card Number
            expiry,     // Card Expiry (MM/YY or MM/YYYY)
            cv2,        // CVV
            cardType,   // 1 for Visa, 2 for MasterCard
            card_holder // Card Holder Name
        } = req.body;

        const mbrId = process.env.QNB_MBR_ID || "5";
        const clientId = process.env.QNB_MERCHANT_ID;
        const terminalId = process.env.QNB_TERMINAL_ID;
        const merchantPass = process.env.QNB_MERCHANT_PASS;
        const storeType = process.env.QNB_STORE_TYPE || "3d";

        const backendBaseUrl = (process.env.BACKEND_URL || 'https://avyna.com.tr').replace(/\/$/, '');
        const okUrl = `${backendBaseUrl}/payment-success`;
        const failUrl = `${backendBaseUrl}/payment-fail`;
 
        const rnd = crypto.randomBytes(10).toString('hex');
        const installment = "0"; // Changed from "" to "0" for single payment
        const txnType = "Auth";
        const currency = "949"; // TRY

        // QNB Hash Order (from documentation): 
        // MbrId + MrcOrderId + PurchAmount + OkUrl + FailUrl + TxnType + InstallmentCount + Rnd + MerchantPass
        const hashStr = mbrId + merchant_oid + payment_amount + okUrl + failUrl + txnType + installment + rnd + merchantPass;
        console.log('Hash String (masked):', hashStr.replace(merchantPass, '***'));

        // Use SHA512 for hash calculation (QNB standard)
        // Trying HEX uppercase which is common for modern VPOS
        const hash = crypto.createHash('sha512').update(hashStr, 'utf8').digest('hex').toUpperCase();
        console.log('Generated Hash (HEX):', hash);

        // QNB expects expiry as YYMM
        let expiryFormatted = expiry.replace('/', '');
        if (expiryFormatted.length === 4) {
            const mm = expiryFormatted.substring(0, 2);
            const yy = expiryFormatted.substring(2, 4);
            expiryFormatted = yy + mm;
        }

        const params = {
            MbrId: mbrId,
            MerchantID: clientId,
            UserCode: clientId,
            UserPass: merchantPass,
            SecureType: "3DPay",
            TxnType: txnType,
            InstallmentCount: installment,
            Currency: currency,
            OkUrl: okUrl,
            FailUrl: failUrl,
            OrderId: merchant_oid,
            PurchAmount: payment_amount,
            Lang: "TR",
            Rnd: rnd,
            Hash: hash,
            Pan: pan,
            Expiry: expiryFormatted,
            Cvv2: cv2,
            CardHolderName: card_holder || user_name // QNB sometimes uses CardHolderName
        };

        // QNB 3D Secure Gateway URL
        const gatewayUrl = process.env.QNB_GATEWAY_URL || 'https://vpos.qnbfinansbank.com/Gateway/3DHost.aspx';

        console.log('Gateway URL:', gatewayUrl);
        console.log('Params (masked):', { ...params, UserPass: '***', Hash: '***' });

        res.json({
            status: 'success',
            paymentUrl: gatewayUrl,
            params: params
        });

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
    const oid = req.body.OrderId || req.body.oid || req.body.OrderId;
    const response = req.body.Response || req.body.response;
    
    console.log('Payment successful callback received:', req.body);
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

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`);
});

app.post('/payment-fail', (req, res) => {
    // QNB Finansbank typically sends: OrderId, Response, AuthCode, ProcReturnCode, ErrMsg, HostRefNum
    const oid = req.body.OrderId || req.body.oid;
    const errmsg = req.body.ErrMsg || req.body.errmsg || req.body.mdErrorMsg || 'İşlem banka tarafından reddedildi.';
    const responseCode = req.body.ProcReturnCode || req.body.Response || 'Error';

    console.log('Payment failed callback received:', req.body);
    console.log('Order ID:', oid, 'Response Code:', responseCode, 'Error:', errmsg);
    
    // Redirect to frontend with error message in query params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
