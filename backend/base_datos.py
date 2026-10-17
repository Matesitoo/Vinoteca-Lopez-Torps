import json
import os
import sqlite3
from pathlib import Path

from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

CARPETA = Path(__file__).resolve().parent
load_dotenv(CARPETA / '.env')
RUTA_DB = Path(os.getenv('DB_PATH', CARPETA / 'data' / 'vinoteca.db'))


def conectar_base():
    url = os.getenv('DATABASE_URL')
    if url:
        # Supabase: conexión desde nuestro servidor, nunca desde la app.
        return psycopg.connect(
            url,
            row_factory=dict_row,
            prepare_threshold=None,
            sslmode='require',
            connect_timeout=10,
        )
    if os.getenv('VERCEL'):
        raise RuntimeError('Falta configurar DATABASE_URL en Vercel.')

    # SQLite permite practicar localmente sin depender de internet.
    RUTA_DB.parent.mkdir(parents=True, exist_ok=True)
    conexion = sqlite3.connect(RUTA_DB, timeout=15)
    conexion.row_factory = sqlite3.Row
    return conexion


def consultar(conexion, sql, parametros=()):
    # SQLite usa ?, mientras que PostgreSQL usa %s para los parámetros.
    if not isinstance(conexion, sqlite3.Connection):
        sql = sql.replace('?', '%s')
    return conexion.execute(sql, parametros)


def iniciar_transaccion(conexion):
    if isinstance(conexion, sqlite3.Connection):
        conexion.execute('BEGIN IMMEDIATE')
    else:
        conexion.execute('BEGIN')


def buscar_para_compra(conexion, id):
    sql = 'SELECT * FROM productos WHERE id = ?'
    if not isinstance(conexion, sqlite3.Connection):
        # Bloquea la fila hasta terminar el pago para no vender el mismo stock.
        sql += ' FOR UPDATE'
    return consultar(conexion, sql, (id,)).fetchone()


def iniciar_base():
    # En Supabase las tablas y los 20 vinos se cargan con database/supabase.sql.
    # No ejecutamos migraciones ni modificamos el catálogo al recibir solicitudes.
    if os.getenv('DATABASE_URL') or os.getenv('VERCEL'):
        return
    conexion = conectar_base()
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
            conexion.execute(
                'INSERT OR IGNORE INTO productos VALUES (?, ?, ?, ?, ?, ?, ?)',
                (
                    producto['id'], producto['nombre'], producto['descripcion'],
                    producto['precio'], producto['imagen'], producto['categoria'], producto['stock'],
                ),
            )
        conexion.commit()
    finally:
        conexion.close()


def producto_json(fila):
    producto = dict(fila)
    # Guardamos centavos enteros en la base, pero la app recibe pesos.
    producto['precio'] = producto['precio'] / 100
    return producto
