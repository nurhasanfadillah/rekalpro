Dokumentasi Spesifikasi Aplikasi ReKal

PT. Redone Berkah Mandiri

1. Arsitektur Data Master

1.1 Kategori Material

Digunakan untuk mengelompokkan jenis bahan agar manajemen inventaris dan pencarian lebih teratur.

ID: Identitas unik (Primary Key).

Nama Kategori: Kelompok besar bahan.

Contoh: Bahan Utama, Lining (Lapisan Dalam), Hardware (Resleting/Ring), Aksesoris, dll.

Validasi Integritas: Kategori tidak dapat dihapus jika terdapat data Material yang masih terhubung dengan kategori tersebut.

1.2 Katalog Material (Bahan Baku)

Daftar seluruh bahan mentah yang dibeli dan digunakan dalam proses produksi.

ID: Identitas unik material.

Nama Material: Nama spesifik bahan (misal: "YKK Zipper 5mm").

Kategori ID: Relasi ke Kategori Material.

Harga Satuan Standar: Referensi harga beli terakhir atau estimasi harga pasar.

Satuan Ukur: Pilihan tetap (Dropdown) dengan opsi: Pcs atau Cm.

Validasi Integritas: Data Material tidak dapat dihapus jika sudah digunakan dalam Komposisi Material (BoM) di produk manapun.

2. Data Operasional & Produksi

2.1 Katalog Produk (Barang Jadi)

Informasi utama produk akhir yang siap dipasarkan.

ID: Identitas unik produk.

Nama Produk: Nama model/artikel barang jadi.

Aturan Validasi: Harus Unik (Unique). Sistem akan menolak jika ada nama produk yang sama untuk menghindari tumpang tindih data biaya.

Deskripsi: Spesifikasi detail produk.

Foto Produk: File gambar produk.

Biaya Overhead (%): Persentase biaya tidak langsung (Listrik, Segala, Tenaga Kerja Non-Produksi).

Total Biaya Material (BoM): Akumulasi total biaya bahan baku dari daftar rincian.

HPP (Harga Pokok Produksi): Nilai total biaya produksi (Material + Overhead).

Target Margin Profit (%): Persentase keuntungan yang diinginkan dari harga jual.

Estimasi Harga Jual: Harga jual yang direkomendasikan sistem berdasarkan target profit.

Laba Kotor per Unit: Selisih antara harga jual dan HPP dalam nilai mata uang.

2.2 Komposisi Material / BoM (Rincian Bahan)

Rincian spesifik kebutuhan bahan untuk memproduksi satu (1) unit produk.

Produk ID: Relasi ke Katalog Produk.

Material ID: Relasi ke Katalog Material (Pilihan Dropdown).

Harga Satuan: Harga material saat produksi (Editable, default dari Katalog Material).

Qty (Kebutuhan): Jumlah bahan yang digunakan.

Subtotal: Total biaya per baris bahan ($Harga \times Qty$).

3. Logika Bisnis & Kalkulasi Otomatis

Sistem menggunakan standar akuntansi biaya berikut:

Total Biaya Material (BoM):

$$\sum (\text{Subtotal Tiap Material})$$

HPP (Harga Pokok Produksi):

$$\frac{\text{Total Biaya Material}}{1 - \text{Overhead \%}}$$

Estimasi Harga Jual:

$$\frac{\text{HPP}}{1 - \text{Target Margin \%}}$$

Laba Kotor per Unit:

$$\text{Harga Jual} - \text{HPP}$$

4. Alur Kerja & Antarmuka (UI/UX)

4.1 Dashboard (Daftar Produk)

Header: Branding "ReKal - PT. Redone Berkah Mandiri" dan Tombol Navigasi.

Aksi: Tombol "Tambah Produk Baru".

Tampilan: Card (Mobile) atau Tabel (Desktop).

Interaksi: Klik item untuk masuk ke Detail Produk.

4.2 Detail Produk (Mode Pratinjau)

Content: Visual produk, 4 Card Score (BoM, HPP, Harga Jual, Laba), dan List BoM.

Footer (Aksi):

Tombol "Salin Produk": Duplikasi data ke form input baru (pre-filled).

Tombol "Ubah Data": Mengedit produk saat ini.

Tombol "Hapus Produk": Menghapus record produk.

4.3 Form Input Produk (Tambah/Ubah)

Input: Nama (Unique), Deskripsi, Foto, % Overhead, % Margin.

BoM Editor: Dropdown Material, Qty, Harga (Override).

Validasi: Nama produk harus unik, angka tidak boleh negatif, konfirmasi simpan.

4.4 Halaman Katalog Material

Modul untuk mengelola aset bahan baku yang tersedia.

Header: Judul "Katalog Material".

Aksi Utama: Tombol "Tambah Material" (Full width di mobile, pojok kanan di desktop).

Tampilan Data:

Desktop: Tabel dengan kolom Nama Material, Kategori, Harga Standar, Satuan, dan Aksi (Edit/Hapus).

Mobile: Card List yang menampilkan Nama Material (Bold), Kategori (Badge), dan Harga per Satuan.

Validasi Hapus: Jika tombol "Hapus" diklik pada material yang sudah masuk dalam BoM produk, sistem memunculkan notifikasi: "Gagal menghapus: Material masih digunakan dalam komposisi produk."

4.5 Halaman Manajemen Kategori

Modul untuk klasifikasi grup material.

Header: Judul "Manajemen Kategori".

Aksi Utama: Tombol "Tambah Kategori".

Tampilan Data:

Layout: Tabel sederhana (Desktop) atau List Item (Mobile) berisi Nama Kategori dan jumlah material yang terhubung (opsional).

Aksi Baris: Tombol Edit (Ubah Nama) dan Tombol Hapus.

Validasi Hapus: Sistem akan menonaktifkan tombol hapus atau memberikan peringatan jika kategori masih berisi material: "Gagal menghapus: Kosongkan material dalam kategori ini terlebih dahulu."

4.6 Form Input Material & Kategori (Dialog/Modal)

Untuk efisiensi, input data master menggunakan sistem Modal/Pop-up.

Modal Material:

Input: Nama Material (Text), Pilih Kategori (Dropdown), Harga Standar (Number), Satuan (Dropdown: Pcs, Cm).

Modal Kategori:

Input: Nama Kategori (Text).

5. Menu Navigasi

Daftar menu utama aplikasi:

Beranda: Monitoring daftar produk jadi.

Katalog Material: Pengaturan daftar bahan baku dan harga standar.

Kategori: Pengaturan klasifikasi material.