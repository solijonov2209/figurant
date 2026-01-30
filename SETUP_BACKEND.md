# Backend'ni Ishga Tushirish - To'liq Qo'llanma

Backend to'liq tayyor, faqat MongoDB o'rnatish va ishga tushirish kerak.

## 1. MongoDB O'rnatish

### Windows uchun:

1. **MongoDB Community Server yuklab olish:**
   - https://www.mongodb.com/try/download/community saytiga o'ting
   - Windows versiyasini tanlang
   - MSI installer ni yuklab oling

2. **O'rnatish:**
   - Yuklab olingan `.msi` faylni ishga tushiring
   - "Complete" o'rnatishni tanlang
   - "Install MongoDB as a Service" ni belgilang
   - "Install MongoDB Compass" (GUI tool) ni belgilang

3. **Tekshirish:**
   ```cmd
   mongod --version
   ```

### macOS uchun:

```bash
# Homebrew orqali o'rnatish
brew tap mongodb/brew
brew install mongodb-community

# Ishga tushirish
brew services start mongodb-community

# Tekshirish
mongod --version
```

### Linux (Ubuntu/Debian) uchun:

```bash
# MongoDB repository qo'shish
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# O'rnatish
sudo apt-get update
sudo apt-get install -y mongodb-org

# Ishga tushirish
sudo systemctl start mongod
sudo systemctl enable mongod

# Tekshirish
mongod --version
```

## 2. Backend Sozlash

### 2.1. Dependencies o'rnatish

```bash
cd backend
npm install
```

### 2.2. Environment variables sozlash

`.env` fayli allaqachon mavjud, lekin tekshiring:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/figurant
JWT_SECRET=figurant_secret_key_2024_namangan_viloyati_jinoyat_monitoring
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 2.3. Dastlabki ma'lumotlarni yuklash

```bash
node src/utils/seed.js
```

Bu quyidagilarni yaratadi:
- ✅ Super Admin: `admin / admin123`
- ✅ JQB Admin: `jqb_namangan / jqb123`
- ✅ 12 ta tuman (Namangan viloyati)
- ✅ 5 ta mahalla (Namangan shahar)
- ✅ 8 ta jinoyat turi

## 3. Backend Ishga Tushirish

### Development mode (nodemon bilan):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

Server `http://localhost:5000` da ishga tushadi.

## 4. Backend Test Qilish

### 4.1. Health check:

```bash
curl http://localhost:5000/api/health
```

Natija:
```json
{
  "success": true,
  "message": "Server ishlayapti"
}
```

### 4.2. Login test:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'
```

Natija:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "...",
    "login": "admin",
    "fullName": "Super Administrator",
    "role": "SUPER_ADMIN"
  }
}
```

## 5. MongoDB Compass bilan Ma'lumotlarni Ko'rish

1. MongoDB Compass'ni oching
2. Connection string: `mongodb://localhost:27017`
3. Connect tugmasini bosing
4. `figurant` database'ini tanlang
5. Collections: users, persons, districts, mahallas, crimetypes

## 6. Muammolarni Bartaraf Qilish

### MongoDB ulanmadi:

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl status mongod
```

### Port 5000 band:

`.env` faylida `PORT` ni o'zgartiring (masalan: 5001)

### "Cannot find module" xatosi:

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 7. API Endpoints Ro'yxati

### Auth:
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Current user
- PUT `/api/auth/updatepassword` - Parolni o'zgartirish

### Persons:
- GET `/api/persons` - Barcha shaxslar
- POST `/api/persons` - Shaxs qo'shish
- GET `/api/persons/:id` - Bitta shaxs
- GET `/api/persons/in-process` - Ishlovdagilar
- GET `/api/persons/search` - Qidirish
- PUT `/api/persons/:id/add-to-process` - Ishlovga qo'shish
- PUT `/api/persons/:id/remove-from-process` - Ishlovdan chiqarish
- DELETE `/api/persons/:id` - O'chirish

### Districts:
- GET `/api/districts` - Barcha tumanlar
- GET `/api/districts/:id/mahallas` - Tuman mahallalari
- POST `/api/districts` - Tuman yaratish (Super Admin)
- POST `/api/districts/:id/mahallas` - Mahalla yaratish (Super Admin)

### Crime Types:
- GET `/api/crime-types` - Barcha jinoyat turlari
- POST `/api/crime-types` - Jinoyat turi yaratish (Super Admin)
- PUT `/api/crime-types/:id` - Yangilash (Super Admin)
- DELETE `/api/crime-types/:id` - O'chirish (Super Admin)

### Users:
- GET `/api/users` - Barcha adminlar (Super Admin)
- POST `/api/users` - Admin yaratish (Super Admin)
- PUT `/api/users/:id` - Yangilash (Super Admin)
- DELETE `/api/users/:id` - O'chirish (Super Admin)

## 8. Keyingi Qadamlar

Backend ishlagandan so'ng:

1. ✅ Frontend `.env` faylini yarating:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. ✅ Frontend servicalarni backend bilan bog'lang

3. ✅ Frontend va Backend'ni parallel ishga tushiring:
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd .. && npm run dev`

## MongoDB Cloud Alternative (Agar local MongoDB o'rnatib bo'lmasa)

MongoDB Atlas (cloud database) ishlatish mumkin:

1. https://www.mongodb.com/cloud/atlas/register - ro'yxatdan o'ting
2. Free Cluster yarating
3. Database User yarating
4. Network Access: `0.0.0.0/0` qo'shing (dev uchun)
5. Connection string ni oling
6. `.env` faylida `MONGODB_URI` ni yangilang:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/figurant
   ```

---

**Yordam kerak bo'lsa:**
- Backend README.md faylini o'qing
- GitHub Issues: https://github.com/solijonov2209/figurant/issues
