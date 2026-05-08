# Pet Fashion · Sistema de Gestión

App de gestión para Pet Fashion Dog Salon — citas, perros, finanzas del negocio y del hogar.

---

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Realtime + Auth)
- **Deploy:** Vercel (gratis)

---

## Instalación paso a paso

### 1. Crea el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New project**
2. Pon el nombre `petfashion`, elige una contraseña fuerte para la DB, región `South America (São Paulo)` o similar
3. Espera que se cree (1–2 min)

### 2. Crea las tablas

1. En tu proyecto Supabase → **SQL Editor**
2. Pega todo el contenido de `supabase/schema.sql`
3. Click **Run** — debe decir "Success"

### 3. Crea las cuentas de usuario

1. En Supabase → **Authentication → Users**
2. Click **Invite user** o **Add user** manualmente:
   - `elizabethdemartinezf@gmail.com`
   - `ricardomartinezvet@gmail.com`
3. Cada uno recibirá un email para crear su contraseña
   - Si no llega, puedes hacer clic en los 3 puntos del usuario → **Send magic link** o establecer contraseña manualmente

> **Opcional:** Para que SOLO estas dos cuentas puedan usar la app, ve a Authentication → Settings y **desactiva** "Enable email confirmations" y **desactiva** "Allow new users to sign up" (cambia a false). Así nadie más puede registrarse.

### 4. Obtén las credenciales

En Supabase → **Settings → API**:
- `Project URL` → cópiala
- `anon / public key` → cópiala

### 5. Configura variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

### 6. Instala y ejecuta localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

1. Sube el proyecto a GitHub (repositorio privado)
2. Ve a [vercel.com](https://vercel.com) → **New Project** → importa el repo
3. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

---

## Instalar como app en el celular (PWA)

**iPhone (iOS 16.4+):**
1. Abre la URL de tu app en Safari
2. Toca el ícono de compartir
3. "Agregar a pantalla de inicio"
4. Ya funciona como app nativa

**Android:**
1. Abre la URL en Chrome
2. Toca el menú (3 puntos) → "Agregar a pantalla de inicio" o "Instalar app"

---

## Migrar datos desde la app anterior

1. En la app antigua, ve a **Más → Exportar a CSV**
2. Guarda el archivo
3. Los datos se pueden importar manualmente o escribirnos para hacer el import automatizado

---

## Realtime — cómo funciona

Cuando un usuario crea, edita o elimina cualquier registro, el otro usuario ve el cambio **inmediatamente** sin recargar la página. Esto funciona gracias a Supabase Realtime (WebSockets). Solo necesitan estar conectados a internet.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── login/          Login
│   └── (app)/
│       ├── hoy/        Vista de hoy + acciones rápidas
│       ├── agenda/     Calendario día/mes
│       ├── perros/     Directorio de perros
│       ├── finanzas/   Negocio (ingresos/egresos) + Hogar (gastos)
│       └── mas/        Precios, mensajes WhatsApp, configuración
├── components/
│   ├── AppProvider.tsx Contexto global + Realtime
│   ├── appointments/
│   ├── dogs/
│   ├── finances/
│   ├── layout/
│   └── ui/
└── lib/
    ├── supabase/       Clientes browser + server
    ├── types.ts
    ├── utils.ts
    └── constants.ts
```
