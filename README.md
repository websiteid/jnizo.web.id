# Luca's ID — JSONBin Setup (2 Menit!)

## Langkah 1: Daftar JSONBin
1. Buka https://jsonbin.io → Sign Up (gratis)
2. Login → klik "API Keys" di sidebar
3. Copy Secret Key (contoh: $2a$10$abc...)

## Langkah 2: Buat Database
1. Klik Bins → + Create Bin
2. Isi dengan: {"products":[],"events":[],"sales":[]}
3. Klik Create → copy BIN ID dari URL

## Langkah 3: Edit jsonbin-config.js
Buka jsonbin-config.js, ganti baris 12-13:
  const JSONBIN_KEY    = "PASTE_SECRET_KEY_DI_SINI";
  const JSONBIN_BIN_ID = "PASTE_BIN_ID_DI_SINI";

## Langkah 4: Deploy ke Vercel
Drag & drop folder ini ke vercel.com → Deploy

## Login Operator
Email: naj4235461@gmail.com
Password: naj100
