import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./styles/Dashboard.css";
import useCrud from "../hooks/useCrud";
import CustomLabel from "../components/Home/CustomLabel";

const Dashboard = () => {
  const [courses, getCourses] = useCrud();

  const [inscripcionDashboard, getInscipcionDashboard, , , , , isLoading] =
    useCrud();
  const [pagoDashboard, getPagoDashboard, , , , , isLoading2] = useCrud();
  const [
    inscripcionDashboardObservacion,
    getInscipcionDashboardObservacion,
    ,
    ,
    ,
    ,
    isLoading3,
  ] = useCrud();

  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [usuarioEdicion, setusUarioEdicion] = useState("todos");
  const [cursoFiltroObservaciones, setCursoFiltroObservaciones] =
    useState("todos");
  const [resultadoSeguimientoFiltro, setResultadoSeguimientoFiltro] =
    useState("todos");
  const [fechaDesdeObservaciones, setFechaDesdeObservaciones] = useState("");
  const [fechaHastaObservaciones, setFechaHastaObservaciones] = useState("");

  const [verificadoFiltro, setVerificadoFiltro] = useState("todos");
  const [cursoFiltro, setCursoFiltro] = useState("todos");
  const [fechaDesdePagos, setFechaDesdePagos] = useState("");
  const [fechaHastaPagos, setFechaHastaPagos] = useState("");

  const [cursoFiltroInscripciones, setCursoFiltroInscripciones] = useState("todos");
  const [fechaDesdeInscripciones, setFechaDesdeInscripciones] = useState("");
  const [fechaHastaInscripciones, setFechaHastaInscripciones] = useState("");



  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const PATH_COURSES = "/courses";

  useEffect(() => {
    getCourses(PATH_COURSES);
  }, []);

  useEffect(() => {
    getInscipcionDashboard(
      `/inscripcion_dashboard?desde=${fechaDesdeInscripciones}&hasta=${fechaHastaInscripciones}&curso=${cursoFiltroInscripciones}`
    );
  }, [fechaDesdeInscripciones, fechaHastaInscripciones, cursoFiltroInscripciones]);

  useEffect(() => {
    getInscipcionDashboardObservacion(
      `/seguimiento_dashboard?desde=${fechaDesdeObservaciones}&hasta=${fechaHastaObservaciones}&curso=${cursoFiltroObservaciones}&usuarioEdicion=${usuarioEdicion}&resultado=${resultadoSeguimientoFiltro}`
    );
  }, [
    fechaDesdeObservaciones,
    fechaHastaObservaciones,
    cursoFiltroObservaciones,
    usuarioEdicion,
    resultadoSeguimientoFiltro,
  ]);

  useEffect(() => {
    getPagoDashboard(
      `/pagos_dashboard?desde=${fechaDesdePagos}&hasta=${fechaHastaPagos}&curso=${cursoFiltro}&verificado=${verificadoFiltro}`
    );
  }, [fechaHastaPagos, fechaDesdePagos, cursoFiltro, verificadoFiltro]);

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

    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const limpiarFiltrosGlobales = () => {
    setFechaDesde("");
    setFechaHasta("");

    setCursoFiltro("todos");
    setVerificadoFiltro("todos");
    setFechaDesdePagos("");
    setFechaHastaPagos("");

    setFechaDesdeInscripciones("");
    setFechaHastaInscripciones("");
    setCursoFiltroInscripciones("");

    setusUarioEdicion("todos");
    setCursoFiltroObservaciones("todos");
    setFechaDesdeObservaciones("");
    setFechaHastaObservaciones("");
    setResultadoSeguimientoFiltro("todos");
  };

  const cursosUnicos = inscripcionDashboard?.inscritosPorCurso?.map((c) => c.curso) || [];


  const renderContent = () => {
    switch (activeSection) {
      case "resumen": {
        const totalInscritosF = inscripcionDashboard?.totalInscritos || 0;
        const totalDepositado = pagoDashboard?.totalPagos || 0;
        const totalCertificados = pagoDashboard?.totalPagosDinstint || 0;

        return (
          <section className="secCard dashCard">
            <div className="secCardHeader">
              <h2 className="secTitle">📋 Resumen General</h2>
            </div>

            <div className="secFilters dashFilters">
              <div className="secInputGroup">
                <label className="dashLabel">Desde:</label>
                <input
                  className="secInput"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => {
                    setFechaDesde(e.target.value);
                    setFechaDesdeInscripciones(e.target.value);
                    setFechaDesdePagos(e.target.value);

                  }}
                />
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">Hasta:</label>
                <input
                  className="secInput"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value);
                    setFechaHastaInscripciones(e.target.value);
                    setFechaHastaPagos(e.target.value);
                  }}
                />
              </div>



              <button
                className="secBtnDanger"
                type="button"
                onClick={limpiarFiltrosGlobales}
              >
                ❌ Eliminar filtros
              </button>
            </div>

            <div className="dashSummaryGrid">
              <div className="dashSummaryCard">
                <h3>Total de inscritos</h3>
                <p className="dashBigNumber">{totalInscritosF}</p>
              </div>

              <div className="dashSummaryCard">
                <div className="dashSummary2">
                  <div>
                    <h3>Total depositado</h3>
                    <p className="dashBigNumber">
                      ${Number(totalDepositado).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <h3>Total Certificados</h3>
                    <p className="dashBigNumber">{totalCertificados}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      case "inscripciones": {
        return (
          <section className="secCard dashCard">
            <div className="secCardHeader">
              <h2 className="secTitle">🧾 Inscripciones</h2>
            </div>

            <div className="secFilters dashFilters">
              <div className="secInputGroup">
                <label className="dashLabel">Desde:</label>
                <input
                  className="secInput"
                  type="date"
                  value={fechaDesdeInscripciones}
                  onChange={(e) => setFechaDesdeInscripciones(e.target.value)}
                />
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">Hasta:</label>
                <input
                  className="secInput"
                  type="date"
                  value={fechaHastaInscripciones}
                  onChange={(e) => setFechaHastaInscripciones(e.target.value)}
                />
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">Filtrar por curso:</label>
                <select
                  className="secInput"
                  value={cursoFiltroInscripciones}
                  onChange={(e) => setCursoFiltroInscripciones(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {cursosUnicos.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              </div>


              <button
                className="secBtnDanger"
                type="button"
                onClick={limpiarFiltrosGlobales}
              >
                ❌ Eliminar filtros
              </button>
            </div>

            <div className="dashSummaryGrid">
              <div className="dashSummaryCard">
                <h3>Total de inscritos</h3>
                <p className="dashBigNumber">
                  {inscripcionDashboard?.totalInscritos ?? 0}
                </p>
              </div>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">Inscritos por grado</h4>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={inscripcionDashboard?.inscritosPorGrado || []}>
                  <XAxis dataKey="grado" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#0f2a63" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">Franja horaria de inscripción</h4>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={inscripcionDashboard?.inscritosPorFranjaHoraria || []}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {(inscripcionDashboard?.inscritosPorFranjaHoraria || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#0f2a63",
                              "#1b326b",
                              "#ffb703",
                              "#00a8e8",
                              "#1de9b6",
                              "#ff7c43",
                            ][index % 6]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">Inscritos por subsistema</h4>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={inscripcionDashboard?.inscritosPorSubsistema || []}
                >
                  <XAxis dataKey="subsistema" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#0f2a63" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">Evolutivo diario de inscripciones</h4>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={inscripcionDashboard?.inscritosPorDia || []}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cantidad"
                    stroke="#0f2a63"
                    strokeWidth={2}
                    label={<CustomLabel />}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        );
      }

      case "pagos": {
        const cursosUnicos =
          pagoDashboard?.pagosPorCurso?.map((c) => c.curso) || [];

        const conteoDistMoneda = pagoDashboard?.conteoDistMoneda || [];
        const totalMonedas = pagoDashboard?.totalMonedas || 0;
        const totalDistintivos = pagoDashboard?.totalDistintivos || 0;
        const totalConceptos = pagoDashboard?.totalConceptos || 0;
        const totalPagos = pagoDashboard?.totalPagos || 0;
        const pagosPorGrado = pagoDashboard?.pagosPorGrado || [];
        const pagosPorFecha = pagoDashboard?.pagosPorFecha || [];

        return (
          <section className="secCard dashCard">
            <div className="secCardHeader">
              <h2 className="secTitle">💳 Pagos</h2>
            </div>

            <div className="secFilters dashFilters">
              <div className="secInputGroup">
                <label className="dashLabel">Filtrar por curso:</label>
                <select
                  className="secInput"
                  value={cursoFiltro}
                  onChange={(e) => setCursoFiltro(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {cursosUnicos.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">Filtrar por verificación:</label>
                <select
                  className="secInput"
                  value={verificadoFiltro}
                  onChange={(e) => setVerificadoFiltro(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="verificados">Verificados</option>
                  <option value="no_verificados">No Verificados</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">Desde:</label>
                <input
                  className="secInput"
                  type="date"
                  value={fechaDesdePagos}
                  onChange={(e) => setFechaDesdePagos(e.target.value)}
                />
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">Hasta:</label>
                <input
                  className="secInput"
                  type="date"
                  value={fechaHastaPagos}
                  onChange={(e) => setFechaHastaPagos(e.target.value)}
                />
              </div>

              <button
                className="secBtnDanger"
                type="button"
                onClick={limpiarFiltrosGlobales}
              >
                ❌ Eliminar filtros
              </button>
            </div>

            <div className="dashSummaryGrid">
              <div className="dashSummaryCard">
                <div className="dashSummary2">
                  <div>
                    <h3>Total depositado</h3>
                    <p className="dashBigNumber">${Number(totalPagos).toFixed(2)}</p>
                  </div>
                  <div>
                    <h3>Total Certificados</h3>
                    <p className="dashBigNumber">
                      {pagoDashboard?.totalPagosDinstint || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">Pagos con Distintivo vs Moneda</h4>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={conteoDistMoneda}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {conteoDistMoneda.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#0f2a63", "#ffb703"][index % 2]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="dashTotalsBox">
                <h4 className="dashChartTitle">Total Recaudado por conceptos</h4>
                <p className="dashBigNumber">${Number(totalConceptos).toFixed(2)}</p>
                <p className="dashHelp">
                  (Moneda: {totalMonedas}, Distintivo: {totalDistintivos})
                </p>
              </div>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">Evolutivo diario de pagos</h4>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={pagosPorFecha}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#0f2a63"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">Pagos por grado</h4>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pagosPorGrado}>
                  <XAxis dataKey="grado" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#0f2a63" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        );
      }










      case "calificaciones": {
        const llamadasPorDia =
          inscripcionDashboardObservacion?.llamadasPorDia || [];

        const llamadasPorFranja =
          inscripcionDashboardObservacion?.llamadasPorFranja || [];

        const llamadasPorResultado =
          inscripcionDashboardObservacion?.llamadasPorResultado || [];

        const conversionPorUsuario =
          inscripcionDashboardObservacion?.conversionPorUsuario || [];

        const conversionPorCurso =
          inscripcionDashboardObservacion?.conversionPorCurso || [];

        const totalLlamadas =
          inscripcionDashboardObservacion?.totalLlamadas || 0;

        const totalContactados =
          inscripcionDashboardObservacion?.totalContactados || 0;

        const totalCompras =
          inscripcionDashboardObservacion?.totalCompras || 0;

        const montoVentas =
          inscripcionDashboardObservacion?.montoVentas || 0;

        const tasaConversion =
          inscripcionDashboardObservacion?.tasaConversion || 0;

        const promedioLlamadasPorCompra =
          inscripcionDashboardObservacion?.promedioLlamadasPorCompra || 0;

        const usuariosUnicos = [
          ...new Set(
            conversionPorUsuario
              .map((item) => item.usuario)
              .filter(Boolean)
          ),
        ];

        const formatearResultado = (resultado) =>
          String(resultado || "")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letra) => letra.toUpperCase());

        return (
          <section className="secCard dashCard">
            <div className="secCardHeader">
              <h2 className="secTitle">
                📞 Seguimiento de llamadas y conversión
              </h2>
            </div>

            <div className="secFilters dashFilters">
              <div className="secInputGroup">
                <label className="dashLabel">
                  Filtrar por curso:
                </label>

                <select
                  className="secInput"
                  value={cursoFiltroObservaciones}
                  onChange={(e) =>
                    setCursoFiltroObservaciones(e.target.value)
                  }
                >
                  <option value="todos">Todos</option>

                  {courses?.map((curso) => (
                    <option
                      key={curso.id}
                      value={curso.sigla}
                    >
                      {curso.sigla}
                    </option>
                  ))}
                </select>
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">
                  Usuario responsable:
                </label>

                <select
                  className="secInput"
                  value={usuarioEdicion}
                  onChange={(e) =>
                    setusUarioEdicion(e.target.value)
                  }
                >
                  <option value="todos">Todos</option>

                  {usuariosUnicos.map((usuario) => (
                    <option
                      key={usuario}
                      value={usuario}
                    >
                      {usuario}
                    </option>
                  ))}
                </select>
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">
                  Resultado:
                </label>

                <select
                  className="secInput"
                  value={resultadoSeguimientoFiltro}
                  onChange={(e) =>
                    setResultadoSeguimientoFiltro(e.target.value)
                  }
                >
                  <option value="todos">Todos</option>
                  <option value="sin_respuesta">
                    Sin respuesta
                  </option>
                  <option value="numero_incorrecto">
                    Número incorrecto
                  </option>
                  <option value="interesado">
                    Interesado
                  </option>
                  <option value="no_interesado">
                    No interesado
                  </option>
                  <option value="volver_llamar">
                    Volver a llamar
                  </option>
                  <option value="pago_pendiente">
                    Pago pendiente
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">Desde:</label>

                <input
                  className="secInput"
                  type="date"
                  value={fechaDesdeObservaciones}
                  onChange={(e) =>
                    setFechaDesdeObservaciones(e.target.value)
                  }
                />
              </div>

              <div className="secInputGroup">
                <label className="dashLabel">Hasta:</label>

                <input
                  className="secInput"
                  type="date"
                  value={fechaHastaObservaciones}
                  onChange={(e) =>
                    setFechaHastaObservaciones(e.target.value)
                  }
                />
              </div>

              <button
                className="secBtnDanger"
                type="button"
                onClick={() => {
                  setusUarioEdicion("todos");
                  setCursoFiltroObservaciones("todos");
                  setResultadoSeguimientoFiltro("todos");
                  setFechaDesdeObservaciones("");
                  setFechaHastaObservaciones("");
                }}
              >
                ❌ Eliminar filtros
              </button>
            </div>

            <div className="dashSummaryGrid">
              <div className="dashSummaryCard">
                <h3>Total de llamadas</h3>
                <p className="dashBigNumber">
                  {totalLlamadas}
                </p>
              </div>

              <div className="dashSummaryCard">
                <h3>Personas contactadas</h3>
                <p className="dashBigNumber">
                  {totalContactados}
                </p>
              </div>

              <div className="dashSummaryCard">
                <h3>Compras generadas</h3>
                <p className="dashBigNumber">
                  {totalCompras}
                </p>
              </div>

              <div className="dashSummaryCard">
                <h3>Tasa de conversión</h3>
                <p className="dashBigNumber">
                  {Number(tasaConversion).toFixed(2)}%
                </p>
              </div>

              <div className="dashSummaryCard">
                <h3>Monto vendido</h3>
                <p className="dashBigNumber">
                  ${Number(montoVentas).toFixed(2)}
                </p>
              </div>

              <div className="dashSummaryCard">
                <h3>Llamadas por compra</h3>
                <p className="dashBigNumber">
                  {Number(promedioLlamadasPorCompra).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">
                Evolutivo diario de llamadas
              </h4>

              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={llamadasPorDia}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="cantidad"
                    name="Llamadas"
                    stroke="#0f2a63"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">
                Llamadas por franja horaria
              </h4>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={llamadasPorFranja}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {llamadasPorFranja.map((item, index) => (
                      <Cell
                        key={`${item.label}-${index}`}
                        fill={
                          [
                            "#0f2a63",
                            "#1b326b",
                            "#ffb703",
                            "#00a8e8",
                            "#1de9b6",
                            "#ff7c43",
                          ][index % 6]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">
                Resultados de las llamadas
              </h4>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={llamadasPorResultado}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="resultado"
                    tickFormatter={formatearResultado}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip
                    labelFormatter={formatearResultado}
                  />

                  <Bar
                    dataKey="cantidad"
                    name="Llamadas"
                    fill="#568416"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">
                Rendimiento por usuario
              </h4>

              <ResponsiveContainer width="100%" height={330}>
                <BarChart data={conversionPorUsuario}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="usuario"
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={75}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Monto vendido") {
                        return [
                          `$${Number(value).toFixed(2)}`,
                          name,
                        ];
                      }

                      if (name === "Conversión") {
                        return [
                          `${Number(value).toFixed(2)}%`,
                          name,
                        ];
                      }

                      return [value, name];
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="llamadas"
                    name="Llamadas"
                    fill="#0f2a63"
                  />

                  <Bar
                    dataKey="contactados"
                    name="Contactados"
                    fill="#00a8e8"
                  />

                  <Bar
                    dataKey="compras"
                    name="Compras"
                    fill="#568416"
                  />
                </BarChart>
              </ResponsiveContainer>

              {conversionPorUsuario.length > 0 && (
                <div className="dashTableWrap">
                  <table className="dashDataTable">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Llamadas</th>
                        <th>Contactados</th>
                        <th>Compras</th>
                        <th>Conversión</th>
                        <th>Monto</th>
                      </tr>
                    </thead>

                    <tbody>
                      {conversionPorUsuario.map((item) => (
                        <tr key={item.usuario}>
                          <td>{item.usuario}</td>
                          <td>{item.llamadas}</td>
                          <td>{item.contactados}</td>
                          <td>{item.compras}</td>
                          <td>
                            {Number(
                              item.tasaConversion || 0
                            ).toFixed(2)}
                            %
                          </td>
                          <td>
                            $
                            {Number(
                              item.monto || 0
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="dashChartBox">
              <h4 className="dashChartTitle">
                Conversión por curso
              </h4>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={conversionPorCurso}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="curso" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="llamadas"
                    name="Llamadas"
                    fill="#0f2a63"
                  />

                  <Bar
                    dataKey="contactados"
                    name="Contactados"
                    fill="#00a8e8"
                  />

                  <Bar
                    dataKey="compras"
                    name="Compras"
                    fill="#568416"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        );
      }









      case "progreso":
        return (
          <section className="secCard dashCard">
            <div className="secCardHeader">
              <h2 className="secTitle">📈 Progreso</h2>
            </div>
            <p className="secMuted">Próximamente podrás ver tu progreso académico.</p>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="secPage dashPage">
      {(isLoading || isLoading2 || isLoading3) && (
        <div className="dashLoadingNote" aria-hidden="true" />
      )}

      {/* Overlay mobile */}
      <div
        className={`secOverlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <div className="dashboard_container secShell dashShell">
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
          className={`dashboard_menu secMenu ${menuOpen ? "open" : ""}`}
          ref={menuRef}
        >
          <div className="secMenuHeader">
            <img src="/images/cumanda_sf.png" alt="Eduka" className="secMenuLogo" />
            <p className="secMenuSubtitle">Dashboard</p>
          </div>

          <button
            className={`menu-btn secMenuBtn ${activeSection === "resumen" ? "active" : ""
              }`}
            onClick={() => {
              setActiveSection("resumen");
              setMenuOpen(false);
            }}
          >
            📋 Resumen General
          </button>

          <button
            className={`menu-btn secMenuBtn ${activeSection === "inscripciones" ? "active" : ""
              }`}
            onClick={() => {
              setActiveSection("inscripciones");
              setMenuOpen(false);
            }}
          >
            🧾 Inscripciones
          </button>

          <button
            className={`menu-btn secMenuBtn ${activeSection === "pagos" ? "active" : ""
              }`}
            onClick={() => {
              setActiveSection("pagos");
              setMenuOpen(false);
            }}
          >
            💳 Pagos
          </button>

          <button
            className={`menu-btn secMenuBtn ${activeSection === "calificaciones" ? "active" : ""
              }`}
            onClick={() => {
              setActiveSection("calificaciones");
              setMenuOpen(false);
            }}
          >
            📝 Llamadas
          </button>

          <button
            className={`menu-btn secMenuBtn ${activeSection === "progreso" ? "active" : ""
              }`}
            onClick={() => {
              setActiveSection("progreso");
              setMenuOpen(false);
            }}
          >
            📈 Progreso
          </button>
        </nav>

        <main className="secretaria_content secContent dashContent">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
