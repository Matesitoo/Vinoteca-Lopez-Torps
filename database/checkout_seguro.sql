-- Agrega la protección de reintentos sin modificar productos ni órdenes existentes.
BEGIN;
CREATE TABLE IF NOT EXISTS public.compras_confirmadas (
  clave TEXT PRIMARY KEY,
  huella TEXT NOT NULL,
  respuesta TEXT NOT NULL
);
ALTER TABLE public.compras_confirmadas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.compras_confirmadas FROM anon, authenticated;
COMMIT;
