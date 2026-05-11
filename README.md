# 🎮 Minecraft Server Dashboard

Panel dashboard Minecraft realtime dengan dua tampilan: **Public** dan **Admin**.

## Fitur

### Public (`/`)
- Status server realtime (TPS, CPU, RAM, Uptime)
- Daftar player online
- Leaderboard playtime
- Update otomatis setiap 3 detik via SSE

### Admin (`/admin`)
- Login dengan password
- Monitoring realtime dengan chart history
- Detail player lengkap (HP, Hunger, XP, Koordinat)
- Live chat monitor
- Console server interaktif
- Quick actions (Restart, Save, Broadcast, Backup)
- Update setiap 2 detik

## Deploy ke Vercel

### 1. Clone & Install
```bash
git clone <repo-url>
cd minecraft-dashboard
npm install
```

### 2. Deploy ke Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Atau import langsung dari GitHub di [vercel.com](https://vercel.com/new).

### 3. Environment Variables (Opsional)
Tambahkan di Vercel Dashboard > Settings > Environment Variables:
```
ADMIN_PASSWORD=password_kamu_di_sini
MINECRAFT_SERVER_HOST=play.myserver.net
MINECRAFT_SERVER_PORT=25565
RCON_PORT=25575
RCON_PASSWORD=password_rcon
```

## Integrasi Server Minecraft Asli

Edit `src/lib/serverData.ts` dan ganti fungsi-fungsi dengan koneksi RCON nyata:

### Menggunakan library RCON:
```bash
npm install rcon-client
```

```typescript
import { Rcon } from 'rcon-client';

const rcon = new Rcon({
  host: process.env.MINECRAFT_SERVER_HOST!,
  port: parseInt(process.env.RCON_PORT || '25575'),
  password: process.env.RCON_PASSWORD!,
});

// Contoh ambil player online:
await rcon.connect();
const response = await rcon.send('list');
await rcon.end();
```

### Menggunakan minecraft-server-util:
```bash
npm install minecraft-server-util
```

```typescript
import * as mcsUtil from 'minecraft-server-util';

const result = await mcsUtil.status('play.myserver.net', 25565);
console.log(result.players.online);
```

## Struktur Project
```
src/
├── app/
│   ├── page.tsx              # Public dashboard
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   ├── api/
│   │   ├── server-status/    # SSE endpoint public
│   │   └── admin/            # SSE endpoint admin
│   └── globals.css
└── lib/
    └── serverData.ts         # Data layer (ganti dengan RCON asli)
```

## Keamanan Produksi

1. Ganti `ADMIN_TOKEN = "admin123"` dengan token dari environment variable
2. Implementasikan autentikasi JWT atau session yang proper
3. Tambahkan rate limiting pada API routes
4. Gunakan HTTPS (sudah otomatis di Vercel)

## Local Development
```bash
npm run dev
# Buka http://localhost:3000
# Admin: http://localhost:3000/admin (password: admin123)
```
