# Figurant Backend API

Backend API for Figurant Crime Tracking System - Namangan viloyati jinoyatchilik monitoring tizimi.

## Texnologiyalar

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## O'rnatish

### 1. Dependencies ni o'rnatish

```bash
cd backend
npm install
```

### 2. Environment variables sozlash

`.env` faylini yarating va quyidagi ma'lumotlarni kiriting:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/figurant
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. MongoDB ni ishga tushirish

MongoDB kompyuteringizda ishlab turganligiga ishonch hosil qiling:

```bash
# MongoDB ni ishga tushirish (Ubuntu/Linux)
sudo systemctl start mongod

# MongoDB ni ishga tushirish (macOS)
brew services start mongodb-community

# Windows uchun MongoDB Compass yoki MongoDB serverni ishga tushiring
```

### 4. Dastlabki ma'lumotlarni yuklash (Seed)

```bash
node src/utils/seed.js
```

Bu buyruq quyidagilarni yaratadi:
- Super Admin (login: `admin`, password: `admin123`)
- JQB Admin (login: `jqb_namangan`, password: `jqb123`)
- Namangan viloyati tumanlari
- Namangan shahar mahallalari
- Jinoyat turlari

### 5. Serverni ishga tushirish

```bash
# Development mode (nodemon bilan)
npm run dev

# Production mode
npm start
```

Server `http://localhost:5000` da ishga tushadi.

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password

### Persons

- `GET /api/persons` - Get all persons
- `POST /api/persons` - Create person
- `GET /api/persons/:id` - Get single person
- `GET /api/persons/in-process` - Get persons in process
- `GET /api/persons/search` - Search persons
- `PUT /api/persons/:id/add-to-process` - Add to process
- `PUT /api/persons/:id/remove-from-process` - Remove from process
- `DELETE /api/persons/:id` - Delete person

### Districts & Mahallas

- `GET /api/districts` - Get all districts
- `POST /api/districts` - Create district (Super Admin only)
- `GET /api/districts/:id/mahallas` - Get mahallas by district
- `POST /api/districts/:id/mahallas` - Create mahalla (Super Admin only)

### Crime Types

- `GET /api/crime-types` - Get all crime types
- `POST /api/crime-types` - Create crime type (Super Admin only)
- `PUT /api/crime-types/:id` - Update crime type (Super Admin only)
- `DELETE /api/crime-types/:id` - Delete crime type (Super Admin only)

### Users (Admin Management)

- `GET /api/users` - Get all users (Super Admin only)
- `POST /api/users` - Create user (Super Admin only)
- `PUT /api/users/:id` - Update user (Super Admin only)
- `DELETE /api/users/:id` - Delete user (Super Admin only)

## Authentication

Barcha protected routelar JWT token talab qiladi. Token ni Authorization header da yuborish kerak:

```
Authorization: Bearer <your_jwt_token>
```

## Role-based Access Control

### SUPER_ADMIN
- Barcha operatsiyalarga to'liq ruxsat
- Barcha tumanlar va mahallalarga kirish
- Adminlarni boshqarish
- Sistema sozlamalarini o'zgartirish

### JQB_ADMIN
- Faqat o'z tumanidagi ma'lumotlarga kirish
- Shaxslarni qo'shish va ishlovga olish
- Hisobotlarni ko'rish

### MAHALLA_INSPECTOR
- Faqat o'z mahallasidagi ma'lumotlarga kirish
- Shaxslarni qo'shish
- O'z mahallasi hisobotlarini ko'rish

## Xatolarni Bartaraf Qilish

### MongoDB ulanmadi

```bash
# MongoDB service ishlayotganligini tekshiring
sudo systemctl status mongod

# Agar ishlamasa, qayta ishga tushiring
sudo systemctl restart mongod
```

### Port band

Agar 5000 port band bo'lsa, `.env` faylida `PORT` ni o'zgartiring.

### JWT xatosi

`.env` faylida `JWT_SECRET` ni o'zgartirgan bo'lsangiz, barcha tokenlar bekor qilinadi va qayta login qilish kerak.

## Development

```bash
# Install dependencies
npm install

# Run in dev mode with nodemon
npm run dev

# Run in production mode
npm start
```

## Struktura

```
backend/
├── src/
│   ├── config/         # Database va config fayllar
│   ├── controllers/    # Route controller funksiyalar
│   ├── middleware/     # Authentication va error handling
│   ├── models/         # MongoDB/Mongoose modellari
│   ├── routes/         # Express route definitions
│   ├── utils/          # Utility funksiyalar va seed script
│   └── server.js       # Express app entry point
├── .env.example        # Environment variables example
├── .gitignore
├── package.json
└── README.md
```

## Production Deployment

1. `.env` faylini production uchun sozlang
2. `JWT_SECRET` ni kuchli qiymatga o'zgartiring
3. `NODE_ENV=production` qiling
4. MongoDB ni cloud service (MongoDB Atlas) ga ulang
5. HTTPS dan foydalaning
6. Rate limiting va security middleware qo'shing

## Support

Savol va muammolar uchun: [GitHub Issues](https://github.com/solijonov2209/figurant/issues)
