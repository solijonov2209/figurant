# Production ga chiqarish (Deployment) yo'riqnomasi

## 1. Backend CORS sozlamalari (MAJBURIY!) ⚠️

Production ga chiqishdan **OLDIN** backend dasturchilar CORS ni sozlashi shart!

### Django uchun:

```bash
pip install django-cors-headers
```

```python
# settings.py
INSTALLED_APPS = [
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Eng yuqorida!
    'django.middleware.common.CommonMiddleware',
    ...
]

# CORS sozlamalari
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",           # Development
    "https://your-domain.uz",          # Production
    "https://www.your-domain.uz",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'ngrok-skip-browser-warning',
]
```

### FastAPI uchun:

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Development
        "https://your-domain.uz",     # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Node.js/Express uchun:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',        // Development
    'https://your-domain.uz'        // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
```

## 2. Frontend Environment sozlamalari

### Development (.env):

```bash
# Development API URL (ngrok yoki local)
VITE_API_URL=https://8ed8-84-54-70-89.ngrok-free.app/api/v1

# Mock data ishlatmaslik
VITE_USE_MOCK_DATA=false
```

### Production (.env.production):

```bash
# Production API URL
VITE_API_URL=https://api.your-domain.uz/api/v1

# Mock data ishlatmaslik (production da har doim false!)
VITE_USE_MOCK_DATA=false
```

## 3. Build qilish

### Development uchun:

```bash
npm run dev
```

### Production uchun:

```bash
# Production build
npm run build

# Build fayllarini test qilish
npm run preview
```

## 4. Hosting platformalarida sozlash

### Vercel:

1. Vercel dashboard ga kiring
2. Project Settings → Environment Variables
3. Quyidagilarni qo'shing:
   - `VITE_API_URL` = `https://api.your-domain.uz/api/v1`
   - `VITE_USE_MOCK_DATA` = `false`

### Netlify:

1. Netlify dashboard ga kiring
2. Site Settings → Build & Deploy → Environment
3. Quyidagilarni qo'shing:
   - `VITE_API_URL` = `https://api.your-domain.uz/api/v1`
   - `VITE_USE_MOCK_DATA` = `false`

### VPS (nginx):

1. `.env.production` faylini server ga yuklang
2. Build qiling: `npm run build`
3. `dist` papkasini nginx ga ko'rsating

```nginx
server {
    listen 80;
    server_name your-domain.uz;

    root /var/www/figurant/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 5. HTTPS sozlash (Majburiy!)

Production da har doim HTTPS ishlatish kerak:

```bash
# Let's Encrypt SSL sertifikat
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.uz -d www.your-domain.uz
```

## 6. Tekshirish (Testing)

Production ga chiqarishdan oldin:

- [ ] Backend CORS sozlangan
- [ ] Backend HTTPS ishlayapti
- [ ] Frontend environment variables to'g'ri
- [ ] Build hech qanday error bermaydi
- [ ] Login ishlayapti
- [ ] Barcha API endpointlar ishlayapti
- [ ] Brauzer console da CORS error yo'q
- [ ] Network tab da 200/201 statuslar kelmoqda

## 7. Muammolarni hal qilish

### CORS error:
- Backend CORS sozlamalarini tekshiring
- Frontend va Backend URLlarini tekshiring
- Browser cache ni tozalang (Ctrl+Shift+R)

### API so'rov ishlamayapti:
- Environment variablelar to'g'ri ekanligini tekshiring
- Backend server ishlayotganini tekshiring
- Network tabda so'rovni tekshiring

### Build error:
- `node_modules` ni o'chiring va qayta `npm install` qiling
- `.env` fayllarni tekshiring
