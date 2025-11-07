/**
 * Main.js - File JavaScript Utama untuk Aplikasi Input Nilai Mahasiswa
 *
 * File ini berisi semua fungsi untuk:
 * 1. Halaman input nilai (index.html)
 * 2. Halaman lihat data (data.html)
 * 3. Event handler dan UI management
 * 4. Menggunakan fungsi dari logic.js untuk validasi, simpan, dan load data
 */

// Import fungsi dari logic.js
import { validasiInput, simpanData, loadData, getNamaMataKuliah } from './logic.js';

// ========================================
// BAGIAN 1: FUNGSI UMUM (UNTUK KEDUA HALAMAN)
// ========================================

/**
 * Fungsi untuk menampilkan alert notifikasi ke pengguna
 *
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe alert: 'success', 'danger', 'warning', 'info'
 */
function tampilkanAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');

    if (!alertContainer) return;

    // Buat elemen alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';

    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Hapus alert sebelumnya
    alertContainer.innerHTML = '';

    // Tambahkan alert baru
    alertContainer.appendChild(alertDiv);

    // Auto dismiss setelah 5 detik
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}

/**
 * Fungsi untuk mereset form input nilai
 */
function resetForm() {
    const form = document.getElementById('formInputNilai');
    if (form) {
        form.reset();
    }
}

/**
 * Event handler untuk form submit
 * Alur sesuai Activity Diagram:
 * 1. Ambil data dari form
 * 2. Validasi input menggunakan validasiInput() dari logic.js
 * 3. Jika valid, simpan data menggunakan simpanData() dari logic.js
 * 4. Tampilkan notifikasi hasil
 */
async function handleFormSubmit(event) {
    // Prevent default form submission
    event.preventDefault();

    console.log('📝 Form disubmit, memproses data...');

    // LANGKAH 1: Ambil data dari form
    const nim = document.getElementById('nim').value;
    const nama = document.getElementById('namaLengkap').value;
    const kodeMk = document.getElementById('mataKuliah').value;
    const nilai = document.getElementById('nilaiMahasiswa').value;

    // Buat object data
    const dataInput = {
        nim: nim,
        nama: nama,
        kodeMk: kodeMk,
        nilai: nilai
    };

    console.log('📋 Data yang akan divalidasi:', dataInput);

    // LANGKAH 2: Validasi input terlebih dahulu
    const hasilValidasi = validasiInput(dataInput);

    if (!hasilValidasi.valid) {
        // Jika validasi gagal, tampilkan pesan error
        console.error('❌ Validasi gagal:', hasilValidasi.errors);

        const errorMessage = `
            <strong>Validasi Gagal!</strong><br>
            ${hasilValidasi.errors.map(err => `• ${err}`).join('<br>')}
        `;

        tampilkanAlert(errorMessage, 'danger');
        return; // Stop eksekusi
    }

    console.log('✅ Validasi berhasil, menyimpan data...');

    // LANGKAH 3: Jika validasi berhasil, simpan data (async)
    const hasilSimpan = await simpanData(dataInput);

    // LANGKAH 4: Tampilkan notifikasi hasil penyimpanan
    if (hasilSimpan.success) {
        console.log('✅ Data berhasil disimpan dengan ID:', hasilSimpan.id);

        // Tampilkan notifikasi sukses
        tampilkanAlert(
            `<strong>Berhasil!</strong> ${hasilSimpan.message} Data dapat dilihat di halaman <a href="data.html" class="alert-link">Lihat Data Mahasiswa</a>.`,
            'success'
        );

        // Reset form setelah berhasil
        resetForm();

    } else {
        // Tampilkan notifikasi error
        console.error('❌ Gagal menyimpan:', hasilSimpan.message);
        tampilkanAlert(
            `<strong>Gagal!</strong> ${hasilSimpan.message}`,
            'danger'
        );
    }
}

// ========================================
// BAGIAN 2: FUNGSI UNTUK HALAMAN DATA (DATA.HTML)
// ========================================

/**
 * Fungsi helper untuk menentukan class badge berdasarkan nilai
 * @param {number} nilai - Nilai mahasiswa
 * @returns {string} - Class Bootstrap untuk badge
 */
