import React, { useEffect, useState, useRef } from "react";
import "./styles/Home.css";
import useAuth from "../hooks/useAuth";
import IsLoading from "../components/shared/isLoading";

const Home = () => {
  const token = localStorage.getItem("token");
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const [activeSection, setActiveSection] = useState("datos-personales");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursoAbiertoIndex, setCursoAbiertoIndex] = useState(null);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;
      const success = await loggedUser();
      if (!success) {
        console.log("❌ Token inválido, removido");
        localStorage.removeItem("token");
        setUserLogged(null);
      }
    };
    checkToken();
  }, [token]);

  // Cerrar menú si clic fuera de menú y fuera del botón hamburguesa
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

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      const ultimoMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      dias += ultimoMes.getDate();
    }

    if (meses < 0) {
      años--;
      meses += 12;
    }

    return `${años} años ${meses} meses ${dias} días`;
  };

  return (
    <div className="homePage">
      <div className="homeShell">
        {/* Botón hamburguesa para mobile */}
        <button
          ref={hamburgerRef}
          className={`homeHamburger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span className="homeHamburgerLine"></span>
          <span className="homeHamburgerLine"></span>
          <span className="homeHamburgerLine"></span>
        </button>

        {/* Overlay mobile */}
        <div
          className={`homeOverlay ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}
        />

        {/* Menú lateral */}
        <nav
          className={`homeMenu ${menuOpen ? "open" : ""}`}
          ref={menuRef}
          aria-hidden={!menuOpen && window.innerWidth <= 768}
        >
          <div className="homeMenuHeader">
            <img
              src="/images/cumanda_sf.png"
              alt="Eduka"
              className="homeMenuLogo"
            />
            <p className="homeMenuSubtitle">Panel del estudiante</p>
          </div>

          <button
            className={`homeMenuBtn ${activeSection === "datos-personales" ? "active" : ""
              }`}
            onClick={() => handleSelect("datos-personales")}
          >
            📄 Datos Personales
          </button>

          <button
            className={`homeMenuBtn ${activeSection === "cursos" ? "active" : ""}`}
            onClick={() => handleSelect("cursos")}
          >
            📚 Cursos y Certificados
          </button>

          <button
            className={`homeMenuBtn ${activeSection === "calificaciones" ? "active" : ""
              }`}
            onClick={() => handleSelect("calificaciones")}
          >
            📝 Calificaciones
          </button>

          <button
            className={`homeMenuBtn ${activeSection === "pagos" ? "active" : ""}`}
            onClick={() => handleSelect("pagos")}
          >
            💳 Pagos
          </button>

          <button
            className={`homeMenuBtn ${activeSection === "advertencia" ? "active" : ""
              }`}
            onClick={() => handleSelect("advertencia")}
          >
            ⚠️ Importante
          </button>
        </nav>

        <main className="homeContent" tabIndex="-1">
          {/* ===== Datos personales ===== */}
          {activeSection === "datos-personales" && (
            <section className="homeCard">
              <div className="homeCardHeader">
                <h2 className="homeTitle">📄 Datos personales</h2>
              </div>

              {user ? (
                <ul className="homeDataGrid">
                  <li className="homeDataItem">
                    <span className="homeDataLabel">Nombre</span>
                    <span className="homeDataValue">
                      {user.firstName && user.lastName ? (
                        `${user.firstName} ${user.lastName}`
                      ) : (
                        <span className="homeWarn">Complete información</span>
                      )}
                    </span>
                  </li>

                  <li className="homeDataItem">
                    <span className="homeDataLabel">Cédula</span>
                    <span className="homeDataValue">
                      {user.cI || <span className="homeWarn">Complete información</span>}
                    </span>
                  </li>

                  <li className="homeDataItem">
                    <span className="homeDataLabel">Email</span>
                    <span className="homeDataValue">
                      {user.email || <span className="homeWarn">Complete información</span>}
                    </span>
                  </li>

                  <li className="homeDataItem">
                    <span className="homeDataLabel">Celular</span>
                    <span className="homeDataValue">
                      {user.cellular || <span className="homeWarn">Complete información</span>}
                    </span>
                  </li>

                  <li className="homeDataItem">
                    <span className="homeDataLabel">Edad</span>
                    <span className="homeDataValue">
                      {user.dateBirth ? (
                        calcularEdad(user.dateBirth)
                      ) : (
                        <span className="homeWarn">Complete información</span>
                      )}
                    </span>
                  </li>

                  <li className="homeDataItem">
                    <span className="homeDataLabel">Provincia</span>
                    <span className="homeDataValue">
                      {user.province || <span className="homeWarn">Complete información</span>}
                    </span>
                  </li>

                  <li className="homeDataItem">
                    <span className="homeDataLabel">Ciudad</span>
                    <span className="homeDataValue">
                      {user.city || <span className="homeWarn">Complete información</span>}
                    </span>
                  </li>

                  <li className="homeDataItem">
                    <span className="homeDataLabel">Grado</span>
                    <span className="homeDataValue">
                      {user.grado || <span className="homeWarn">Complete información</span>}
                    </span>
                  </li>

                  <li className="homeDataItem">
                    <span className="homeDataLabel">Eje Policial</span>
                    <span className="homeDataValue">
                      {user.subsistema || (
                        <span className="homeWarn">Complete información</span>
                      )}
                    </span>
                  </li>
                </ul>
              ) : (
                <IsLoading />
              )}
            </section>
          )}

          {/* ===== Cursos ===== */}
          {activeSection === "cursos" && (
            <section className="homeCard">
              <div className="homeCardHeader">
                <h2 className="homeTitle">📚 Cursos y Certificados</h2>
              </div>

              {user?.courses?.length > 0 ? (
                <ul className="homeList">
                  {user.courses.map((curso, i) => (
                    <li key={i} className="homeListItem">
                      <div className="homeListTop">
                        <span className="homeDot">•</span>
                        <a
                          className="homeLink"
                          href={`https://acadexeduc.com/course/view.php?name=${curso.curso}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {curso.fullname}
                        </a>
                      </div>

                      <div className="homeListBottom">
                        {curso.certificado?.url ? (
                          <a
                            className="homeLinkCert"
                            href={curso.certificado.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver certificado
                          </a>
                        ) : (
                          <span className="homeMuted">No hay certificado disponible</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="homeMuted">No hay cursos registrados.</p>
              )}
            </section>
          )}

          {/* ===== Calificaciones ===== */}
          {activeSection === "calificaciones" && (
            <section className="homeCard">
              <div className="homeCardHeader">
                <h2 className="homeTitle">📝 Calificaciones</h2>
              </div>

              {user?.courses?.length > 0 ? (
                <ul className="homeList">
                  {user.courses.map((curso, index) => {
                    const calificaciones = curso.grades || {};
                    const estaAbierto = cursoAbiertoIndex === index;

                    return (
                      <li key={index} className="homeListItem">
                        <button
                          onClick={() => setCursoAbiertoIndex(estaAbierto ? null : index)}
                          className="homeToggle"
                          type="button"
                        >
                          <span className="homeToggleArrow">{estaAbierto ? "▼" : "▶"}</span>
                          <span className="homeToggleText">{curso.fullname}</span>
                        </button>

                        {estaAbierto && (
                          <>
                            {/* Estados */}
                            {!curso.inscripcion && (
                              <p className="homeStatus danger">
                                ❌ No tiene inscripción en este curso.
                              </p>
                            )}

                            {curso.inscripcion && !curso.matriculado && (
                              <p className="homeStatus warn">
                                ⚠️ Está inscrito pero no matriculado. Solicite a soporte su
                                matriculación.
                              </p>
                            )}

                            {/* ✅ Calificaciones: se muestran si existen, sin depender de inscripcion/matriculado */}
                            {Object.keys(calificaciones).length > 0 ? (
                              <ul className="homeNotes">
                                {Object.entries(calificaciones).map(([actividad, nota]) => (
                                  <li key={actividad} className="homeNoteItem">
                                    <strong>{actividad}:</strong> {nota}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="homeMuted">No hay calificaciones registradas.</p>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="homeMuted">No hay cursos registrados.</p>
              )}

            </section>
          )}

          {/* ===== Pagos ===== */}
          {activeSection === "pagos" && (
            <section className="homeCard">
              <div className="homeCardHeader">
                <h2 className="homeTitle">💳 Pagos</h2>
              </div>

              {user?.courses?.some((c) => c.pagos?.length > 0) ? (
                <div className="homePayments">
                  {user.courses.map((curso, i) => {
                    if (!curso.pagos || curso.pagos.length === 0) return null;

                    return (
                      <div key={i} className="homePaymentCourse">
                        <p className="homePaymentCourseTitle">
                          <strong>Curso:</strong> {curso.fullname}
                        </p>

                        {curso.pagos.map((pago, j) => {
                          const extras = [];
                          if (pago.moneda) extras.push("moneda");
                          if (pago.distintivo) extras.push("distintivo");

                          return (
                            <div key={j} className="homePaymentItem">
                              <p>
                                <strong>Pago #{j + 1}</strong>{" "}
                                {j === 0
                                  ? `por el certificado${extras.length > 0
                                    ? ", incluyendo " + extras.join(" y ")
                                    : ""
                                  }`
                                  : extras.length > 0
                                    ? `por ${extras.join(" y ")}`
                                    : ""}
                                .
                              </p>

                              <p>
                                <strong>Estado:</strong>{" "}
                                {pago.verificado ? (
                                  <span className="homeStatus ok">✅ Verificado</span>
                                ) : (
                                  <span className="homeStatus pending">⏳ Por verificar</span>
                                )}
                              </p>

                              <p>
                                <strong>Monto:</strong> ${pago.valorDepositado}
                              </p>

                              <a
                                href={pago.pagoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="homeBtnLink"
                              >
                                Ver comprobante de pago <span>➜</span>
                              </a>

                              <hr className="homeDivider" />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="homeMuted">No se encontraron pagos registrados.</p>
              )}
            </section>
          )}

          {/* ===== Advertencia ===== */}
          {activeSection === "advertencia" && (
            <section className="homeCard">
              <div className="homeCardHeader">
                <h2 className="homeTitle">⚠️ Importante</h2>
              </div>

              <div className="homeNotice">
                <p>
                  Verifica que tus datos personales estén correctos, ya que los
                  nombres y la información que ingreses aquí se reflejarán en tus
                  certificados. Puedes modificar tu información desde tu perfil,
                  asegurándote de usar tildes y caracteres especiales correctamente.
                </p>
                <p>
                  Si detectas que tu correo registrado en Moodle es diferente al de
                  tu perfil, es posible que no veas tu información de cursos y
                  calificaciones. En ese caso, solicita al administrador la
                  corrección correspondiente.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
