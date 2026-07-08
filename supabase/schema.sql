-- =============================================
-- APP DE ASISTENCIA — Esquema Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================

-- Tabla de cursos
create table if not exists cursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz default now()
);

-- Tabla de estudiantes
create table if not exists estudiantes (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references cursos(id) on delete cascade,
  nombre text not null,
  apellido text not null default '',
  created_at timestamptz default now()
);

-- Tabla de asistencia (un registro por estudiante por fecha)
create table if not exists asistencia (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  fecha date not null,
  estado text not null check (estado in ('presente', 'ausente')),
  created_at timestamptz default now(),
  unique (estudiante_id, fecha)
);

-- Índices para consultas rápidas
create index if not exists idx_estudiantes_curso on estudiantes(curso_id);
create index if not exists idx_asistencia_estudiante on asistencia(estudiante_id);
create index if not exists idx_asistencia_fecha on asistencia(fecha);

-- =============================================
-- RLS: por ahora acceso abierto con la anon key.
-- Cuando agregues login de profesor, reemplaza
-- estas políticas por unas basadas en auth.uid().
-- =============================================
alter table cursos enable row level security;
alter table estudiantes enable row level security;
alter table asistencia enable row level security;

create policy "acceso_abierto_cursos" on cursos
  for all using (true) with check (true);

create policy "acceso_abierto_estudiantes" on estudiantes
  for all using (true) with check (true);

create policy "acceso_abierto_asistencia" on asistencia
  for all using (true) with check (true);
