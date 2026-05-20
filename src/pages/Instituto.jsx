import React, { useEffect, useMemo, useRef, useState } from "react";
import useCrud from "../hooks/useCrud";
import IsLoadingUpload from "../components/shared/isLoadingUpload";
import IsLoading from "../components/shared/isLoading";
import "./styles/Instituto.css";
import useAuth from "../hooks/useAuth";

const Instituto = () => {
  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;
  const [, , , loggedUser, , , , , , , , , , user] = useAuth();
  const [filtroCurso, setFiltroCurso] = useState("");

  const rolePath = useMemo(() => {
    if (!user) return "";

    // SUPERADMIN → toma del select
    if (user.cI === superAdmin) {
      return filtroCurso || "";
    }

    // USUARIO NORMAL → toma del rol
    return user?.role?.replace("instituto_", "") || "";
  }, [user, filtroCurso, superAdmin]);

  const PATH_CERTIFICADOS = rolePath
    ? `/instituto/certificados/${rolePath}`
    : null;

  const PATH_CERTIFICADOS_DESCARGAR = rolePath
    ? `/instituto/certificados/${rolePath}/descargar`
    : null;

  const PATH_CERTIFICADOS_SUBIR = rolePath
    ? `/instituto/certificados/${rolePath}/subir`
    : null;
  const PATH_COURSES = "/courses";

  const [certificados, getCertificados] = useCrud();
  const [, , , , , , , , , , , , , postApiDownloadZip] = useCrud();
  const [, , , , , , isLoading, , , , , , , , uploadCertificadosZip] =
    useCrud();
  const [courses, getCourses] = useCrud();

  const [activeSection, setActiveSection] = useState("descargar");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const [selectedArchivos, setSelectedArchivos] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [archivoZip, setArchivoZip] = useState(null);
  const [sendingDownload, setSendingDownload] = useState(false);
  const [sendingUpload, setSendingUpload] = useState(false);

  useEffect(() => {
    loggedUser();
    getCourses(PATH_COURSES);
  }, []);

  useEffect(() => {
    if (PATH_CERTIFICADOS) {
      getCertificados(PATH_CERTIFICADOS);
    }
  }, [PATH_CERTIFICADOS]);

  // Cerrar menú si clic fuera (igual que Home)
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

  const handleSelect = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  const listaArchivos = certificados?.archivos || [];

  // Mantener selectAll consistente si cambian archivos
  useEffect(() => {
    if (!listaArchivos.length) {
      setSelectAll(false);
      setSelectedArchivos([]);
      return;
    }
    setSelectAll(selectedArchivos.length === listaArchivos.length);
  }, [listaArchivos.length]);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      setSelectedArchivos(listaArchivos.map((a) => a.nombreArchivo));
    } else {
      setSelectedArchivos([]);
    }
  };

  const handleSelectOne = (nombreArchivo) => {
    setSelectedArchivos((prev) => {
      if (prev.includes(nombreArchivo)) {
        const nuevo = prev.filter((n) => n !== nombreArchivo);
        setSelectAll(false);
        return nuevo;
      }
      const nuevo = [...prev, nombreArchivo];
      if (nuevo.length === listaArchivos.length) setSelectAll(true);
      return nuevo;
    });
  };

  const handleDescargarSeleccionados = async () => {
    if (selectedArchivos.length === 0) {
      alert("Selecciona al menos un certificado.");
      return;
    }

    const data = { archivos: selectedArchivos };

    try {
      setSendingDownload(true);
      await postApiDownloadZip(PATH_CERTIFICADOS_DESCARGAR, data);
      alert("Solicitud enviada. Se generará la descarga.");
    } catch (err) {
      console.error(err);
      alert("Error al solicitar descarga.");
    } finally {
      setSendingDownload(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setArchivoZip(file || null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!archivoZip) {
      alert("Selecciona un comprimido primero.");
      return;
    }

    try {
      setSendingUpload(true);
      await uploadCertificadosZip(PATH_CERTIFICADOS_SUBIR, archivoZip);
      alert("Archivo subido correctamente.");
      setArchivoZip(null);
      e.target.reset();
      getCertificados(PATH_CERTIFICADOS);
    } catch (err) {
      console.error(err);
      alert("Error al subir archivo.");
    } finally {
      setSendingUpload(false);
    }
  };

  return (
    <div className="institutoPage">
      {isLoading && <IsLoadingUpload />}

      <div className="institutoShell">
        {/* Botón hamburguesa mobile */}
        <button
          ref={hamburgerRef}
          className={`institutoHamburger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span className="institutoHamburgerLine"></span>
          <span className="institutoHamburgerLine"></span>
          <span className="institutoHamburgerLine"></span>
        </button>

        {/* Overlay mobile */}
        <div
          className={`institutoOverlay ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}
        />

        {/* Menú lateral */}
        <nav
          className={`institutoMenu ${menuOpen ? "open" : ""}`}
          ref={menuRef}
          aria-hidden={!menuOpen && window.innerWidth <= 768}
        >
          <div className="institutoMenuHeader">
            <img
              src="/images/cumanda_sf.png"
              alt="Eduka"
              className="institutoMenuLogo"
            />
            <p className="institutoMenuSubtitle">Panel Instituto</p>
          </div>

          <button
            className={`institutoMenuBtn ${
              activeSection === "descargar" ? "active" : ""
            }`}
            onClick={() => handleSelect("descargar")}
          >
            📥 Descargar certificados
          </button>

          <button
            className={`institutoMenuBtn ${
              activeSection === "subir" ? "active" : ""
            }`}
            onClick={() => handleSelect("subir")}
          >
            📤 Subir certificados firmados
          </button>
        </nav>

        {/* Contenido */}
        <main className="institutoContent" tabIndex="-1">
          {/* ===== Descargar ===== */}
          {activeSection === "descargar" && (
            <section className="institutoCard">
              <div className="institutoCardHeader">
                <h2 className="institutoTitle">📥 Descargar certificados</h2>
              </div>

              {!certificados ? (
                <IsLoading />
              ) : listaArchivos.length > 0 ? (
                <>
                  {user.cI === superAdmin && (
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
                  )}
                  <p className="institutoDescription">
                    Selecciona uno o varios certificados. El botón “Ver” abre el
                    PDF, y “Descargar” enviará los seleccionados al backend.
                  </p>

                  <span className="instSelectedInfo">
                    {selectedArchivos.length
                      ? `${selectedArchivos.length} seleccionado(s)`
                      : "Ninguno seleccionado"}{" "}
                    de {listaArchivos.length}
                  </span>

                  <div className="instTableWrapper">
                    <table className="instTable">
                      <thead>
                        <tr>
                          <th className="instCheckCell">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                            />
                          </th>
                          <th>Cédula</th>
                          <th>Nombre del archivo</th>
                          <th>Ver</th>
                        </tr>
                      </thead>

                      <tbody>
                        {listaArchivos.map((item, idx) => (
                          <tr key={idx}>
                            <td className="instCheckCell">
                              <input
                                type="checkbox"
                                checked={selectedArchivos.includes(
                                  item.nombreArchivo,
                                )}
                                onChange={() =>
                                  handleSelectOne(item.nombreArchivo)
                                }
                              />
                            </td>
                            <td>{item.cedula}</td>
                            <td className="instFileName">
                              {item.nombreArchivo}
                            </td>
                            <td>
                              <a
                                className="instBtnOutline"
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="instActions">
                    <button
                      className="instPrimaryBtn"
                      onClick={handleDescargarSeleccionados}
                      disabled={
                        sendingDownload || selectedArchivos.length === 0
                      }
                    >
                      {sendingDownload
                        ? "Generando..."
                        : "Descargar seleccionados"}
                    </button>

                    <span className="instSelectedInfo">
                      {selectedArchivos.length
                        ? `${selectedArchivos.length} seleccionado(s)`
                        : "Ninguno seleccionado"}
                    </span>
                  </div>

                  <pre className="instJsonPreview">
                    {JSON.stringify({ archivos: selectedArchivos }, null, 2)}
                  </pre>
                </>
              ) : (
                <div>
                  <p className="institutoMuted">
                    No hay certificados disponibles.
                  </p>
                  {user?.cI === superAdmin && (
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
                  )}
                </div>
              )}
            </section>
          )}

          {/* ===== Subir ===== */}
          {activeSection === "subir" && (
            <section className="institutoCard">
              <div className="institutoCardHeader">
                <h2 className="institutoTitle">
                  📤 Subir certificados firmados
                </h2>
              </div>

              <p className="institutoDescription">
                Sube un archivo comprimido (ZIP/RAR/7Z) con los certificados
                firmados.
              </p>

              <form className="instUploadForm" onSubmit={handleUpload}>
                <label className="instFileLabel">
                  <span>Archivo comprimido</span>
                  <input
                    type="file"
                    accept=".zip,.rar,.7z"
                    onChange={handleFileChange}
                    className="instFileInput"
                  />
                </label>

                {archivoZip && (
                  <p className="instFileNamePreview">
                    Archivo seleccionado: <strong>{archivoZip.name}</strong>
                  </p>
                )}

                <button
                  type="submit"
                  className="instPrimaryBtn"
                  disabled={sendingUpload}
                >
                  {sendingUpload ? "Subiendo..." : "Subir"}
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Instituto;
