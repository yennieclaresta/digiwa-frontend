# DIGIWA

DIGIWA is an Expo mobile app with Expo web support, a Flask backend, and a PostgreSQL or Supabase data layer for digital warga service requests.

## Stack

- Mobile and web: Expo Router, React Native, TypeScript
- Backend: Flask
- Database: PostgreSQL or Supabase
- File upload: Cloudinary signed upload
- API testing: Postman collection in [postman](/C:/Users/Rahfi/client-digiwa-claresta/postman)

## Run

### 1. Install app dependencies

```bash
npm install
```

### 2. Configure backend

Copy [backend/.env.example](/C:/Users/Rahfi/client-digiwa-claresta/backend/.env.example) to `backend/.env` and fill:

- database config
- `APP_SECRET`
- Cloudinary config if you want real upload testing

### 3. Prepare database

For a fresh database:

```sql
\i database/schema.sql
```

For an existing database that needs the no-NIK fix:

```sql
\i database/schema_01.sql
```

### 4. Seed demo users

Run:

```bash
cd backend
python seed_demo.py
```

Demo credentials created by the script:

- Petugas: `admin@digiwa.id` / `admin123`
- Warga: `demo.warga@example.com` / `password123`

### 5. Run backend

```bash
cd backend
python app.py
```

Default backend URL:

```text
http://127.0.0.1:5000
```

### 6. Configure mobile/web app

Copy [/.env.example](/C:/Users/Rahfi/client-digiwa-claresta/.env.example) to `.env` and set:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:5000
```

Use your machine IP for phone testing, not `127.0.0.1`.

### 7. Run Expo

```bash
npm run start
```

For web showcase:

```bash
npm run web
```

## Manual API Testing

Import both files into Postman:

- [DIGIWA.postman_collection.json](/C:/Users/Rahfi/client-digiwa-claresta/postman/DIGIWA.postman_collection.json)
- [DIGIWA.local.postman_environment.json](/C:/Users/Rahfi/client-digiwa-claresta/postman/DIGIWA.local.postman_environment.json)

Suggested order:

1. `Health`
2. `Services`
3. `Login Petugas`
4. `Login Warga`
5. `Create Request KTP`
6. `Petugas List Requests`
7. `Update Request Status`
8. `Generate Mock Document`
9. `Download Document`
10. `List Notifications`

## Current Behavior

- Login does not use a role selector. Petugas is detected from the `@digiwa.id` email account, while warga can login with email or NIK.
- Warga can register with or without NIK.
- Petugas must already exist; the demo seed script creates one.
- PDF output is intentionally dummy/generated placeholder content for showcase and flow validation.

## Production Showcase Notes

- Expo web is the web mode for this project; there is no separate React website codebase.
- The current structure is backend-ready and demo-ready.
- For a real production rollout, the main unfinished piece is replacing placeholder PDF output with real signed documents.
