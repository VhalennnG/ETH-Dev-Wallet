Dashboard ETH lokal berbasis **Next.js + web3.js** dengan koneksi ke **Ganache**. Proyek ini _tidak_ menyertakan fitur jual/beli/transfer token ERC20. Namun, struktur dan konfigurasi **Truffle** disertakan sebagai _framework_ ERC20 agar Anda bisa mengembangkan kontrak sendiri bila diperlukan.

---

## Feature

- Connect ke Ganache (RPC lokal)
- Menampilkan daftar akun & saldo **ETH**
- Form **transfer ETH** antarakun lokal
- Disertai kerangka **Truffle + Solidity** (opsional) untuk eksperimen ERC20

## Stack

- **Next.js** (React)
- **web3.js**
- **Ganache** untuk blockchain lokal
- **Truffle** untuk compile/migrate kontrak
- **Solidity** `^0.8.13`

## Requirements

- Node.js **>= 18**
- Ganache (CLI atau UI)
- Truffle (global atau via `npx`)

```bash
# Opsional: instal global
npm i -g truffle ganache
```

---

## Menjalankan Secara Cepat

1. **Clone & install**

   ```bash
   git clone <URL-REPO-ANDA>
   cd <REPO_NAME>
   npm install
   # atau
   yarn
   ```

2. **Jalankan Ganache** (port default 8545)

   ```bash
   # Contoh CLI
   ganache -p 8545
   # atau gunakan Ganache UI dan pastikan RPC: http://127.0.0.1:8545
   ```

3. **Buat `.env.local`** di root Next.js

   ```env
   NEXT_PUBLIC_GANACHE_RPC=http://127.0.0.1:8545
   ```

4. **Jalankan Next.js**

   ```bash
   npm run dev
   # buka http://localhost:3000
   ```

> Setelah mengubah `.env.local`, **restart** dev server agar variabel termuat ulang.

---

## (Opsional) Kerangka ERC20 dengan Truffle

UI saat ini hanya untuk **ETH**. Bagian ini untuk Anda yang ingin tetap men-deploy kontrak ERC20 sebagai framework pengembangan (tanpa integrasi UI jual/beli/transfer token).

### 1) Struktur dasar kontrak

Letakkan kontrak di folder `contracts/`, contoh minimal (menggunakan OpenZeppelin):

```solidity
// contracts/MyToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply);
    }
}
```

Install dependensi OpenZeppelin:

```bash
npm i @openzeppelin/contracts
```

### 2) `truffle-config.js`

Gunakan konfigurasi berikut agar Truffle terhubung ke Ganache (sesuai permintaan Anda):

```js
// truffle-config.js
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: "0.8.13",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
```

### 3) Migrasi

Buat berkas migrasi di `migrations/2_deploy_mytoken.js`:

```js
const MyToken = artifacts.require("MyToken");

module.exports = async function (deployer) {
  const initialSupply = web3.utils.toWei("1000000", "ether"); // 1,000,000 MTK (18 desimal)
  await deployer.deploy(MyToken, initialSupply);
};
```

Lalu compile & migrate:

```bash
npx truffle compile
npx truffle migrate --network development
```

**Catat address** kontrak hasil deploy (ditampilkan di output `migrate`). Jika suatu saat Anda ingin membaca saldo token dari UI, Anda bisa menambahkan alamat kontrak & ABI secara manual (di luar cakupan proyek awal ini).

---

## Skrip NPM (contoh)

Pastikan `package.json` memiliki skrip standar Next.js:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000"
  }
}
```

---

## Cara Pakai (UI ETH)

1. Masuk ke halaman utama, pastikan **RPC URL** sudah benar (`http://127.0.0.1:8545`).
2. Klik **Connect** untuk mengambil `chainId`, `blockNumber`, `gasPrice`, dan daftar akun.
3. Buka bagian **Akun & Saldo** untuk melihat saldo ETH per akun.
4. Gunakan form **Transfer ETH** untuk mengirim ETH antar akun Ganache.

> Pastikan akun pengirim memiliki saldo yang cukup.

---

## Struktur Folder (ringkas)

```
<REPO_NAME>/
├─ contracts/
├─ migrations/
├─ pages/
├─ public/
├─ styles/
├─ truffle-config.js
└─ ...
```

---

## Troubleshooting

- **Tidak bisa Connect / `ECONNREFUSED`**: Pastikan Ganache berjalan di `127.0.0.1:8545`.
- **Saldo 0**: Gunakan akun bawaan Ganache atau faucet lokal.
- **Error variabel lingkungan**: Restart `npm run dev` setelah edit `.env.local`.
- **Versi Solidity**: Cocokkan versi di kontrak & `truffle-config.js` (`0.8.13`).
- \*\*Nonce / pending tx
