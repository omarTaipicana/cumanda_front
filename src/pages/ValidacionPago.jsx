import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
const urlBase = import.meta.env.VITE_API_URL;

const PATH_PAGOS = "/pagos";
const PATH_VARIABLES = "/variables";
const PATH_COURSES = "/courses";
const REGISTROS_POR_PAGINA = 15;
// guarda posición

const ValidacionPago = () => {
  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const contentRef = useRef(null); // el contenedor que scrollea
  const scrollPosRef = useRef(0);
  const lastClickedRef = useRef(null);
  const hamburgerRef = useRef();
  const activeSectionRef = useRef(activeSection);
  const cargarPagosRef = useRef(null);
  const dispatch = useDispatch();

  const { register, handleSubmit, reset } = useForm();

  const [, , , loggedUser, , , , , , , , , , user] = useAuth();
  const [pagoDashboard, getPagoDashboard] = useCrud();
  const [inscripcion, getInscripcion] = useCrud();
  const [variables, getVariables] = useCrud();
  const [courses, getCourses] = useCrud();

  const [showDelete, setShowDelete] = useState(false);
  const [pagoIdDelete, setPagoIdDelete] = useState(null);

  const [showRestaurar, setShowRestaurar] = useState(false);
  const [
    showConfirmarCertificado,
    setShowConfirmarCertificado,
  ] = useState(false);

  const [
    datosPendientesGuardar,
    setDatosPendientesGuardar,
  ] = useState(null);

  const [pagoIdRestaurar, setPagoIdRestaurar] = useState(null);
  const [isEmitiendoFactura, setIsEmitiendoFactura] = useState(false);
  const [facturandoPagoId, setFacturandoPagoId] = useState(null);

  const [papelera, setPapelera] = useState(false);
  const [verificadoOriginal, setVerificadoOriginal] = useState(false);
  const [generaFactura, setGeneraFactura] = useState();

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

  const [paginaActual, setPaginaActual] = useState(1);
  const limit = REGISTROS_POR_PAGINA;

  /*
   * Se utiliza para evitar que el primer render
   * dispare consultas antes de conocer la sección.
   */
  const [componenteInicializado, setComponenteInicializado] =
    useState(false);




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
    scrollPosRef.current =
      scroller === window ? window.scrollY : scroller.scrollTop;
  };

  const SCROLL_OFFSET = -100; // 👈 ajusta a gusto (80, 120, 160...)

  const restoreScroll = () => {
    const scroller = getScroller();
    const top = Math.max(0, scrollPosRef.current - SCROLL_OFFSET);

    if (scroller === window) window.scrollTo(0, top);
    else scroller.scrollTop = top;
  };

  useEffect(() => {
    if (generaFactura) {
      const message = generaFactura.message ?? "Error inesperado";
      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 2,
        }),
      );
    }
  }, [generaFactura]);

  useEffect(() => {
    if (!error) return;

    console.error(
      "ERROR COMPLETO DE PAGOS:",
      error,
    );

    console.error(
      "RESPUESTA DEL BACKEND:",
      error?.response?.data,
    );

    const responseData =
      error?.response?.data;

    let message =
      responseData?.message ||
      responseData?.error ||
      responseData?.errors?.[0]?.message ||
      responseData?.errors?.[0]?.msg ||
      error?.message ||
      "No se pudo completar la operación.";

    /*
     * Cuando Express responde HTML, por ejemplo:
     * Cannot PUT /pagos/123
     */
    if (
      typeof responseData === "string"
    ) {
      message = responseData
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    dispatch(
      showAlert({
        message: `⚠️ ${message}`,
        alertType: 1,
      }),
    );
  }, [error, dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltroGrado(inputValue.trim());
      setPaginaActual(1);
    }, 600);

    return () => clearTimeout(handler);
  }, [inputValue]);


  /*
   * =========================================================
   * DATOS DEVUELTOS POR EL ENDPOINT PAGINADO
   * =========================================================
   */

  const pagosData = useMemo(() => {
    if (Array.isArray(pago)) {
      return pago;
    }

    return Array.isArray(pago?.data)
      ? pago.data
      : [];
  }, [pago]);

  const totalRegistros =
    Number(pago?.total) || 0;

  const totalPaginas =
    Math.max(
      Number(pago?.totalPages) || 1,
      1,
    );

  const registroDesde =
    Number(pago?.from) || 0;

  const registroHasta =
    Number(pago?.to) || 0;

  const pagosMostrados = pagosData;

  /*
   * =========================================================
   * CONSTRUIR CONSULTA SEGÚN LA SECCIÓN ACTIVA
   * =========================================================
   */

  const construirQueryPagos = useCallback(() => {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(paginaActual),
    );

    params.set(
      "limit",
      String(limit),
    );

    params.set(
      "order",
      ordenFechaDesc
        ? "DESC"
        : "ASC",
    );

    /*
     * Todas estas pantallas trabajan con pagos activos,
     * excepto cuando el usuario abre la papelera.
     */
    if (
      activeSection === "validarPagos"
    ) {
      params.set(
        "confirmacion",
        papelera ? "false" : "true",
      );
    }

    if (
      activeSection === "registrarEntregas"
    ) {
      params.set(
        "confirmacion",
        "true",
      );

      params.set(
        "reconocimiento",
        "true",
      );
    }

    if (
      activeSection === "listaPagos"
    ) {
      params.set(
        "confirmacion",
        "true",
      );
    }

    if (filtroCurso) {
      params.set(
        "curso",
        filtroCurso,
      );
    }

    if (filtroVerificado) {
      params.set(
        "verificado",
        filtroVerificado,
      );
    }

    if (filtroMoneda) {
      params.set(
        "moneda",
        filtroMoneda,
      );
    }

    if (filtroDistintivo) {
      params.set(
        "distintivo",
        filtroDistintivo,
      );
    }

    if (
      activeSection ===
      "registrarEntregas" &&
      filtroEntregado
    ) {
      params.set(
        "entregado",
        filtroEntregado,
      );
    }

    if (filtroCertificado) {
      params.set(
        "certificado",
        filtroCertificado,
      );
    }

    if (filtroGrado) {
      params.set(
        "busqueda",
        filtroGrado,
      );
    }

    if (filtroFechaInicio) {
      params.set(
        "fechaInicio",
        filtroFechaInicio,
      );
    }

    if (filtroFechaFin) {
      params.set(
        "fechaFin",
        filtroFechaFin,
      );
    }

    return `/pagos?${params.toString()}`;
  }, [
    activeSection,
    paginaActual,
    limit,
    ordenFechaDesc,
    papelera,
    filtroCurso,
    filtroVerificado,
    filtroMoneda,
    filtroDistintivo,
    filtroEntregado,
    filtroCertificado,
    filtroGrado,
    filtroFechaInicio,
    filtroFechaFin,
  ]);



  const cargarPagosActuales =
    useCallback(async () => {
      const seccionUsaPagos = [
        "validarPagos",
        "registrarEntregas",
        "listaPagos",
      ].includes(activeSection);

      if (!seccionUsaPagos) {
        return;
      }

      await getPago(
        construirQueryPagos(),
      );
    }, [
      activeSection,
      construirQueryPagos,
    ]);




  /*
   * =========================================================
   * SINCRONIZAR REFERENCIAS PARA SOCKET
   * =========================================================
   */

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    cargarPagosRef.current = cargarPagosActuales;
  }, [cargarPagosActuales]);

  /*
   * =========================================================
   * CARGAR DATOS AUXILIARES SEGÚN LA SECCIÓN
   * =========================================================
   */

  useEffect(() => {
    if (!componenteInicializado) {
      return;
    }

    if (activeSection === "resumen") {
      getPagoDashboard("/pagos_dashboard");
      return;
    }

    if (
      activeSection === "validarPagos" ||
      activeSection === "registrarEntregas"
    ) {
      const cursosCargados =
        Array.isArray(courses)
          ? courses.length > 0
          : Array.isArray(courses?.data)
            ? courses.data.length > 0
            : Array.isArray(courses?.results)
              ? courses.results.length > 0
              : false;

      if (!cursosCargados) {
        getCourses(PATH_COURSES);
      }
    }

    if (activeSection === "validarPagos") {
      const variablesCargadas =
        Array.isArray(variables)
          ? variables.length > 0
          : Array.isArray(variables?.data)
            ? variables.data.length > 0
            : false;

      if (!variablesCargadas) {
        getVariables(PATH_VARIABLES);
      }
    }
  }, [
    componenteInicializado,
    activeSection,
  ]);

  /*
   * =========================================================
   * CARGAR PAGOS PAGINADOS
   * =========================================================
   */

  useEffect(() => {
    if (!componenteInicializado) {
      return;
    }

    const seccionUsaPagos = [
      "validarPagos",
      "registrarEntregas",
      "listaPagos",
    ].includes(activeSection);

    if (!seccionUsaPagos) {
      return;
    }

    cargarPagosActuales();
  }, [
    componenteInicializado,
    activeSection,
    cargarPagosActuales,
  ]);

  useEffect(() => {
    const socket = io(BASEURL, {
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const actualizarPantallaActual =
      () => {
        const seccionActual =
          activeSectionRef.current;

        if (
          [
            "validarPagos",
            "registrarEntregas",
            "listaPagos",
          ].includes(seccionActual)
        ) {
          cargarPagosRef.current?.();
        }

        if (
          seccionActual === "resumen"
        ) {
          getPagoDashboard(
            "/pagos_dashboard",
          );
        }
      };

    socket.on(
      "pagoCreado",
      actualizarPantallaActual,
    );

    socket.on(
      "pagoActualizado",
      actualizarPantallaActual,
    );

    return () => {
      socket.off(
        "pagoCreado",
        actualizarPantallaActual,
      );

      socket.off(
        "pagoActualizado",
        actualizarPantallaActual,
      );

      socket.disconnect();
    };
  }, []);



  useEffect(() => {
    setPaginaActual(1);
    cancelarEdicion();
    setEditingEntregaId(null);
  }, [
    activeSection,
    papelera,
    filtroCurso,
    filtroVerificado,
    filtroMoneda,
    filtroDistintivo,
    filtroEntregado,
    filtroCertificado,
    filtroFechaInicio,
    filtroFechaFin,
    ordenFechaDesc,
  ]);



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
    loggedUser();
    setComponenteInicializado(true);
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


  const guardarEdicion = (
    pagoId,
    data,
  ) => {
    if (
      verificadoOriginal === false &&
      data.verificado === true
    ) {
      setDatosPendientesGuardar({
        pagoId,
        data,
      });

      setShowConfirmarCertificado(
        true,
      );

      return;
    }

    guardarEdicionConfirmada(
      pagoId,
      data,
    );
  };


  const guardarEdicionConfirmada = async (
    pagoId,
    data,
  ) => {
    try {







      const valorDepositado =
        Number.parseFloat(
          data.valorDepositado,
        );

      if (
        !Number.isFinite(
          valorDepositado,
        )
      ) {
        dispatch(
          showAlert({
            message:
              "⚠️ El valor depositado no es válido.",
            alertType: 1,
          }),
        );

        return;
      }

      const datosActualizar = {
        ...data,

        valorDepositado,

        entidad:
          data.entidad?.trim() || null,

        idDeposito:
          data.idDeposito?.trim() ||
          null,

        observacion:
          data.observacion?.trim() ||
          "",

        usuarioEdicion:
          user?.email ||
          "Usuario no identificado",
      };


      await updatePago(
        PATH_PAGOS,
        pagoId,
        datosActualizar,
      );

      cancelarEdicion();

      /*
       * Actualiza solo la página actual.
       */
      await cargarPagosActuales();

      dispatch(
        showAlert({
          message:
            "✅ La validación del pago fue registrada correctamente.",
          alertType: 2,
        }),
      );
    } catch (errorGuardar) {
      console.error(
        "ERROR AL GUARDAR VALIDACIÓN:",
        errorGuardar,
      );

      const message =
        errorGuardar?.response?.data
          ?.message ||
        errorGuardar?.response?.data
          ?.error ||
        errorGuardar?.message ||
        "No se pudo guardar la validación.";

      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        }),
      );
    }
  };

  const deletePagoPr = async (id) => {
    try {
      await updatePago(PATH_PAGOS, id, { confirmacion: false });
      await cargarPagosActuales();
      cancelarEdicion();
      setShowDelete(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    }
  };

  const restaurarPagoPr = async (id) => {
    try {
      await updatePago(PATH_PAGOS, id, { confirmacion: true });
      await cargarPagosActuales();
      cancelarEdicion();
      setShowRestaurar(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    }
  };

  const listaCursos = useMemo(() => {
    let cursosData = [];

    if (Array.isArray(courses)) {
      cursosData = courses;
    } else if (Array.isArray(courses?.data)) {
      cursosData = courses.data;
    } else if (Array.isArray(courses?.results)) {
      cursosData = courses.results;
    }

    return [
      ...new Set(
        cursosData
          .map((course) =>
            course.sigla || course.curso || "",
          )
          .filter(Boolean),
      ),
    ].sort((a, b) =>
      String(a).localeCompare(String(b)),
    );
  }, [courses]);

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




  const descargarExcel = () => {
    const datosExcel =
      pagosMostrados.map((p) => ({
        Grado:
          p?.inscripcion?.user?.grado || "",

        Nombres:
          p?.inscripcion?.user?.firstName || "",

        Apellidos:
          p?.inscripcion?.user?.lastName || "",

        Cedula:
          p?.inscripcion?.user?.cI || "",

        Curso:
          p.curso || "",

        "Valor Depositado":
          Number(
            p.valorDepositado || 0,
          ).toFixed(2),

        Comprobante:
          p.pagoUrl || "",

        Verificado:
          p.verificado ? "Sí" : "No",

        Fecha:
          p.createdAt
            ? new Date(
              p.createdAt,
            ).toLocaleDateString()
            : "",

        Email:
          p?.inscripcion?.user?.email || "",

        Celular:
          p?.inscripcion?.user?.cellular || "",
      }));

    const ws =
      XLSX.utils.json_to_sheet(
        datosExcel,
      );

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Pagos",
    );

    const wbout =
      XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
      });

    const blob =
      new Blob(
        [wbout],
        {
          type:
            "application/octet-stream",
        },
      );

    saveAs(
      blob,
      "pagos_pagina_actual.xlsx",
    );
  };

  const descargarExcelInscripcion = () => {
    if (
      !Array.isArray(inscripcion) ||
      inscripcion.length === 0
    ) {
      dispatch(
        showAlert({
          message:
            "⚠️ Las inscripciones no se han cargado. Esta exportación se optimizará desde el backend.",
          alertType: 1,
        }),
      );

      return;
    }

    const datosExcel = [...inscripcion]
      .sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt),
      )
      .map((i) => ({
        id: i?.id || "",
        grado: i?.user?.grado || "",
        nombres:
          i?.user?.firstName || "",
        apellidos:
          i?.user?.lastName || "",
        cedula:
          i?.user?.cI || "",
        email:
          i?.user?.email || "",
        aceptacion:
          i?.aceptacion || "",
        curso:
          i?.curso || "",
        userId:
          i?.userId || "",
        createdAt:
          i?.createdAt || "",
        updatedAt:
          i?.updatedAt || "",
        courseId:
          i?.courseId || "",
        observacion:
          i?.observacion || "",
        usuarioEdicion:
          i?.usuarioEdicion || "",
      }));

    const ws =
      XLSX.utils.json_to_sheet(
        datosExcel,
      );

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "inscripcion",
    );

    const wbout =
      XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
      });

    const blob =
      new Blob(
        [wbout],
        {
          type:
            "application/octet-stream",
        },
      );

    saveAs(
      blob,
      "inscripciones.xlsx",
    );
  };

  const emitirFacturaManual =
    async (pagoId) => {
      try {
        if (isEmitiendoFactura) {
          return;
        }

        setIsEmitiendoFactura(true);
        setFacturandoPagoId(pagoId);

        const { data } =
          await axios.post(
            `${urlBase}/contifico/factura/emitir-manual`,
            {
              pagoId,
            },
          );

        setGeneraFactura(data);

        await cargarPagosActuales();
      } catch (error) {
        console.error(
          "Error emitir factura:",
          error.response?.data ||
          error.message,
        );
      } finally {
        setIsEmitiendoFactura(false);
        setFacturandoPagoId(null);
      }
    };

  const getFacturaUI = (p) => {
    // 1) No hay documento
    if (!p.contificoDocumentoId) {
      return { type: "emitir", label: "Emitir factura" };
    }

    // 2) Ya hay autorización => ver RIDE
    if (p.contificoAutorizacion) {
      return {
        type: "ver",
        label: "Ver factura",
        href: p.contificoUrlRide || p.contificoUrlXml,
      };
    }

    // 3) Hay documento pero no autorización
    return { type: "pendiente", label: "Pendiente SRI" };
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

    setPaginaActual(1);
    setEditPagoId(null);
    setEditingEntregaId(null);
  };


  const cambiarSeccion = (
    nuevaSeccion,
  ) => {
    setActiveSection(
      nuevaSeccion,
    );

    setMenuOpen(false);
    setPaginaActual(1);
    setPapelera(false);
    setEditPagoId(null);
    setEditingEntregaId(null);
  };


  const renderPaginacion = () => {
    if (
      totalRegistros === 0
    ) {
      return null;
    }

    const paginasVisibles =
      Array.from(
        {
          length:
            totalPaginas,
        },
        (_, index) =>
          index + 1,
      ).filter(
        (numeroPagina) =>
          numeroPagina === 1 ||
          numeroPagina ===
          totalPaginas ||
          (
            numeroPagina >=
            paginaActual - 2 &&
            numeroPagina <=
            paginaActual + 2
          ),
      );

    return (
      <>
        <div className="paginacion secPagination">
          <div className="paginacion-flechas izquierda">
            <button
              type="button"
              onClick={() =>
                setPaginaActual(1)
              }
              disabled={
                paginaActual === 1 ||
                isLoading
              }
            >
              «
            </button>

            <button
              type="button"
              onClick={() =>
                setPaginaActual(
                  (prev) =>
                    Math.max(
                      prev - 1,
                      1,
                    ),
                )
              }
              disabled={
                paginaActual === 1 ||
                isLoading
              }
            >
              ‹
            </button>
          </div>

          <div className="paginacion-numeros">
            {paginasVisibles.map(
              (
                numeroPagina,
                index,
                array,
              ) => (
                <React.Fragment
                  key={
                    numeroPagina
                  }
                >
                  {index > 0 &&
                    numeroPagina -
                    array[
                    index - 1
                    ] >
                    1 && (
                      <span className="puntos">
                        ...
                      </span>
                    )}

                  <button
                    type="button"
                    onClick={() =>
                      setPaginaActual(
                        numeroPagina,
                      )
                    }
                    className={
                      paginaActual ===
                        numeroPagina
                        ? "pagina-actual"
                        : ""
                    }
                    disabled={
                      isLoading
                    }
                  >
                    {
                      numeroPagina
                    }
                  </button>
                </React.Fragment>
              ),
            )}
          </div>

          <div className="paginacion-flechas derecha">
            <button
              type="button"
              onClick={() =>
                setPaginaActual(
                  (prev) =>
                    Math.min(
                      prev + 1,
                      totalPaginas,
                    ),
                )
              }
              disabled={
                paginaActual ===
                totalPaginas ||
                isLoading
              }
            >
              ›
            </button>

            <button
              type="button"
              onClick={() =>
                setPaginaActual(
                  totalPaginas,
                )
              }
              disabled={
                paginaActual ===
                totalPaginas ||
                isLoading
              }
            >
              »
            </button>
          </div>
        </div>

        <div className="numero-registros secCount">
          Mostrando{" "}
          {registroDesde}–{registroHasta}{" "}
          de {totalRegistros} registros
          {" · "}
          Página {paginaActual} de{" "}
          {totalPaginas}
        </div>
      </>
    );
  };


  const dashboardDisponible =
    pagoDashboard &&
    !Array.isArray(pagoDashboard) &&
    typeof pagoDashboard === "object";

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">📋 Resumen General</h2>
            </div>

            {!dashboardDisponible ? (
              <p className="secEmpty">Cargando resumen...</p>
            ) : (
              <div className="vpResumenGrid">
                <div className="vpStatCard">
                  <div className="vpStatLabel">Total Pagos / Validados</div>
                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {pagoDashboard?.totalPagosNum ?? 0}
                    </span>
                    <span className="vpStatSep">/</span>
                    <span className="vpStatOk">
                      {pagoDashboard?.totalPagosVerificados ?? 0}
                    </span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">Monedas / Entregadas</div>
                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {pagoDashboard.conteoDistMoneda?.find(
                        (c) => c.name === "Moneda",
                      )?.value || 0}
                    </span>
                    <span className="vpStatSep">/</span>
                    <span className="vpStatOk">
                      {pagoDashboard.conteoDistMoneda?.find(
                        (c) => c.name === "Moneda",
                      )?.entregado || 0}
                    </span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">Distintivos / Entregados</div>
                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {pagoDashboard.conteoDistMoneda?.find(
                        (c) => c.name === "Distintivo",
                      )?.value || 0}
                    </span>
                    <span className="vpStatSep">/</span>
                    <span className="vpStatOk">
                      {pagoDashboard.conteoDistMoneda?.find(
                        (c) => c.name === "Distintivo",
                      )?.entregado || 0}
                    </span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">Certificados pagados</div>
                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {pagoDashboard?.totalPagosDinstint ?? 0}
                    </span>
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
              <button
                className="secBtnDanger"
                onClick={limpiarFiltrosBase}
                type="button"
              >
                ❌ Eliminar filtros
              </button>

              <div className="secInputGroup">
                <label className="vpLbl">Curso</label>
                <select
                  className="secInput"
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >
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
                <select
                  className="secInput"
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Moneda</label>
                <select
                  className="secInput"
                  value={filtroMoneda}
                  onChange={(e) => setFiltroMoneda(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Distintivo</label>
                <select
                  className="secInput"
                  value={filtroDistintivo}
                  onChange={(e) => setFiltroDistintivo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Grado / Nombres / Apellidos / Cédula
                </label>
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
                <input
                  className="secInput"
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha fin</label>
                <input
                  className="secInput"
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                />
              </div>

              <button
                className="secBtnPrimary vpTrashBtn"
                type="button"
                onClick={() => {
                  setPapelera((prev) => !prev);
                  setPaginaActual(1);
                  setEditPagoId(null);
                }} title={papelera ? "Volver a activos" : "Ver eliminados"}
              >
                {papelera ? "↩️ Activos" : "🗑️ Papelera"}
              </button>
            </div>

            {papelera ? (
              <p className="vpInfoDanger">
                Mostrando {totalRegistros} registros eliminados
              </p>
            ) : (
              <p className="vpInfo">
                Mostrando {totalRegistros} resultados

              </p>
            )}

            {pagosMostrados.length ? (
              <>
                {renderPaginacion()}

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
                        <th colSpan={papelera ? 1 : 2}>
                          {papelera ? "Restaurar" : "Acción"}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pagosMostrados.map((p) => {
                        const isEditing = editPagoId === p.id;

                        return (
                          <tr key={p.id}>
                            <td className="vpTdWrap">
                              {p
                                ? `${p?.inscripcion?.user?.grado} ${p?.inscripcion?.user?.firstName} ${p?.inscripcion?.user?.lastName}`
                                : "Sin Inscripción"}
                            </td>

                            <td>
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleDateString()
                                : "-"}
                            </td>

                            <td className="vpTdWrap">{p.curso}</td>

                            <td style={{ textAlign: "center" }}>
                              {papelera ? (
                                p.distintivo ? (
                                  "✅"
                                ) : (
                                  "❌"
                                )
                              ) : isEditing ? (
                                <input
                                  type="checkbox"
                                  {...register("distintivo")}
                                />
                              ) : p.distintivo ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>

                            <td style={{ textAlign: "center" }}>
                              {papelera ? (
                                p.moneda ? (
                                  "✅"
                                ) : (
                                  "❌"
                                )
                              ) : isEditing ? (
                                <input type="checkbox" {...register("moneda")} />
                              ) : p.moneda ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>

                            <td>
                              {papelera ? (
                                `$${Number(p.valorDepositado || 0).toFixed(2)}`
                              ) : isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  {...register("valorDepositado")}
                                  className="vpMiniInput"
                                />
                              ) : (
                                `$${Number(p.valorDepositado || 0).toFixed(2)}`
                              )}
                            </td>

                            <td className="vpTdWrap">
                              {papelera ? (
                                p.entidad || "---"
                              ) : isEditing ? (
                                <select
                                  {...register("entidad")}
                                  className="secInput vpMiniSelect"
                                  required
                                >
                                  <option value="">Entidad</option>
                                  {[
                                    ...new Set(
                                      (Array.isArray(variables)
                                        ? variables
                                        : []
                                      )
                                        .map((v) => v.entidad)
                                        .filter(Boolean),
                                    ),
                                  ].map((entidad, i) => (
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
                                <input
                                  type="text"
                                  {...register("idDeposito")}
                                  className="vpMiniInput"
                                />
                              ) : (
                                p.idDeposito || "---"
                              )}
                            </td>

                            <td>
                              {p.pagoUrl ? (
                                <a
                                  className="vpLink"
                                  href={p.pagoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Ver
                                </a>
                              ) : (
                                "No disponible"
                              )}
                            </td>

                            <td style={{ textAlign: "center" }}>
                              {papelera ? (
                                p.verificado ? (
                                  "✅"
                                ) : (
                                  "❌"
                                )
                              ) : isEditing ? (
                                <input
                                  type="checkbox"
                                  {...register("verificado")}
                                />
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
                                <input
                                  type="text"
                                  {...register("observacion")}
                                  className="vpMiniInput"
                                />
                              ) : (
                                p.observacion || "👍"
                              )}
                            </td>

                            <td className="vpTdWrap">
                              {p.usuarioEdicion ? p.usuarioEdicion : "Sin editar"}
                            </td>

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
                                        onClick={handleSubmit((data) =>
                                          guardarEdicion(p.id, data),
                                        )}
                                        className="vp-btn-save"
                                        type="button"
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        onClick={cancelarEdicion}
                                        className="vp-btn-cancel"
                                        type="button"
                                      >
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

                                  {(() => {
                                    const f = getFacturaUI(p);

                                    // Emitir (solo si pago está verificado)
                                    if (f.type === "emitir") {
                                      return (
                                        <button
                                          className="secBtnPrimary vpBtnSmall"
                                          type="button"
                                          disabled={
                                            !p.verificado || isEmitiendoFactura
                                          }
                                          title={
                                            !p.verificado
                                              ? "Primero verifica el pago"
                                              : "Emitir factura en Contífico"
                                          }
                                          onClick={() =>
                                            emitirFacturaManual(p.id)
                                          }
                                          style={{ marginLeft: 8 }}
                                        >
                                          {facturandoPagoId === p.id
                                            ? "Facturando..."
                                            : "Facturar"}
                                        </button>
                                      );
                                    }

                                    // Pendiente
                                    if (f.type === "pendiente") {
                                      return (
                                        <span
                                          style={{ marginLeft: 10, fontSize: 12 }}
                                        >
                                          🟡 Pendiente
                                        </span>
                                      );
                                    }

                                    // Ver
                                    return f.href ? (
                                      <a
                                        className="vpLink"
                                        href={f.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ marginLeft: 10 }}
                                      >
                                        Ver
                                      </a>
                                    ) : (
                                      <span
                                        style={{ marginLeft: 10, fontSize: 12 }}
                                      >
                                        🟢 Autorizada
                                      </span>
                                    );
                                  })()}
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

                {renderPaginacion()}
              </>
            ) : (
              <p className="secEmpty">No hay pagos para mostrar.</p>
            )
            }
          </section >
        );

      case "registrarEntregas":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">🎁 Registrar Entregas</h2>
            </div>

            <div className="secFilters vpFiltersRow">
              <button
                className="secBtnDanger"
                onClick={limpiarFiltrosBase}
                type="button"
              >
                ❌ Eliminar filtros
              </button>

              <div className="secInputGroup">
                <label className="vpLbl">Curso</label>
                <select
                  className="secInput"
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >
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
                <select
                  className="secInput"
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Moneda</label>
                <select
                  className="secInput"
                  value={filtroMoneda}
                  onChange={(e) => setFiltroMoneda(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Distintivo</label>
                <select
                  className="secInput"
                  value={filtroDistintivo}
                  onChange={(e) => setFiltroDistintivo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Entregado</label>
                <select
                  className="secInput"
                  value={filtroEntregado}
                  onChange={(e) => setFiltroEntregado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Grado / Nombres / Apellidos / Cédula
                </label>
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
                <input
                  className="secInput"
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha fin</label>
                <input
                  className="secInput"
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                />
              </div>
            </div>

            <p className="vpInfo">
              Mostrando {totalRegistros} resultados
            </p>

            {renderPaginacion()}

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
                  {pagosMostrados.map((p) => {
                    const startEditing = () => {
                      setEditingEntregaId(p.id);
                      reset({ entregado: p.entregado });
                    };

                    const guardarEntrega = handleSubmit(async (data) => {
                      try {
                        await updatePago(PATH_PAGOS, p.id, {
                          entregado: data.entregado,
                        });
                        await cargarPagosActuales();
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
                        <td>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="vpTdWrap">{p.curso}</td>
                        <td style={{ textAlign: "center" }}>
                          {p.moneda ? "✅" : "❌"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {p.distintivo ? "✅" : "❌"}
                        </td>
                        <td>${Number(p.valorDepositado || 0).toFixed(2)}</td>
                        <td style={{ textAlign: "center" }}>
                          {p.verificado ? "✅" : "❌"}
                        </td>
                        <td>
                          {p.pagoUrl ? (
                            <a
                              className="vpLink"
                              href={p.pagoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
                              <button
                                onClick={guardarEntrega}
                                className="vp-btn-save"
                                type="button"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingEntregaId(null)}
                                className="vp-btn-cancel"
                                type="button"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={startEditing}
                              className="vp-btn-edit"
                              type="button"
                            >
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

            {renderPaginacion()}
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
                <select
                  className="secInput"
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Certificado</label>
                <select
                  className="secInput"
                  value={filtroCertificado}
                  onChange={(e) => setFiltroCertificado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Con Certificado</option>
                  <option value="false">Sin Certificado</option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha inicio</label>
                <input
                  className="secInput"
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Fecha fin</label>
                <input
                  className="secInput"
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                />
              </div>

              <button
                className="secBtnDanger"
                onClick={limpiarFiltrosBase}
                type="button"
              >
                ❌ Eliminar filtros
              </button>

              {SUPERADMIN === user?.cI && (
                <button
                  className="secBtnPrimary"
                  onClick={descargarExcel}
                  type="button"
                >
                  📥 Descargar Pagos
                </button>
              )}

              {SUPERADMIN === user?.cI && (
                <button
                  className="secBtnPrimary"
                  onClick={descargarExcelInscripcion}
                  type="button"
                >
                  📥 Descargar Inscripciones
                </button>
              )}
            </div>

            {renderPaginacion()}

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
                  {pagosMostrados.map((p) => (
                    <tr key={p.id}>
                      <td>{p?.inscripcion?.user?.grado || "-"}</td>
                      <td>{p?.inscripcion?.user?.firstName || "-"}</td>
                      <td>{p?.inscripcion?.user?.lastName || "-"}</td>
                      <td>{p?.inscripcion?.user?.cI || "-"}</td>
                      <td>
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="vpTdWrap">{p.curso}</td>
                      <td>${Number(p.valorDepositado || 0).toFixed(2)}</td>
                      <td>
                        {p.pagoUrl ? (
                          <a
                            className="vpLink"
                            href={p.pagoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver
                          </a>
                        ) : (
                          "No disponible"
                        )}
                      </td>
                      <td>
                        {p?.urlCertificado ? (
                          <a
                            className="vpLink"
                            href={p?.urlCertificado}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver
                          </a>
                        ) : (
                          "No disponible"
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {p.verificado ? "✅" : "❌"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {renderPaginacion()}
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
            <img
              src="/images/cumanda_sf.png"
              alt="Instituto Superior Tecnológico Cumandá"
              className="secMenuLogo"
            />
            <p className="secMenuSubtitle">Validación de Pagos</p>
          </div>

          <button
            className={`secMenuBtn ${activeSection === "resumen" ? "active" : ""}`}
            onClick={() =>
              cambiarSeccion("resumen")
            }
            type="button"
          >
            📋 Resumen
          </button>

          <button
            className={`secMenuBtn ${activeSection === "validarPagos" ? "active" : ""}`}
            onClick={() => cambiarSeccion("validarPagos")}
            type="button"
          >
            ✅ Validar Pagos
          </button>

          <button
            className={`secMenuBtn ${activeSection === "registrarEntregas" ? "active" : ""}`}
            onClick={() => cambiarSeccion("registrarEntregas")}
            type="button"
          >
            🎁 Entregas
          </button>

          <button
            className={`secMenuBtn ${activeSection === "listaPagos" ? "active" : ""}`}
            onClick={() => cambiarSeccion("listaPagos")}
            type="button"
          >
            💳 Lista Pagos
          </button>

          <button
            className={`secMenuBtn ${activeSection === "listaInscritos" ? "active" : ""}`}
            onClick={() => cambiarSeccion("listaInscritos")}
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
                <button
                  className="btn yes"
                  onClick={() => deletePagoPr(pagoIdDelete)}
                  type="button"
                >
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
                <button
                  className="btn yes"
                  onClick={() => restaurarPagoPr(pagoIdRestaurar)}
                  type="button"
                >
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

        {showConfirmarCertificado && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <h3
                style={{
                  marginBottom: 12,
                }}
              >
                📄 Emitir certificado
              </h3>

              <p
                style={{
                  marginBottom: 20,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                Estás marcando este pago
                como <strong>VERIFICADO</strong>.
                <br />
                <br />
                Al guardar los cambios se
                emitirá automáticamente el
                certificado del participante.
                <br />
                <br />
                ¿Deseas continuar?
              </p>

              <section className="btn_content">
                <button
                  className="btn yes"
                  type="button"
                  onClick={async () => {
                    const datos =
                      datosPendientesGuardar;

                    setShowConfirmarCertificado(
                      false,
                    );

                    setDatosPendientesGuardar(
                      null,
                    );

                    if (datos) {
                      await guardarEdicionConfirmada(
                        datos.pagoId,
                        datos.data,
                      );
                    }
                  }}
                >
                  ✅ Sí, continuar
                </button>

                <button
                  className="btn no"
                  type="button"
                  onClick={() => {
                    setShowConfirmarCertificado(
                      false,
                    );

                    setDatosPendientesGuardar(
                      null,
                    );
                  }}
                >
                  Cancelar
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