# Deploy ReKal ke Netlify

## 🚀 Quick Deploy

### Opsi 1: Deploy via Git (Recommended)

1. **Push ke GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PWA ready"
   git remote add origin https://github.com/username/rekal.git
   git push -u origin main
   ```

2. **Connect ke Netlify**
   - Buka [netlify.com](https://netlify.com)
   - Login/Sign up
   - Klik "Add new site" → "Import an existing project"
   - Pilih Git provider (GitHub/GitLab/Bitbucket)
   - Pilih repository `rekal`

3. **Build Settings** (auto-detected dari `netlify.toml`):
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Environment Variables** (jika perlu):
   - Go to Site settings → Environment variables
   - Add: `VITE_API_BASE_URL` = `/api` (atau URL backend)

5. **Deploy!**
   - Klik "Deploy site"
   - Netlify akan otomatis build dan deploy

### Opsi 2: Deploy via Drag & Drop

1. **Build locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Upload ke Netlify:**
   - Buka [netlify.com](https://netlify.com)
   - Drag folder `client/dist` ke dashboard Netlify
   - Done!

### Opsi 3: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   cd client
   npm run build
   netlify deploy --prod --dir=dist
   ```

## ⚙️ Konfigurasi yang Sudah Dibuat

### Files untuk Netlify:
- ✅ `netlify.toml` - Build config, redirects, headers
- ✅ `client/public/_redirects` - SPA routing support
- ✅ `client/.env.production` - Environment variables

### Features:
- ✅ **SPA Routing**: Semua route redirect ke index.html
- ✅ **PWA Support**: Service worker dan manifest
- ✅ **Caching**: Static assets cached 1 tahun
- ✅ **Security Headers**: X-Frame-Options, X-Content-Type-Options
- ✅ **API Proxy**: Configured untuk backend (jika same domain)

## 🔧 Custom Domain (Opsional)

1. Go to Site settings → Domain management
2. Klik "Add custom domain"
3. Masukkan domain Anda (e.g., `rekal.yourdomain.com`)
4. Follow DNS setup instructions

## 📝 Environment Variables

Jika backend terpisah, set di Netlify:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://api.yourdomain.com` | Backend API URL |

## 🧪 Pre-Deploy Checklist

- [ ] Build berhasil locally: `npm run build`
- [ ] Tidak ada error di console
- [ ] PWA manifest valid
- [ ] Icons sudah digenerate (atau gunakan placeholder)
- [ ] API endpoint accessible

## 🐛 Troubleshooting

### Build Failed
```bash
# Check build logs di Netlify dashboard
# Pastikan dependencies terinstall:
cd client && npm install
```

### 404 on Refresh
- ✅ Sudah dihandle oleh `netlify.toml` dan `_redirects`
- Jika masih error: Clear cache dan redeploy

### API Not Working
- Backend harus di-deploy terpisah
- Update `VITE_API_BASE_URL` di environment variables
- Enable CORS di backend

### PWA Not Installing
- Pastikan HTTPS enabled (Netlify auto-HTTPS)
- Check manifest valid di DevTools → Application → Manifest
- Icons harus accessible (check di DevTools → Console)

## 🎉 Post-Deploy

1. **Test PWA:**
   - Buka site di Chrome mobile
   - Menu → Add to Home Screen
   - Verifikasi app terinstall

2. **Test Offline:**
   - Matikan wifi
   - Refresh page
   - Data harus masih tampil dari cache

3. **Enable Analytics:**
   - Netlify Analytics (opsional)
   - Atau tambahkan Google Analytics

## 📚 Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [PWA on Netlify](https://www.netlify.com/blog/2017/10/31/service-workers-on-netlify/)
