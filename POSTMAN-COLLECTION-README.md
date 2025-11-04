# 📮 HIMTI API - Postman Collection Documentation

## 📚 Available Collections

Terdapat 3 file Postman collection yang tersedia dengan tingkat detail yang berbeda:

### 1. 🚀 **HIMTI-API-Complete.postman_collection.json** ⭐ RECOMMENDED

**File paling lengkap dengan semua fitur!**

- ✅ **140 Endpoints** lengkap dengan dokumentasi
- ✅ **206 Example Responses** (Success & Error scenarios)
- ✅ **Query Parameters** dengan deskripsi lengkap
- ✅ **Request Body Examples** untuk semua endpoints
- ✅ **Auto-save Token** setelah login
- ✅ **Validation Examples** termasuk Bootcamp registration rules
- 📏 **Size:** 217 KB

**Struktur Lengkap:**
```
├── Authentication (10 endpoints)
├── Profile (4 endpoints)
├── User Management (6 endpoints)
├── Events (Acara) (5 endpoints)
├── Event Registration (5 endpoints) ⚡ NEW: Bootcamp validation
├── Event Meeting (6 endpoints)
├── Meetings (6 endpoints)
├── Members (Anggota) (5 endpoints)
├── Generations (Angkatan) (5 endpoints)
├── Structural (Struktural) (5 endpoints)
├── Lecturers (Dosen) (4 endpoints)
├── Attendances (Absensi) (5 endpoints)
├── Points (1 endpoint)
├── Achievements (Prestasi) (1 endpoint)
├── Business (4 endpoints)
├── Notification (5 endpoints)
├── User FCM (2 endpoints)
├── History (1 endpoint)
├── Ticket Support (1 endpoint)
├── Registration Type (6 endpoints)
├── Version (2 endpoints)
├── Initial (1 endpoint)
├── LMS (46 endpoints)
│   ├── Classes (12 endpoints)
│   ├── Mentors (4 endpoints)
│   ├── Categories (2 endpoints)
│   ├── Sessions (5 endpoints)
│   ├── Modules (4 endpoints)
│   ├── Assignments (5 endpoints)
│   ├── Submissions (4 endpoints)
│   ├── Class Participants (3 endpoints)
│   ├── Completed Modules (1 endpoint)
│   ├── Completed Classes (1 endpoint)
│   ├── Certificates (3 endpoints)
│   ├── Transactions (1 endpoint)
│   └── Mentor Transactions (1 endpoint)
└── Utility (4 endpoints)
```

---

### 2. 🎯 **HIMTI-API-Enhanced.postman_collection.json**

**Sample collection dengan dokumentasi detail untuk beberapa endpoint pilihan**

- ✅ 20 Endpoints dengan dokumentasi sangat detail
- ✅ Multiple example responses per endpoint
- ✅ Inline documentation dan use cases
- ✅ Test scripts untuk auto-save token
- 📏 **Size:** 47 KB

**Use Case:** Cocok untuk developer yang ingin melihat contoh struktur dokumentasi API yang lengkap

---

### 3. 📄 **HIMTI-API.postman_collection.json**

**Basic collection dengan semua endpoints (tanpa example responses)**

- ✅ Semua 140+ endpoints
- ✅ Request body examples
- ❌ Minimal example responses
- 📏 **Size:** 71 KB

**Use Case:** Untuk quick testing tanpa perlu banyak dokumentasi

---

## 🚀 Cara Menggunakan

### 1. Import ke Postman

```bash
# Di Postman:
File → Import → Select File
# Pilih: HIMTI-API-Complete.postman_collection.json
```

### 2. Setup Environment Variables

Buat environment baru atau gunakan variables di collection:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:5000` | Base URL API (sesuaikan dengan server Anda) |
| `token` | `""` | JWT Token (auto-filled setelah login) |

### 3. Test Authentication

1. Buka folder **Authentication**
2. Jalankan request **"Login"**
3. Token akan otomatis tersimpan ke variable `{{token}}`
4. Endpoints lain akan otomatis menggunakan token ini

---

## 📋 Fitur Khusus

### 🔐 Auto-Save Token

Request **Login** dan **Register** memiliki test script yang otomatis menyimpan token:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.collectionVariables.set('token', response.data.token);
    }
}
```

