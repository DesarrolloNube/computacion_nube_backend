import api from "./api";

export async function completarCompra() {
  const { data } = await api.post("/pedidos");
  return data;
}
