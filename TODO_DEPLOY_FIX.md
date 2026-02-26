# TODO: Fix 404 Error Kategori (Deploy Backend)

## ✅ Completed Tasks:

### 1. Update API Client
- [x] Modified `client/src/api/index.js`
  - [x] Added environment variable support (`VITE_API_URL`)
  - [x] Added response interceptor for better error handling
  - [x] Fallback to `/api` for local development

### 2. Documentation
- [x] Created `client/.env.example` - template environment variables
- [x] Created `DEPLOY_BACKEND.md` - complete deployment guide

## ⏳ Next Steps (User Action Required):

### 1. Deploy Backend ke Railway.app (Free $5 Credit/Bulan)
- [ ] Sign up/login ke https://railway.app (pakai GitHub)
- [ ] Klik "New Project" → "Deploy from GitHub repo"
- [ ] Pilih repository `rekal-blackbox`
- [ ] Add environment variables: `PORT=3000`, `NODE_ENV=production`
- [ ] Railway akan auto-deploy
- [ ] Catat URL yang diberikan (contoh: `https://rekal-api.up.railway.app`)

### 2. Update Netlify Environment
- [ ] Login ke Netlify Dashboard
- [ ] Pilih site ReKal → "Site settings" → "Environment variables"
- [ ] Add environment variable: `VITE_API_URL=https://rekal-api.up.railway.app/api`
- [ ] Trigger redeploy


### 3. Testing
- [ ] Buka aplikasi Netlify
- [ ] Coba tambah kategori baru
- [ ] Verifikasi tidak ada error 404


## Summary Perubahan Kode:

**File: `client/src/api/index.js`**
```javascript
// Sebelum:
const api = axios.create({
  baseURL: '/api',
  ...
});

// Sesudah:
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  ...
});
// + error interceptor untuk debugging
```

**File Baru: `package.json` (root)**
- Konfigurasi untuk Railway/Cyclic deployment
- Start command: `cd server && node src/index.js`

**File Baru: `cyclic.json` (root)**
- Konfigurasi untuk Cyclic.sh (backup jika Railway tidak tersedia)



## Error Messages yang Lebih Jelas:

Sekarang user akan melihat pesan error yang informatif:
- "Tidak dapat terhubung ke server. Pastikan backend server berjalan..."
- "Endpoint tidak ditemukan: /api/categories. Pastikan backend server sudah di-deploy..."

## Notes:
- ✅ Development lokal tetap berfungsi tanpa perubahan
- ✅ Railway.app: $5 credit gratis/bulan, cukup untuk app kecil
- ✅ SQLite di Railway persistent (data tidak hilang)
- ✅ File `package.json` dan `cyclic.json` sudah dibuat di root project
- ⚠️ Cyclic.sh sedang down, gunakan Railway sebagai primary option
