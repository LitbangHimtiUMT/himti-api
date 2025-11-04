// const fs = require('fs');

// const collection = {
//   "info": {
//     "_postman_id": "himti-api-complete",
//     "name": "HIMTI API - Complete Collection",
//     "description": "Complete API collection for HIMTI API with 200+ endpoints, example responses, and detailed documentation",
//     "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
//     "version": "2.0.0"
//   },
//   "variable": [
//     { "key": "baseUrl", "value": "http://localhost:5000", "type": "string" },
//     { "key": "token", "value": "", "type": "string" }
//   ],
//   "auth": {
//     "type": "bearer",
//     "bearer": [{ "key": "token", "value": "{{token}}", "type": "string" }]
//   }
// };

// // Helper function to create example response
// const createResponse = (name, code, body, description = "") => ({
//   name,
//   originalRequest: { method: "GET", header: [], url: { raw: "{{baseUrl}}/", host: ["{{baseUrl}}"], path: [""] } },
//   status: code === 200 ? "OK" : code === 201 ? "Created" : code === 400 ? "Bad Request" : code === 401 ? "Unauthorized" : "Not Found",
//   code,
//   "_postman_previewlanguage": "json",
//   header: [{ "key": "Content-Type", "value": "application/json" }],
//   cookie: [],
//   body: JSON.stringify(body, null, 2)
// });

// // Authentication endpoints
// const authEndpoints = {
//   name: "Authentication",
//   description: "Authentication and authorization endpoints",
//   item: [
//     {
//       name: "Register",
//       request: {
//         method: "POST",
//         header: [{ key: "Content-Type", value: "application/json" }],
//         body: {
//           mode: "raw",
//           raw: JSON.stringify({ email: "user@example.com", password: "SecurePass123!", name: "John Doe", nim: "11200001" }, null, 2),
//           options: { raw: { language: "json" } }
//         },
//         url: { raw: "{{baseUrl}}/auth/register", host: ["{{baseUrl}}"], path: ["auth", "register"] },
//         description: "Register a new user account"
//       },
//       response: [
//         createResponse("Success", 201, { status: 201, code: "CREATED", message: "User registered successfully", data: { id: "user-uuid", email: "user@example.com", name: "John Doe", token: "jwt-token-here" } }),
//         createResponse("Validation Error", 400, { status: 400, code: "BAD_REQUEST", message: "Validation error", errors: [{ field: "email", message: "Email is required" }] })
//       ]
//     },
//     {
//       name: "Login",
//       event: [{ listen: "test", script: { exec: ["if (pm.response.code === 200) {", "  const res = pm.response.json();", "  if (res.data && res.data.token) pm.collectionVariables.set('token', res.data.token);", "}"], type: "text/javascript" }}],
//       request: {
//         method: "POST",
//         header: [{ key: "Content-Type", value: "application/json" }],
//         body: {
//           mode: "raw",
//           raw: JSON.stringify({ email: "user@example.com", password: "SecurePass123!" }, null, 2),
//           options: { raw: { language: "json" } }
//         },
//         url: { raw: "{{baseUrl}}/auth/login", host: ["{{baseUrl}}"], path: ["auth", "login"] }
//       },
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "Login successful", data: { user: { id: "user-uuid", email: "user@example.com", name: "John Doe", role: "USER" }, token: "jwt-token", refreshToken: "refresh-token" }})]
//     },
//     {
//       name: "Admin Login",
//       request: { method: "POST", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ email: "admin@himti.com", password: "Admin123!" }, null, 2) }, url: { raw: "{{baseUrl}}/auth/admin/login", host: ["{{baseUrl}}"], path: ["auth", "admin", "login"] }},
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "Admin login successful", data: { user: { id: "admin-uuid", email: "admin@himti.com", role: "SUPER_ADMIN" }, token: "jwt-token" }})]
//     },
//     {
//       name: "Request OTP",
//       request: { method: "POST", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ email: "user@example.com" }, null, 2) }, url: { raw: "{{baseUrl}}/auth/otp", host: ["{{baseUrl}}"], path: ["auth", "otp"] }},
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "OTP sent successfully", data: { email: "user@example.com", expiresIn: 300 }})]
//     },
//     {
//       name: "Validate OTP",
//       request: { method: "POST", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ email: "user@example.com", otp: "123456" }, null, 2) }, url: { raw: "{{baseUrl}}/auth/otp/validate", host: ["{{baseUrl}}"], path: ["auth", "otp", "validate"] }},
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "OTP validated", data: { verified: true }}), createResponse("Invalid OTP", 400, { status: 400, code: "BAD_REQUEST", message: "Invalid or expired OTP" })]
//     },
//     {
//       name: "Forgot Password",
//       request: { method: "PUT", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ email: "user@example.com", newPassword: "NewPass123!", otp: "123456" }, null, 2) }, url: { raw: "{{baseUrl}}/auth/forgot-password", host: ["{{baseUrl}}"], path: ["auth", "forgot-password"] }},
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "Password reset successfully" })]
//     },
//     {
//       name: "Login with Biometric",
//       request: { method: "POST", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ encryptedData: "encrypted-biometric-data" }, null, 2) }, url: { raw: "{{baseUrl}}/auth/biometric", host: ["{{baseUrl}}"], path: ["auth", "biometric"] }},
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "Biometric login successful", data: { user: {}, token: "jwt-token" }})]
//     },
//     {
//       name: "Logout",
//       request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{token}}" }], url: { raw: "{{baseUrl}}/auth/logout", host: ["{{baseUrl}}"], path: ["auth", "logout"] }},
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "Logout successful" })]
//     },
//     {
//       name: "Check Token",
//       request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{token}}" }], url: { raw: "{{baseUrl}}/auth/token", host: ["{{baseUrl}}"], path: ["auth", "token"] }},
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "Token is valid", data: { userId: "user-uuid", role: "USER" }})]
//     },
//     {
//       name: "Refresh Token",
//       request: { method: "POST", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ refreshToken: "refresh-token-here" }, null, 2) }, url: { raw: "{{baseUrl}}/auth/refresh-token", host: ["{{baseUrl}}"], path: ["auth", "refresh-token"] }},
//       response: [createResponse("Success", 200, { status: 200, code: "SUCCESS", message: "Token refreshed", data: { token: "new-jwt-token", refreshToken: "new-refresh-token" }})]
//     }
//   ]
// };

// console.log(JSON.stringify({ ...collection, item: [authEndpoints] }, null, 2));
