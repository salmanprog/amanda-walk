# Amanda Walk – Architecture & Structure

This document describes the project’s architecture and conventions so changes stay consistent with the codebase.

---

## 1. Stack & tooling

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Prisma (MySQL) – models in `prisma/schema.prisma`
- **Auth:** JWT (Bearer token in `Authorization` header); token stored in `localStorage` / `sessionStorage`
- **Validation:** Yup schemas in `src/validators/` (e.g. `user.validation.ts`)

---

## 2. App directory structure (`app/`)

| Path | Purpose |
|------|--------|
| `app/layout.tsx` | Root layout: ThemeProvider, SidebarProvider |
| `app/(frontend)/` | Public/customer-facing pages (account, pets, booking, blog, etc.). Layout: Header, Tabs (when logged in), Footer. Uses `useCurrentUser` and often `useAuthGuard`. |
| `app/admin/` | Admin panel. Layout: Sidebar, AppHeader. Auth UI under `app/admin/@auth/` (e.g. login). |
| `app/api/` | API routes. Subpaths: `api/admin/*` (admin APIs), `api/users/*` (user-facing APIs, e.g. booking, pet, profile, currentuser). |

Route groups like `(frontend)` and `(admin)` only affect layout and URL grouping; they don’t add path segments.

---

## 3. Backend pattern (API → DB)

Flow: **API Route → Controller → Hook (query) → Prisma → Resource (transform) → JSON response**.

### 3.1 API routes (`app/api/`)

- **File naming:** `route.tsx` or `route.ts`; dynamic segments e.g. `[id]/route.tsx`, `[slug]/route.tsx`.
- **Responsibilities:** Parse request, verify JWT when required (`verifyToken` from `@/utils/jwt`), optionally inject user into controller (e.g. `{ id: user.id }`), call controller method (`index`, `show`, `store`, `update`, `destroy`), return `NextResponse`.
- **Response shape:** `{ code, message, data }`. `data` is transformed by the **Resource** (see below).
- **Auth:** User-facing routes (e.g. `api/users/booking`) often decode the token in the route and pass user id into the controller; they do not rely on `x-current-user` for that.

### 3.2 Controllers (`src/controllers/`)

- **Base:** `RestController` in `src/core/RestController.ts` extends `Controller` (`src/core/Controller.ts`).
- **Constructor:** Receives Prisma model (e.g. `prisma.booking`), optional `Request`, optional `data`. Sets `this.resource` and `this.hook`.
- **CRUD:** `index()`, `show(id)`, `showSlug(slug)`, `store(data)`, `update(id, data)`, `updateBySlug(slug, data)`, `destroy(id)`, `destroyBySlug(slug)`.
- **Hooks (lifecycle):** `beforeIndex` / `afterIndex`, `beforeShow` / `afterShow`, `beforeStore` / `afterStore`, `beforeUpdate` / `afterUpdate`, `beforeDestroy` / `afterDestroy`. Used for auth checks, mutating `this.data`, or creating related records (e.g. booking schedules in `afterStore`).
- **Query hooks:** Controller calls `getQueryHook("index", query, requestData)` or `getQueryHook("show", ...)`. The **Hook** (see below) returns the Prisma query (`where`, `include`, `orderBy`, etc.). `index` uses `findMany(query)`, `show` uses `findUnique(query)`.
- **Response:** After fetching, controller calls `this.__sendResponse(status, message, data)`. `RestController.__sendResponse` runs the **Resource**’s `collection(records)` or `toArray(record)` and returns `NextResponse.json({ code, message, data: transformedData })`.
- **User context:** `getCurrentUser()` / `requireUser()` read from `this.__request` headers (`x-current-user`). For API routes that don’t go through middleware that set this, the route often passes user context via constructor `data` (e.g. `new AdminBookingController(req, { id: user.id })`).

### 3.3 Hooks (`src/hooks/`)

- **Query hooks:** Static methods `indexQueryHook(query, request?)`, `showQueryHook(query, request?)`, `beforeCreateHook(query, request?)`. They receive and return a Prisma query object.
- **Responsibilities:** Set `where`, `include`, `orderBy`, `select`. E.g. filter by `deletedAt: null`, include relations (`user`, `category`, `service`, `schedules` with nested `employee`, `pet`), restrict to current user when needed. `getHookUser(request)` in `@/utils/hookUser` parses `request.headers["x-current-user"]` when available.
- **Naming:** Domain-specific, e.g. `AdminBookingHook`, `AdminPetTypeHook`.

### 3.4 Resources (`src/resources/`)

