# TODO - Pembangunan Aplikasi ReKal Full Stack

## Phase 1: Setup Project Structure ✅
- [x] Buat struktur folder client/ dan server/
- [x] Setup package.json root dengan scripts
- [x] Setup client React + Vite + Tailwind
- [x] Setup server Express + SQLite

## Phase 2: Backend Implementation ✅
- [x] Buat database schema & koneksi SQLite
- [x] Implementasi Model (Category, Material, Product)
- [x] Implementasi Controllers
  - [x] categoryController.js
  - [x] materialController.js
  - [x] productController.js
- [x] Implementasi Routes
- [x] Implementasi validasi integritas (delete restrictions)

## Phase 3: Frontend Implementation ✅
- [x] Setup API client
- [x] Buat komponen UI
  - [x] Navbar.jsx
  - [x] ScoreCard.jsx
  - [x] MaterialModal.jsx
  - [x] CategoryModal.jsx
  - [x] ConfirmDialog.jsx
- [x] Buat Pages
  - [x] Dashboard.jsx (Beranda - daftar produk)
  - [x] ProductDetail.jsx
  - [x] ProductForm.jsx (Tambah/Ubah + BoM Editor)
  - [x] MaterialCatalog.jsx
  - [x] CategoryManagement.jsx

## Phase 4: Integration & Testing ✅
- [x] Integrasi API frontend-backend
- [x] Test CRUD operations
- [x] Test kalkulasi HPP
- [x] Test validasi integritas

## Phase 5: Thorough API Testing ✅

### ✅ Backend API Test Results:

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/health` | GET | ✅ PASS | Server running |
| `/api/categories` | GET | ✅ PASS | List with material_count |
| `/api/categories` | POST | ✅ PASS | Create category |
| `/api/categories/:id` | PUT | ✅ PASS | Update category |
| `/api/categories/:id` | DELETE | ✅ PASS | Blocked if has materials |
| `/api/materials` | GET | ✅ PASS | List with category_name |
| `/api/materials` | POST | ✅ PASS | Create material |
| `/api/materials/:id` | DELETE | ✅ PASS | Blocked if in BoM |
| `/api/products` | GET | ✅ PASS | List products |
| `/api/products/:id` | GET | ✅ PASS | Detail with BoM |
| `/api/products` | POST | ✅ PASS | Create with auto-calc HPP |
| `/api/products/:id/duplicate` | POST | ✅ PASS | Duplicate product |
| Validation | - | ✅ PASS | Negative numbers rejected |

### Kalkulasi HPP Terverifikasi:
```
Input: Material 50,000 × 2 = 100,000, Overhead 20%, Margin 30%
Output: 
- Total Material: 100,000 ✅
- HPP: 125,000 (100,000 / 0.8) ✅
- Harga Jual: 178,571 (125,000 / 0.7) ✅
- Laba: 53,571 ✅
```

### Validasi Integritas Terverifikasi:
- ❌ Material dalam BoM → Tidak bisa dihapus
- ❌ Kategori dengan material → Tidak bisa dihapus
- ❌ Input negatif → Ditolak

## Phase 6: Finalisasi ✅
- [x] README.md dengan instruksi run
- [x] Testing end-to-end

## Phase 7: Bug Fixes & Polish ✅
- [x] PUT /api/materials/:id - Tested ✅
- [x] PUT /api/products/:id - Tested ✅ (recalculates HPP)
- [x] DELETE /api/products/:id - Tested ✅
- [x] ScoreCard: "Total Produk" type="count" (angka biasa, bukan IDR)
- [x] ScoreCard: Tambah type="count" dengan icon LayoutGrid & warna indigo
- [x] Tailwind: Tambah primary-200 s/d primary-900 yang hilang
- [x] Navbar: Active state menggunakan startsWith() untuk sub-routes
- [x] Navbar: Hapus menu "Produk" duplikat (sudah ada di Beranda)

---

## Phase 8: Bug Fixes (Session 2) ✅
- [x] ProductDetail.jsx: handleDelete alert() → deleteError state + ConfirmDialog error prop
- [x] ProductDetail.jsx: handleDuplicate alert() → duplicateError state (inline di header)
- [x] ProductDetail.jsx: Tambah handleDeleteClose() untuk reset error saat dialog ditutup
- [x] ProductForm.jsx: Setelah save → navigate ke /products/:id (bukan ke /)
- [x] ProductForm.jsx: Tombol Batal & back arrow → navigate ke /products/:id saat edit
- [x] server/src/index.js: Hapus debug endpoints (/api/debug/bom, /api/debug/cleanup-bom)

### API Test Session 2:
- ✅ POST /api/categories → "Bahan Utama"
- ✅ POST /api/materials → "Kain Canvas 600D" @ Rp15.000/Cm
- ✅ POST /api/products → HPP kalkulasi benar (3jt → 3.75jt → 5.36jt → 1.6jt laba)
- ✅ DELETE material dalam BoM → BLOCKED "Gagal menghapus: Material masih digunakan..."
- ✅ DELETE kategori dengan material → BLOCKED "Gagal menghapus: Kosongkan material..."
- ✅ POST /api/products/:id/duplicate → "Tas Ransel Kanvas (Copy)"

---

## 🚀 Status: COMPLETE

Aplikasi ReKal Full Stack siap digunakan!
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
