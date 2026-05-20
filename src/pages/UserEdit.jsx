// src/pages/UserEdit.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/UserEdit.css";
import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";

const PATH_USERS = "/users";
const PATH_SENPLADES = "/senplades";
const PATH_VARIABLES = "/variables";

const UserEdit = () => {
  const dispatch = useDispatch();
  const debounceRef = useRef(null);

  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEdit, setUserEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false)
  const [userIdDelete, setUserIdDelete] = useState()

  const [senplades, getSenplades] = useCrud();
  const [variables, getVariables] = useCrud();

  // usuarios para sugerencias
  const [usersAll, getUsers, , , , , isLoadingUsers] = useCrud();

  // updateUser del auth
  const [, updateUser, , loggedUser, , , isLoadingAuth, error, , , , , userUpdate, , , deleteUserApi, deleteReg] =
    useAuth();

  // ====== STATES CONTROLADOS (TODO editable) ======
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

  // role como state controlado
  const [selectedRole, setSelectedRole] = useState("student");

  // catálogos
  useEffect(() => {
    getSenplades(PATH_SENPLADES);
    getVariables(PATH_VARIABLES);
  }, []);

  // usuarios para sugerencias
  useEffect(() => {
    getUsers(`${PATH_USERS}?page=1&limit=50000`);
  }, [userUpdate]);

  useEffect(() => {
    if (userUpdate) loggedUser();
  }, [userUpdate]);

  useEffect(() => {
    if (error) {
      const msg = error?.response?.data?.message || "Error al actualizar";
      dispatch(showAlert({ message: `⚠️ ${msg}`, alertType: 1 }));
    }
  }, [error]);


  useEffect(() => {
    if (deleteReg) {
      dispatch(showAlert({ message: `⚠️ ${deleteReg?.message}`, alertType: 1 }));
    }
  }, [deleteUserApi]);

  const usersList = useMemo(() => usersAll?.data || [], [usersAll]);
  const senpladesVal = senplades || [];
  const variablesVal = variables || [];

  const obtenerCantonesPorProvincia = (provincia) =>
    senpladesVal.filter((item) => item.provincia === provincia);

  const handleProvinciaChange = (provincia) => {
    setSelectedProvincia(provincia);
    const cantones = obtenerCantonesPorProvincia(provincia);
    setCantonesOption(cantones);
    setSelectedCanton("");
  };

  // ===== validaciones =====
  const validarCedula = (cedula) => {
    cedula = cedula ? cedula.replace(/\D/g, "") : "";
    if (!/^\d{10}$/.test(cedula)) return false;

    const digitos = cedula.split("").map(Number);
    const digitoVerificador = digitos.pop();
    let suma = 0;

    for (let i = 0; i < digitos.length; i++) {
      let valor = digitos[i];
      if (i % 2 === 0) {
        valor *= 2;
        if (valor > 9) valor -= 9;
      }
      suma += valor;
    }

    const decenaSuperior = Math.ceil(suma / 10) * 10;
    return decenaSuperior - suma === digitoVerificador;
  };

  const capitalizeWords = (str) =>
    (str || "")
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  // ===== sugerencias: cédula o nombre =====
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const txt = (query || "").trim().toLowerCase();
    if (txt.length < 2) {
      setSugerencias([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const mapa = new Map();

      usersList.forEach((u) => {
        if (!u) return;
        const ciTxt = String(u.cI || "");
        const full = `${u.firstName || ""} ${u.lastName || ""}`.trim().toLowerCase();

        if (ciTxt.includes(txt) || full.includes(txt)) {
          if (!mapa.has(u.id)) mapa.set(u.id, u);
        }
      });

      setSugerencias(Array.from(mapa.values()).slice(0, 10));
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query, usersList]);

  const seleccionarUser = (u) => {
    setSelectedUser(u);
    setUserEdit(false);
    setSugerencias([]);
    setQuery(`${u.firstName || ""} ${u.lastName || ""}`.trim());

    // states controlados
    setFirstName(u.firstName || "");
    setLastName(u.lastName || "");
    setEmail(u.email || "");
    setCI(u.cI || "");
    setCellular(u.cellular || "");
    setDateBirth(u.dateBirth || "");

    setSelectedProvincia(u.province || "");
    setCantonesOption(obtenerCantonesPorProvincia(u.province || ""));
    setSelectedCanton(u.city || "");
    setSelectedGenero(u.genre || "");
    setSelectedGrado(u.grado || "");
    setSelectedSubsistema(u.subsistema || "");
    setSelectedRole(u.role || "student");
  };

  const limpiar = () => {
    setQuery("");
    setSugerencias([]);
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

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser?.id) return;

    // normalizaciones
    const cedulaLimpia = cI ? cI.trim().replace(/\D/g, "") : "";
    const celularLimpio = cellular ? cellular.trim().replace(/\D/g, "") : "";
    const emailFormateado = (email || "").trim().toLowerCase();

    const isValidCedula = cedulaLimpia ? validarCedula(cedulaLimpia) : true;
    const isValidCellular = celularLimpio ? /^09\d{8}$/.test(celularLimpio) : true;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormateado);

    if (!isValidCedula)
      return dispatch(showAlert({ message: "⚠️ La cédula ingresada es incorrecta.", alertType: 1 }));

    if (!isValidEmail)
      return dispatch(showAlert({ message: "⚠️ El email es incorrecto.", alertType: 1 }));

    if (!isValidCellular)
      return dispatch(
        showAlert({
          message: "⚠️ Celular inválido. Debe empezar con 09 y tener 10 dígitos.",
          alertType: 1,
        })
      );

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

    await updateUser(formattedData, selectedUser.id);

    dispatch(showAlert({ message: "✅ Usuario actualizado", alertType: 2 }));
    setUserEdit(false);

    await getUsers(`${PATH_USERS}?page=1&limit=5000`);

    // refrescar tarjeta (opcional)
    setSelectedUser((prev) => (prev ? { ...prev, ...formattedData } : prev));
  };

  const deleteUser = async (id) => {

    try {
      await deleteUserApi(id)

      setShowDelete(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    }
  };

  return (
    <div className="ue_page">
      {(isLoadingUsers || isLoadingAuth) && <IsLoading />}

      <section className="ue_shell">
        <div className="ue_card">
          <div className="ue_header">
            <h2 className="ue_title">Editar usuarios</h2>
            <p className="ue_subtitle">
              Busca por <strong>cédula</strong> o <strong>nombres</strong>. Selecciona y edita.
            </p>
          </div>

          {/* BUSCADOR */}
          <div className="ue_search">
            <div className="ue_searchBox">
              <input
                className="ue_input ue_input_center"
                type="text"
                placeholder="🔍 Buscar por cédula o nombres..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />

              {sugerencias.length > 0 && (
                <ul className="ue_suggest" role="listbox">
                  {sugerencias.map((u) => (
                    <li
                      key={u.id}
                      className="ue_suggestItem"
                      role="option"
                      onClick={() => seleccionarUser(u)}
                    >
                      <strong>
                        {u.firstName} {u.lastName}
                      </strong>{" "}
                      — {u.cI || "Sin cédula"}{" "}
                      <span className="ue_suggestMuted">({u.email})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="ue_btnDanger" type="button" onClick={limpiar}>
              ❌ Limpiar
            </button>
          </div>

          {!selectedUser ? (
            <p className="ue_empty">✍️ Escribe al menos 2 caracteres para ver sugerencias.</p>
          ) : (
            <section className="ue_profile">
              <div className="ue_profileTop">
                <div>
                  <h3 className="ue_profileName">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="ue_profileMeta">
                    <strong>ID:</strong> {selectedUser.id} · <strong>Email:</strong> {selectedUser.email}
                  </p>
                </div>

                <div className="ue_actions">
                  <button
                    type="button"
                    className="ue_btnPrimary"
                    onClick={() => setUserEdit((s) => !s)}
                  >
                    {userEdit ? "Cancelar edición" : "Editar"}
                    <span className="ue_btnArrow">➜</span>
                  </button>

                  <button
                    type="button"
                    className="ue_btnPrimary delete"
                    onClick={() => {
                      setUserIdDelete(selectedUser.id)
                      setShowDelete(true)
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <form className="ue_form" onSubmit={submitUpdate}>
                {/* col 1 */}
                <article className="ue_col">
                  <label className="ue_label">
                    <span className="ue_span">Nombres</span>
                    <input
                      className="ue_input"
                      readOnly={!userEdit}
                      style={{ border: userEdit ? "2px solid #cfd5e6" : "none" }}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      type="text"
                    />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Apellidos</span>
                    <input
                      className="ue_input"
                      readOnly={!userEdit}
                      style={{ border: userEdit ? "2px solid #cfd5e6" : "none" }}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                    />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Email</span>
                    <input
                      className="ue_input"
                      readOnly={!userEdit}
                      style={{ border: userEdit ? "2px solid #cfd5e6" : "none" }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="text"
                    />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Cédula</span>
                    <input
                      className="ue_input"
                      readOnly={!userEdit}
                      style={{ border: userEdit ? "2px solid #cfd5e6" : "none" }}
                      value={cI}
                      onChange={(e) => setCI(e.target.value)}
                      type="text"
                    />
                  </label>
                </article>

                {/* col 2 */}
                <article className="ue_col">
                  <label className="ue_label">
                    <span className="ue_span">Celular</span>
                    <input
                      className="ue_input"
                      readOnly={!userEdit}
                      style={{ border: userEdit ? "2px solid #cfd5e6" : "none" }}
                      value={cellular}
                      onChange={(e) => setCellular(e.target.value)}
                      type="text"
                    />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Fecha nacimiento</span>
                    <input
                      className="ue_input"
                      readOnly={!userEdit}
                      style={{ border: userEdit ? "2px solid #cfd5e6" : "none" }}
                      value={dateBirth || ""}
                      onChange={(e) => setDateBirth(e.target.value)}
                      type="date"
                    />
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Rol</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly style={{ border: "none" }} value={selectedRole || ""} />
                    ) : (
                      <select
                        className="ue_input"
                        style={{ border: "2px solid #cfd5e6" }}
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                        <option value="student">student</option>
                        <option value="Administrador">Administrador</option>
                        <option value="SubAdministrador">SubAdministrador</option>
                        <option value="Validador">Validador</option>
                        <option value="Secretaria">Secretaria</option>
                        <option value="instituto_cmcsce">instituto_cmcsce</option>
                      </select>
                    )}
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Género</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly style={{ border: "none" }} value={selectedGenero || ""} />
                    ) : (
                      <select
                        className="ue_input"
                        style={{ border: "2px solid #cfd5e6" }}
                        value={selectedGenero}
                        onChange={(e) => setSelectedGenero(e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        {variablesVal?.filter((v) => v.genero).map((g) => (
                          <option key={g.id} value={g.genero}>
                            {g.genero}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                </article>

                {/* col 3 */}
                <article className="ue_col">
                  <label className="ue_label">
                    <span className="ue_span">Provincia</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly style={{ border: "none" }} value={selectedProvincia || ""} />
                    ) : (
                      <select
                        className="ue_input"
                        style={{ border: "2px solid #cfd5e6" }}
                        value={selectedProvincia}
                        onChange={(e) => handleProvinciaChange(e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        {[...new Set(senpladesVal?.map((e) => e.provincia))].map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Ciudad</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly style={{ border: "none" }} value={selectedCanton || ""} />
                    ) : (
                      <select
                        className="ue_input"
                        style={{ border: "2px solid #cfd5e6" }}
                        value={selectedCanton}
                        onChange={(e) => setSelectedCanton(e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        {[...new Set(cantonesOption?.map((e) => e.canton))].map((canton) => (
                          <option key={canton} value={canton}>
                            {canton}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Subsistema</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly style={{ border: "none" }} value={selectedSubsistema || ""} />
                    ) : (
                      <select
                        className="ue_input"
                        style={{ border: "2px solid #cfd5e6" }}
                        value={selectedSubsistema}
                        onChange={(e) => setSelectedSubsistema(e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        {variablesVal?.filter((v) => v.subsistema).map((s) => (
                          <option key={s.id} value={s.subsistema}>
                            {s.subsistema}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>

                  <label className="ue_label">
                    <span className="ue_span">Grado</span>
                    {!userEdit ? (
                      <input className="ue_input" readOnly style={{ border: "none" }} value={selectedGrado || ""} />
                    ) : (
                      <select
                        className="ue_input"
                        style={{ border: "2px solid #cfd5e6" }}
                        value={selectedGrado}
                        onChange={(e) => setSelectedGrado(e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        {variablesVal?.filter((v) => v.grado).map((g) => (
                          <option key={g.id} value={g.grado}>
                            {g.grado}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                </article>

                <div className="ue_footer">
                  <button className="ue_btnPrimaryFull" type="submit" disabled={!userEdit}>
                    Guardar cambios <span className="ue_btnArrow">➜</span>
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
              <button className="btn yes" onClick={() => deleteUser(userIdDelete)} type="button">
                Sí
              </button>
              <button
                className="btn no"
                onClick={() => {
                  setShowDelete(false);
                  setUserIdDelete(null);
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
  );
};

export default UserEdit;
