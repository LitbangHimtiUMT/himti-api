const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, 'HIMTI-API-Complete.postman_collection.json');

if (!fs.existsSync(collectionPath)) {
  console.error("Postman collection file not found at: " + collectionPath);
  process.exit(1);
}

const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Helper to generate a standardized success response
const successResponse = (status, code, body) => ({
  name: "Success Response",
  status,
  code,
  "_postman_previewlanguage": "json",
  header: [{ key: "Content-Type", value: "application/json" }],
  body: JSON.stringify(body, null, 2)
});

const newFolders = [
  {
    name: "Potential Users Key Management",
    item: [
      {
        name: "Create Key",
        request: {
          method: "POST",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Authorization", value: "Bearer {{token}}" }
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              key: "TALENTA-01",
              maxUsage: 10,
              allowedGen: ["2023", "2024"],
              expiredAt: "2026-12-31T23:59:59.000Z"
            }, null, 2)
          },
          url: { raw: "{{baseUrl}}/potential-user-keys", host: ["{{baseUrl}}"], path: ["potential-user-keys"] }
        },
        response: [successResponse("Created", 201, { status: 201, code: "SUCCESS", message: "Success create data", data: { id: "uuid", key: "TALENTA-01" } })]
      },
      {
        name: "Get All Keys",
        request: {
          method: "GET",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          url: { raw: "{{baseUrl}}/potential-user-keys", host: ["{{baseUrl}}"], path: ["potential-user-keys"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success get data", data: [] })]
      },
      {
        name: "Delete Key",
        request: {
          method: "DELETE",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          url: {
            raw: "{{baseUrl}}/potential-user-keys/:id",
            host: ["{{baseUrl}}"],
            path: ["potential-user-keys", ":id"],
            variable: [{ key: "id", value: "key-uuid" }]
          }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success delete data", data: null })]
      }
    ]
  },
  {
    name: "Potential Users Profiles",
    item: [
      {
        name: "Parse CV with AI",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              text: "John Doe, 2 years Web Dev, skills: React, Node.js. Education UMT."
            }, null, 2)
          },
          url: { raw: "{{baseUrl}}/potential-users/parse-cv", host: ["{{baseUrl}}"], path: ["potential-users", "parse-cv"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success parse CV", data: { role: "Web Developer", skills: ["React", "Node.js"] } })]
      },
      {
        name: "Register Potential User (Form Data)",
        request: {
          method: "POST",
          header: [],
          body: {
            mode: "formdata",
            formdata: [
              { key: "nim", value: "24552010142", type: "text" },
              { key: "keyUsed", value: "TALENTA-01", type: "text" },
              { key: "role", value: "Frontend Developer", type: "text" },
              { key: "company", value: "Tokopedia", type: "text" },
              { key: "experienceYear", value: "2", type: "text" },
              { key: "summary", value: "React Developer", type: "text" },
              { key: "skills", value: '["React.js","Figma"]', type: "text" },
              { key: "projects", value: '[]', type: "text" },
              { key: "education", value: '[]', type: "text" },
              { key: "photo", type: "file", src: [] }
            ]
          },
          url: { raw: "{{baseUrl}}/potential-users", host: ["{{baseUrl}}"], path: ["potential-users"] }
        },
        response: [successResponse("Created", 201, { status: 201, code: "SUCCESS", message: "Success create data", data: {} })]
      },
      {
        name: "Get All Potential Users",
        request: {
          method: "GET",
          url: { raw: "{{baseUrl}}/potential-users", host: ["{{baseUrl}}"], path: ["potential-users"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success get data", data: [] })]
      },
      {
        name: "Update Potential User Profile",
        request: {
          method: "PUT",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Authorization", value: "Bearer {{token}}" }
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              id: "profile-uuid",
              role: "Senior Frontend Developer",
              isActive: true
            }, null, 2)
          },
          url: { raw: "{{baseUrl}}/potential-users", host: ["{{baseUrl}}"], path: ["potential-users"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success update data", data: {} })]
      }
    ]
  },
  {
    name: "Prodi Structural",
    item: [
      {
        name: "Get All Prodi Structural",
        request: {
          method: "GET",
          url: { raw: "{{baseUrl}}/prodi-structural", host: ["{{baseUrl}}"], path: ["prodi-structural"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success get prodi structural list", data: [] })]
      },
      {
        name: "Create Prodi Structural",
        request: {
          method: "POST",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          body: {
            mode: "formdata",
            formdata: [
              { key: "name", value: "Arief Herdiansah, M.TI", type: "text" },
              { key: "role", value: "Ketua Prodi Teknik Informatika", type: "text" },
              { key: "bio", value: "Kaprodi periode 2026-2030", type: "text" },
              { key: "sequence", value: "1", type: "text" },
              { key: "image", type: "file", src: [] }
            ]
          },
          url: { raw: "{{baseUrl}}/prodi-structural", host: ["{{baseUrl}}"], path: ["prodi-structural"] }
        },
        response: [successResponse("Created", 201, { status: 201, code: "SUCCESS", message: "Success create prodi structural", data: {} })]
      },
      {
        name: "Update Prodi Structural",
        request: {
          method: "PUT",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          body: {
            mode: "formdata",
            formdata: [
              { key: "name", value: "Arief Herdiansah, M.TI (Edited)", type: "text" },
              { key: "sequence", value: "1", type: "text" },
              { key: "image", type: "file", src: [] }
            ]
          },
          url: {
            raw: "{{baseUrl}}/prodi-structural/:id",
            host: ["{{baseUrl}}"],
            path: ["prodi-structural", ":id"],
            variable: [{ key: "id", value: "record-uuid" }]
          }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success update prodi structural", data: {} })]
      },
      {
        name: "Delete Prodi Structural",
        request: {
          method: "DELETE",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          url: {
            raw: "{{baseUrl}}/prodi-structural/:id",
            host: ["{{baseUrl}}"],
            path: ["prodi-structural", ":id"],
            variable: [{ key: "id", value: "record-uuid" }]
          }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success delete prodi structural", data: null })]
      }
    ]
  },
  {
    name: "Tenure Period Vision & Mission",
    item: [
      {
        name: "Get Active Period Vision",
        request: {
          method: "GET",
          url: { raw: "{{baseUrl}}/periode/active", host: ["{{baseUrl}}"], path: ["periode", "active"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success get active period", data: {} })]
      },
      {
        name: "Get All Periods",
        request: {
          method: "GET",
          url: { raw: "{{baseUrl}}/periode", host: ["{{baseUrl}}"], path: ["periode"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success get all periods", data: [] })]
      },
      {
        name: "Create Period",
        request: {
          method: "POST",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          body: {
            mode: "formdata",
            formdata: [
              { key: "period", value: "2024/2025", type: "text" },
              { key: "name", value: "Kepengurusan Angkatan 24", type: "text" },
              { key: "vision", value: "Mewujudkan HIMTI yang unggul...", type: "text" },
              { key: "mission", value: '[{"title": "Misi 1", "description": "Detail misi"}]', type: "text" },
              { key: "isActive", value: "true", type: "text" },
              { key: "logo", type: "file", src: [] }
            ]
          },
          url: { raw: "{{baseUrl}}/periode", host: ["{{baseUrl}}"], path: ["periode"] }
        },
        response: [successResponse("Created", 201, { status: 201, code: "SUCCESS", message: "Success create period", data: {} })]
      },
      {
        name: "Update Period",
        request: {
          method: "PUT",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          body: {
            mode: "formdata",
            formdata: [
              { key: "vision", value: "Visi baru...", type: "text" },
              { key: "logo", type: "file", src: [] }
            ]
          },
          url: {
            raw: "{{baseUrl}}/periode/:id",
            host: ["{{baseUrl}}"],
            path: ["periode", ":id"],
            variable: [{ key: "id", value: "period-uuid" }]
          }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success update period", data: {} })]
      },
      {
        name: "Delete Period",
        request: {
          method: "DELETE",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          url: {
            raw: "{{baseUrl}}/periode/:id",
            host: ["{{baseUrl}}"],
            path: ["periode", ":id"],
            variable: [{ key: "id", value: "period-uuid" }]
          }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success delete period", data: null })]
      }
    ]
  },
  {
    name: "Dynamic Contact Info",
    item: [
      {
        name: "Get All Contacts",
        request: {
          method: "GET",
          url: { raw: "{{baseUrl}}/contact-info", host: ["{{baseUrl}}"], path: ["contact-info"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success get contacts", data: [] })]
      },
      {
        name: "Create Contact",
        request: {
          method: "POST",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Authorization", value: "Bearer {{token}}" }
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              key: "youtube",
              value: "https://youtube.com",
              group: "social_media"
            }, null, 2)
          },
          url: { raw: "{{baseUrl}}/contact-info", host: ["{{baseUrl}}"], path: ["contact-info"] }
        },
        response: [successResponse("Created", 201, { status: 201, code: "SUCCESS", message: "Success create contact", data: {} })]
      },
      {
        name: "Batch Upsert Contacts",
        request: {
          method: "PUT",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Authorization", value: "Bearer {{token}}" }
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify([
              { key: "address", value: "Bekasi", group: "office_info" },
              { key: "youtube", value: "https://youtube.com", group: "social_media" }
            ], null, 2)
          },
          url: { raw: "{{baseUrl}}/contact-info/batch", host: ["{{baseUrl}}"], path: ["contact-info", "batch"] }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success batch update contacts", data: [] })]
      },
      {
        name: "Update Contact",
        request: {
          method: "PUT",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Authorization", value: "Bearer {{token}}" }
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              value: "Bandung",
              group: "office_info"
            }, null, 2)
          },
          url: {
            raw: "{{baseUrl}}/contact-info/:id",
            host: ["{{baseUrl}}"],
            path: ["contact-info", ":id"],
            variable: [{ key: "id", value: "contact-uuid" }]
          }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success update contact", data: {} })]
      },
      {
        name: "Delete Contact",
        request: {
          method: "DELETE",
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          url: {
            raw: "{{baseUrl}}/contact-info/:id",
            host: ["{{baseUrl}}"],
            path: ["contact-info", ":id"],
            variable: [{ key: "id", value: "contact-uuid" }]
          }
        },
        response: [successResponse("OK", 200, { status: 200, code: "SUCCESS", message: "Success delete contact", data: null })]
      }
    ]
  }
];

// Add the folders to the items
collection.item.push(...newFolders);

// Save the collection file back
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf8');
console.log("Postman collection updated successfully with new folders!");
