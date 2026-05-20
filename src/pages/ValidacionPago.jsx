import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./styles/ValidacionPago.css";
import useCrud from "../hooks/useCrud";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useAuth from "../hooks/useAuth";
import IsLoading from "../components/shared/isLoading";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";


const BASEURL = import.meta.env.VITE_API_URL;
const SUPERADMIN = import.meta.env.VITE_CI_SUPERADMIN;

const PATH_PAGOS = "/pagos";
const PATH_VARIABLES = "/variables";
// guarda posición


const ValidacionPago = () => {
  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const contentRef = useRef(null);        // el contenedor que scrollea
  const scrollPosRef = useRef(0);
  const lastClickedRef = useRef(null);
  const hamburgerRef = useRef();
  const dispatch = useDispatch();

  const { register, handleSubmit, reset } = useForm();

  const [, , , loggedUser, , , , , , , , , , user] = useAuth();
  const [pagoDashboard, getPagoDashboard] = useCrud();
  const [inscripcion, getInscripcion] = useCrud();
  const [variables, getVariables] = useCrud();

  const [showDelete, setShowDelete] = useState(false);
  const [pagoIdDelete, setPagoIdDelete] = useState(null);

  const [showRestaurar, setShowRestaurar] = useState(false);
  const [pagoIdRestaurar, setPagoIdRestaurar] = useState(null);

  const [papelera, setPapelera] = useState(false);
  const [verificadoOriginal, setVerificadoOriginal] = useState(false);


  const [pago, getPago, , , updatePago, error, isLoading] = useCrud();

  const [editPagoId, setEditPagoId] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [editVerificado, setEditVerificado] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [editingEntregaId, setEditingEntregaId] = useState(null);

  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroVerificado, setFiltroVerificado] = useState("");
  const [filtroMoneda, setFiltroMoneda] = useState("");
  const [filtroDistintivo, setFiltroDistintivo] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroEntregado, setFiltroEntregado] = useState("");

  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  const [filtroCertificado, setFiltroCertificado] = useState("");

  const [ordenFechaDesc, setOrdenFechaDesc] = useState(true);


  const getScroller = () => {
    const el = contentRef.current;
    if (!el) return window;

    const st = getComputedStyle(el);
    const overflowY = st.overflowY;
    const canScroll =
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 2;

    return canScroll ? el : window; // ✅ si main no puede scrollear, usa window
  };

  const saveScroll = () => {
    const scroller = getScroller();
    scrollPosRef.current = scroller === window ? window.scrollY : scroller.scrollTop;
  };

const SCROLL_OFFSET = -100; // 👈 ajusta a gusto (80, 120, 160...)

