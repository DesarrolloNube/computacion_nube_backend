import api from "./api";

export async function obtenerCarrito(config = {}) {
  const { data } = await api.get("/carrito/", config);
  return data;
}

export async function agregarItem(idProducto, cantidad = 1) {
  const { data } = await api.post("/carrito/items", {
    id_producto: idProducto,
    cantidad,
  });
  return data;
}

export async function actualizarCantidad(idProducto, cantidad) {
  const { data } = await api.patch(`/carrito/items/${idProducto}`, { cantidad });
  return data;
}

export async function eliminarItem(idProducto) {
  const { data } = await api.delete(`/carrito/items/${idProducto}`);
  return data;
}
