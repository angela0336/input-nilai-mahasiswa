/**
 * Main.js - File JavaScript Utama untuk Aplikasi Input Nilai Mahasiswa
 *
 * File ini berisi semua fungsi untuk:
 * 1. Halaman input nilai (index.html)
 * 2. Halaman lihat data (data.html)
 * 3. Event handler dan UI management
 */

// ========================================
// BAGIAN 1: FUNGSI UNTUK HALAMAN INPUT NILAI
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
 * 2. Validasi input menggunakan validasiInput()
 * 3. Jika valid, simpan data menggunakan simpanData()
 * 4. Tampilkan notifikasi hasil
 */
function handleFormSubmit(event) {
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

    // LANGKAH 3: Jika validasi berhasil, simpan data
    const hasilSimpan = simpanData(dataInput);

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
// BAGIAN 2: FUNGSI UNTUK HALAMAN LIHAT DATA
// ========================================

/**
 * Fungsi untuk merender data ke dalam tabel HTML
 *
 * @param {Array} data - Array berisi data nilai mahasiswa
 */
function renderTableData(data) {
    const tableBody = document.getElementById('tableBody');
    const tableContainer = document.getElementById('tableContainer');
    const emptyState = document.getElementById('emptyState');

    // Bersihkan isi tabel terlebih dahulu
    tableBody.innerHTML = '';

    // Cek apakah ada data
    if (!data || data.length === 0) {
        // Tampilkan empty state
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Sembunyikan empty state, tampilkan tabel
    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    // Loop data dan buat baris tabel
    data.forEach((item, index) => {
        const row = document.createElement('tr');

        // Tentukan warna badge berdasarkan nilai
        let badgeClass = 'bg-danger'; // Merah untuk nilai < 60
        if (item.nilai >= 80) {
            badgeClass = 'bg-success'; // Hijau untuk nilai >= 80
        } else if (item.nilai >= 60) {
            badgeClass = 'bg-warning'; // Kuning untuk nilai 60-79
        }

        row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td>${item.nama}</td>
            <td class="text-center"><code>${item.nim}</code></td>
            <td>${getNamaMataKuliah(item.kodeMk)}</td>
            <td class="text-center">
                <span class="badge ${badgeClass} px-3 py-2">${item.nilai}</span>
            </td>
        `;

        tableBody.appendChild(row);
    });

    console.log(`✅ Berhasil merender ${data.length} baris data`);
}

/**
 * Fungsi untuk menampilkan atau menyembunyikan loading indicator
 *
 * @param {boolean} isLoading - true untuk tampilkan, false untuk sembunyikan
 */
function toggleLoading(isLoading) {
    const loadingIndicator = document.getElementById('loadingIndicator');

    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
}

/**
 * Fungsi untuk memuat dan menampilkan data nilai mahasiswa
 * Implementasi alur sesuai Activity Diagram:
 * 1. Tampilkan loading
 * 2. Panggil loadData() untuk mengambil data
 * 3. Tampilkan data ke tabel
 */
function muatDanTampilkanData() {
    console.log('🔄 Memulai proses load data...');

    // Tampilkan loading indicator
    toggleLoading(true);

    // Simulasi delay untuk UX yang lebih baik
    setTimeout(function() {
        // LANGKAH 1: Load data dari storage menggunakan fungsi dari logic.js
        const result = loadData();

        console.log('📊 Hasil load data:', result);

        // Sembunyikan loading
        toggleLoading(false);

        // LANGKAH 2: Cek apakah load data berhasil
        if (result.success) {
            const data = result.data;

            console.log(`✅ Load data berhasil, ditemukan ${data.length} data`);

            // LANGKAH 3: Render data ke tabel
            renderTableData(data);

            // LANGKAH 4: Log hasil
            if (data.length > 0) {
                console.log('✅ Data berhasil ditampilkan');
            } else {
                console.log('ℹ️ Tidak ada data untuk ditampilkan');
            }
        } else {
            // Jika gagal load data, tampilkan error
            console.error('❌ Gagal load data:', result.message);
            tampilkanAlert(
                `<strong>Error!</strong> ${result.message}`,
                'danger'
            );

            // Tampilkan empty state
            renderTableData([]);
        }
    }, 800);
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
    console.log('📋 Menggunakan localStorage untuk penyimpanan sementara');
    console.log('🎯 Aplikasi siap digunakan');
}

// ========================================
// BAGIAN 4: JALANKAN SAAT DOM LOADED
// ========================================

/**
 * Event listener untuk DOMContentLoaded
 * Memastikan semua elemen HTML sudah dimuat sebelum JavaScript dijalankan
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded');
    initApp();
});

console.log('✅ main.js berhasil dimuat');
