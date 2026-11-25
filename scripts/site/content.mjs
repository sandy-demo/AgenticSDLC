export const roles = {
  Rani: 'Developer junior', Bima: 'Tech Lead', Sari: 'QA', Dimas: 'AppSec',
  Lina: 'PM / BA', Yoga: 'Platform', Hendra: 'Engineering Manager', 'Ibu Maya': 'CISO',
};

export const diagramNotes = {
  D1: {
    caption: 'Ruang kerja AI berkembang: saran kode, tanya jawab, satu tugas, lalu koordinasi lintas tahap.',
    steps: ['Code completion menyarankan potongan kode.', 'Chat menjelaskan konteks dan pilihan.', 'Coding agent mengerjakan tugas dan mengajukan PR.', 'Agentic SDLC menghubungkan hasil dengan tahap berikutnya.'],
  },
  D2: {
    caption: 'Setiap perpindahan punya hasil yang bisa diperiksa. Panah putus-putus mengembalikan pembelajaran operasi ke perencanaan.',
    steps: ['Plan (S11): setujui keputusan.', 'Build (S02, S04): buat perubahan.', 'Test (S05, S08): jalankan checks.', 'Review (S09): kumpulkan bukti.', 'Security (S10, S14): periksa temuan dan guardrails.', 'Deploy (S15): manusia memutuskan.', 'Operate (S12, S13): jaga docs dan triage.'],
  },
  D3: {
    caption: 'Express mengurus validasi dan balasan; SQLite hanya di proses lokal. CI dan CodeQL membaca source di GitHub, bukan data klaim.',
    steps: ['Browser mengirim POST /claims ke Express.', 'Jika valid, Express menyimpan klaim dan event di SQLite.', 'SQLite mengembalikan nomor klaim.', 'Express membalas 201 atau 400 ke browser.', 'GitHub Actions menjalankan tes; CodeQL memindai source jika aktif.'],
  },
  D4: {
    caption: 'Perubahan dikerjakan pada branch. Review dan merge adalah keputusan manusia. Garis putus-putus menunjukkan jalur triage dan audit terpisah.',
    steps: ['Maintainer mendelegasikan issue ke cloud agent.', 'Agent mengajukan draft PR.', 'CI menjalankan tes dan reviewer memeriksa bukti.', 'Bima memutuskan merge di repo latihan.', 'Docs Sync atau Triage berjalan bila diaktifkan; hook mencatat keputusan tanpa argumen.'],
  },
  D5: {
    caption: 'Aturan, peran, prosedur, setup, hook dan workflow memiliki pembaca berbeda. Biru menandai manusia, ungu agent, jingga kontrol, abu artefak.',
    steps: ['Instructions dan AGENTS.md memberi aturan.', 'Profil agent memberi peran dan tools.', 'Skill mengajarkan prosedur.', 'Setup steps menyiapkan dependensi.', 'Hook memeriksa aksi.', 'Actions menjalankan workflow terkompilasi.'],
  },
  D6: {
    caption: 'S04: CI dan PR mengembalikan bukti ke Bima. Bila belum cukup, Bima meminta revisi; tidak ada merge di skenario ini.',
    steps: ['Bima menulis issue dan assign ke Copilot.', 'Copilot mengajukan draft PR pada branch terpisah.', 'CI melaporkan hasil tes ke PR.', 'Bima meninjau diff dan meminta tes batas hari ini.', 'Copilot mengirim revisi untuk ditinjau.'],
  },
  D7: {
    caption: 'Security, Performance dan Compliance membaca diff yang sama dari sudut berbeda. Manusia memeriksa bukti lalu memutuskan.',
    steps: ['Draft PR membagikan diff kepada tiga reviewer.', 'Security memeriksa privasi.', 'Performance memeriksa query berulang.', 'Compliance memeriksa audit trail.', 'Bima membaca ringkasan dengan bukti masing-masing.'],
  },
  D8: {
    caption: 'Alur CodeQL ini ilustrasi. Status alert sungguhan baru dinilai dari hasil scan dan perubahan yang ditinjau.',
    steps: ['Baca alert bila scanner menemukannya.', 'Minta usulan mitigasi tanpa menanam celah.', 'Tinjau perubahan defensif dalam draft PR.', 'Jalankan scan ulang dan lihat hasilnya.'],
  },
  D9: {
    caption: 'Keputusan Bima adalah titik henti. Jika belum setuju, agent kembali ke ADR; bukan langsung coding.',
    steps: ['Architect menulis draf ADR.', 'Bima meminta revisi atau menyetujui.', 'Setelah disetujui, Implementer membuka draft PR.', 'Security Reviewer memeriksa hasil desain dan implementasi.'],
  },
  D10: {
    caption: 'Satu pemicu menghasilkan satu jalur kerja. Safe outputs membatasi objek yang boleh berubah.',
    steps: ['Push demo/manual → Docs Sync → draft PR docs.', 'Issue latihan dibuka → Issue Triage → label atau komentar.', 'CI latihan gagal → CI Fault Analysis → satu komentar pada PR pemicu.'],
  },
  D11: {
    caption: 'Hook memutuskan penolakan atau meneruskan ke kebijakan normal. Log hanya menyimpan metadata keputusan.',
    steps: ['Agent meminta tool.', 'Hook memeriksa kategori.', 'Kategori terlarang ditolak.', 'Selain itu, izin runtime tetap menentukan.', 'Audit lokal mencatat waktu dan kategori.'],
  },
  D12: {
    caption: 'Urutan penyerahan S15. Audit bukan langkah deploy: jejaknya dicatat sepanjang latihan.',
    steps: ['Lina menulis epik bersama Planner.', 'Architect menulis ADR; Bima menyetujui.', 'Copilot mengajukan draft PR.', 'CI memperlihatkan tes.', 'Review Board dan CodeQL memberi bukti.', 'Bima memutuskan merge.', 'Docs Sync dan Triage menangani tindak lanjut.', 'Yoga memeriksa metadata audit sepanjang alur.'],
  },
  D13: {
    caption: 'Tanpa akun tetap bisa belajar dari aplikasi dan materi lokal. Jalur organisasi menambah persetujuan tenant dan integrasi.',
    steps: ['Lokal: jalankan app dan buka HTML offline.', 'Personal: pakai Issues dan PR bila ada izin.', 'Organisasi: cek konektor, policy dan budget.', 'Jika Copilot belum aktif, gunakan bukti lokal.'],
  },
};

