# Cross-Tenant Isolation Penetration Test — Report

Run at: 2026-05-28T03:00:47.779Z
Gateway: http://localhost:4000/api
Tenant A: 4fb9a661-a09a-4d9e-aa6c-1806ecca3670
Tenant B: 13007de2-fb73-492d-a169-f7d2b7545ce1

## Summary

- **Total checks**: 10
- **Passed**: 10
- **Failed**: 0

✅ **All isolation assertions passed.** Tenant A cannot read or modify Tenant B's data via any tested vector.

## Detailed results

| # | Check | Result |
|---|---|---|
| 1 | GET /requisitions/<B's req id> as A | ✅ PASS |
| 2 | GET /requisitions list does not contain B's req | ✅ PASS |
| 3 | GET /candidates/<B's candidate id> as A | ✅ PASS |
| 4 | Spoofed X-Tenant-Id is ignored (gateway derives from JWT) | ✅ PASS |
| 5 | GET /branding returns ONLY caller's own tenant | ✅ PASS |
| 6 | PATCH /super-admin/tenants/<B's id> as A (non-super-admin) | ✅ PASS |
| 7 | GET /super-admin/platform/agents as A (non-super-admin) | ✅ PASS |
| 8 | GET /notifications excludes B's tenant rows | ✅ PASS |
| 9 | GET /branding without JWT | ✅ PASS |
| 10 | DELETE /requisitions/<B's req id> as A | ✅ PASS |

## Per-check attempts

### ✅ GET /requisitions/<B's req id> as A

- **Attempt**: Use Tenant A's JWT to read Tenant B's requisition (id=12d46146…)
- **Expected**: 404 (not found in A's scope)
- **Actual**: `404 {"success":false,"error":{"code":"NOT_FOUND","message":"Requisition not found"}}`

### ✅ GET /requisitions list does not contain B's req

- **Attempt**: List requisitions as A — verify B's req absent
- **Expected**: B's req id NOT in response
- **Actual**: `200 {"count":1,"containsBId":false}`

### ✅ GET /candidates/<B's candidate id> as A

- **Attempt**: Read Tenant B's candidate (id=ab1a8f88…)
- **Expected**: 404
- **Actual**: `404 {"success":false,"error":{"code":"NOT_FOUND","message":"Candidate not found"}}`

### ✅ Spoofed X-Tenant-Id is ignored (gateway derives from JWT)

- **Attempt**: Send X-Tenant-Id: 13007de2… with A's JWT
- **Expected**: Response only contains A's resources
- **Actual**: `200 {"count":1,"containsBId":false}`

### ✅ GET /branding returns ONLY caller's own tenant

- **Attempt**: Auth'd branding read as A — must not return B's website
- **Expected**: tenantId == A.tenantId; website != B's
- **Actual**: `200 {"id":"4fb9a661-a09a-4d9e-aa6c-1806ecca3670","website":null}`

### ✅ PATCH /super-admin/tenants/<B's id> as A (non-super-admin)

- **Attempt**: Tenant-admin token tries super-admin tenant update
- **Expected**: 403 (SUPER_ADMIN required)
- **Actual**: `403 {"success":false,"error":{"code":"FORBIDDEN","message":"SUPER_ADMIN role required"}}`

### ✅ GET /super-admin/platform/agents as A (non-super-admin)

- **Attempt**: Read platform agent kill switches as a regular tenant admin
- **Expected**: 403
- **Actual**: `403 {"success":false,"error":{"code":"FORBIDDEN","message":"SUPER_ADMIN role required"}}`

### ✅ GET /notifications excludes B's tenant rows

- **Attempt**: List notifications as A — verify none belong to tenant B
- **Expected**: No row with tenantId == B.tenantId
- **Actual**: `200 {"count":0,"leakedFromB":false}`

### ✅ GET /branding without JWT

- **Attempt**: Hit the protected endpoint with no Authorization header
- **Expected**: 401
- **Actual**: `401 {"success":false,"error":{"code":"UNAUTHORIZED","message":"Authentication required"}}`

### ✅ DELETE /requisitions/<B's req id> as A

- **Attempt**: Attempt to destroy Tenant B's data
- **Expected**: 404 or 403 or 405 (NOT 200/204)
- **Actual**: `404 {"success":false,"error":{"code":"ROUTE_NOT_FOUND","message":"No route matches DELETE /internal/requisitions/12d46146-3873-46c8-89f6-3fc54b564d46"}}`
