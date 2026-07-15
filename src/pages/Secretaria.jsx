import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useDeferredValue,
} from "react";
import { io } from "socket.io-client";
import "./styles/Secretaria.css";
import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";
import useAuth from "../hooks/useAuth";
const BASEURL = import.meta.env.VITE_API_URL;

const Secretaria = () => {
  const [activeSection, setActiveSection] = useState("inscripciones");
  const [menuOpen, setMenuOpen] = useState(false);
  const [inputNombre, setInputNombre] = useState("");
  const [inputCedula, setInputCedula] = useState();
  const [cedulaBuscada, setCedulaBuscada] = useState("");
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [filtroPago, setFiltroPago] = useState("");
  const [filtroCertificado, setFiltroCertificado] = useState("");
  const [filtroObservacion, setFiltroObservacion] = useState("");
  const [filtroDetalle, setFiltroDetalle] = useState("");
  const [filtroUltimoAcceso, setFiltroUltimoAcceso] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [busquedaTemporal, setBusquedaTemporal] = useState("");
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const [cedulaTemporal, setCedulaTemporal] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [limit, setLimit] = useState(15);
  const [editInscripcionId, setEditInscripcionId] = useState();
  const inputNombreDiferido = useDeferredValue(inputNombre);

  const [cedulaCertificado, setCedulaCertificado] = useState("");
  const [nombreCertificado, setNombreCertificado] = useState("");
  const [sugerenciasCertificados, setSugerenciasCertificados] = useState([]);
  const [certificadosFiltrados, setCertificadosFiltrados] = useState([]);
  const [usersData, setUsersData] = useState([]);

  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);

  const [seguimientoActual, setSeguimientoActual] = useState(null);

  const [seguimientos, setSeguimientos] = useState([]);

  const [resultadoSeguimiento, setResultadoSeguimiento] = useState("");

  const [observacionSeguimiento, setObservacionSeguimiento] = useState("");

  const [proximoContacto, setProximoContacto] = useState("");


  const [modalSeguimientoAbierto, setModalSeguimientoAbierto] = useState(false);
  const [cursoSeguimiento, setCursoSeguimiento] = useState(null);
  const [usuarioSeguimiento, setUsuarioSeguimiento] = useState(null);
  const [historialSeguimiento, setHistorialSeguimiento] = useState(null);
  const [cargandoSeguimiento, setCargandoSeguimiento] = useState(false);
  const [errorSeguimiento, setErrorSeguimiento] = useState("");

  const [mostrarFormularioSeguimiento, setMostrarFormularioSeguimiento] =
    useState(false);

  const [proximoContactoSeguimiento, setProximoContactoSeguimiento] =
    useState("");

  const [guardandoSeguimiento, setGuardandoSeguimiento] = useState(false);
  const [errorGuardarSeguimiento, setErrorGuardarSeguimiento] = useState("");
  const [mensajeSeguimiento, setMensajeSeguimiento] = useState("");



  // Debajo de tus useState, define:
  const cargaTimeoutRef = useRef(null);

  const debounceRef = useRef(null);

  const observacionRef = useRef(null);
  const cedulaRef = useRef();

  const registrosPorPagina = 15;

  const [sugerencias, setSugerencias] = useState([]);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const cargarDatosConQuery = (pagina, limite) => {
    if (cargaTimeoutRef.current) clearTimeout(cargaTimeoutRef.current);

    cargaTimeoutRef.current = setTimeout(() => {
      getUsers(
        `/users?cedula=${cedulaBuscada}&search=${nombreBuscado}&notaFinal=${filtroDetalle}&acces=${filtroUltimoAcceso}&pagos=${filtroPago}&certificado=${filtroCertificado}&curso=${filtroCurso}&observacion=${filtroObservacion}&page=${pagina}&limit=${limite}`,
      );
    }, 2000); // 2 segundos de espera
  };

  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_COURSES = "/courses";
  const PATH_CERTIFICADOS = "/certificados";
  const PATH_USERS = "/users";

  const [courses, getCourses] = useCrud();
  const [usersAll, getUsers, , , , , isLoading] = useCrud();
  const [
    seguimientoData,
    getSeguimientos,
    createSeguimiento,
  ] = useCrud();



  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const abrirSeguimiento = async (curso) => {
    setSeguimientoActual(curso);

    await getSeguimientos(
      `/seguimiento_inscripcion/${curso.id}`
    );

    setShowSeguimientoModal(true);
  };

  const abrirModalSeguimiento = async (usuario, curso) => {
    setUsuarioSeguimiento(usuario);
    setCursoSeguimiento(curso);
    setModalSeguimientoAbierto(true);

    setHistorialSeguimiento(null);
    setMostrarFormularioSeguimiento(false);
    setResultadoSeguimiento("");
    setObservacionSeguimiento("");
    setProximoContactoSeguimiento("");
    setErrorGuardarSeguimiento("");
    setMensajeSeguimiento("");

    await cargarHistorialSeguimiento(curso.id);
  };

  const cerrarModalSeguimiento = () => {
    if (guardandoSeguimiento) return;

    setModalSeguimientoAbierto(false);
    setCursoSeguimiento(null);
    setUsuarioSeguimiento(null);
    setHistorialSeguimiento(null);

    setMostrarFormularioSeguimiento(false);
    setResultadoSeguimiento("");
    setObservacionSeguimiento("");
    setProximoContactoSeguimiento("");

    setErrorSeguimiento("");
    setErrorGuardarSeguimiento("");
    setMensajeSeguimiento("");
  };


  const cargarHistorialSeguimiento = async (inscripcionId) => {
    setCargandoSeguimiento(true);
    setErrorSeguimiento("");

    try {
      const response = await fetch(
        `${BASEURL}/seguimiento_inscripcion/${inscripcionId}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
          "No se pudo obtener el historial de seguimiento.",
        );
      }

      const data = await response.json();
      setHistorialSeguimiento(data);
    } catch (error) {
      console.error("Error al cargar seguimiento:", error);

      setErrorSeguimiento(
        error.message || "No se pudo cargar el historial.",
      );
    } finally {
      setCargandoSeguimiento(false);
    }
  };

  const registrarSeguimiento = async (event) => {
    event.preventDefault();

    setErrorGuardarSeguimiento("");
    setMensajeSeguimiento("");

    if (!cursoSeguimiento?.id) {
      setErrorGuardarSeguimiento(
        "No se encontró la inscripción seleccionada.",
      );
      return;
    }

    if (!resultadoSeguimiento) {
      setErrorGuardarSeguimiento(
        "Selecciona el resultado de la llamada.",
      );
      return;
    }

    if (!observacionSeguimiento.trim()) {
      setErrorGuardarSeguimiento(
        "Escribe lo que indicó el cliente.",
      );
      return;
    }

    setGuardandoSeguimiento(true);

    try {
      await createSeguimiento("/seguimiento", {
        inscripcionId: cursoSeguimiento.id,
        usuarioEdicion:
          user?.email || "Usuario no identificado",
        resultado: resultadoSeguimiento,
        observacion: observacionSeguimiento.trim(),
        proximoContacto:
          proximoContactoSeguimiento || null,
      });

      setResultadoSeguimiento("");
      setObservacionSeguimiento("");
      setProximoContactoSeguimiento("");
      setMostrarFormularioSeguimiento(false);

      setMensajeSeguimiento(
        "✅ La llamada fue registrada correctamente.",
      );

      await cargarHistorialSeguimiento(cursoSeguimiento.id);

      await getUsers(
        `/users?cedula=${cedulaBuscada}&search=${nombreBuscado}&notaFinal=${filtroDetalle}&acces=${filtroUltimoAcceso}&pagos=${filtroPago}&certificado=${filtroCertificado}&curso=${filtroCurso}&seguimiento=${filtroObservacion}&page=${paginaActual}`,
      );
    } catch (error) {
      console.error("Error al registrar seguimiento:", error);

      setErrorGuardarSeguimiento(
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo registrar la llamada.",
      );
    } finally {
      setGuardandoSeguimiento(false);
    }
  };

  useEffect(() => {
    const cerrarConEscape = (event) => {
      if (event.key === "Escape" && modalSeguimientoAbierto) {
        cerrarModalSeguimiento();
      }
    };

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [modalSeguimientoAbierto]);

  // Refs para mantener los filtros y la página actual
  const filtrosRef = useRef({
    cedula: "",
    nombre: "",
    notaFinal: "",
    acces: "",
    pagos: "",
    certificado: "",
    curso: "",
    observacion: "",
    page: 1,
  });

  // Cada vez que cambie un filtro o página, actualizamos la ref
  useEffect(() => {
    filtrosRef.current = {
      cedula: cedulaBuscada,
      nombre: nombreBuscado,
      notaFinal: filtroDetalle,
      acces: filtroUltimoAcceso,
      pagos: filtroPago,
      certificado: filtroCertificado,
      curso: filtroCurso,
      observacion: filtroObservacion,
      page: paginaActual,
    };
  }, [
    cedulaBuscada,
    nombreBuscado,
    filtroDetalle,
    filtroUltimoAcceso,
    filtroPago,
    filtroCertificado,
    filtroCurso,
    filtroObservacion,
    paginaActual,
  ]);

  // useEffect para socket
  useEffect(() => {
    const socket = io(BASEURL);

    const actualizarUsuarios = () => {
      const f = filtrosRef.current; // usamos los valores actuales de los filtros
      getUsers(
        `/users?cedula=${f.cedula}&search=${f.nombre}&notaFinal=${f.notaFinal}&acces=${f.acces}&pagos=${f.pagos}&certificado=${f.certificado}&curso=${f.curso}&observacion=${f.observacion}&page=${f.page}`,
      );
    };

    // Escuchar tanto actualizaciones como creaciones
    socket.on("inscripcionActualizada", actualizarUsuarios);
    socket.on("inscripcionCreada", actualizarUsuarios);
    socket.on("pagoCreado", actualizarUsuarios);

    socket.on("seguimientoCreado", actualizarUsuarios);
    socket.on("seguimientoActualizado", actualizarUsuarios);
    socket.on("seguimientoEliminado", actualizarUsuarios);

    // Carga inicial
    actualizarUsuarios();

    return () => {
      socket.off("inscripcionActualizada", actualizarUsuarios);
      socket.off("inscripcionCreada", actualizarUsuarios);
      socket.off("pagoCreado", actualizarUsuarios);

      socket.off("seguimientoCreado", actualizarUsuarios);
      socket.off("seguimientoActualizado", actualizarUsuarios);
      socket.off("seguimientoEliminado", actualizarUsuarios);

      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    getUsers(
      `/users?cedula=${cedulaBuscada}&search=${nombreBuscado}&notaFinal=${filtroDetalle}&acces=${filtroUltimoAcceso}&pagos=${filtroPago}&certificado=${filtroCertificado}&curso=${filtroCurso}&observacion=${filtroObservacion}&page=${paginaActual}`);
  }, [
    cedulaBuscada,
    nombreBuscado,
    filtroDetalle,
    filtroPago,
    filtroCertificado,
    filtroCurso,
    filtroObservacion,
    paginaActual,
    filtroUltimoAcceso,
    filtroObservacion,
  ]);

  useEffect(() => {
    setPaginaActual(1); // 👈 cada vez que cambian los filtros, resetear a 1
  }, [
    cedulaBuscada,
    nombreBuscado,
    filtroDetalle,
    filtroPago,
    filtroCertificado,
    filtroCurso,
    filtroObservacion,
    filtroUltimoAcceso,
    filtroObservacion,
  ]);



  const users = usersAll
    ? {
      ...usersAll,
      data: usersAll.data
        ? usersAll.data
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [],
    }
    : { total: 0, page: 1, limit: 10, totalPages: 1, data: [] };

  const [
    inscripciones,
    getInscripciones,
    ,
    ,
    updateInscripciones,
    ,
    isLoadingI,
  ] = useCrud();

  const [certificados, getCertificados] = useCrud();

  useEffect(() => {
    getInscripciones(PATH_INSCRIPCIONES);
    getCourses(PATH_COURSES);
    getCertificados(PATH_CERTIFICADOS);
    getUsers(PATH_USERS);
    loggedUser();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (inputNombreDiferido.trim().length < 3) {
      setSugerencias([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const texto = inputNombreDiferido.trim().toLowerCase();

      const mapaUnicos = new Map();

      inscripciones.forEach((i) => {
        const u = i.user;
        if (!u?.cI) return;

        const fullName =
          `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        const ci = String(u.cI);

        // match por nombre o por cédula
        if (fullName.includes(texto) || ci.includes(texto)) {
          // 🔑 usamos cI como clave única
          if (!mapaUnicos.has(ci)) {
            mapaUnicos.set(ci, i);
          }
        }
      });

      setSugerencias(Array.from(mapaUnicos.values()).slice(0, 10));
    }, 300);
  }, [inputNombreDiferido, inscripciones]);

  const handleSelect = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
    limpiarFiltros();
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // ---------------------------------------------------------------------------------------------------------------------

  const limpiarFiltros = () => {
    // cedulaRef.current.value = "";

    setBusquedaTemporal("");
    setCedulaTemporal("");
    setCedulaBuscada("");
    setCedulaBuscada("");
    setNombreBuscado("");
    setInputNombre("");
    setInputCedula("");
    setFiltroPago("");
    setFiltroCertificado("");
    setFiltroCurso("");
    setFiltroObservacion("");
    setFiltroDetalle("");
    setFiltroUltimoAcceso("");
    setBusquedaRealizada(false);
    setSugerencias([]);
  };

  // Al seleccionar sugerencia llenamos input y vaciamos sugerencias
  const seleccionarSugerencia = (sug) => {
    const nombre =
      `${sug.user?.firstName || ""} ${sug.user?.lastName || ""}`.trim();
    const ci = sug.user?.cI || "";

    // 1) llenar inputs visibles (opcional pero recomendado)
    setInputNombre(nombre);
    setInputCedula(ci);

    // 2) aplicar filtros reales
    setNombreBuscado(nombre);
    setCedulaBuscada(ci);

    // 3) ocultar sugerencias
    setSugerencias([]);

    // 4) ✅ activar resultados (clave)
    setBusquedaRealizada(true);

    // 5) ✅ opcional: reset a página 1
    setPaginaActual(1);
  };

  const handleBuscar = () => {
    setCedulaBuscada(inputCedula);
    setNombreBuscado(inputNombre);
    setSugerencias([]); // opcionalmente vacía sugerencias
    setBusquedaRealizada(true); // ✅ activamos la visualización de resultados
  };

  const totalPaginas = Math.ceil((users?.total || 0) / registrosPorPagina);

  const iniciarEdicion = (inscripcion) => {
    setEditInscripcionId(inscripcion.id);
  };

  const cancelarEdicion = () => {
    setEditInscripcionId();
  };

  const guardarEdicion = async (inscripcionId) => {
    const nuevaObservacion = observacionRef.current?.value.trim() || "";

    try {
      await updateInscripciones(PATH_INSCRIPCIONES, inscripcionId, {
        observacion: nuevaObservacion,
        usuarioEdicion: user.email,
      });
      await getInscripciones(PATH_INSCRIPCIONES);
      cancelarEdicion();
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
    }
  };
  // ----------------------------------------------------------------------------------------------------
  const handleBuscarCertificados = () => {
    const resultados = certificados.filter((c) => {
      const matchCedula =
        cedulaCertificado.trim() !== "" &&
        c.cedula.includes(cedulaCertificado.trim());

      const matchNombre =
        nombreCertificado.trim() !== "" &&
        `${c.nombres} ${c.apellidos}`
          .toLowerCase()
          .includes(nombreCertificado.toLowerCase());

      return matchCedula || matchNombre;
    });

    setCertificadosFiltrados(resultados);
  };

  // Limpiar filtros
  const limpiarFiltrosCertificados = () => {
    setCedulaCertificado("");
    setNombreCertificado("");
    setFiltroCurso("");
    setCertificadosFiltrados([]);
    setSugerenciasCertificados([]);
  };

  // Autocompletar nombres
  useEffect(() => {
    if (nombreCertificado.trim() === "") {
      setSugerenciasCertificados([]);
      return;
    }
    const sugerencias = certificados.filter((c) =>
      `${c.nombres} ${c.apellidos}`
        .toLowerCase()
        .includes(nombreCertificado.toLowerCase()),
    );
    setSugerenciasCertificados(sugerencias.slice(0, 5)); // máx 5 sugerencias
  }, [nombreCertificado, certificados]);

  // Seleccionar sugerencia
  const seleccionarSugerenciaCertificado = (sug) => {
    setNombreCertificado(`${sug.nombres} ${sug.apellidos}`);
    setCedulaCertificado(sug.cedula);
    setSugerenciasCertificados([]);
    setCertificadosFiltrados([sug]);
  };

  return (
    <div className="secPage">


      {modalSeguimientoAbierto && (
        <div
          className="segModalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarModalSeguimiento();
            }
          }}
        >
          <section
            className="segModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="segModalTitulo"
          >
            <header className="segModalHeader">
              <div>
                <span className="segModalEyebrow">
                  Gestión comercial
                </span>

                <h2 id="segModalTitulo">
                  📞 Seguimiento de llamadas
                </h2>

                <p>
                  Historial de contactos realizados para esta
                  inscripción.
                </p>
              </div>

              <button
                type="button"
                className="segModalClose"
                onClick={cerrarModalSeguimiento}
                aria-label="Cerrar ventana"
              >
                ×
              </button>
            </header>

            <div className="segModalBody">
              <div className="segClienteCard">
                <div className="segClienteAvatar">
                  {usuarioSeguimiento?.firstName?.charAt(0) || "U"}
                  {usuarioSeguimiento?.lastName?.charAt(0) || ""}
                </div>

                <div className="segClienteInfo">
                  <h3>
                    {usuarioSeguimiento?.firstName || ""}{" "}
                    {usuarioSeguimiento?.lastName || ""}
                  </h3>

                  <p>
                    <strong>Cédula:</strong>{" "}
                    {usuarioSeguimiento?.cI || "No disponible"}
                  </p>

                  <p>
                    <strong>Celular:</strong>{" "}
                    {usuarioSeguimiento?.cellular || "No disponible"}
                  </p>

                  <p>
                    <strong>Curso:</strong>{" "}
                    {cursoSeguimiento?.fullname ||
                      cursoSeguimiento?.curso ||
                      "No disponible"}
                  </p>
                </div>
              </div>

              {cargandoSeguimiento ? (
                <div className="segModalLoading">
                  <span className="segSpinner"></span>
                  <p>Cargando historial de llamadas...</p>
                </div>
              ) : errorSeguimiento ? (
                <div className="segModalError">
                  <strong>⚠️ No se pudo cargar el seguimiento</strong>
                  <p>{errorSeguimiento}</p>

                  <button
                    type="button"
                    className="segBtnRetry"
                    onClick={() =>
                      abrirModalSeguimiento(
                        usuarioSeguimiento,
                        cursoSeguimiento,
                      )
                    }
                  >
                    Intentar nuevamente
                  </button>
                </div>
              ) : (
                <>
                  <div className="segResumenGrid">
                    <article className="segResumenCard">
                      <span className="segResumenIcon">📞</span>

                      <div>
                        <span>Total de llamadas</span>
                        <strong>
                          {historialSeguimiento?.totalSeguimientos || 0}
                        </strong>
                      </div>
                    </article>

                    <article
                      className={`segResumenCard ${historialSeguimiento?.tienePago
                          ? "segCompraConfirmada"
                          : "segCompraPendiente"
                        }`}
                    >
                      <span className="segResumenIcon">
                        {historialSeguimiento?.tienePago ? "✅" : "⏳"}
                      </span>

                      <div>
                        <span>Estado de pago</span>
                        <strong>
                          {historialSeguimiento?.tienePago
                            ? "Pago confirmado"
                            : "Sin pago confirmado"}
                        </strong>
                      </div>
                    </article>

                    <article className="segResumenCard">
                      <span className="segResumenIcon">💵</span>

                      <div>
                        <span>Monto confirmado</span>
                        <strong>
                          $
                          {Number(
                            historialSeguimiento?.montoTotalPagado || 0
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </article>

                    <article className="segResumenCard">
                      <span className="segResumenIcon">
                        {historialSeguimiento?.tieneCompraPorSeguimiento
                          ? "🎯"
                          : "➖"}
                      </span>

                      <div>
                        <span>Conversión por seguimiento</span>
                        <strong>
                          {historialSeguimiento?.tieneCompraPorSeguimiento
                            ? "Sí"
                            : "No atribuida"}
                        </strong>
                      </div>
                    </article>
                  </div>

                  {mensajeSeguimiento && (
                    <div className="segMensajeExito">
                      {mensajeSeguimiento}
                    </div>
                  )}

                  {mostrarFormularioSeguimiento && (
                    <form
                      className="segForm"
                      onSubmit={registrarSeguimiento}
                    >
                      <div className="segFormHeader">
                        <div>
                          <span className="segFormEyebrow">
                            Nuevo contacto
                          </span>

                          <h3>📞 Registrar llamada</h3>

                          <p>
                            Registra el resultado y la información proporcionada
                            por el cliente.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="segFormClose"
                          onClick={() => {
                            if (guardandoSeguimiento) return;

                            setMostrarFormularioSeguimiento(false);
                            setResultadoSeguimiento("");
                            setObservacionSeguimiento("");
                            setProximoContactoSeguimiento("");
                            setErrorGuardarSeguimiento("");
                          }}
                          aria-label="Cerrar formulario"
                        >
                          ×
                        </button>
                      </div>

                      {errorGuardarSeguimiento && (
                        <div className="segFormError">
                          ⚠️ {errorGuardarSeguimiento}
                        </div>
                      )}

                      <div className="segFormGrid">
                        <div className="segFormGroup">
                          <label htmlFor="resultadoSeguimiento">
                            Resultado de la llamada
                            <span aria-hidden="true"> *</span>
                          </label>

                          <select
                            id="resultadoSeguimiento"
                            value={resultadoSeguimiento}
                            onChange={(event) =>
                              setResultadoSeguimiento(event.target.value)
                            }
                            disabled={guardandoSeguimiento}
                            required
                          >
                            <option value="">
                              Selecciona un resultado
                            </option>

                            <option value="sin_respuesta">
                              📵 Sin respuesta
                            </option>

                            <option value="numero_incorrecto">
                              ❌ Número incorrecto
                            </option>

                            <option value="interesado">
                              ✅ Interesado
                            </option>

                            <option value="no_interesado">
                              🚫 No interesado
                            </option>

                            <option value="volver_llamar">
                              📞 Volver a llamar
                            </option>

                            <option value="pago_pendiente">
                              💳 Pago pendiente
                            </option>
                          </select>
                        </div>

                        <div className="segFormGroup">
                          <label htmlFor="proximoContactoSeguimiento">
                            Próximo contacto
                          </label>

                          <input
                            id="proximoContactoSeguimiento"
                            type="datetime-local"
                            value={proximoContactoSeguimiento}
                            onChange={(event) =>
                              setProximoContactoSeguimiento(event.target.value)
                            }
                            disabled={guardandoSeguimiento}
                          />

                          <small>
                            Déjalo vacío cuando no sea necesario volver a contactar.
                          </small>
                        </div>

                        <div className="segFormGroup segFormGroupFull">
                          <label htmlFor="observacionSeguimiento">
                            ¿Qué indicó el cliente?
                            <span aria-hidden="true"> *</span>
                          </label>

                          <textarea
                            id="observacionSeguimiento"
                            value={observacionSeguimiento}
                            onChange={(event) =>
                              setObservacionSeguimiento(event.target.value)
                            }
                            placeholder="Ejemplo: El cliente solicita información sobre el valor, formas de pago y fecha de inicio..."
                            rows={5}
                            maxLength={1500}
                            disabled={guardandoSeguimiento}
                            required
                          />

                          <div className="segTextareaFooter">
                            <small>
                              Registra información clara y útil para el siguiente contacto.
                            </small>

                            <span>
                              {observacionSeguimiento.length}/1500
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="segFormActions">
                        <button
                          type="button"
                          className="segBtnCancelarForm"
                          disabled={guardandoSeguimiento}
                          onClick={() => {
                            setMostrarFormularioSeguimiento(false);
                            setResultadoSeguimiento("");
                            setObservacionSeguimiento("");
                            setProximoContactoSeguimiento("");
                            setErrorGuardarSeguimiento("");
                          }}
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="segBtnGuardar"
                          disabled={guardandoSeguimiento}
                        >
                          {guardandoSeguimiento
                            ? "Guardando..."
                            : "💾 Registrar llamada"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="segHistorialHeader">
                    <div>
                      <h3>Historial de contactos</h3>
                      <p>
                        Registro cronológico de las llamadas realizadas.
                      </p>
                    </div>
                  </div>

                  {historialSeguimiento?.seguimientos?.length > 0 ? (
                    <div className="segTimeline">
                      {historialSeguimiento.seguimientos.map(
                        (seguimiento, index) => (
                          <article
                            key={seguimiento.id}
                            className="segTimelineItem"
                          >
                            <div className="segTimelineMarker">
                              <span>{index + 1}</span>
                            </div>

                            <div className="segTimelineContent">
                              <div className="segTimelineTop">
                                <span className="segResultadoBadge">
                                  {String(
                                    seguimiento.resultado || "Sin resultado",
                                  )
                                    .replaceAll("_", " ")
                                    .replace(/\b\w/g, (letra) =>
                                      letra.toUpperCase(),
                                    )}
                                </span>

                                <time>
                                  {seguimiento.createdAt
                                    ? new Date(
                                      seguimiento.createdAt,
                                    ).toLocaleString("es-EC", {
                                      timeZone:
                                        "America/Guayaquil",
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                    : "Fecha no disponible"}
                                </time>
                              </div>

                              <p className="segObservacionTexto">
                                {seguimiento.observacion}
                              </p>

                              <div className="segTimelineMeta">
                                <span>
                                  👤{" "}
                                  {seguimiento.usuarioEdicion ||
                                    "Usuario no identificado"}
                                </span>

                                {seguimiento.proximoContacto && (
                                  <span>
                                    📅 Próximo contacto:{" "}
                                    {new Date(
                                      seguimiento.proximoContacto,
                                    ).toLocaleString("es-EC", {
                                      timeZone:
                                        "America/Guayaquil",
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </article>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="segHistorialVacio">
                      <div className="segHistorialVacioIcon">📞</div>
                      <h3>Sin llamadas registradas</h3>
                      <p>
                        Todavía no se ha registrado ningún seguimiento
                        para este usuario y curso.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <footer className="segModalFooter">
              <button
                type="button"
                className="segBtnCerrar"
                onClick={cerrarModalSeguimiento}
              >
                Cerrar
              </button>

              {!mostrarFormularioSeguimiento && (
                <button
                  type="button"
                  className="segBtnNuevo"
                  disabled={guardandoSeguimiento}
                  onClick={() => {
                    setMostrarFormularioSeguimiento(true);
                    setMensajeSeguimiento("");
                    setErrorGuardarSeguimiento("");
                  }}
                >
                  ＋ Registrar llamada
                </button>
              )}
            </footer>
          </section>
        </div>
      )}

      {(isLoadingI || (isLoading && busquedaRealizada)) && <IsLoading />}

      {/* Overlay para mobile */}
      <div
        className={`secOverlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <div className="secretaria_container secShell">
        <button
          ref={hamburgerRef}
          className={`secretaria_hamburger secHamburger ${menuOpen ? "is-open" : ""
            }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="secHamburgerLine"></span>
          <span className="secHamburgerLine"></span>
          <span className="secHamburgerLine"></span>
        </button>

        <nav
          className={`secretaria_menu secMenu ${menuOpen ? "open" : ""}`}
          ref={menuRef}
        >
          <div className="secMenuHeader">
            <img
              src="/images/cumanda_sf.png"
              alt="Eduka"
              className="secMenuLogo"
            />
            <p className="secMenuSubtitle">Panel Secretaría</p>
          </div>

          <button
            className={`menu-btn secMenuBtn ${activeSection === "inscripciones" ? "active" : ""
              }`}
            onClick={() => handleSelect("inscripciones")}
          >
            🔎 Buscador
          </button>

          <button
            className={`menu-btn secMenuBtn ${activeSection === "pagos" ? "active" : ""}`}
            onClick={() => handleSelect("pagos")}
          >
            📄 Listado
          </button>

          <button
            className={`menu-btn secMenuBtn ${activeSection === "certificados" ? "active" : ""
              }`}
            onClick={() => handleSelect("certificados")}
          >
            🎓 Certificados
          </button>
        </nav>

        <main className="secretaria_content secContent">
          {/* ===================== INSCRIPCIONES ===================== */}
          {activeSection === "inscripciones" && (
            <section className="secCard">
              <div className="secCardHeader">
                <h2 className="secTitle">🔎 Buscador</h2>
              </div>

              <div className="inputs_busqueda secFilters">
                <div className="input_group secInputGroup">
                  <input
                    type="text"
                    className="buscador_input secInput"
                    placeholder="🔍 Buscar por cédula"
                    value={inputCedula}
                    onChange={(e) => setInputCedula(e.target.value)}
                  />
                </div>

                <div className="input_group secInputGroup">
                  <input
                    type="text"
                    className="buscador_input secInput"
                    placeholder="🔍 Buscar por nombres y apellidos"
                    value={inputNombre}
                    onChange={(e) => setInputNombre(e.target.value)}
                    autoComplete="off"
                  />

                  {sugerencias.length > 0 && (
                    <ul className="sugerencias_lista secSuggest" role="listbox">
                      {sugerencias.map((sug) => (
                        <li
                          key={sug.id}
                          onClick={() => seleccionarSugerencia(sug)}
                          className="sugerencia_item secSuggestItem"
                          role="option"
                        >
                          {sug.user?.firstName} {sug.user?.lastName} —{" "}
                          {sug.user?.cI}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  className="btn_buscar secBtnPrimary"
                  onClick={handleBuscar}
                >
                  🔍 Buscar
                </button>

                <button
                  className="btn_limpiar_filtros secBtnDanger"
                  onClick={limpiarFiltros}
                >
                  ❌ Borrar filtros
                </button>
              </div>

              {/* Resultados */}
              {busquedaRealizada && !isLoading ? (
                users.total > 0 ? (
                  users?.data?.map((i) => (
                    <div key={i.id} className="grid_dos_columnas secGrid2">
                      <div className="card_inscripcion secCardInner">
                        <h3>
                          {i.firstName} {i.lastName}
                        </h3>
                        <p>
                          <strong>Cédula:</strong> {i.cI}
                        </p>
                        <p>
                          <strong>Celular:</strong> {i.cellular}
                        </p>
                        <p>
                          <strong>Subsistema:</strong> {i.subsistema}
                        </p>
                        <p>
                          <strong>Grado:</strong> {i.grado}
                        </p>
                        <p>
                          <strong>Email:</strong> {i.email}
                        </p>

                        <article>
                          <strong>Cursos Inscrito:</strong> <br />
                          {i.courses && i.courses.length > 0
                            ? i.courses.map((curso) => (
                              <div
                                key={curso.id}
                                style={{ marginBottom: "8px" }}
                              >
                                <hr />
                                <span>✅ {curso.fullname}</span>
                                <br />
                                <span>
                                  <strong>Fecha de inscripción:</strong>{" "}
                                  {curso.createdAt
                                    ? new Date(curso.createdAt)
                                      .toLocaleString("es-EC", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: false,
                                        timeZone: "America/Guayaquil",
                                      })
                                      .replace(",", "")
                                    : "No encontrado"}
                                </span>
                                <br />
                                <span>
                                  <strong>Matricula:</strong>{" "}
                                  {curso.matriculado
                                    ? "Matriculado en Acadex"
                                    : "Aun no registra matricula"}
                                </span>
                                <br />
                                <span>
                                  <strong>Calificación:</strong>{" "}
                                  {curso.grades["Nota Final"]}
                                </span>
                                <hr />
                              </div>
                            ))
                            : "No encontrado"}
                        </article>
                      </div>

                      <div className="card_cursos_inscripcion secCardInner">
                        {i.courses && i.courses.length > 0 ? (
                          i.courses.map((curso) => (
                            <div key={curso.id} className="curso_detalle">
                              <h4>📚 {curso.fullname}</h4>

                              <div className="card_pagos_inscripcion secPaymentsCard">
                                <h4>💳 Pagos relacionados</h4>
                                {curso.pagos && curso.pagos.length > 0 ? (
                                  curso.pagos.map((pago, idx) => (
                                    <div key={pago.id} className="pago_detalle">
                                      <p>
                                        <strong>Pago #{idx + 1}</strong>
                                      </p>
                                      <p>Monto: ${pago.valorDepositado}</p>
                                      {pago.moneda && <p>💰 Incluye moneda</p>}
                                      {pago.distintivo && (
                                        <p>🎖️ Incluye distintivo</p>
                                      )}
                                      <p>
                                        Estado:{" "}
                                        {pago.verificado
                                          ? "✅ Verificado"
                                          : "⏳ Por verificar"}
                                      </p>

                                      {pago.pagoUrl && (
                                        <a
                                          className="btn_ver_comprobante secBtnLink"
                                          href={pago.pagoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Ver comprobante <span>➜</span>
                                        </a>
                                      )}
                                      <hr />
                                    </div>
                                  ))
                                ) : (
                                  <p className="secMuted">
                                    Sin pagos registrados.
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="secMuted">No hay cursos registrados.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="mensaje_sin_resultados secEmpty">
                    🔍 No se encontraron resultados para esta búsqueda.
                  </p>
                )
              ) : (
                <p className="mensaje_sin_resultados secEmpty">
                  ✍️ Por favor, ingrese un criterio de búsqueda para comenzar.
                </p>
              )}
            </section>
          )}

          {/* ===================== PAGOS ===================== */}
          {activeSection === "pagos" && (
            <section className="secCard">
              <div className="secCardHeader">
                <h2 className="secTitle">📄 Listado</h2>
              </div>

              <div className="inputs_busqueda secFilters">
                <div className="input_group secInputGroup">
                  <input
                    type="text"
                    placeholder="Buscar por cédula..."
                    value={cedulaTemporal}
                    onChange={(e) => setCedulaTemporal(e.target.value)}
                    className="buscador_input secInput"
                  />
                </div>

                <div className="input_group secInputGroup">
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={busquedaTemporal}
                    onChange={(e) => setBusquedaTemporal(e.target.value)}
                    className="buscador_input secInput"
                  />
                </div>

                <div className="input_group secInputGroup">
                  <select
                    value={filtroDetalle}
                    onChange={(e) => setFiltroDetalle(e.target.value)}
                    className="buscador_input secInput"
                  >
                    <option value="">Aprobación</option>
                    <option value="true">Aprobado</option>
                    <option value="false">No aprobado</option>
                  </select>
                </div>

                <div className="input_group secInputGroup">
                  <select
                    value={filtroUltimoAcceso}
                    onChange={(e) => setFiltroUltimoAcceso(e.target.value)}
                    className="buscador_input secInput"
                  >
                    <option value="">Acceso a Acadex</option>
                    <option value="true">Accede</option>
                    <option value="false">No Accede</option>
                  </select>
                </div>

                <div className="input_group secInputGroup">
                  <select
                    value={filtroPago}
                    onChange={(e) => setFiltroPago(e.target.value)}
                    className="buscador_input secInput"
                  >
                    <option value="">Pagos</option>
                    <option value="true">Con pago</option>
                    <option value="false">Sin pago</option>
                  </select>
                </div>

                <div className="input_group secInputGroup">
                  <select
                    value={filtroCertificado}
                    onChange={(e) => setFiltroCertificado(e.target.value)}
                    className="buscador_input secInput"
                  >
                    <option value="">Certificados</option>
                    <option value="true">Con certificado</option>
                    <option value="false">Sin certificado</option>
                  </select>
                </div>

                <div className="input_group secInputGroup">
                  <select
                    value={filtroCurso}
                    onChange={(e) => setFiltroCurso(e.target.value)}
                    className="buscador_input secInput"
                  >
                    <option value="">Todos los cursos</option>
                    {courses?.map((c) => (
                      <option key={c.id} value={c.sigla}>
                        {c.sigla}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input_group secInputGroup">
                  <select
                    value={filtroObservacion}
                    onChange={(e) => setFiltroObservacion(e.target.value)}
                    className="buscador_input secInput"
                  >
                    <option value="">Observación</option>
                    <option value="true">Con observación</option>
                    <option value="false">Sin observación</option>
                  </select>
                </div>


                <div className="input_group secInputGroup">
                  <button
                    className="btn_buscar secBtnPrimary"
                    onClick={() => {
                      setNombreBuscado(busquedaTemporal);
                      setCedulaBuscada(cedulaTemporal);
                    }}
                  >
                    🔍 Buscar
                  </button>
                </div>

                <div className="input_group secInputGroup">
                  <button
                    className="btn_limpiar_filtros secBtnDanger"
                    onClick={() => {
                      setBusquedaTemporal("");
                      setCedulaTemporal("");
                      setCedulaBuscada("");
                      setNombreBuscado("");
                      setFiltroPago("");
                      setFiltroCertificado("");
                      setFiltroCurso("");
                      setFiltroObservacion("");
                      setFiltroDetalle("");
                      setFiltroUltimoAcceso("");
                    }}
                  >
                    ❌ Limpiar filtros
                  </button>
                </div>
              </div>

              <div className="paginacion secPagination">
                <div className="paginacion-flechas izquierda">
                  <button
                    onClick={() => {
                      setPaginaActual(1);
                      cargarDatosConQuery(1, limit);
                    }}
                    disabled={paginaActual === 1}
                  >
                    «
                  </button>
                  <button
                    onClick={() => {
                      const prev = Math.max(paginaActual - 1, 1);
                      setPaginaActual(prev);
                      cargarDatosConQuery(prev, limit);
                    }}
                    disabled={paginaActual === 1}
                  >
                    ‹
                  </button>
                </div>

                <div className="paginacion-numeros">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === totalPaginas ||
                        (n >= paginaActual - 2 && n <= paginaActual + 2),
                    )
                    .map((n, idx, arr) => (
                      <React.Fragment key={n}>
                        {idx > 0 && n - arr[idx - 1] > 1 && (
                          <span className="puntos">...</span>
                        )}
                        <button
                          onClick={() => {
                            setPaginaActual(n);
                            cargarDatosConQuery(n, limit);
                          }}
                          className={paginaActual === n ? "pagina-actual" : ""}
                        >
                          {n}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <div className="paginacion-flechas derecha">
                  <button
                    onClick={() => {
                      const next = Math.min(paginaActual + 1, totalPaginas);
                      setPaginaActual(next);
                      cargarDatosConQuery(next, limit);
                    }}
                    disabled={paginaActual === totalPaginas}
                  >
                    ›
                  </button>
                  <button
                    onClick={() => {
                      setPaginaActual(totalPaginas);
                      cargarDatosConQuery(totalPaginas, limit);
                    }}
                    disabled={paginaActual === totalPaginas}
                  >
                    »
                  </button>
                </div>
              </div>

              <div className="numero-registros secCount">
                Número de registros: {users?.total} / Página {paginaActual} de{" "}
                {totalPaginas}
              </div>

              <div className="contenedor-tabla-pagos secTableWrap">
                <table className="tabla-pagos secTable">
                  <thead>
                    <tr>
                      <th>Cédula</th>
                      <th>Grado</th>
                      <th className="col-curso">Nombre</th>
                      <th className="col-curso">Celular</th>
                      <th className="col-curso">Curso</th>
                      <th>Calificacion</th>
                      <th className="col-curso">Matriculado</th>
                      <th>Ingresa a Acadex</th>
                      <th>Pagos</th>
                      <th>Certificado</th>
                      <th>Seguimiento</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users?.data?.map((usuario) => {
                      const cursos = usuario.courses || [];

                      if (cursos.length === 0) {
                        return (
                          <tr key={usuario.id}>
                            <td>{usuario.cI}</td>
                            <td>{usuario.grado}</td>
                            <td className="col-curso">
                              {usuario.firstName} {usuario.lastName}
                            </td>
                            <td>{usuario.cellular}</td>
                            <td colSpan={7} style={{ textAlign: "center" }}>
                              Sin inscripciones
                            </td>
                          </tr>
                        );
                      }



                      return cursos.map((curso, idx) => (
                        <tr key={`${usuario.id}-${curso.id}`}>
                          {idx === 0 && (
                            <>
                              <td rowSpan={cursos.length}>{usuario.cI}</td>
                              <td rowSpan={cursos.length}>{usuario.grado}</td>
                              <td className="col-curso" rowSpan={cursos.length}>
                                {usuario.firstName} {usuario.lastName}
                              </td>
                              <td rowSpan={cursos.length}>
                                {(() => {
                                  const celular = String(
                                    usuario.cellular || "",
                                  ).replace(/\D/g, "");

                                  if (!celular || celular.length < 9) {
                                    return usuario.cellular || "";
                                  }

                                  const numeroWhatsapp = celular.startsWith("0")
                                    ? `593${celular.slice(1)}`
                                    : celular.startsWith("593")
                                      ? celular
                                      : `593${celular}`;

                                  return (
                                    <a
                                      href={`https://wa.me/${numeroWhatsapp}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#0b66c3",
                                        fontWeight: 700,
                                        textDecoration: "underline",
                                      }}
                                    >
                                      {usuario.cellular}
                                    </a>
                                  );
                                })()}
                              </td>
                            </>
                          )}

                          <td className="col-curso">{curso.fullname}</td>
                          <td>
                            {curso.grades?.["Nota Final"] ?? "Sin calificación"}
                          </td>
                          <td>{curso.matriculado ? "✅" : "❌"}</td>
                          <td>{curso.acces ? "✅" : "❌"}</td>

                          <td>
                            {curso.pagos?.length
                              ? curso.pagos.map((pago, i) => (
                                <div key={pago.id}>
                                  <a
                                    href={pago.pagoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Pago {i + 1}
                                  </a>
                                </div>
                              ))
                              : "----"}
                          </td>

                          <td>
                            {curso.certificado?.url ? (
                              <a
                                href={curso.certificado.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver
                              </a>
                            ) : (
                              "----"
                            )}
                          </td>

                          <td className="celda-seguimiento">
                            {curso.tieneSeguimiento ? (
                              <div className="seguimiento-resumen">
                                <span className="seguimiento-contador">
                                  📞 {curso.totalSeguimientos || 0}
                                </span>

                                <span className="seguimiento-estado">
                                  {curso.totalSeguimientos === 1
                                    ? "llamada registrada"
                                    : "llamadas registradas"}
                                </span>

                                {curso.ultimoSeguimiento?.resultado && (
                                  <span className="seguimiento-ultimo-resultado">
                                    Último:{" "}
                                    {String(curso.ultimoSeguimiento.resultado)
                                      .replaceAll("_", " ")
                                      .replace(/\b\w/g, (letra) => letra.toUpperCase())}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="seguimiento-sin-registros">
                                Sin llamadas
                              </span>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() => abrirModalSeguimiento(usuario, curso)}
                              className="vp-btn-edit"
                            >
                              📞 Seguimiento
                            </button>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===================== CERTIFICADOS ===================== */}
          {activeSection === "certificados" && (
            <section className="secCard">
              <div className="secCardHeader">
                <h2 className="secTitle">🎓 Certificados</h2>
              </div>

              <div className="inputs_busqueda secFilters">
                <div className="input_group secInputGroup">
                  <input
                    type="text"
                    className="buscador_input secInput"
                    placeholder="🔍 Buscar por cédula"
                    value={cedulaCertificado}
                    onChange={(e) => setCedulaCertificado(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="input_group secInputGroup">
                  <input
                    type="text"
                    className="buscador_input secInput"
                    placeholder="🔍 Buscar por nombres y apellidos"
                    value={nombreCertificado}
                    onChange={(e) => setNombreCertificado(e.target.value)}
                    autoComplete="off"
                  />

                  {sugerenciasCertificados.length > 0 && (
                    <ul className="sugerencias_lista secSuggest" role="listbox">
                      {sugerenciasCertificados.map((sug) => (
                        <li
                          key={sug.id}
                          onClick={() => seleccionarSugerenciaCertificado(sug)}
                          className="sugerencia_item secSuggestItem"
                          role="option"
                        >
                          {sug.nombres} {sug.apellidos} — {sug.cedula}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  className="btn_buscar secBtnPrimary"
                  onClick={handleBuscarCertificados}
                >
                  🔍 Buscar
                </button>

                <button
                  className="btn_limpiar_filtros secBtnDanger"
                  onClick={limpiarFiltrosCertificados}
                >
                  ❌ Borrar filtros
                </button>
              </div>

              {certificadosFiltrados.length === 0 ? (
                nombreCertificado.trim() === "" &&
                  cedulaCertificado.trim() === "" ? (
                  <p className="mensaje_sin_resultados secEmpty">
                    ✍️ Por favor, ingrese un criterio de búsqueda para comenzar.
                  </p>
                ) : (
                  <p className="mensaje_sin_resultados secEmpty">
                    🔍 No se encontraron certificados para esta búsqueda.
                  </p>
                )
              ) : (
                <div className="secResults">
                  {certificadosFiltrados.map((c) => (
                    <div key={c.id} className="card_inscripcion secCardInner">
                      <h3>
                        {c.nombres} {c.apellidos}
                      </h3>
                      <p>
                        <strong>Cédula:</strong> {c.cedula}
                      </p>
                      <p>
                        <strong>Grado:</strong> {c.grado}
                      </p>
                      <p>
                        <strong>Curso:</strong>{" "}
                        {(() => {
                          const cursoEncontrado = courses.find(
                            (course) =>
                              course.sigla.toLowerCase() ===
                              c.curso.toLowerCase(),
                          );
                          return cursoEncontrado
                            ? cursoEncontrado.nombre
                            : c.curso;
                        })()}
                      </p>

                      <p>
                        <strong>Depósito:</strong> ${c.deposito}
                      </p>
                      <p>
                        <strong>Fecha:</strong> {c.certificadoCreatedAt}
                      </p>
                      <p>
                        <strong>Grupo:</strong> {c.grupo}
                      </p>

                      {c.urlDeposito === "EXTERNO" ? (
                        <p className="pendiente_certificado">
                          🌐 Comprobante externo
                        </p>
                      ) : (
                        <a
                          className="btn_ver_comprobante secBtnLink"
                          href={c.urlDeposito}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📄 Ver comprobante <span>➜</span>
                        </a>
                      )}

                      <br />

                      {c.url ? (
                        <a
                          className="btn_certificado"
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          🎓 Ver certificado
                        </a>
                      ) : (
                        <p className="pendiente_certificado">
                          📌 Por certificar
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Secretaria;
