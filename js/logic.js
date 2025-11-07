/**
 * Logic Layer - Application Logic
 *
 * File ini berisi fungsi-fungsi utama untuk menghubungkan UI dengan Database
 * Mengimplementasikan logika bisnis sesuai dengan Activity Diagram dan Class Diagram
 *
 * Fungsi utama:
 * 1. validasiInput() - Memvalidasi data input dari form
 * 2. simpanData() - Menyimpan data ke storage
 * 3. loadData() - Mengambil dan menampilkan data dari storage
 */

// ========================================
// 1. FUNGSI VALIDASI INPUT
// ========================================

/**
 * Fungsi untuk memvalidasi data input dari form
 * Memeriksa apakah data yang diinput sudah lengkap dan sesuai format
 *
 * @param {Object} data - Object berisi data input dari form
 * @param {string} data.nim - Nomor Induk Mahasiswa
 * @param {string} data.nama - Nama lengkap mahasiswa
 * @param {string} data.kodeMk - Kode mata kuliah
 * @param {number} data.nilai - Nilai mahasiswa
 *
 * @return {Object} Object berisi status validasi (valid: true/false, errors: array)
 */
function validasiInput(data) {
    const errors = [];

    // Validasi NIM - tidak boleh kosong dan harus angka
    if (!data.nim || data.nim.trim() === '') {
        errors.push('NIM tidak boleh kosong');
    } else if (data.nim.length < 5) {
        errors.push('NIM minimal 5 karakter');
    } else if (!/^[0-9]+$/.test(data.nim)) {
        errors.push('NIM harus berupa angka');
    }

    // Validasi Nama - tidak boleh kosong dan minimal 3 karakter
    if (!data.nama || data.nama.trim() === '') {
        errors.push('Nama tidak boleh kosong');
    } else if (data.nama.trim().length < 3) {
        errors.push('Nama minimal 3 karakter');
    }

    // Validasi Kode Mata Kuliah - harus dipilih
    if (!data.kodeMk || data.kodeMk.trim() === '') {
        errors.push('Mata kuliah harus dipilih');
    }

    // Validasi Nilai - tidak boleh kosong dan harus antara 0-100
    if (data.nilai === null || data.nilai === undefined || data.nilai === '') {
        errors.push('Nilai tidak boleh kosong');
    } else {
        const nilaiNum = parseFloat(data.nilai);
        if (isNaN(nilaiNum)) {
            errors.push('Nilai harus berupa angka');
        } else if (nilaiNum < 0 || nilaiNum > 100) {
            errors.push('Nilai harus antara 0 - 100');
        }
    }

    // Return hasil validasi
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// ========================================
// 2. FUNGSI SIMPAN DATA
// ========================================

/**
 * Fungsi untuk menyimpan data nilai mahasiswa
 * Data disimpan ke localStorage (sementara, nanti akan diganti Firebase)
 *
 * Alur:
 * 1. Validasi data terlebih dahulu menggunakan validasiInput()
 * 2. Jika validasi gagal, return error
 * 3. Jika validasi berhasil, simpan data ke storage
 * 4. Return success message
 *
 * @param {Object} data - Object berisi data mahasiswa
 * @return {Object} Object berisi status penyimpanan (success, message)
 */
function simpanData(data) {
    try {
        // LANGKAH 1: Validasi data terlebih dahulu
        const validasi = validasiInput(data);

        // Jika validasi gagal, return pesan error
        if (!validasi.valid) {
            return {
                success: false,
                message: 'Validasi gagal: ' + validasi.errors.join(', ')
            };
        }

        // LANGKAH 2: Persiapkan data untuk disimpan
        const dataNilai = {
            id: Date.now().toString(), // Generate ID unik berdasarkan timestamp
            nim: data.nim.trim(),
            nama: data.nama.trim(),
            kodeMk: data.kodeMk.trim(),
            nilai: parseFloat(data.nilai),
            timestamp: new Date().toISOString() // Waktu penyimpanan
        };

        // LANGKAH 3: Ambil data yang sudah ada dari localStorage
        let dataMahasiswa = [];
        const existingData = localStorage.getItem('dataNilai');
        if (existingData) {
            dataMahasiswa = JSON.parse(existingData);
        }

        // LANGKAH 4: Tambahkan data baru ke array
        dataMahasiswa.push(dataNilai);

        // LANGKAH 5: Simpan kembali ke localStorage
        localStorage.setItem('dataNilai', JSON.stringify(dataMahasiswa));

        console.log('✅ Data berhasil disimpan:', dataNilai);

        // Return success
        return {
            success: true,
            message: 'Data berhasil disimpan!',
            id: dataNilai.id
        };

    } catch (error) {
        console.error('❌ Error saat menyimpan data:', error);
        return {
            success: false,
            message: 'Gagal menyimpan data: ' + error.message
        };
    }
}

// ========================================
// 3. FUNGSI LOAD DATA
// ========================================

/**
 * Fungsi untuk mengambil dan menampilkan data nilai mahasiswa
 * Data diambil dari localStorage (sementara, nanti akan diganti Firebase)
 *
 * @return {Object} Object berisi status (success) dan array data mahasiswa
 */
function loadData() {
    try {
        // Ambil data dari localStorage
        const existingData = localStorage.getItem('dataNilai');

        // Jika tidak ada data, return array kosong
        if (!existingData) {
            return {
                success: true,
                data: [],
                count: 0
            };
        }

        // Parse data JSON
        const dataMahasiswa = JSON.parse(existingData);

        console.log('✅ Berhasil memuat', dataMahasiswa.length, 'data');

        // Return data
        return {
            success: true,
            data: dataMahasiswa,
            count: dataMahasiswa.length
        };

    } catch (error) {
        console.error('❌ Error saat memuat data:', error);
        return {
            success: false,
            message: 'Gagal memuat data: ' + error.message,
            data: []
        };
    }
}

// ========================================
// 4. FUNGSI HELPER - NAMA MATA KULIAH
// ========================================

/**
 * Fungsi helper untuk mendapatkan nama lengkap mata kuliah
 *
 * @param {string} kodeMk - Kode mata kuliah
 * @return {string} Nama lengkap mata kuliah dengan kode
 */
function getNamaMataKuliah(kodeMk) {
    // Mapping kode mata kuliah ke nama lengkap
    const mataKuliah = {
        'MK001': 'MK001 - Kalkulus I',
        'MK002': 'MK002 - Fisika Dasar',
        'MK003': 'MK003 - Algoritma & Pemrograman',
        'MK004': 'MK004 - Bahasa Indonesia',
        'MK005': 'MK005 - Basis Data',
        'MK006': 'MK006 - Rekayasa Perangkat Lunak'
    };

    return mataKuliah[kodeMk] || kodeMk;
}
