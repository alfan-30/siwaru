import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: {
    'DashboardADMIN': resolve(__dirname, 'DashboardADMIN.html'),
    'DashboardGURU': resolve(__dirname, 'DashboardGURU.html'),
    'DashboardSISWA': resolve(__dirname, 'DashboardSISWA.html'),
    'absensiGURU': resolve(__dirname, 'absensiGURU.html'),
    'absensiSISWA': resolve(__dirname, 'absensiSISWA.html'),
    'absensiADMIN': resolve(__dirname, 'absensiADMIN.html'),
    'kelasADMIN': resolve(__dirname, 'kelasADMIN.html'),
    'mapelADMIN': resolve(__dirname, 'mapelADMIN.html'),
    'dataguruADMIN': resolve(__dirname, 'dataguruADMIN.html'),
    'datasiswaADMIN': resolve(__dirname, 'datasiswaADMIN.html'),
    'editjadwalADMIN': resolve(__dirname, 'editjadwalADMIN.html'),
    'jadwalGURU': resolve(__dirname, 'jadwalGURU.html'),
    'jadwalSISWA': resolve(__dirname, 'jadwalSISWA.html'),
    'login': resolve(__dirname, 'login.html'),
    'profileADMIN': resolve(__dirname, 'profileADMIN.html'),
    'profileGURU': resolve(__dirname, 'profileGURU.html'),
    'profileSiswa': resolve(__dirname, 'profileSiswa.html'),
    'registrasi': resolve(__dirname, 'registrasi.html'),
    'reset-password': resolve(__dirname, 'reset-password.html'),
    'riwayatADMIN': resolve(__dirname, 'riwayatADMIN.html')
  } } }
});
