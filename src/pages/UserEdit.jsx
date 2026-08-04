// src/pages/UserEdit.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/UserEdit.css";
import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";

const PATH_USERS = "/users";
const PATH_USERS_SEARCH = "/users/search";
const PATH_SENPLADES = "/senplades";
const PATH_VARIABLES = "/variables";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 450;

const UserEdit = () => {
  const dispatch = useDispatch();
  const debounceRef = useRef(null);
  const searchRequestRef = useRef(0);

  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEdit, setUserEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [userIdDelete, setUserIdDelete] = useState(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [senplades, getSenplades, , , , senpladesError, isLoadingSenplades] = useCrud();
  const [variables, getVariables, , , , variablesError, isLoadingVariables] = useCrud();
  const [, searchUsers, , , , searchError, isLoadingSearch] = useCrud();
  const [, getUserDetail, , , , detailError, isLoadingDetail] = useCrud();

  const [
    ,
    updateUser,
    ,
    loggedUser,
    ,
    ,
    isLoadingAuth,
    authError,
    ,
    ,
    ,
    ,
    userUpdate,
    ,
    ,
    deleteUserApi,
    deleteReg,
  ] = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cI, setCI] = useState("");
  const [cellular, setCellular] = useState("");
  const [dateBirth, setDateBirth] = useState("");
  const [cantonesOption, setCantonesOption] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedGenero, setSelectedGenero] = useState("");
  const [selectedGrado, setSelectedGrado] = useState("");
  const [selectedSubsistema, setSelectedSubsistema] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");

  const isLoading =
    isLoadingSearch ||
    isLoadingDetail ||
    cargandoDetalle ||
    isLoadingAuth ||
    isLoadingSenplades ||
    isLoadingVariables;

  useEffect(() => {
    getSenplades(PATH_SENPLADES);
    getVariables(PATH_VARIABLES);
  }, []);

  useEffect(() => {
    if (userUpdate) loggedUser();
  }, [userUpdate]);

  useEffect(() => {
    const error = authError || searchError || detailError || senpladesError || variablesError;
    if (!error) return;

    const responseData = error?.response?.data;
    const message =
      responseData?.message ||
      responseData?.error ||
      error?.message ||
      "No se pudo completar la operación.";

    dispatch(showAlert({ message: `⚠️ ${message}`, alertType: 1 }));
  }, [authError, searchError, detailError, senpladesError, variablesError, dispatch]);

  useEffect(() => {
    if (!deleteReg) return;
    dispatch(
      showAlert({
        message: deleteReg?.message || "✅ Usuario eliminado correctamente.",
        alertType: 2,
      }),
    );
  }, [deleteReg, dispatch]);

  const senpladesVal = useMemo(() => {
    if (Array.isArray(senplades)) return senplades;
    if (Array.isArray(senplades?.data)) return senplades.data;
    return [];
  }, [senplades]);

  const variablesVal = useMemo(() => {
    if (Array.isArray(variables)) return variables;
    if (Array.isArray(variables?.data)) return variables.data;
    return [];
  }, [variables]);

  const provincias = useMemo(
    () =>
      [...new Set(senpladesVal.map((item) => item?.provincia).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b)),
      ),
    [senpladesVal],
  );

  const generos = useMemo(() => variablesVal.filter((item) => item?.genero), [variablesVal]);
  const grados = useMemo(() => variablesVal.filter((item) => item?.grado), [variablesVal]);
  const subsistemas = useMemo(
    () => variablesVal.filter((item) => item?.subsistema),
    [variablesVal],
  );

  const obtenerCantonesPorProvincia = (provincia) =>
    senpladesVal.filter((item) => item.provincia === provincia);

  const handleProvinciaChange = (provincia) => {
    setSelectedProvincia(provincia);
    setCantonesOption(obtenerCantonesPorProvincia(provincia));
    setSelectedCanton("");
  };

  const validarCedula = (cedula) => {
    const cedulaLimpia = cedula ? cedula.replace(/\D/g, "") : "";
    if (!/^\d{10}$/.test(cedulaLimpia)) return false;

    const digitos = cedulaLimpia.split("").map(Number);
    const digitoVerificador = digitos.pop();
    let suma = 0;

    for (let index = 0; index < digitos.length; index += 1) {
      let valor = digitos[index];
      if (index % 2 === 0) {
        valor *= 2;
        if (valor > 9) valor -= 9;
      }
      suma += valor;
    }

    const decenaSuperior = Math.ceil(suma / 10) * 10;
    return decenaSuperior - suma === digitoVerificador;
  };

  const capitalizeWords = (text) =>
    (text || "")
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const cargarFormularioUsuario = (usuario) => {
    setSelectedUser(usuario);
    setUserEdit(false);
    setFirstName(usuario?.firstName || "");
    setLastName(usuario?.lastName || "");
    setEmail(usuario?.email || "");
    setCI(usuario?.cI || "");
    setCellular(usuario?.cellular || "");
    setDateBirth(usuario?.dateBirth ? String(usuario.dateBirth).slice(0, 10) : "");
    setSelectedProvincia(usuario?.province || "");
    setCantonesOption(obtenerCantonesPorProvincia(usuario?.province || ""));
    setSelectedCanton(usuario?.city || "");
    setSelectedGenero(usuario?.genre || "");
    setSelectedGrado(usuario?.grado || "");
    setSelectedSubsistema(usuario?.subsistema || "");
    setSelectedRole(usuario?.role || "student");
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const texto = String(query || "").trim();
    if (texto.length < SEARCH_MIN_LENGTH) {
      setSugerencias([]);
      setBusquedaRealizada(false);
      return undefined;
    }

    const nombreSeleccionado = selectedUser
      ? `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim()
      : "";

    if (selectedUser && texto === nombreSeleccionado) return undefined;

    debounceRef.current = setTimeout(async () => {
      const requestId = searchRequestRef.current + 1;
      searchRequestRef.current = requestId;

      try {
        setBusquedaRealizada(false);
        const result = await searchUsers(
          `${PATH_USERS_SEARCH}?q=${encodeURIComponent(texto)}&limit=${SEARCH_LIMIT}`,
        );

        if (requestId !== searchRequestRef.current) return;

        const data = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        setSugerencias(data);
        setBusquedaRealizada(true);
      } catch {
        if (requestId === searchRequestRef.current) {
          setSugerencias([]);
          setBusquedaRealizada(true);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedUser]);

  const seleccionarUser = async (usuarioSugerencia) => {
    try {
      setCargandoDetalle(true);
      setSugerencias([]);
      setBusquedaRealizada(false);

      const nombre = `${usuarioSugerencia.firstName || ""} ${usuarioSugerencia.lastName || ""}`.trim();
      setQuery(nombre);

      const usuarioCompleto = await getUserDetail(`${PATH_USERS}/${usuarioSugerencia.id}`);
      cargarFormularioUsuario(usuarioCompleto);
    } catch {
      setSelectedUser(null);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const limpiar = () => {
    searchRequestRef.current += 1;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setQuery("");
    setSugerencias([]);
    setBusquedaRealizada(false);
    setSelectedUser(null);
    setUserEdit(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setCI("");
    setCellular("");
    setDateBirth("");
    setSelectedProvincia("");
    setCantonesOption([]);
    setSelectedCanton("");
    setSelectedGenero("");
    setSelectedGrado("");
    setSelectedSubsistema("");
    setSelectedRole("student");
  };

  const submitUpdate = async (event) => {
    event.preventDefault();
    if (!selectedUser?.id) return;

    const cedulaLimpia = cI ? cI.trim().replace(/\D/g, "") : "";
    const celularLimpio = cellular ? cellular.trim().replace(/\D/g, "") : "";
    const emailFormateado = (email || "").trim().toLowerCase();

    const isValidCedula = cedulaLimpia ? validarCedula(cedulaLimpia) : true;
    const isValidCellular = celularLimpio ? /^09\d{8}$/.test(celularLimpio) : true;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormateado);

    if (!isValidCedula) {
      dispatch(showAlert({ message: "⚠️ La cédula ingresada es incorrecta.", alertType: 1 }));
      return;
    }

    if (!isValidEmail) {
      dispatch(showAlert({ message: "⚠️ El email es incorrecto.", alertType: 1 }));
      return;
    }

    if (!isValidCellular) {
      dispatch(
        showAlert({
          message: "⚠️ Celular inválido. Debe empezar con 09 y tener 10 dígitos.",
          alertType: 1,
        }),
      );
      return;
    }

    const formattedData = {
      firstName: capitalizeWords(firstName),
      lastName: capitalizeWords(lastName),
      email: emailFormateado,
      cI: cedulaLimpia || null,
      cellular: celularLimpio || null,
      dateBirth: dateBirth || null,
      province: selectedProvincia || null,
      city: selectedCanton || null,
      genre: selectedGenero || null,
      grado: selectedGrado || null,
      subsistema: selectedSubsistema || null,
      role: selectedRole || "student",
    };

    try {
      await updateUser(formattedData, selectedUser.id);

      setSelectedUser((previous) =>
        previous ? { ...previous, ...formattedData } : previous,
      );
      setFirstName(formattedData.firstName);
      setLastName(formattedData.lastName);
      setEmail(formattedData.email);
      setQuery(`${formattedData.firstName} ${formattedData.lastName}`.trim());
      setUserEdit(false);

      dispatch(
        showAlert({
          message: "✅ Usuario actualizado correctamente.",
          alertType: 2,
        }),
      );
    } catch {
      // El mensaje real se muestra desde authError.
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserApi(id);
      setShowDelete(false);
      setUserIdDelete(null);
      limpiar();
    } catch {
      // El mensaje real se muestra desde authError.
    }
  };

  return (
    <div className="ue_page">
      {false && <IsLoading />}

      <section className="ue_shell">
        <div className="ue_card">
          <div className="ue_header">
            <h2 className="ue_title">Editar usuarios</h2>
            <p className="ue_subtitle">
              Busca por <strong>cédula</strong> o <strong>nombres</strong>. La información
              completa se carga únicamente al seleccionar un usuario.
            </p>
          </div>

          <div className="ue_search">
            <div className="ue_searchBox">
              <input
                className="ue_input ue_input_center"
                type="text"
                placeholder="🔍 Buscar por cédula o nombres..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedUser(null);
                  setUserEdit(false);
                }}
                autoComplete="off"
                aria-label="Buscar usuario"
              />

              {isLoadingSearch && query.trim().length >= SEARCH_MIN_LENGTH && (
                <div className="ue_searchStatus">Buscando usuarios...</div>
              )}

              {!isLoadingSearch && sugerencias.length > 0 && (
                <ul className="ue_suggest" role="listbox">
                  {sugerencias.map((usuario) => (
                    <li
                      key={usuario.id}
                      className="ue_suggestItem"
                      role="option"
                      aria-selected="false"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => seleccionarUser(usuario)}
                    >
                      <strong>
                        {usuario.firstName} {usuario.lastName}
                      </strong>
                      <span className="ue_suggestCi">{usuario.cI || "Sin cédula"}</span>
                      <span className="ue_suggestMuted">{usuario.email || "Sin email"}</span>
                    </li>
                  ))}
                </ul>
              )}

              {!isLoadingSearch &&
                busquedaRealizada &&
                query.trim().length >= SEARCH_MIN_LENGTH &&
                sugerencias.length === 0 &&
                !selectedUser && (
                  <div className="ue_searchEmpty">No se encontraron usuarios.</div>
                )}
            </div>

            <button className="ue_btnDanger" type="button" onClick={limpiar}>
              ❌ Limpiar
            </button>
          </div>

          {!selectedUser ? (
            <p className="ue_empty">
              ✍️ Escribe al menos {SEARCH_MIN_LENGTH} caracteres y selecciona una sugerencia.
            </p>
          ) : (
            <section className="ue_profile">
              <div className="ue_profileTop">
                <div>
                  <h3 className="ue_profileName">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="ue_profileMeta">
                    <strong>ID:</strong> {selectedUser.id} · <strong>Email:</strong>{" "}
                    {selectedUser.email}
                  </p>
                </div>

                <div className="ue_actions">
                  <button
                    type="button"
                    className="ue_btnPrimary"
                    onClick={() => setUserEdit((current) => !current)}
                  >
                    {userEdit ? "Cancelar edición" : "Editar"}
                    <span className="ue_btnArrow">➜</span>
                  </button>

                  <button
                    type="button"
                    className="ue_btnPrimary ue_btnDelete"
                    onClick={() => {
                      setUserIdDelete(selectedUser.id);
                      setShowDelete(true);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <form className="ue_form" onSubmit={submitUpdate}>
                <article className="ue_col">
                  <label className="ue_label">
                    <span className="ue_span">Nombres</span>
                    <input className="ue_input" readOnly={!userEdit} value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Apellidos</span>
                    <input className="ue_input" readOnly={!userEdit} value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Email</span>
                    <input className="ue_input" readOnly={!userEdit} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Cédula</span>
                    <input className="ue_input" readOnly={!userEdit} value={cI} onChange={(e) => setCI(e.target.value)} type="text" inputMode="numeric" />
                  </label>
                </article>

                <article className="ue_col">
                  <label className="ue_label">
                    <span className="ue_span">Celular</span>
                    <input className="ue_input" readOnly={!userEdit} value={cellular} onChange={(e) => setCellular(e.target.value)} type="text" inputMode="numeric" />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Fecha nacimiento</span>
                    <input className="ue_input" readOnly={!userEdit} value={dateBirth || ""} onChange={(e) => setDateBirth(e.target.value)} type="date" />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Rol</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly value={selectedRole || ""} />
                    ) : (
                      <select className="ue_input" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                        <option value="student">student</option>
                        <option value="Administrador">Administrador</option>
                        <option value="SubAdministrador">SubAdministrador</option>
                        <option value="Validador">Validador</option>
                        <option value="Secretaria">Secretaria</option>
                        <option value="instituto_ciccenic">instituto_ciccenic</option>
                      </select>
                    )}
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Género</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly value={selectedGenero || ""} />
                    ) : (
                      <select className="ue_input" value={selectedGenero} onChange={(e) => setSelectedGenero(e.target.value)}>
                        <option value="">Seleccione</option>
                        {generos.map((item) => (
                          <option key={item.id} value={item.genero}>{item.genero}</option>
                        ))}
                      </select>
                    )}
                  </label>
                </article>

                <article className="ue_col">
                  <label className="ue_label">
                    <span className="ue_span">Provincia</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly value={selectedProvincia || ""} />
                    ) : (
                      <select className="ue_input" value={selectedProvincia} onChange={(e) => handleProvinciaChange(e.target.value)}>
                        <option value="">Seleccione</option>
                        {provincias.map((provincia) => (
                          <option key={provincia} value={provincia}>{provincia}</option>
                        ))}
                      </select>
                    )}
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Ciudad</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly value={selectedCanton || ""} />
                    ) : (
                      <select className="ue_input" value={selectedCanton} onChange={(e) => setSelectedCanton(e.target.value)}>
                        <option value="">Seleccione</option>
                        {[...new Set(cantonesOption.map((item) => item?.canton).filter(Boolean))].map((canton) => (
                          <option key={canton} value={canton}>{canton}</option>
                        ))}
                      </select>
                    )}
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Subsistema</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly value={selectedSubsistema || ""} />
                    ) : (
                      <select className="ue_input" value={selectedSubsistema} onChange={(e) => setSelectedSubsistema(e.target.value)}>
                        <option value="">Seleccione</option>
                        {subsistemas.map((item) => (
                          <option key={item.id} value={item.subsistema}>{item.subsistema}</option>
                        ))}
                      </select>
                    )}
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Grado</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly value={selectedGrado || ""} />
                    ) : (
                      <select className="ue_input" value={selectedGrado} onChange={(e) => setSelectedGrado(e.target.value)}>
                        <option value="">Seleccione</option>
                        {grados.map((item) => (
                          <option key={item.id} value={item.grado}>{item.grado}</option>
                        ))}
                      </select>
                    )}
                  </label>
                </article>

                <div className="ue_footer">
                  <button className="ue_btnPrimaryFull" type="submit" disabled={!userEdit || isLoadingAuth}>
                    {isLoadingAuth ? "Guardando..." : "Guardar cambios"}
                    <span className="ue_btnArrow">➜</span>
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </section>

      {showDelete && (
        <div className="modal_overlay_user">
          <article className="user_delete_content_2">
            <span>¿Deseas eliminar el registro?</span>
            <section className="btn_content_2">
              <button className="btn yes" onClick={() => deleteUser(userIdDelete)} type="button" disabled={isLoadingAuth}>
                {isLoadingAuth ? "Eliminando..." : "Sí"}
              </button>
              <button
                className="btn no"
                onClick={() => {
                  setShowDelete(false);
                  setUserIdDelete(null);
                }}
                type="button"
                disabled={isLoadingAuth}
              >
                No
              </button>
            </section>
          </article>
        </div>
      )}
    </div>
  );
};

export default UserEdit;