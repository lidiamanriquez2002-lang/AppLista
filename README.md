# 📋 App de Registro de Asistencia

App web (Next.js + Supabase) para pasar lista con tarjetas por estudiante, estadísticas, gestión de cursos y exportación a Excel.

## Páginas

| Ruta | Función |
|---|---|
| `/` | Pasar lista: tarjetas por estudiante con botones Presente/Ausente y aviso al terminar |
| `/estadisticas` | % de asistencia por estudiante e historial detallado |
| `/listas` | Crear/editar/eliminar cursos y estudiantes |
| `/exportar` | Descargar Excel con nómina + matriz de asistencia por fecha |
| `/profesor` | Panel general: estado de las listas de hoy y asistencia por curso |

## Guía de instalación (paso a paso)

### 1. Supabase
1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. En el panel, ve a **SQL Editor** → pega el contenido de `supabase/schema.sql` → **Run**.
3. Ve a **Project Settings → API** y copia la **Project URL** y la **anon public key**.

### 2. Proyecto local
```bash
cd asistencia-app
cp .env.local.example .env.local
# Edita .env.local y pega tu URL y anon key
npm install
npm run dev
```
Abre http://localhost:3000

### 3. GitHub
```bash
git init
git add .
git commit -m "App de asistencia inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/asistencia-app.git
git push -u origin main
```

### 4. Vercel
1. Entra a [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo `asistencia-app`.
2. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy**. Cada `git push` a `main` desplegará automáticamente.

## Notas
- Sin login por ahora: las políticas RLS son abiertas (ver `supabase/schema.sql`). Cuando agregues Supabase Auth, reemplázalas por políticas basadas en `auth.uid()`.
- La fecha de asistencia se guarda en la zona horaria del dispositivo (Chile).
- Excel: hoja **Asistencia** (P/A por fecha, totales y %) + hoja **Estudiantes**.