- **Base:** `BaseResource<T>` in `src/resources/BaseResource.ts`: `toArray(record)`, `collection(records)` (maps each with `toArray`).
- **Responsibilities:** Transform raw Prisma/entity records into the API payload: flatten relations (e.g. `user` → `userName`, `userEmail`), format dates, add computed fields (e.g. `employeeName`, `petName` on each schedule). Extended types (e.g. `ExtendedBooking`) are often defined in the same resource file and describe the shape **before** transformation (including relations).
- **Naming:** E.g. `AdminBookingResource`, `AdminPetResource`. Used by the controller via `this.resource`; instantiated inside `__sendResponse` to transform `data` before sending.

### 3.5 Validators (`src/validators/`)

- Yup schemas for request body (e.g. `storeBooking`, `updateBooking` in `user.validation.ts`). Controllers call `this.__validate(schema, this.data)` in their `validation(action)`.

---

## 4. Frontend patterns

### 4.1 Data fetching

- **useApi** (`src/utils/useApi.ts`): Options include `url`, `method`, `type: "mount" | "manual"`, `requiresAuth`. Returns `{ data, loading, error, fetchApi, sendData, updateParams, queryParams }`. On success, `data` is set from `response.data` (or full response). Auth: sends `Authorization: Bearer <token>` from `localStorage`/`sessionStorage`. On 401/403, can redirect to `/admin/login`.
- **useCurrentUser** (`src/utils/currentUser.tsx`): Fetches `/api/currentuser` (manual), caches user in memory for 5 minutes. Returns `{ user, loadingUser, errorUser }`. Used in frontend layout and account pages.
- **useAuthGuard** (`src/hooks/useAuthGuard.ts`): Can redirect unauthenticated users (e.g. from frontend pages that require login).

### 4.2 Imports and components

- **Alias:** `@/` points to `src/` (and sometimes app-level code). API routes import from `@/controllers`, `@/resources`, `@/utils/jwt`, `@/validators`, etc.
- **UI:** `@/components/ui/` (Button, Badge, Table, Input, etc.), `@/components/form/` (Input, Label, Form), `@/components/common/` (Header, Footer, InnerBanner). Shared layout: `@/layout/` (AppSidebar, AppHeader). Tabs: `@/components/tabs`.

### 4.3 Pages

- **Frontend:** Under `app/(frontend)/`. Typically client components (`"use client"`), use `useApi` for GET/POST/PATCH, local state for forms and modals. Types for API responses often defined inline (e.g. `BookingItem`) or in `src/types/` (e.g. `booking.ts`) when shared.
- **Admin:** Under `app/admin/`. Same useApi/state patterns; tables and forms wired to `api/admin/*` or `api/users/*` as appropriate.

---

## 5. Auth flow (summary)

- **Login:** Token stored in `localStorage` and/or `sessionStorage`; cookie may also be set.
- **Requests:** Frontend sends `Authorization: Bearer <token>` for protected APIs. `useApi` with `requiresAuth: true` does this.
- **API:** Routes that need the current user call `verifyToken(token)` and optionally pass user id (or full user) into the controller. Middleware (`src/middleware/jwtMiddleware.ts`) can set `x-current-user` on the **response** for page requests; API request context often comes from the route, not from that header.
- **Current user endpoint:** `GET /api/currentuser` returns the logged-in user; used by `useCurrentUser`.

---

## 6. Conventions to follow

- **Naming:** Admin-facing controllers/resources/hooks use an `Admin*` prefix when they serve admin or shared APIs (e.g. `AdminBookingController`, `AdminBookingResource`, `AdminBookingHook`). User-facing APIs still use these if they share the same backend (e.g. `GET /api/users/booking` uses `AdminBookingController` + hook + resource).
- **Soft delete:** Many models use `deletedAt`. Hooks add `where: { deletedAt: null }`; destroy often does a soft delete (`update(..., { deletedAt: new Date() })`).
- **Errors:** Controllers use `this.sendError(message, errors, status)`. API responses always `{ code, message, data }`.
- **Clean code:** Prefer readable names, DRY, small functions. Comment non-obvious logic. Use existing patterns (hook for query, resource for output shape) instead of ad-hoc logic in controllers or routes.

---

## 7. Where things live (quick reference)

| Concern | Location |
|--------|----------|
| API route (method handlers) | `app/api/**/route.tsx` or `route.ts` |
| Controller (CRUD + lifecycle) | `src/controllers/*.ts` |
| Query building (Prisma where/include) | `src/hooks/*Hook.ts` |
| Response shape (toArray/collection) | `src/resources/*Resource.ts` |
| Request validation (Yup) | `src/validators/*.ts` |
| Shared types | `src/types/*.ts` or next to resource |
| Frontend pages | `app/(frontend)/*` or `app/admin/*` |
| Shared UI / form components | `src/components/**` |
| API client & auth helpers | `src/utils/useApi.ts`, `currentUser.tsx`, `useAuthGuard.ts` |
| DB client | `src/lib/prisma.ts` |
| Core base classes | `src/core/Controller.ts`, `RestController.ts` |

This architecture is what you should read and follow when adding or changing features (e.g. new fields in booking details, new API endpoints, or new pages).
