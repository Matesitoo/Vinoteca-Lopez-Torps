import json
import os
import tempfile
import unittest
from pathlib import Path

# Todas las pruebas usan una base temporal, separada del catálogo de la app.
carpeta = tempfile.TemporaryDirectory()
os.environ['DB_PATH'] = str(Path(carpeta.name) / 'pruebas.db')
os.environ['DATABASE_URL'] = ''
os.environ.pop('VERCEL', None)
from fastapi.testclient import TestClient
from backend.main import app
from backend.base_datos import conectar_base, iniciar_base


class PruebasTienda(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cliente = TestClient(app)

    def setUp(self):
        conexion = conectar_base()
        conexion.execute('DELETE FROM ordenes')
        conexion.execute('UPDATE productos SET stock = 10')
        conexion.commit()
        conexion.close()
        self.producto = self.cliente.get('/productos/1').json()
        self.pedido = {
            'comprador': {'nombre': 'Ana Prueba', 'direccion': 'Calle Ficticia 123', 'metodo': 'tarjeta', 'referencia': 'TEST-1234'},
            'items': [{'id': 1, 'cantidad': 2}],
            'total': self.producto['precio'] * 2,
        }

    def test_rutas_de_produccion(self):
        self.assertEqual(self.cliente.get('/api/productos').json(), self.cliente.get('/productos').json())
        self.assertEqual(self.cliente.get('/api/productos/1').status_code, 200)
        self.assertEqual(self.cliente.get('/api/docs').status_code, 200)
        self.assertEqual(self.cliente.post('/api/checkout', json=self.pedido).status_code, 201)

    def test_catalogo_y_detalle(self):
        productos = self.cliente.get('/productos').json()
        self.assertEqual(len(productos), 20)
        self.assertEqual(productos[0]['categoria'], 'Tintos')
        self.assertEqual(self.cliente.get('/productos/999').status_code, 404)

    def test_compra_guarda_orden_y_desconta_stock(self):
        respuesta = self.cliente.post('/checkout', json=self.pedido)
        self.assertEqual(respuesta.status_code, 201)
        orden = respuesta.json()
        self.assertEqual(orden['estado'], 'aprobado_simulado')
        self.assertEqual(self.cliente.get('/productos/1').json()['stock'], 8)
        conexion = conectar_base()
        guardada = conexion.execute('SELECT * FROM ordenes WHERE id = ?', (orden['id'],)).fetchone()
        self.assertEqual(json.loads(guardada['comprador'])['nombre'], 'Ana Prueba')
        conexion.close()

    def test_rechaza_total_incorrecto(self):
        self.pedido['total'] = 1
        self.assertEqual(self.cliente.post('/checkout', json=self.pedido).status_code, 409)
        self.assertEqual(self.cliente.get('/productos/1').json()['stock'], 10)

    def test_rechaza_stock_insuficiente_y_duplicados(self):
        self.pedido['items'] = [{'id': 1, 'cantidad': 6}, {'id': 1, 'cantidad': 6}]
        self.pedido['total'] = self.producto['precio'] * 12
        self.assertEqual(self.cliente.post('/checkout', json=self.pedido).status_code, 409)

    def test_rechaza_campos_y_cantidades_invalidas(self):
        for cantidad in [0, -1, 1.5, True]:
            self.pedido['items'] = [{'id': 1, 'cantidad': cantidad}]
            self.assertEqual(self.cliente.post('/checkout', json=self.pedido).status_code, 422)
        self.pedido['items'] = []
        self.assertEqual(self.cliente.post('/checkout', json=self.pedido).status_code, 422)
        self.pedido['items'] = [{'id': 1, 'cantidad': 1}]
        self.pedido['comprador']['nombre'] = '   '
        self.assertEqual(self.cliente.post('/checkout', json=self.pedido).status_code, 400)

    def test_error_no_deja_un_pedido_parcial(self):
        self.pedido['items'].append({'id': 999, 'cantidad': 1})
        self.assertEqual(self.cliente.post('/checkout', json=self.pedido).status_code, 404)
        self.assertEqual(self.cliente.get('/productos/1').json()['stock'], 10)
        conexion = conectar_base()
        self.assertEqual(conexion.execute('SELECT COUNT(*) FROM ordenes').fetchone()[0], 0)
        conexion.close()

    def test_reiniciar_no_restablece_stock(self):
        self.cliente.post('/checkout', json=self.pedido)
        iniciar_base()
        self.assertEqual(self.cliente.get('/productos/1').json()['stock'], 8)


if __name__ == '__main__':
    unittest.main()
