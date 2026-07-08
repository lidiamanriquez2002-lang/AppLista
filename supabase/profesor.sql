-- =============================================
-- NUEVA TABLA: datos del profesor
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================
create table if not exists profesor (
  id uuid primary key default gen_random_uuid(),
  nombre text not null default '',
  correo text default '',
  asignatura text default '',
  establecimiento text default '',
  telefono text default '',
  updated_at timestamptz default now()
);

alter table profesor enable row level security;

create policy "acceso_abierto_profesor" on profesor
  for all using (true) with check (true);
