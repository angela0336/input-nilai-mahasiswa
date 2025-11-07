/**
 * Logic Layer - Application Logic
 *
 * File ini berisi fungsi-fungsi utama untuk menghubungkan UI dengan Database (Firestore)
 * Mengimplementasikan logika bisnis sesuai dengan Activity Diagram dan Class Diagram
 *
 * Fungsi utama:
 * 1. validasiInput() - Memvalidasi data input dari form
 * 2. simpanData() - Menyimpan data ke Firestore
 * 3. loadData() - Mengambil dan menampilkan data dari Firestore
 */

import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
 * Fungsi untuk menyimpan data nilai mahasiswa ke Firestore
 * Data disimpan ke collection 'nilai_mahasiswa'
 *
 * Alur:
 * 1. Validasi data terlebih dahulu menggunakan validasiInput()
 * 2. Jika validasi gagal, return error
 * 3. Jika validasi berhasil, simpan data ke Firestore
 * 4. Return success message
 *
 * @param {Object} data - Object berisi data mahasiswa
 * @return {Promise<Object>} Object berisi status penyimpanan (success, message, id)
 */
async function simpanData(data) {
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
            nim: data.nim.trim(),
            nama: data.nama.trim(),
            kode_mk: data.kodeMk.trim(),
            nilai: parseFloat(data.nilai),
            timestamp: new Date() // Waktu penyimpanan
        };

        // LANGKAH 3: Simpan data ke Firestore
        const docRef = await addDoc(collection(db, "nilai_mahasiswa"), dataNilai);

        console.log('✅ Data berhasil disimpan dengan ID:', docRef.id);

        // Return success
        return {
            success: true,
            message: 'Data berhasil disimpan!',
            id: docRef.id
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
 * Fungsi untuk mengambil dan menampilkan data nilai mahasiswa dari Firestore
 * Data diambil dari collection 'nilai_mahasiswa'
 *
 * @return {Promise<Object>} Object berisi status (success) dan array data mahasiswa
 */
async function loadData() {
    try {
        // Query untuk mengambil semua data dari collection 'nilai_mahasiswa'
        // Diurutkan berdasarkan timestamp descending (data terbaru di atas)
        const q = query(
            collection(db, "nilai_mahasiswa"),
            orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);

        // Array untuk menyimpan data
        const dataMahasiswa = [];

        // Loop setiap dokumen dan masukkan ke array
        querySnapshot.forEach((doc) => {
            dataMahasiswa.push({
                id: doc.id,
                ...doc.data()
            });
        });

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
            data: [],
            count: 0
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

// Export fungsi-fungsi untuk digunakan di file lain
export { validasiInput, simpanData, loadData, getNamaMataKuliah };
