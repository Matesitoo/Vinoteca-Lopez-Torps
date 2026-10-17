import json
import os
from datetime import datetime, timezone
from typing import List, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from backend.base_datos import (
    conectar_base, iniciar_base, producto_json, consultar,
    iniciar_transaccion, buscar_para_compra,
)

app = FastAPI(title='Vinoteca Lopez & Torps', docs_url='/api/docs', openapi_url='/api/openapi.json')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('CORS_ORIGIN', '*')],
    allow_methods=['GET', 'POST'],
    allow_headers=['Content-Type'],
)
iniciar_base()


# Como en el carrito anterior: estas clases describen el JSON que recibimos.
class Comprador(BaseModel):
    nombre: str = Field(min_length=3, max_length=100)
    direccion: str = Field(min_length=5, max_length=200)
    metodo: Literal['tarjeta', 'transferencia']
    referencia: str = Field(min_length=3, max_length=80)


class ArticuloCarrito(BaseModel):
    id: int = Field(gt=0, strict=True)
    cantidad: int = Field(ge=1, le=99, strict=True)


class Pedido(BaseModel):
    comprador: Comprador
    items: List[ArticuloCarrito] = Field(min_length=1, max_length=100)
    total: float = Field(gt=0, allow_inf_nan=False)


@app.get('/api/health')
@app.get('/health', include_in_schema=False)
def estado():
    return {'status': 'ok'}


@app.get('/api/productos')
@app.get('/productos', include_in_schema=False)
def obtener_productos():
    conexion = conectar_base()
    try:
        filas = consultar(conexion, 'SELECT * FROM productos ORDER BY id').fetchall()
        return [producto_json(fila) for fila in filas]
    finally:
        conexion.close()


@app.get('/api/productos/{id}')
@app.get('/productos/{id}', include_in_schema=False)
def obtener_producto(id: int):
    conexion = conectar_base()
    try:
        fila = consultar(conexion, 'SELECT * FROM productos WHERE id = ?', (id,)).fetchone()
        if fila is None:
            raise HTTPException(status_code=404, detail='No se encontró el vino.')
        return producto_json(fila)
    finally:
        conexion.close()


@app.post('/api/checkout', status_code=201)
@app.post('/checkout', status_code=201, include_in_schema=False)
def confirmar_compra(pedido: Pedido):
    comprador = pedido.comprador
    if (
        len(comprador.nombre.strip()) < 3
        or len(comprador.direccion.strip()) < 5
        or len(comprador.referencia.strip()) < 3
    ):
        raise HTTPException(status_code=400, detail='Completá nombre, dirección y referencia válidos.')

    conexion = conectar_base()
    try:
        # Una transacción guarda orden y stock juntos, o cancela ambos.
        iniciar_transaccion(conexion)
        cantidades = {}
        for articulo in pedido.items:
            cantidades[articulo.id] = cantidades.get(articulo.id, 0) + articulo.cantidad

        total_centavos = 0
        productos_pedido = []
        for id, cantidad in sorted(cantidades.items()):
            fila = buscar_para_compra(conexion, id)
            if fila is None:
                raise HTTPException(status_code=404, detail='Uno de los vinos ya no existe.')
            if cantidad > fila['stock'] or cantidad > 99:
                raise HTTPException(status_code=409, detail=f"Stock insuficiente para {fila['nombre']}.")
            total_centavos += fila['precio'] * cantidad
            productos_pedido.append({
                'id': id, 'nombre': fila['nombre'],
                'cantidad': cantidad, 'precio': fila['precio'] / 100,
            })

        if abs(pedido.total * 100 - total_centavos) > 0.01:
            raise HTTPException(
                status_code=409,
                detail='El precio cambió. Quitá los productos del carrito y volvé a agregarlos desde el catálogo actualizado.',
            )

        fecha = datetime.now(timezone.utc).isoformat()
        datos_comprador = {'nombre': comprador.nombre.strip(), 'direccion': comprador.direccion.strip()}
        cursor = consultar(
            conexion,
            'INSERT INTO ordenes (fecha, comprador, total, items) VALUES (?, ?, ?, ?) RETURNING id',
            (fecha, json.dumps(datos_comprador), total_centavos, json.dumps(productos_pedido)),
        )
        numero_orden = cursor.fetchone()['id']
        for id, cantidad in cantidades.items():
            consultar(conexion, 'UPDATE productos SET stock = stock - ? WHERE id = ?', (cantidad, id))
        conexion.commit()

        return {
            'id': numero_orden, 'fecha': fecha, 'estado': 'aprobado_simulado',
            'comprador': datos_comprador, 'items': productos_pedido, 'total': total_centavos / 100,
        }
    except Exception:
        conexion.rollback()
        raise
    finally:
        conexion.close()
