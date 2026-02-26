# Panduan Deploy Backend ReKal (Minimal Effort)

## Masalah
Aplikasi frontend di Netlify tidak bisa menyimpan kategori karena backend API belum di-deploy.

## Solusi: Deploy ke Railway.app (Free $5 Credit/Bulan)

**Railway.app adalah pilihan terbaik karena:**
- ✅ $5 credit gratis per bulan (cukup untuk app kecil)
- ✅ Native support Node.js + Express + SQLite
- ✅ Deploy mudah dari GitHub
- ✅ Tidak perlu kartu kredit untuk free tier

### Step 1: Deploy Backend ke Railway.app

1. **Daftar/Login ke Railway**: https://railway.app (gratis, pakai GitHub login)

2. **Create New Project**:
   - Klik "New Project" → "Deploy from GitHub repo"
   - Pilih repository GitHub Anda (`rekal-blackbox`)
   - Klik "Add Variables"

3. **Configure Environment Variables**:
   Tambahkan variables di Railway dashboard:
   ```
   PORT=3000
   NODE_ENV=production
   ```

4. **Deploy & Dapatkan URL**:
   - Railway akan auto-deploy
   - Tunggu 2-3 menit sampai deploy selesai
   - **Cara mendapatkan URL**:
     - Di dashboard Railway, klik service Anda
     - Lihat bagian "Domains" atau "Settings"
     - URL akan terlihat seperti: `https://rekal-api.up.railway.app` atau `https://your-app.railway.app`
     - Atau klik "Generate Domain" jika belum ada
   - Catat URL tersebut (contoh: `https://rekal-api.up.railway.app`)


### Alternatif: Cyclic.sh (Jika Railway Tidak Tersedia)

**Note**: Cyclic.sh sedang down/unstable. Jika sudah kembali normal:
- 100% gratis tanpa kartu kredit
- File `package.json` dan `cyclic.json` sudah disiapkan di root project
- Deploy: https://www.cyclic.sh


### Step 2: Update Environment Variable di Netlify

1. **Login ke Netlify Dashboard**
2. **Pilih site ReKal** → "Site settings" → "Environment variables"
3. **Add new variable**:
   ```
   Key: VITE_API_URL
   Value: https://rekal-api.up.railway.app/api
   (Ganti dengan URL Railway Anda)
   ```
4. **Trigger Redeploy**:
   - Go to "Deploys" → "Trigger deploy" → "Deploy site"


### Step 3: Verifikasi

1. Buka aplikasi di Netlify
2. Coba tambah kategori baru
3. Jika berhasil, API sudah terhubung!

## Alternatif Gratis Lainnya

### Option 2: Cyclic.sh (100% Gratis - Sedang Down)
1. https://www.cyclic.sh (sedang tidak dapat diakses)
2. 100% gratis tanpa kartu kredit
3. File konfigurasi sudah disiapkan (`package.json`, `cyclic.json`)

### Option 3: Glitch.com (Free dengan Limitasi)
1. https://glitch.com
2. 100% gratis tapi app "sleep" setelah 5 menit tidak aktif
3. Cocok untuk testing, tidak recommended untuk production

### Option 4: Fly.io (Free Tier)
1. https://fly.io
2. Free tier: 3 shared-cpu-1x VMs, 3GB persistent storage
3. Perlu install flyctl CLI

### Option 5: Render.com (Free Tier dengan Limitasi)
1. https://render.com
2. Free tier tersedia tapi ada batasan
3. Kadang memerlukan verifikasi


## Troubleshooting

### Error "Tidak dapat terhubung ke server"
- Pastikan backend sudah "Live" (bukan "Building")
- Cek URL di environment variable sudah benar
- Pastikan ada `/api` di akhir URL

### Error 404 saat POST/PUT/DELETE
- Backend mungkin belum di-deploy
- Cek logs di dashboard hosting

### Database SQLite
- Railway: SQLite persistent (data tidak hilang)
- Cyclic: SQLite persistent (jika sudah kembali online)
- Glitch: Data hilang saat app sleep


## Development Lokal
Untuk development lokal, tidak perlu ubah apa-apa:
- Vite proxy akan tetap berfungsi
- `VITE_API_URL` di `.env` lokal bisa diisi `http://localhost:3001/api`
