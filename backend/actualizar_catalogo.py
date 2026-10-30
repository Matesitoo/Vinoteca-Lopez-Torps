"""Actualizar datos comerciales sin modificar stock ni pedidos existentes."""
import json
from backend.base_datos import CARPETA, conectar_base, consultar, iniciar_base


def actualizar_catalogo():
    productos = json.loads((CARPETA.parent / 'database' / 'seed.json').read_text())
    iniciar_base()
    conexion = conectar_base()
    try:
        for producto in productos:
            consultar(
                conexion,
                '''INSERT INTO productos (id, nombre, descripcion, precio, imagen, categoria, stock)
                   VALUES (?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT (id) DO UPDATE SET
                     nombre = excluded.nombre, descripcion = excluded.descripcion,
                     precio = excluded.precio, imagen = excluded.imagen,
                     categoria = excluded.categoria''',
                tuple(producto[campo] for campo in (
                    'id', 'nombre', 'descripcion', 'precio', 'imagen', 'categoria', 'stock'
                )),
            )
        conexion.commit()
    except Exception:
        conexion.rollback()
        raise
    finally:
        conexion.close()


if __name__ == '__main__':
    actualizar_catalogo()
    print('Catálogo actualizado. Stock existente y órdenes conservados.')