export const timeline = [
  ['Pecah epik', 'Lina + Planner', 'Susun draf issue ADR, API/UI, tes, dan docs; manusia menyetujui penugasan.', 'S15-02-breakdown.png'],
  ['Setujui ADR', 'Architect + Bima', 'Sepakati sumber kurs, waktu kurs dan pembulatan sebelum menulis kode.', 'S15-03-adr.png'],
  ['Buka draft PR', 'Copilot', 'Ajukan perubahan di branch dan tautkan epik serta tes.', 'S15-04-pr.png'],
  ['Periksa checks', 'GitHub Actions', 'Jalankan tes. Jika merah, periksa penyebab sebelum lanjut.', 'S15-05-ci.png'],
  ['Review dan scan', 'Reviewer + CodeQL', 'Pisahkan saran model, temuan terverifikasi, dan keputusan manusia.', 'S15-06-reviews.png'],
  ['Putuskan merge', 'Bima', 'Merge hanya pada repo latihan setelah review persetujuan dan checks terpenuhi.', 'S15-07-merge.png'],
  ['Sinkronkan docs', 'Docs Sync + Triage', 'Ajukan draft PR dokumentasi dan rapikan issue tindak lanjut bila diaktifkan.', 'S15-08-docs.png'],
  ['Tinjau audit', 'Yoga + Ibu Maya', 'Periksa keputusan hook dan penggunaan AI credits secara terpisah.', 'S15-09-audit.png'],
];

export const glossary = [
  ['Agentic SDLC', 'Pemakaian agent di beberapa tahap kerja perangkat lunak, dengan manusia di titik keputusan.'],
  ['Copilot cloud agent', 'Agent yang mengerjakan tugas di latar belakang dan mengusulkan perubahan lewat PR.'],
  ['Custom agent', 'Profil peran dengan instruksi dan daftar tool, misalnya QA Engineer.'],
  ['Skill', 'Prosedur berulang yang dimuat saat relevan, misalnya aturan menambah endpoint.'],
  ['MCP', 'Protokol untuk menghubungkan agent ke tool dan data dengan izin yang sesuai.'],
  ['Hook', 'Program kecil yang bereaksi pada fase sesi, misalnya sebelum tool dijalankan.'],
  ['gh-aw', 'Compiler yang mengubah workflow berorientasi agent dari Markdown menjadi GitHub Actions.'],
  ['Safe outputs', 'Daftar bentuk perubahan yang boleh diminta agent; job terpisah memvalidasi dan menerapkannya.'],
  ['Premium request / AI credit', 'Istilah penggunaan pada versi paket yang berbeda. Workshop memakai AI credits sesuai dokumentasi saat dicek; keduanya bukan satuan yang otomatis setara.'],
  ['Branch protection', 'Aturan merge dan push yang diterapkan repository, terpisah dari instruksi agent.'],
  ['ADR', 'Catatan tentang keputusan arsitektur, alternatif, dan konsekuensinya.'],
  ['Draft PR', 'Usulan perubahan yang belum dinyatakan siap untuk merge.'],
];

export const faq = [
  ['Bolehkah agent merge sendiri?', 'Tidak di workshop ini. Branch protection dan manusia yang meninjau menentukan keputusan; S04 tidak di-merge.'],
  ['Apa bedanya memberi chat dan mendelegasikan issue?', 'Chat membantu memahami. Issue memberi kriteria dan identitas tugas, lalu menerima tautan hasil dan jejak review.'],
  ['Haruskah punya Copilot untuk mengikuti workshop?', 'Tidak untuk materi offline, aplikasi lokal, dan fixture. Periksa paket dan policy sebelum mencoba fitur cloud.'],
  ['Kenapa CodeQL tidak menghasilkan alert yang ditunjukkan?', 'S10 memakai ilustrasi yang aman. Jangan menganggap kartu simulasi sebagai alert sungguhan; laporkan hasil scan aktual apa adanya.'],
  ['Apakah hook menggantikan sandbox atau izin?', 'Tidak. Hook adalah lapisan tambahan, bukan jaminan keamanan. Hak akses, sandbox, dan branch protection tetap berlaku.'],
  ['Ke mana biaya masuk?', 'Model dan token memengaruhi AI credits; Actions dan langganan terpisah. Pemilik memantau dashboard dan anggaran.'],
  ['Bisakah PM mulai dari Jira atau Teams?', 'Bisa jika paket mendukung integrasinya dan kebijakan organisasi mengizinkan. Versi personal memakai GitHub Issue.'],
  ['Bagaimana mengulang tanpa menghapus pekerjaan?', 'Restart aplikasi lokal untuk seed awal. Buat checkout latihan baru dengan npm run reset -- --fresh; remote tidak diubah.'],
  ['Apakah buka situs ini menjalankan Express atau Copilot?', 'Tidak. Situs, diagram, grafik dan simulasi halaman semuanya offline. Aplikasi dan GitHub dimulai secara terpisah.'],
];
