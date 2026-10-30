-- Ejecutar en SQL Editor de Supabase para crear o actualizar el catálogo.
-- Conserva pedidos y stock existente. Los precios son de demostración.
-- Nuestra API accede con DATABASE_URL; la app no usa claves de Supabase.
BEGIN;
CREATE TABLE IF NOT EXISTS public.productos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio BIGINT NOT NULL CHECK (precio > 0),
  imagen TEXT NOT NULL,
  categoria TEXT NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);
CREATE TABLE IF NOT EXISTS public.ordenes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha TIMESTAMPTZ NOT NULL,
  comprador TEXT NOT NULL,
  total BIGINT NOT NULL CHECK (total > 0),
  items TEXT NOT NULL
);
-- Sin políticas públicas: solo nuestra API puede operar estas tablas.
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.productos, public.ordenes FROM anon, authenticated;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (1, 'Uvita Tinto', 'Vino argentino. Tetra Brik de 1 litro. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 180000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 11)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (2, 'Termidor Tinto', 'Vino argentino. Tetra Brik de 1 litro. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 170000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 12)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (3, 'Toro Tinto', 'Vino argentino. Tetra Brik de 1 litro. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 190000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 13)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (4, 'Santa Julia Malbec', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 650000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 14)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (5, 'Santa Julia Cabernet Sauvignon', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 650000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 15)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (6, 'Don Valentín Lacrado Tinto', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 420000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 16)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (7, 'Uvita Blanco', 'Vino argentino. Tetra Brik de 1 litro. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 180000, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80', 'Blancos', 17)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (8, 'Termidor Blanco', 'Vino argentino. Tetra Brik de 1 litro. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 170000, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80', 'Blancos', 18)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (9, 'Toro Blanco', 'Vino argentino. Tetra Brik de 1 litro. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 190000, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80', 'Blancos', 19)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (10, 'Santa Julia Chardonnay', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 650000, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80', 'Blancos', 20)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (11, 'López Rosado', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 450000, 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=900&q=80', 'Rosados', 21)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (12, 'Santa Julia Syrah Rosé', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 650000, 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=900&q=80', 'Rosados', 22)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (13, 'Norton Rosado', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 500000, 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=900&q=80', 'Rosados', 23)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (14, 'Trapiche Malbec', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 550000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 24)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (15, 'Finca Las Moras Malbec', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 450000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 10)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (16, 'Alma Mora Malbec', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 600000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 11)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (17, 'Santa Julia Chenin Dulce Natural', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 700000, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80', 'Dulces', 12)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (18, 'Cosecha Tardía Norton Blanco', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 500000, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80', 'Dulces', 13)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (19, 'Colón Malbec', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 350000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 14)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
INSERT INTO public.productos (id, nombre, descripcion, precio, imagen, categoria, stock)
VALUES (20, 'San Felipe Tinto', 'Vino argentino. Botella de 750 ml. Imagen ilustrativa: no representa el envase de la marca. Precio de demostración para una compra simulada.', 450000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80', 'Tintos', 15)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio, imagen = EXCLUDED.imagen, categoria = EXCLUDED.categoria;
CREATE TABLE IF NOT EXISTS public.compras_confirmadas (
  clave TEXT PRIMARY KEY,
  huella TEXT NOT NULL,
  respuesta TEXT NOT NULL
);
ALTER TABLE public.compras_confirmadas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.compras_confirmadas FROM anon, authenticated;
COMMIT;
