# Catatan Perubahan

Semua perubahan penting pada proyek ini akan didokumentasikan dalam file ini.

Format ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini mematuhi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Belum Dirilis]

### Ditambahkan
- Validasi input pada penambahan topic di form registrasi perangkat (semua kolom wajib diisi sebelum tambah baris baru)

### Diubah
- Penyederhanaan dan pembersihan bagian Screenshots Dashboard di README.md
- Instruksi penambahan screenshot di README.md diperjelas agar gambar tampil dengan benar

### Diperbaiki
- Perbaikan agar input topic, keterangan, dan satuan pada form tambah topic tidak bisa kosong

### Diubah

- Menerjemahkan README.md dan CHANGELOG.md ke Bahasa Indonesia
- Meningkatkan gaya penanda peta untuk visibilitas yang lebih baik
- Meningkatkan penanganan pesan MQTT untuk tampilan data yang lebih andal
- Memperbarui dependensi ke versi terbaru
- Meningkatkan desain UI/UX dengan Tailwind CSS

### Diperbaiki

- Masalah dengan nilai NaN dalam data sensor yang menyebabkan masalah tampilan
- Tooltip penanda peta sekarang dengan benar menampilkan ID perangkat setiap saat
- Perbaikan bug dan optimasi awal

## [1.0.0] - 2025-05-04

### Ditambahkan

- Pengaturan proyek awal
- Server backend dengan Express.js
- Sistem manajemen pengguna
- Fungsionalitas pelacakan perangkat
- Dasbor frontend dengan visualisasi peta

### Diubah

- Menyiapkan struktur proyek
- Mengkonfigurasi lingkungan pengembangan

### Diselesaikan

- Masalah pengaturan awal

[Belum Dirilis]: https://github.com/duwiarsana/iot-locator-data/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/duwiarsana/iot-locator-data/releases/tag/v1.0.0
