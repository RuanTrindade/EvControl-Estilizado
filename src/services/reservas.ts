import api from "./api";

export interface Reserva {
  id?: number;
  clienteId: number;
  data: string;
  valor: number;
}

export const getReservas = () => api.get<Reserva[]>("/reservas");
export const createReserva = (reserva: Reserva) => api.post("/reservas", reserva);
export const updateReserva = (id: number, reserva: Reserva) => api.put(`/reservas/${id}`, reserva);
export const deleteReserva = (id: number) => api.delete(`/reservas/${id}`);