const restoreScroll = () => {
  const scroller = getScroller();
  const top = Math.max(0, scrollPosRef.current - SCROLL_OFFSET);

  if (scroller === window) window.scrollTo(0, top);
  else scroller.scrollTop = top;
};



  useEffect(() => {
    if (error) {
      const message = error.response?.data?.message ?? "Error inesperado";
      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        })
      );
    }
  }, [error]);


  useEffect(() => {
    const handler = setTimeout(() => setFiltroGrado(inputValue), 2000);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useLayoutEffect(() => {
    if (editPagoId == null) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restoreScroll();

        // opcional: evitar que el focus auto provoque scroll
        if (lastClickedRef.current?.focus) {
          try {
            lastClickedRef.current.focus({ preventScroll: true });
          } catch {
            lastClickedRef.current.focus();
          }
        }
      });
    });
  }, [editPagoId]);




  useEffect(() => {
    getPago(
      `/pagos?curso=${filtroCurso}&verificado=${filtroVerificado}&moneda=${filtroMoneda}&distintivo=${filtroDistintivo}&entregado=${filtroEntregado}&certificado=${filtroCertificado}&busqueda=${filtroGrado}&fechaInicio=${filtroFechaInicio}&fechaFin=${filtroFechaFin}`
    );

    const socket = io(BASEURL);
    socket.on("pagoActualizado", () => getPago(PATH_PAGOS));

    return () => socket.disconnect();
  }, [
    filtroCurso,
    filtroVerificado,
    filtroMoneda,
    filtroDistintivo,
    filtroGrado,
    filtroFechaInicio,
    filtroFechaFin,
    filtroEntregado,
    filtroCertificado,
  ]);

  const pagosActivos = [];
  const pagosEliminados = [];
  const pagosDistintivos = [];

  for (const pagoItem of pago) {
    if (pagoItem.confirmacion) pagosActivos.push(pagoItem);
    else pagosEliminados.push(pagoItem);

    if (pagoItem.confirmacion && (pagoItem.distintivo || pagoItem.moneda)) {
      pagosDistintivos.push(pagoItem);
    }
  }

  useEffect(() => {
    getPago(PATH_PAGOS);
    getVariables(PATH_VARIABLES);
    getInscripcion("/inscripcion");
    loggedUser();
    getPagoDashboard(`/pagos_dashboard`);
  }, []);

  const iniciarEdicion = (p, e) => {
    lastClickedRef.current = e?.currentTarget || null;
    saveScroll();

    setEditPagoId(p.id);
    setVerificadoOriginal(!!p.verificado);

    reset({
      valorDepositado: p.valorDepositado || "",
      entidad: p.entidad || "",
      idDeposito: p.idDeposito || "",
      verificado: !!p.verificado,
      moneda: !!p.moneda,
      distintivo: !!p.distintivo,
      observacion: p.observacion || "",
    });
  };





  const cancelarEdicion = () => {
    setEditPagoId(null);
    setObservacion("");
    setEditVerificado(false);
  };

  const guardarEdicion = async (pagoId, data) => {
    try {
      // ✅ Confirmación SOLO si BD era false y ahora el input viene true
      if (verificadoOriginal === false && data.verificado === true) {
        const ok = window.confirm(
          "⚠️ Al marcar este pago como VERIFICADO se emitirá el certificado.\n\n¿Deseas continuar?"
        );
        if (!ok) return; // ❌ no actualiza nada
      }

      await updatePago(PATH_PAGOS, pagoId, {
        ...data,
        valorDepositado: parseFloat(data.valorDepositado),
        usuarioEdicion: user.email,
      });

      await getPago(PATH_PAGOS);
      cancelarEdicion();
    } catch (error) {
      alert("Error al guardar los cambios.");
    }
  };


  const deletePagoPr = async (id) => {
    try {
      await updatePago(PATH_PAGOS, id, { confirmacion: false });
      await getPago(PATH_PAGOS);
      cancelarEdicion();
      setShowDelete(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    }
  };

  const restaurarPagoPr = async (id) => {
    try {
      await updatePago(PATH_PAGOS, id, { confirmacion: true });
      await getPago(PATH_PAGOS);
      cancelarEdicion();
      setShowRestaurar(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    }
  };

  const getListaCursos = (arr) => {
    const cursosSet = new Set();
    arr.forEach((p) => p.curso && cursosSet.add(p.curso));
    return Array.from(cursosSet);
  };

  const listaCursos = getListaCursos(pago);

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

  const ordenarPorFecha = (array) => {
    return [...array].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return ordenFechaDesc ? dateB - dateA : dateA - dateB;
    });
  };

  const pagosOrdenados = ordenarPorFecha(pagosActivos);

  const descargarExcel = () => {
    const datosExcel = pagosActivos.map((p) => ({
      Grado: p?.inscripcion?.user?.grado || "",
      Nombres: p?.inscripcion?.user?.firstName || "",
      Apellidos: p?.inscripcion?.user?.lastName || "",
      Cedula: p?.inscripcion?.user?.cI || "",
      Curso: p.curso || "",
      "Valor Depositado": p.valorDepositado?.toFixed(2) || "0.00",
      Comprobante: p.pagoUrl || "",
      Verificado: p.verificado ? "Sí" : "No",
      Fecha: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
      Email: p?.inscripcion?.user?.email || "",
      Celular: p?.inscripcion?.user?.cellular || "",
    }));

    

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagos");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "pagos_filtrados.xlsx");


    
  };

  const descargarExcelInscripcion = () => {
    const datosExcel = [...inscripcion]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((i) => ({
        id: i?.id || "",
        grado: i?.user?.grado || "",
        nombres: i?.user?.firstName || "",
        apellidos: i?.user?.lastName || "",
        cedula: i?.user?.cI || "",
        email: i?.user?.email || "",
        aceptacion: i?.aceptacion || "",
        curso: i?.curso || "",
        userId: i?.userId || "",
        createdAt: i?.createdAt || "",
        updatedAt: i?.updatedAt || "",
        courseId: i?.courseId || "",
        observacion: i?.observacion || "",
        usuarioEdicion: i?.usuarioEdicion || "",
      }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "inscripcion");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "inscripciones.xlsx");
  };

  const limpiarFiltrosBase = () => {
    setFiltroCurso("");
    setFiltroVerificado("");
    setFiltroMoneda("");
    setFiltroDistintivo("");
    setFiltroGrado("");
    setInputValue("");
    setFiltroEntregado("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
    setFiltroCertificado("");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">📋 Resumen General</h2>
            </div>

            {!pagoDashboard ? (
              <p className="secEmpty">Cargando resumen...</p>
            ) : (
              <div className="vpResumenGrid">
                <div className="vpStatCard">
                  <div className="vpStatLabel">Total Pagos / Validados</div>
                  <div className="vpStatValue">
                    <span className="vpStatMain">{pagoDashboard.totalPagosNum}</span>
                    <span className="vpStatSep">/</span>
                    <span className="vpStatOk">{pagoDashboard.totalPagosVerificados}</span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">Monedas / Entregadas</div>
                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {pagoDashboard.conteoDistMoneda?.find((c) => c.name === "Moneda")?.value || 0}
                    </span>
                    <span className="vpStatSep">/</span>
                    <span className="vpStatOk">
                      {pagoDashboard.conteoDistMoneda?.find((c) => c.name === "Moneda")?.entregado || 0}
                    </span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">Distintivos / Entregados</div>
                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {pagoDashboard.conteoDistMoneda?.find((c) => c.name === "Distintivo")?.value || 0}
                    </span>
                    <span className="vpStatSep">/</span>
                    <span className="vpStatOk">
                      {pagoDashboard.conteoDistMoneda?.find((c) => c.name === "Distintivo")?.entregado || 0}
                    </span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">Certificados pagados</div>
                  <div className="vpStatValue">
                    <span className="vpStatMain">{pagoDashboard.totalPagosDinstint}</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        );

      case "validarPagos":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">✅ Validar Pagos</h2>
            </div>

            <div className="secFilters vpFiltersRow">
              <button className="secBtnDanger" onClick={limpiarFiltrosBase} type="button">
                ❌ Eliminar filtros
              </button>

              <div className="secInputGroup">
                <label className="vpLbl">Curso</label>
                <select className="secInput" value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
                  <option value="">Todos</option>
                  {listaCursos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Verificado</label>
                <select className="secInput" value={filtroVerificado} onChange={(e) => setFiltroVerificado(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Moneda</label>
                <select className="secInput" value={filtroMoneda} onChange={(e) => setFiltroMoneda(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Distintivo</label>
                <select className="secInput" value={filtroDistintivo} onChange={(e) => setFiltroDistintivo(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Grado / Nombres / Apellidos / Cédula</label>
                <input
                  className="secInput"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Buscar..."
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha inicio</label>
                <input className="secInput" type="date" value={filtroFechaInicio} onChange={(e) => setFiltroFechaInicio(e.target.value)} />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha fin</label>
                <input className="secInput" type="date" value={filtroFechaFin} onChange={(e) => setFiltroFechaFin(e.target.value)} />
              </div>

              <button
                className="secBtnPrimary vpTrashBtn"
                type="button"
                onClick={() => setPapelera(!papelera)}
                title={papelera ? "Volver a activos" : "Ver eliminados"}
              >
                {papelera ? "↩️ Activos" : "🗑️ Papelera"}
              </button>
            </div>

            {papelera ? (
              <p className="vpInfoDanger">Mostrando {pagosEliminados.length} registros eliminados</p>
            ) : (
              <p className="vpInfo">
                Mostrando {pagosActivos.length} resultados /{" "}
                <span className="vpInfoOk">{pagosActivos.filter((p) => p.verificado).length} pagos validados</span>
              </p>
            )}

            {(papelera ? pagosEliminados : pagosOrdenados)?.length ? (
              <div className="secTableWrap">
                <table className="secTable vpTable">
                  <thead>
                    <tr>
                      <th>Discente</th>
                      <th
                        className="vpThSortable"
                        onClick={() => setOrdenFechaDesc((prev) => !prev)}
                        title="Ordenar por fecha"
                      >
                        Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                      </th>
                      <th>Curso</th>
                      <th>Distin</th>
                      <th>Mon</th>
                      <th>Valor</th>
                      <th>Entidad</th>
                      <th>Id Pago</th>
                      <th>Comp</th>
                      <th>Verif</th>
                      <th>Obser</th>
                      <th>Editor</th>
                      <th colSpan={papelera ? 1 : 2}>{papelera ? "Restaurar" : "Acción"}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(papelera ? pagosEliminados : pagosOrdenados).map((p) => {
                      const isEditing = editPagoId === p.id;

                      return (
                        <tr key={p.id}>
                          <td className="vpTdWrap">
                            {p
                              ? `${p?.inscripcion?.user?.grado} ${p?.inscripcion?.user?.firstName} ${p?.inscripcion?.user?.lastName}`
                              : "Sin Inscripción"}
                          </td>

                          <td>
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                          </td>

                          <td className="vpTdWrap">{p.curso}</td>

                          <td style={{ textAlign: "center" }}>
                            {papelera ? (p.distintivo ? "✅" : "❌") : isEditing ? <input type="checkbox" {...register("distintivo")} /> : (p.distintivo ? "✅" : "❌")}
                          </td>

                          <td style={{ textAlign: "center" }}>
                            {papelera ? (p.moneda ? "✅" : "❌") : isEditing ? <input type="checkbox" {...register("moneda")} /> : (p.moneda ? "✅" : "❌")}
                          </td>

                          <td>
                            {papelera ? (
                              `$${p.valorDepositado || "0.00"}`
                            ) : isEditing ? (
                              <input type="number" step="0.01" {...register("valorDepositado")} className="vpMiniInput" />
                            ) : (
                              `$${p.valorDepositado || "0.00"}`
                            )}
                          </td>

                          <td className="vpTdWrap">
                            {papelera ? (
                              p.entidad || "---"
                            ) : isEditing ? (
                              <select {...register("entidad")} className="secInput vpMiniSelect" required>
                                <option value="">Entidad</option>
                                {[...new Set(variables.map((v) => v.entidad).filter(Boolean))].map((entidad, i) => (
                                  <option key={i} value={entidad}>
                                    {entidad}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              p.entidad || "---"
                            )}
                          </td>

                          <td>
                            {papelera ? (
                              p.idDeposito || "---"
                            ) : isEditing ? (
                              <input type="text" {...register("idDeposito")} className="vpMiniInput" />
                            ) : (
                              p.idDeposito || "---"
                            )}
                          </td>

                          <td>
                            {p.pagoUrl ? (
                              <a className="vpLink" href={p.pagoUrl} target="_blank" rel="noopener noreferrer">
                                Ver
                              </a>
                            ) : (
                              "No disponible"
                            )}
                          </td>

                          <td style={{ textAlign: "center" }}>
                            {papelera ? (
                              p.verificado ? "✅" : "❌"
                            ) : isEditing ? (
                              <input type="checkbox" {...register("verificado")} />
                            ) : p.verificado ? (
                              "✅"
                            ) : (
                              "❌"
                            )}
                          </td>

                          <td className="vpTdWrap">
                            {papelera ? (
                              p.observacion || "👍"
                            ) : isEditing ? (
                              <input type="text" {...register("observacion")} className="vpMiniInput" />
                            ) : (
                              p.observacion || "👍"
                            )}
                          </td>

                          <td className="vpTdWrap">{p.usuarioEdicion ? p.usuarioEdicion : "Sin editar"}</td>

                          {papelera ? (
                            <td className="vpTdWrap">
                              <button
                                className="secBtnPrimary vpBtnSmall"
                                type="button"
                                onClick={() => {
                                  setShowRestaurar(true);
                                  setPagoIdRestaurar(p.id);
                                }}
                              >
                                Restaurar
                              </button>
                            </td>
                          ) : (
                            <>
                              <td className="vpTdWrap2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={handleSubmit((data) => guardarEdicion(p.id, data))}
                                      className="vp-btn-save"
                                      type="button"
                                    >
                                      Guardar
                                    </button>
                                    <button onClick={cancelarEdicion} className="vp-btn-cancel" type="button">
                                      Cancelar
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={(e) => iniciarEdicion(p, e)}
                                    className="vp-btn-edit"
                                    type="button"
                                  >
                                    Registrar Validación
                                  </button>

                                )}
                              </td>

                              <td>
                                <button
                                  className="secBtnDanger vpBtnSmall"
                                  type="button"
                                  onClick={() => {
                                    setShowDelete(true);
                                    setPagoIdDelete(p.id);
                                  }}
                                >
                                  Eliminar
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="secEmpty">No hay pagos para mostrar.</p>
            )}
          </section>
        );

      case "registrarEntregas":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">🎁 Registrar Entregas</h2>
            </div>

            <div className="secFilters vpFiltersRow">
              <button className="secBtnDanger" onClick={limpiarFiltrosBase} type="button">
                ❌ Eliminar filtros
              </button>

              <div className="secInputGroup">
                <label className="vpLbl">Curso</label>
                <select className="secInput" value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
                  <option value="">Todos</option>
                  {listaCursos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Verificado</label>
                <select className="secInput" value={filtroVerificado} onChange={(e) => setFiltroVerificado(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Moneda</label>
                <select className="secInput" value={filtroMoneda} onChange={(e) => setFiltroMoneda(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Distintivo</label>
                <select className="secInput" value={filtroDistintivo} onChange={(e) => setFiltroDistintivo(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Entregado</label>
                <select className="secInput" value={filtroEntregado} onChange={(e) => setFiltroEntregado(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Grado / Nombres / Apellidos / Cédula</label>
                <input className="secInput" type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Buscar..." />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha inicio</label>
                <input className="secInput" type="date" value={filtroFechaInicio} onChange={(e) => setFiltroFechaInicio(e.target.value)} />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha fin</label>
                <input className="secInput" type="date" value={filtroFechaFin} onChange={(e) => setFiltroFechaFin(e.target.value)} />
              </div>
            </div>

            <p className="vpInfo">Mostrando {pagosDistintivos.length} resultados</p>

            <div className="secTableWrap">
              <table className="secTable vpTable">
                <thead>
                  <tr>
                    <th>Discente</th>
                    <th
                      className="vpThSortable"
                      onClick={() => setOrdenFechaDesc((prev) => !prev)}
                      title="Ordenar por fecha"
                    >
                      Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                    </th>
                    <th>Curso</th>
                    <th>Moneda</th>
                    <th>Distintivo</th>
                    <th>Valor</th>
                    <th>Verificado</th>
                    <th>Comprobante</th>
                    <th>Entregado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {pagosDistintivos.map((p) => {
                    const startEditing = () => {
                      setEditingEntregaId(p.id);
                      reset({ entregado: p.entregado });
                    };

                    const guardarEntrega = handleSubmit(async (data) => {
                      try {
                        await updatePago(PATH_PAGOS, p.id, { entregado: data.entregado });
                        await getPago(PATH_PAGOS);
                        setEditingEntregaId(null);
                      } catch (error) {
                        alert("Error al actualizar entrega.");
                      }
                    });

                    return (
                      <tr key={p.id}>
                        <td className="vpTdWrap">
                          {p
                            ? `${p?.inscripcion?.user?.grado} ${p?.inscripcion?.user?.firstName} ${p?.inscripcion?.user?.lastName}`
                            : "Sin Inscripción"}
                        </td>
                        <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                        <td className="vpTdWrap">{p.curso}</td>
                        <td style={{ textAlign: "center" }}>{p.moneda ? "✅" : "❌"}</td>
                        <td style={{ textAlign: "center" }}>{p.distintivo ? "✅" : "❌"}</td>
                        <td>{`$${p.valorDepositado || "0.00"}`}</td>
                        <td style={{ textAlign: "center" }}>{p.verificado ? "✅" : "❌"}</td>
                        <td>
                          {p.pagoUrl ? (
                            <a className="vpLink" href={p.pagoUrl} target="_blank" rel="noopener noreferrer">
                              Ver
                            </a>
                          ) : (
                            "No disponible"
                          )}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          {editingEntregaId === p.id ? (
                            <input type="checkbox" {...register("entregado")} />
                          ) : p.entregado ? (
                            "✅"
                          ) : (
                            "❌"
                          )}
                        </td>

                        <td>
                          {editingEntregaId === p.id ? (
                            <>
                              <button onClick={guardarEntrega} className="vp-btn-save" type="button">
                                Guardar
                              </button>
                              <button onClick={() => setEditingEntregaId(null)} className="vp-btn-cancel" type="button">
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button onClick={startEditing} className="vp-btn-edit" type="button">
                              Registrar Entrega
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );

      case "listaPagos":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">💳 Lista de Pagos</h2>
            </div>

            <div className="secFilters vpFiltersRow">
              <div className="secInputGroup">
                <label className="vpLbl">Verificado</label>
                <select className="secInput" value={filtroVerificado} onChange={(e) => setFiltroVerificado(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Certificado</label>
                <select className="secInput" value={filtroCertificado} onChange={(e) => setFiltroCertificado(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Con Certificado</option>
                  <option value="false">Sin Certificado</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha inicio</label>
                <input className="secInput" type="date" value={filtroFechaInicio} onChange={(e) => setFiltroFechaInicio(e.target.value)} />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha fin</label>
                <input className="secInput" type="date" value={filtroFechaFin} onChange={(e) => setFiltroFechaFin(e.target.value)} />
              </div>

              <button className="secBtnDanger" onClick={limpiarFiltrosBase} type="button">
                ❌ Eliminar filtros
              </button>

              {SUPERADMIN === user?.cI && (
                <button className="secBtnPrimary" onClick={descargarExcel} type="button">
                  📥 Descargar Pagos
                </button>
              )}

              {SUPERADMIN === user?.cI && (
                <button className="secBtnPrimary" onClick={descargarExcelInscripcion} type="button">
                  📥 Descargar Inscripciones
                </button>
              )}
            </div>

            <div className="secCount">Total: {pagosActivos.length}</div>

            <div className="secTableWrap">
              <table className="secTable vpTable">
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Cédula</th>
                    <th
                      className="vpThSortable"
                      onClick={() => setOrdenFechaDesc((prev) => !prev)}
                      title="Ordenar por fecha"
                    >
                      Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                    </th>
                    <th>Curso</th>
                    <th>Valor</th>
                    <th>Comprobante</th>
                    <th>Certificado</th>
                    <th>Verificado</th>
                  </tr>
                </thead>

                <tbody>
                  {pagosActivos.map((p) => (
                    <tr key={p.id}>
                      <td>{p?.inscripcion?.user?.grado || "-"}</td>
                      <td>{p?.inscripcion?.user?.firstName || "-"}</td>
                      <td>{p?.inscripcion?.user?.lastName || "-"}</td>
                      <td>{p?.inscripcion?.user?.cI || "-"}</td>
                      <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="vpTdWrap">{p.curso}</td>
                      <td>${p?.valorDepositado || "0.00"}</td>
                      <td>
                        {p.pagoUrl ? (
                          <a className="vpLink" href={p.pagoUrl} target="_blank" rel="noopener noreferrer">
                            Ver
                          </a>
                        ) : (
                          "No disponible"
                        )}
                      </td>
                      <td>
                        {p?.urlCertificado ? (
                          <a className="vpLink" href={p?.urlCertificado} target="_blank" rel="noopener noreferrer">
                            Ver
                          </a>
                        ) : (
                          "No disponible"
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>{p.verificado ? "✅" : "❌"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );

      case "listaInscritos":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">📋 Lista de Inscritos</h2>
            </div>
            <p className="secEmpty">📌 Próximamente…</p>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="secPage">
      {isLoading && <IsLoading />}

      {/* Overlay para mobile */}
      <div
        className={`secOverlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <div className="secShell vpShell">
        <button
          ref={hamburgerRef}
          className={`secHamburger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          type="button"
        >
          <span className="secHamburgerLine"></span>
          <span className="secHamburgerLine"></span>
          <span className="secHamburgerLine"></span>
        </button>

        <nav className={`secMenu ${menuOpen ? "open" : ""}`} ref={menuRef}>
          <div className="secMenuHeader">
            <img src="/images/cumanda_sf.png" alt="Eduka" className="secMenuLogo" />
            <p className="secMenuSubtitle">Validación de Pagos</p>
          </div>

          <button
            className={`secMenuBtn ${activeSection === "resumen" ? "active" : ""}`}
            onClick={() => setActiveSection("resumen")}
            type="button"
          >
            📋 Resumen
          </button>

          <button
            className={`secMenuBtn ${activeSection === "validarPagos" ? "active" : ""}`}
            onClick={() => setActiveSection("validarPagos")}
            type="button"
          >
            ✅ Validar Pagos
          </button>

          <button
            className={`secMenuBtn ${activeSection === "registrarEntregas" ? "active" : ""}`}
            onClick={() => setActiveSection("registrarEntregas")}
            type="button"
          >
            🎁 Entregas
          </button>

          <button
            className={`secMenuBtn ${activeSection === "listaPagos" ? "active" : ""}`}
            onClick={() => setActiveSection("listaPagos")}
            type="button"
          >
            💳 Lista Pagos
          </button>

          <button
            className={`secMenuBtn ${activeSection === "listaInscritos" ? "active" : ""}`}
            onClick={() => setActiveSection("listaInscritos")}
            type="button"
          >
            📋 Lista Inscritos
          </button>
        </nav>

        <main ref={contentRef} className="secContent vpContent">
          {renderContent()}
        </main>

        {/* MODALES */}
        {showDelete && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <span>¿Deseas eliminar el registro?</span>
              <section className="btn_content">
                <button className="btn yes" onClick={() => deletePagoPr(pagoIdDelete)} type="button">
                  Sí
                </button>
                <button
                  className="btn no"
                  onClick={() => {
                    setShowDelete(false);
                    setPagoIdDelete(null);
                  }}
                  type="button"
                >
                  No
                </button>
              </section>
            </article>
          </div>
        )}

        {showRestaurar && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <span>¿Deseas restaurar registro?</span>
              <section className="btn_content">
                <button className="btn yes" onClick={() => restaurarPagoPr(pagoIdRestaurar)} type="button">
                  Sí
                </button>
                <button
                  className="btn no"
                  onClick={() => {
                    setShowRestaurar(false);
                    setPagoIdRestaurar(null);
                  }}
                  type="button"
                >
                  No
                </button>
              </section>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidacionPago;
