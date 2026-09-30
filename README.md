# SnapLumina — Korean Life4Cuts Photobooth & Wireless Remote Camera 📸✨

Aplikasi Web Photobooth modern bergaya **Life Four Cuts (인생네컷)** / Korean Haru Film dengan estetika luxury dark glassmorphism, filter estetik real-time, kustomisasi frame, stiker lucu, dan ekspor cetak/download beresolusi tinggi (300 DPI).

Aplikasi ini dirancang khusus untuk mengatasi masalah laptop/PC yang **tidak memiliki webcam bawaan**, dengan menyediakan fitur **Wireless Smartphone Camera (Scan QR)** dan dukungan **USB / Virtual Webcam**.

---

## 🌟 Fitur Utama

1. **📱 Solusi Kamera untuk Laptop/PC Tanpa Webcam**:
   - **Kamera HP Wireless (Scan QR)**: Buka website di PC, klik "Kamera HP (Wireless)", lalu scan kode QR menggunakan kamera HP kamu. Kamera HP akan langsung streaming video HD ke layar PC via WebRTC (PeerJS) tanpa perlu install aplikasi apapun! Ponselmu juga berfungsi sebagai remote shutter.
   - **Kamera USB / Virtual Webcams**: Terhubung otomatis dengan webcam USB, capture card, atau aplikasi virtual seperti DroidCam, Iriun Webcam, dan OBS Virtual Camera.
   - **Unggah & Mode Demo**: Bisa upload foto manual atau pakai 4 foto demo untuk uji coba instan.

2. **🎞️ Format Layout Khas Photobooth Korea**:
   - **Classic 4-Cut Strip** (Format vertikal 4 foto ala Life4Cuts).
   - **2x2 Grid Photo Card** (Format kotak modern 4 foto).
   - **3-Cut Vertical** (Format minimalis 3 foto).
   - **Single Aesthetic Polaroid** (1 foto besar bergaya polaroid).

3. **🎨 Real-Time Filters**:
   - Natural Clean
   - Korean Soft Glow (Aestetik pastel glowing Korea)
   - Film B&W Noir (Hitam putih kontras tinggi)
   - Vintage 90s (Tone nostalgia kamera sekali pakai)
   - Golden Sunset (Warm golden hour)
   - Cyberpunk Neon (Warna ungu & cyan malam hari)
   - Cool Film Mist & Matte Grayscale

4. **✨ Customization Studio**:
   - **10 Tema Frame Estetik**: Midnight Onyx, Paper White, Sakura Blush, Cloud Sky, Lilac Mist, Matcha Foam, Soft Butter, Cyber Violet, Sunset Aura.
   - **Kustomisasi Teks**: Tulis judul event (misal: "SWEET 17", "BESTIES 2026") dan tanggal/lokasi.
   - **Stiker Lucu**: Tambahkan emoji dan stiker (❤️, ✨, 🕶️, 🎀, 🐱, 👑, dll) yang bisa ditempel di foto/frame.
   - **Barcode Life4Cuts Asli**: Desain footer strip dilengkapi barcode dekoratif otentik photobooth Korea.

5. **🔊 Efek Suara & Visual Bawaan**:
   - Flash layar putih saat memotret.
   - Efek suara shutter mekanik dan hitung mundur disintesis langsung lewat Web Audio API (tidak butuh file MP3 eksternal).
   - Efek kembang api konfeti saat strip selesai dibuat.

6. **💾 Download HD & Cetak Siap Pakai**:
   - Unduh langsung format PNG resolusi tinggi.
   - Tombol cetak langsung ke printer photobooth (ukuran strip 2x6 inch).

---

## 🚀 Cara Menjalankan di Komputer Lokal

1. Masuk ke folder proyek:
   ```bash
   cd photobooth-app
   ```

2. Jalankan server pengembang:
   ```bash
   npm run dev
   ```

3. Buka browser di `http://localhost:5173`.

---

## ☁️ Cara Deploy Gratis di Vercel

Aplikasi ini 100% berbasis frontend statis (client-side) dan WebRTC P2P gratis via cloud PeerJS, sehingga **tidak butuh server backend berbayar** dan **sangat aman serta gratis selamanya** di Vercel.

### Cara 1: Deploy via GitHub & Vercel Dashboard (Paling Direkomendasikan)
1. Buat repository baru di [GitHub](https://github.com) (misal: `photobooth-korean`).
2. Push kode proyek ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit SnapLumina Photobooth"
   git branch -M main
   git remote add origin https://github.com/USERNAME/photobooth-korean.git
   git push -u origin main
   ```
3. Buka [Vercel Dashboard](https://vercel.com) dan login (gratis).
4. Klik **"Add New..."** ➔ **"Project"**.
5. Pilih repository GitHub kamu dan klik **"Import"**.
6. Pengaturan build akan otomatis terdeteksi (`Vite` framework):
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Klik **"Deploy"**! Dalam 1 menit website photobooth kamu sudah online dengan URL HTTPS gratis (misal: `https://photobooth-korean.vercel.app`).

### Cara 2: Deploy Langsung via Vercel CLI
1. Buka terminal di folder `photobooth-app`:
   ```bash
   npx vercel
   ```
2. Ikuti instruksi login dan pilih default settings. Website akan langsung terbit!

---

## 💡 Panduan Kamera untuk Laptop/PC Tanpa Webcam

### Cara A: Tanpa Kabel & Tanpa Install Apapun (Wireless QR)
1. Buka website SnapLumina di laptop/PC.
2. Klik tombol **"Kamera HP (Wireless)"** di bagian atas atau tengah layar.
3. Muncul kode QR di layar laptop/PC.
4. Buka aplikasi **Kamera** di HP kamu (Android / iPhone) lalu arahkan ke kode QR.
5. Tap tautan yang muncul untuk membuka halaman di browser HP.
6. Izinkan akses kamera di HP.
7. Seketika kamera HP kamu akan streaming langsung ke layar laptop/PC! Kamu juga bisa memencet tombol shutter di layar HP untuk memotret dari jarak jauh.

### Cara B: Menggunakan Kabel USB (DroidCam / Iriun)
1. Install aplikasi gratis **DroidCam** atau **Iriun Webcam** di PC dan di ponsel Android/iOS kamu.
2. Sambungkan HP ke laptop/PC dengan kabel USB (aktifkan USB Debugging di HP).
3. Buka aplikasi DroidCam di PC dan di HP, lalu hubungkan.
4. Buka website SnapLumina di PC, klik ikon **Pengaturan Kamera** ➔ pilih **DroidCam Source** atau **Iriun Webcam**.