function getNilaiBadgeClass(nilai) {
    if (nilai >= 80) return 'bg-success';
    if (nilai >= 70) return 'bg-primary';
    if (nilai >= 60) return 'bg-warning';
    return 'bg-danger';
}

/**
 * Fungsi untuk memuat dan menampilkan data dari Firestore
 * Menggunakan fungsi loadData() dari logic.js
 */
async function muatDanTampilkanData() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const tableContainer = document.getElementById('tableContainer');
    const emptyState = document.getElementById('emptyState');
    const tableBody = document.getElementById('tableBody');

    try {
        // Tampilkan loading indicator
        loadingIndicator.style.display = 'block';
        tableContainer.style.display = 'none';
        emptyState.style.display = 'none';

        console.log('🔄 Memuat data dari Firestore...');

        // Panggil fungsi loadData() dari logic.js
        const result = await loadData();

        // Sembunyikan loading indicator
        loadingIndicator.style.display = 'none';

        // Cek apakah load berhasil
        if (!result.success) {
            // Tampilkan pesan error
            tampilkanAlert(
                `Gagal memuat data: ${result.message}. Pastikan Anda telah mengaktifkan Cloud Firestore dan mengatur rules yang benar.`,
                'danger'
            );
            emptyState.style.display = 'block';
            return;
        }

        const dataMahasiswa = result.data;

        // Cek apakah ada data
        if (!dataMahasiswa || dataMahasiswa.length === 0) {
            // Tampilkan empty state jika tidak ada data
            emptyState.style.display = 'block';
            console.log('ℹ️ Tidak ada data untuk ditampilkan');
            return;
        }

        // Kosongkan tabel terlebih dahulu
        tableBody.innerHTML = '';

        // Loop melalui setiap data dan tambahkan ke tabel
        let nomor = 1;
        dataMahasiswa.forEach((item) => {
            const row = `
        <tr>
          <td class="text-center">${nomor}</td>
          <td>${item.nama || '-'}</td>
          <td class="text-center">${item.nim || '-'}</td>
          <td>${getNamaMataKuliah(item.kode_mk)}</td>
          <td class="text-center">
            <span class="badge ${getNilaiBadgeClass(item.nilai)} fs-6">
              ${item.nilai !== undefined ? item.nilai.toFixed(2) : '-'}
            </span>
          </td>
        </tr>
      `;

            tableBody.innerHTML += row;
            nomor++;
        });

        // Tampilkan tabel
        tableContainer.style.display = 'block';

        console.log(`✅ Berhasil memuat ${dataMahasiswa.length} data mahasiswa`);

    } catch (error) {
        console.error("❌ Error memuat data: ", error);

        // Sembunyikan loading indicator
        loadingIndicator.style.display = 'none';

        // Tampilkan pesan error
        tampilkanAlert(
            `Gagal memuat data: ${error.message}`,
            'danger'
        );

        // Tampilkan empty state
        emptyState.style.display = 'block';
    }
}

// ========================================
// BAGIAN 3: INISIALISASI APLIKASI
// ========================================

/**
 * Fungsi inisialisasi yang dijalankan saat halaman dimuat
 * Menghubungkan event handler dengan elemen HTML
 */
function initApp() {
    console.log('🚀 Aplikasi dimuat, menginisialisasi...');

    // Cek apakah di halaman input nilai (index.html)
    const form = document.getElementById('formInputNilai');
    if (form) {
        // Attach event listener untuk form submit
        form.addEventListener('submit', handleFormSubmit);
        console.log('✅ Event listener form berhasil dipasang');
        console.log('📊 Halaman: Input Nilai Mahasiswa');
    }

    // Cek apakah di halaman lihat data (data.html)
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        // Muat dan tampilkan data
        muatDanTampilkanData();
        console.log('📊 Halaman: Lihat Data Mahasiswa');
    }

    // Log informasi aplikasi
    console.log('📋 Menggunakan Firebase Firestore untuk penyimpanan data');
    console.log('🎯 Aplikasi siap digunakan');
}

// Jalankan inisialisasi saat DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded');
    initApp();
});

console.log('✅ main.js berhasil dimuat');