### 🎯 Example Responses

Setiap endpoint memiliki example responses untuk berbagai scenarios:

- ✅ **Success Response** (200/201)
- ❌ **Validation Error** (400)
- 🔒 **Unauthorized** (401)
- 🚫 **Not Found** (404)

**Cara melihat:**
1. Klik endpoint yang diinginkan
2. Pergi ke tab **"Examples"**
3. Pilih scenario yang ingin dilihat

### 📝 Query Parameters

Semua query parameters sudah dilengkapi dengan deskripsi:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number (default: 1) | `1` |
| `limit` | Items per page (default: 10) | `20` |
| `search` | Search keyword | `"bootcamp"` |
| `status` | Filter by status | `"active"` |

### 📦 Request Body Examples

Semua POST/PUT endpoints sudah memiliki example request body yang realistis.

---

## ⚡ Validation Rules Terbaru

### Event Registration

**BOOTCAMP Type:**
- ✅ `generation` - **REQUIRED** (number)
- ✅ `image` - **REQUIRED** (file, max 3MB)
- ✅ `class` - **REQUIRED** (string)

**LEARNING_GROUP Type:**
- ✅ `class` - **REQUIRED** (string)
- ⚪ `generation` - OPTIONAL
- ⚪ `image` - OPTIONAL

**SEMINAR Type:**
- ⚪ `class` - OPTIONAL
- ⚪ `generation` - OPTIONAL
- ⚪ `image` - OPTIONAL

**Example Error Responses:**

```json
// Missing generation for BOOTCAMP
{
  "status": 400,
  "code": "BAD_REQUEST",
  "message": "Generation is required for bootcamp registration"
}

// Missing image for BOOTCAMP
{
  "status": 400,
  "code": "BAD_REQUEST",
  "message": "Image is required for bootcamp registration"
}
```

---

## 🔍 Tips & Tricks

### 1. **Testing Workflow**

```
1. Login → Auto-save token
2. Test authenticated endpoints
3. View example responses untuk reference
4. Modify requests sesuai kebutuhan
```

### 2. **Bulk Testing**

Gunakan Postman Collection Runner untuk test multiple endpoints:
```
Collection Runner → Select Collection → Run
```

### 3. **Generate API Documentation**

```
Collection → View Documentation → Publish
```

### 4. **Export untuk Tim**

```
Collection → Export → Share with team
```

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total Endpoints | 140 |
| Total Folders | 24 |
| Example Responses | 206 |
| Request Body Examples | 70+ |
| Query Parameters | 50+ |

---

## 🆕 Latest Updates

### January 2024
- ✅ Added **Event Registration** validation for BOOTCAMP type
- ✅ Added **generation** and **image** required validation
- ✅ Added 206 example responses
- ✅ Enhanced query parameters with descriptions
- ✅ Added auto-save token scripts

---

## 💡 Contoh Penggunaan

### Create Event Registration (BOOTCAMP)

**Request:**
```http
POST {{baseUrl}}/event-registration
Content-Type: multipart/form-data

{
  "name": "John Doe",
  "nim": "11200001",
  "class": "TI-3A",
  "generation": 2022,  // ✅ REQUIRED untuk BOOTCAMP
  "registrationTypeId": "regtype-uuid-bootcamp",
  "image": [FILE]  // ✅ REQUIRED untuk BOOTCAMP (max 3MB)
}
```

**Success Response (201):**
```json
{
  "status": 201,
  "code": "CREATED",
  "message": "Event registration created successfully",
  "data": {
    "id": "registration-uuid-new",
    "name": "John Doe",
    "class": "TI-3A",
    "generation": 2022,
    "image": "https://storage.example.com/registrations/proof-123.webp",
    "registrationType": {
      "id": "regtype-uuid-bootcamp",
      "name": "Bootcamp 2024",
      "type": "BOOTCAMP"
    }
  }
}
```

---

## 🤝 Support

Jika ada pertanyaan atau issue:

1. Check example responses di Postman
2. Lihat validation rules di dokumentasi
3. Contact backend team

---

## 📜 License

Internal use only - HIMTI API

---

**Last Updated:** January 15, 2024
**Version:** 2.0.0
**Maintained by:** HIMTI Development Team
