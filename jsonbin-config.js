/**
 * ============================================================
 *  Luca's ID — JSONBin Configuration
 * ============================================================
 *  CARA SETUP (cuma 2 menit!):
 *  1. Buka https://jsonbin.io → klik "Sign Up" (gratis)
 *  2. Setelah login, klik "API Keys" di sidebar
 *  3. Copy "Secret Key" → paste ke JSONBIN_KEY di bawah
 *  4. Buka https://jsonbin.io/app/bins → klik "+ Create Bin"
 *     Isi dengan: {"products":[],"events":[],"sales":[]}
 *     Klik Create → copy BIN ID yang muncul → paste ke JSONBIN_BIN_ID
 *  5. Selesai! Deploy ke Vercel.
 * ============================================================
 */

const JSONBIN_KEY    = "GANTI_SECRET_KEY";   // contoh: $2a$10$abc...
const JSONBIN_BIN_ID = "GANTI_BIN_ID";       // contoh: 6630f1e...

const JB_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
const JB_HEADERS = {
    "Content-Type":  "application/json",
    "X-Master-Key":  JSONBIN_KEY,
    "X-Bin-Versioning": "false",
};

// ============================================================
// INTERNAL HELPERS
// ============================================================

let _cache = null;

async function _readDB() {
    if (_cache) return _cache;
    const res = await fetch(`${JB_URL}/latest`, { headers: JB_HEADERS });
    if (!res.ok) throw new Error("Gagal membaca database");
    const json = await res.json();
    _cache = json.record;
    return _cache;
}

async function _writeDB(data) {
    _cache = data;
    const res = await fetch(JB_URL, {
        method:  "PUT",
        headers: JB_HEADERS,
        body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan database");
    return res.json();
}

function _genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ============================================================
// DB HELPERS — API sama persis dengan supabase/firebase
// ============================================================

async function sbFetchAll() {
    const db = await _readDB();

    const products = (db.products || []).map(p => ({
        ...p,
        price: parseInt(p.price) || 0,
        links: Array.isArray(p.links) ? p.links : [],
    })).reverse();

    const events = (db.events || []).map(e => ({
        ...e,
        dateStart: e.date_start || '',
        dateExp:   e.date_exp   || '',
    })).reverse();

    const sales = (db.sales || []).map(s => ({
        ...s,
        productName: s.product_name || '',
        proofUrl:    s.proof_url    || '',
        buyDate:     s.buy_date     || '',
        expDate:     s.exp_date     || '',
        price:       parseInt(s.price) || 0,
    })).reverse().slice(0, 200);

    return { products, events, sales };
}

async function sbAddEvent(payload) {
    const db = await _readDB();
    const item = {
        id:         _genId(),
        title:      payload.title      || '',
        image:      payload.image      || '',
        date_start: payload.dateStart  || '',
        date_exp:   payload.dateExp    || '',
        content:    payload.content    || '',
        created_at: Date.now(),
    };
    db.events = [...(db.events || []), item];
    await _writeDB(db);
    return item;
}

async function sbAddProduct(payload) {
    const db = await _readDB();
    const item = {
        id:         _genId(),
        name:       payload.name,
        price:      parseInt(payload.price) || 0,
        category:   payload.category || 'Basic',
        links:      Array.isArray(payload.links) ? payload.links : [],
        created_at: Date.now(),
    };
    db.products = [...(db.products || []), item];
    await _writeDB(db);
    return item;
}

async function sbDelete(type, id) {
    const db = await _readDB();
    if (type === 'event') {
        db.events = (db.events || []).filter(e => e.id !== id);
    } else {
        db.products = (db.products || []).filter(p => p.id !== id);
    }
    await _writeDB(db);
    return true;
}

async function sbUploadAndSale({ user, productName, price, imageBase64 }) {
    const today   = new Date();
    const fmt     = d => `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    const buyDate = fmt(today);
    const exp     = new Date(today); exp.setDate(exp.getDate() + 30);
    const expDate = fmt(exp);

    // JSONBin tidak support file upload, simpan base64 langsung (atau kosong)
    // Untuk gambar kecil (<50KB) bisa disimpan, tapi sebaiknya kosongkan saja
    const proofUrl = '';

    const db = await _readDB();
    const item = {
        id:           _genId(),
        user,
        product_name: productName,
        price:        parseInt(price) || 0,
        proof_url:    proofUrl,
        buy_date:     buyDate,
        exp_date:     expDate,
        created_at:   Date.now(),
    };
    db.sales = [...(db.sales || []), item];
    await _writeDB(db);

    return { status: 'success' };
}
