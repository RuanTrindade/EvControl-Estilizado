import { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";

interface Reserva {
  id?: number;
  nomeCliente: string;
  dataReserva: string;
  valorCobrado: number;
  observacoes: string;
}

function App() {
  const [nomeBusca, setNomeBusca] = useState("");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [reservasOriginais, setReservasOriginais] = useState<Reserva[]>([]);
  const [form, setForm] = useState<Reserva>({
    nomeCliente: "",
    dataReserva: "",
    valorCobrado: 0,
    observacoes: "",
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [modalInfoAberto, setModalInfoAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<Reserva | null>(null);
  const [alerta, setAlerta] = useState<{tipo: "sucesso"|"erro", mensagem: string} | null>(null);
  
  
  const api = "http://localhost:8080/reservas";

  useEffect(() => {
    listarReservas();
  }, []);

  const mostrarAlerta = (tipo: "sucesso"|"erro", mensagem: string) => {
    setAlerta({tipo, mensagem});
    setTimeout(() => setAlerta(null), 3000);
  };

const listarReservas = async () => {
  try {
    const response = await axios.get(api);
    setReservas(response.data);
    setReservasOriginais(response.data); // <- salva a lista completa
  } catch (err) {
    console.error(err);
    mostrarAlerta("erro", "Erro ao listar reservas!");
  }
};


  // Busca funcionando no front-end
  const buscar = () => {
    const query = nomeBusca.trim().toLowerCase();
    if (!query) {
      setReservas(reservasOriginais);
      return;
    }
    const filtradas = reservasOriginais.filter(r =>
      r.nomeCliente.toLowerCase().includes(query)
    );
    setReservas(filtradas);
  };

  const criar = async () => {
    try {
      await axios.post(api, form);
      setForm({ nomeCliente: "", dataReserva: "", valorCobrado: 0, observacoes: "" });
      setModalAberto(false);
      listarReservas();
      mostrarAlerta("sucesso", "Reserva cadastrada com sucesso!");
    } catch (err) {
      console.error(err);
      mostrarAlerta("erro", "Erro ao criar reserva!");
    }
  };

  const editar = async () => {
    try {
      await axios.put(`${api}/${form.id}`, form);
      setModalAberto(false);
      listarReservas();
      mostrarAlerta("sucesso", "Reserva atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      mostrarAlerta("erro", "Erro ao editar reserva!");
    }
  };

  const excluir = async (id?: number) => {
    try {
      await axios.delete(`${api}/${id}`);
      setModalExcluirAberto(false);
      setModalInfoAberto(false);
      listarReservas();
      mostrarAlerta("sucesso", "Reserva excluída com sucesso!");
    } catch (err) {
      console.error(err);
      mostrarAlerta("erro", "Erro ao excluir reserva!");
    }
  };

  const aoClicarNoDia = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const reservaExistente = reservas.find(r => r.dataReserva === dateStr);

    if (reservaExistente) {
      setReservaSelecionada(reservaExistente);
      setModalInfoAberto(true);
    } else {
      setForm({ nomeCliente: "", dataReserva: dateStr, valorCobrado: 0, observacoes: "" });
      setModoEdicao(false);
      setModalAberto(true);
    }
  };

  const novaReserva = () => {
    setForm({ nomeCliente: "", dataReserva: "", valorCobrado: 0, observacoes: "" });
    setModoEdicao(false);
    setModalAberto(true);
  };


  // dentro do componente App (React)
const [darkMode, setDarkMode] = useState<boolean>(false);

useEffect(() => {
  const body = document.body;
  const root = document.getElementById("root");
  const app = document.querySelector(".app-container");

  if (darkMode) {
    body?.classList.add("dark");
    root?.classList.add("dark");
    app?.classList.add("dark");
  } else {
    body?.classList.remove("dark");
    root?.classList.remove("dark");
    app?.classList.remove("dark");
  }
}, [darkMode]);



  

  const temReserva = (date: Date) =>
    reservas.some(r => r.dataReserva === date.toISOString().split("T")[0]);


  const [mesAtual, setMesAtual] = useState(new Date().getMonth());



  

  return (
    <div className="app-container">
    
      <h1>EvControl <br /> Gerenciamento de Reservas</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Teste botão para ir para custos kkkk */}
        <button
          className="btn-editar"
          aria-pressed={darkMode}
          title="Gastos"
          style={{ padding: '8px 12px', fontSize: '0.95rem' }}
        >Gastos - teste</button>


        <button
          onClick={() => setDarkMode(d => !d)}
          className="btn-cancelar"
          aria-pressed={darkMode}
          title="Alternar modo escuro"
          style={{ padding: '8px 12px', fontSize: '0.95rem' }}
        >
          {darkMode ? "Modo Claro" : "Modo Escuro"}
        </button>
</div>

      <div className="mb-6 flex justify-center">
        <button onClick={novaReserva} className="btn-salvar">+ Nova Reserva</button>
      </div>

<div className="calendario-container">
<Calendar
  onClickDay={aoClicarNoDia}
  className="react-calendar"
  onActiveStartDateChange={({ activeStartDate }) => {
    if (activeStartDate) {
      setMesAtual(activeStartDate.getMonth());
    }
  }}
tileClassName={({ date, view }) => {
  const dateStr = date.toISOString().split("T")[0];

  // Se tem reserva E é do mês atual
  if (temReserva(date) && date.getMonth() === mesAtual) return "dia-reservado";

  // Dias que pertencem a outros meses
  if (view === "month" && date.getMonth() !== mesAtual) return "dia-vizinho";

  return "dia-livre";
}}

tileContent={({ date, view }) => {
  const reserva = reservas.find(
    (r) => r.dataReserva === date.toISOString().split("T")[0]
  );

  // Só mostrar o nome se a reserva for do mês atual
  if (reserva && date.getMonth() === mesAtual && view === "month") {
    return <div className="nome-cliente">{reserva.nomeCliente}</div>;
  }

  return null;
}}

/>

</div>


      {/* Busca */}
      
      <div className="buscaReserva">
        <h1>Reservas</h1>
        <div className="flex">
          <input
            type="text"
            placeholder="Buscar por nome"
            value={nomeBusca}
            onChange={(e) => setNomeBusca(e.target.value)}
          />
          <button onClick={buscar} className="btn-editar">🔍</button>
          <button
            onClick={() => {
              setNomeBusca("");
              setReservas(reservasOriginais);
            }}
            className="btn-cancelar"
          >
            Limpar
          </button>
        </div>
      </div>


      {/* Lista */}
      {reservas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma reserva encontrada.</p>
      ) : (
        <div className="listaReserva">
          <ul className="space-y-2 w-full max-w-2xl">
            {reservas.map((r) => (
              <li key={r.id}>
                <div>
                  <p><strong>Data:</strong> {r.dataReserva}</p>
                  <p><strong>Cliente:</strong> {r.nomeCliente}</p>
                  <p><strong>Valor:</strong> R$ {r.valorCobrado}</p>
                  <p><strong>Obs:</strong> {r.observacoes}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setForm(r); setModoEdicao(true); setModalAberto(true); }}
                    className="btn-editar"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => { setReservaSelecionada(r); setModalExcluirAberto(true); }}
                    className="btn-excluir"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modoEdicao ? "Editar Reserva" : "Cadastrar Reserva"}</h2>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={form.nomeCliente}
              onChange={(e) => setForm({...form, nomeCliente: e.target.value})}
            />
            <input
              type="date"
              value={form.dataReserva}
              onChange={(e) => setForm({...form, dataReserva: e.target.value})}
            />
            <input
              type="text"
              placeholder="R$ 0,00"
              value={form.valorCobrado === 0 ? "" : `R$ ${form.valorCobrado.toFixed(2).replace('.', ',')}`}
              onChange={(e) => {
                // remove tudo que não for número ou vírgula
                const valor = e.target.value.replace(/[^0-9,]/g, '');
                // transforma vírgula em ponto para number
                const numero = parseFloat(valor.replace(',', '.')) || 0;
                setForm({ ...form, valorCobrado: numero });
              }}
            />

            <textarea
              placeholder="Observações"
              value={form.observacoes}
              onChange={(e) => setForm({...form, observacoes: e.target.value})}
            />
            <div>
              <button onClick={() => setModalAberto(false)} className="btn-cancelar">Fechar</button>
              <button onClick={modoEdicao ? editar : criar} className="btn-salvar">
                {modoEdicao ? "Salvar Alterações" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informações */}
      {modalInfoAberto && reservaSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reserva em {reservaSelecionada.dataReserva}</h2>
            <p><strong>Cliente:</strong> {reservaSelecionada.nomeCliente}</p>
            <p><strong>Valor:</strong> R$ {reservaSelecionada.valorCobrado}</p>
            <p><strong>Observações:</strong> {reservaSelecionada.observacoes}</p>
            <div>
              <button
                onClick={() => { setForm(reservaSelecionada); setModoEdicao(true); setModalAberto(true); setModalInfoAberto(false); }}
                className="btn-editar"
              >
                Editar
              </button>
              <button
                onClick={() => setModalExcluirAberto(true)}
                className="btn-excluir"
              >
                Excluir
              </button>
              <button
                onClick={() => setModalInfoAberto(false)}
                className="btn-cancelar"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {modalExcluirAberto && reservaSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Exclusão</h2>
            <p>Deseja realmente excluir a reserva de <strong>{reservaSelecionada.nomeCliente}</strong>?</p>
            <div>
              <button onClick={() => excluir(reservaSelecionada.id)} className="btn-excluir">Excluir</button>
              <button onClick={() => setModalExcluirAberto(false)} className="btn-cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta */}
      {alerta && (
        <div className={`alerta alerta-${alerta.tipo}`}>
          {alerta.mensagem}
        </div>
      )}
    </div>
  );
}

export default App;
