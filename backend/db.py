import json
import os
import sqlite3
from pathlib import Path

CARPETA = Path(__file__).resolve().parent
RUTA_DB = Path(os.getenv('DB_PATH', CARPETA / 'data' / 'vinoteca.db'))


def get_connection():
    RUTA_DB.parent.mkdir(parents=True, exist_ok=True)
    conexion = sqlite3.connect(RUTA_DB, timeout=15)
    conexion.row_factory = sqlite3.Row
    return conexion


def iniciar_base():
    conexion = get_connection()
    try:
        conexion.execute('''
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                descripcion TEXT NOT NULL,
                precio INTEGER NOT NULL,
                imagen TEXT NOT NULL,
                categoria TEXT NOT NULL,
                stock INTEGER NOT NULL CHECK (stock >= 0)
            )
        ''')
        conexion.execute('''
            CREATE TABLE IF NOT EXISTS ordenes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha TEXT NOT NULL,
                comprador TEXT NOT NULL,
                total INTEGER NOT NULL,
                items TEXT NOT NULL
            )
        ''')
        productos = json.loads((CARPETA.parent / 'database' / 'seed.json').read_text())
        for producto in productos:
            # No sobrescribimos el stock al reiniciar el servidor.
            conexion.execute(
                'INSERT OR IGNORE INTO productos VALUES (?, ?, ?, ?, ?, ?, ?)',
                (producto['id'], producto['nombre'], producto['descripcion'],
                 producto['precio'], producto['imagen'], producto['categoria'], producto['stock'])
            )
        conexion.commit()
    finally:
        conexion.close()


def producto_json(fila):
    producto = dict(fila)
    # Guardamos centavos enteros en la base, pero la app recibe pesos.
    producto['precio'] = producto['precio'] / 100
    return producto
