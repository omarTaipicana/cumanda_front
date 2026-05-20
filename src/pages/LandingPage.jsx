import React, { useState, useRef, useEffect } from "react";
// import "./styles/LandingPage.css";
import { Link, useNavigate } from "react-router-dom";

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaBars,
  FaTimes,
  FaTiktok,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";
import useAuth from "../hooks/useAuth";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const PATH_CONTACTANOS = "/contactanos";
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

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

  const [, , postApi, , , , isLoading, newReg, , ,] = useCrud();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const submit = (data) => {
    postApi(PATH_CONTACTANOS, data);
    reset();
  };

  useEffect(() => {
    if (newReg) {
      dispatch(
        showAlert({
          message: `⚠️ Estimad@ ${newReg?.nombres}, recibimos tu mensaje exitosamente`,
          alertType: 2,
        })
      );
    }
  }, [newReg]);

  const [menuOpen, setMenuOpen] = useState(false);

  const inicioRef = useRef(null);
  const cursosRef = useRef(null);
  const nosotrosRef = useRef(null);
  const contactoRef = useRef(null);

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleRegisterClick = () => {
    navigate("/register");
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const scrollToSection = (ref) => {
    const offset = 120; // 9rem ≈ 144px
    const element = ref.current;

    if (!element) return;

    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    setMenuOpen(false);
  };

  return (
    <div className="app">
      {isLoading && <IsLoading />}

      {/* FRANJA BLANCA SUPERIOR */}
      <div className="topbars">
        <div className="topbar-left">
          <a
            href="https://www.google.com/maps?q=-0.200737103819847,-78.4886245727539"
            target="_blank"
            rel="noopener noreferrer"
            className="link_footer"
          >
            <span className="topbar-item">
              <FaMapMarkerAlt />
              Reina Victoria y Cristobal Colón / Quito - Ecuador
            </span>
          </a>
          <a
            href="https://wa.me/593980773229"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="topbar-item">
              <FaWhatsapp />
              +593 980 773 229
            </span>
          </a>
        </div>

        <div className="topbar-right">
          {!token ? (
            <>
              <button className="topbar-link" onClick={handleRegisterClick}>
                <img
                  className="user_icon"
                  src="../../../user.png"
                  alt="User Icon"
                  onClick={handleRegisterClick}
                />
                Registrarse
              </button>
              <span className="topbar-separator">|</span>
              <button className="topbar-link" onClick={handleLoginClick}>
                Ingresar
              </button>
            </>
          ) : (
            <button className="topbar-link" onClick={handleRegisterClick}>
              Mi cuenta
            </button>
          )}
        </div>
      </div>

      <nav className="navbar">
        <div className="menu_icon" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className="navbar_links navbar_links-left">
          <button onClick={() => scrollToSection(inicioRef)}>Inicio</button>
          <button onClick={() => scrollToSection(nosotrosRef)}>Nosotros</button>
        </div>

        <img
          src="/images/cumanda_sf.png"
          alt="Logo Eduka"
          className="logo_navbar"
          onClick={() => scrollToSection(inicioRef)}
        />

        <div className="navbar_links navbar_links-right">
          <button onClick={() => scrollToSection(cursosRef)}>Cursos</button>
          <button onClick={() => scrollToSection(contactoRef)}>
            Contactos
          </button>
        </div>
      </nav>

      <div
        className={`navbar_mobile_menu ${
          menuOpen ? "navbar_mobile_menu--open" : ""
        }`}
      >
        <button onClick={() => scrollToSection(inicioRef)}>Inicio</button>
        <button onClick={() => scrollToSection(nosotrosRef)}>Nosotros</button>
        <button onClick={() => scrollToSection(cursosRef)}>Cursos</button>
        <button onClick={() => scrollToSection(contactoRef)}>Contactos</button>
      </div>

      <motion.section
        className="hero"
        ref={inicioRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="hero-card">
          <h1>¡Tu camino hacia el conocimiento empieza aquí!</h1>
          <p>Aprende, crece y mejora con nuestros cursos.</p>
          <button
            type="button"
            className="hero-cta"
            onClick={() => scrollToSection(contactoRef)}
          >
            Contáctanos <span className="hero-cta-arrow">➜</span>
          </button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8 }}
        className="nosotros"
        ref={nosotrosRef}
      >
        <div className="nosotros-inner">
          <div className="nosotros-header">
            <img src="/mano_1.png" alt="hand" className="mano_1" />
            <h2 className="nosotros-title">¿Por qué elegir a EDUKA?</h2>
          </div>

          <div className="nosotros-content">
            <p>
              <strong>Eduka</strong> es una plataforma de formación en línea
              comprometida con el fortalecimiento de las capacidades
              profesionales de los servidores policiales del Ecuador. Nuestra
              misión es proporcionar programas educativos actualizados y de alta
              calidad que respondan a los desafíos actuales en materia de
              seguridad ciudadana, derechos humanos, y gestión del orden
              público.
            </p>

            <p>
              A través de nuestras aulas virtuales, los participantes acceden a
              contenidos interactivos, estudios de caso, simulaciones y recursos
              actualizados, diseñados para fortalecer sus conocimientos en áreas
              estratégicas como inteligencia policial, liderazgo operativo,
              mediación de conflictos, uso progresivo de la fuerza,
              ciberseguridad y gestión de crisis.
            </p>

            <p>
              Contamos con la colaboración de un equipo docente internacional
              conformado por expertos y académicos de reconocidas instituciones
              en América Latina y Europa. Esta cooperación multinacional nos
              permite ofrecer una perspectiva comparada, moderna y práctica,
              adaptada a la realidad operativa de la Policía Nacional del
              Ecuador.
            </p>

            <p>
              En <strong>Eduka</strong>, creemos firmemente que una policía
              mejor preparada es clave para construir comunidades más seguras,
              justas y resilientes. Por ello, seguimos innovando en nuestras
              metodologías y expandiendo alianzas académicas con el fin de
              contribuir de forma sostenible al desarrollo profesional de
              quienes protegen y sirven a nuestra sociedad.
            </p>
          </div>
        </div>

        <div className="mvv-section">
          <div className="mvv-card">
            <img src="/flecha.png" alt="flecha" className="mvv-icon" />
            <h3 className="mvv-title">Misión</h3>
            <p className="mvv-text">
              Fortalecer las capacidades profesionales de los servidores
              policiales del Ecuador mediante programas de formación en línea
              actualizados, accesibles y orientados a la práctica. Impulsamos el
              desarrollo de competencias técnicas y éticas que respondan a los
              retos contemporáneos de la seguridad ciudadana, promoviendo un
              servicio más eficiente, humano y comprometido con la sociedad.
            </p>
          </div>

          <div className="mvv-card">
            <img src="/foco.png" alt="foco" className="mvv-icon" />
            <h3 className="mvv-title">Visión</h3>
            <p className="mvv-text">
              Convertirnos en la plataforma líder en capacitación policial y
              seguridad pública en la región, reconocida por su calidad
              académica, su enfoque innovador y su capacidad para generar
              aprendizajes significativos. Aspiramos a transformar la formación
              profesional de los servidores policiales y contribuir al
              fortalecimiento de una fuerza pública preparada, responsable y
              alineada con las necesidades actuales del país.
            </p>
          </div>

          <div className="mvv-card">
            <img src="/mano_2.png" alt="hand" className="mvv-icon" />
            <h3 className="mvv-title">Valores</h3>
            <p className="mvv-text">
              Nos guiamos por la excelencia académica, asegurando contenidos de
              alto nivel y pertinencia. Fomentamos la innovación en cada proceso
              formativo, promovemos una práctica profesional ética y respetuosa
              de los derechos humanos, e impulsamos la cooperación internacional
              para enriquecer nuestras propuestas. Estos valores sostienen
              nuestro compromiso con una policía más capacitada, consciente y
              orientada al bienestar de la comunidad.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="cursos"
        ref={cursosRef}
      >
        <div className="cursos-inner">
          {/* Título con icono */}
          <div className="cursos-header">
            <img
              src="/cursos.png"
              alt="icono cursos"
              className="cursos-header-icon"
            />
            <h2 className="cursos-title">Nuestros Cursos</h2>
          </div>

          {/* Lista de cursos */}
          <div className="cursos-grid">
     

            <Link to="/cidteiafp">
              <article className="curso-item">
                <img
                  src="/accv.png"
                  alt="Análisis en conducta"
                  className="curso-icon"
                />
                <h3 className="curso-name">
                  Curso Internacional de Lengua de Señas
                </h3>
                <button className="curso-cta">
                  Conocer más <span>➜</span>
                </button>
              </article>
            </Link>

   
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="contacto"
        ref={contactoRef}
      >
        <div className="contacto-inner">
          {/* FORMULARIO */}
          <form onSubmit={handleSubmit(submit)} className="contacto-form">
            <h2 className="contacto-title">Contáctanos</h2>
            <p className="contacto-subtitle">
              Para nosotros es un placer poder solucionar tus dudas.
            </p>

            <input
              type="text"
              placeholder="Ingresa tu nombre completo"
              required
              {...register("nombres")}
            />

            <input
              type="text"
              placeholder="Ingresa tu número de celular"
              required
              {...register("celular")}
            />

            <input
              type="email"
              placeholder="Ingresa tu email"
              required
              {...register("email")}
            />

            <textarea
              rows="4"
              placeholder="Escribe tu mensaje"
              required
              {...register("mensaje")}
            ></textarea>

            <button type="submit" className="contacto-btn">
              Enviar <span>➜</span>
            </button>
          </form>

          {/* MAPA */}
          <div className="contacto-map">
            <iframe
              title="Ubicación Eduka"
              src="https://www.google.com/maps?q=-0.200737103819847,-78.4886245727539&z=17&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </motion.section>

      <footer className="footer">
        <div className="footer-inner">
          {/* Columna izquierda: logo + suscripción */}
          <div className="footer-left">
            <img
              src="/images/cumanda_sf.png"
              alt="Logo Eduka"
              className="footer-logo"
            />

            <h3 className="footer-subscribe-title">
              Suscribirse para obtener información de cursos
            </h3>

            <div className="footer-subscribe">
              <input
                type="email"
                className="footer-input"
                placeholder="Ingresa tu correo electrónico"
              />
              <button type="button" className="footer-btn">
                Enviar <span>➜</span>
              </button>
            </div>
          </div>

          {/* Columna centro: menú + redes */}
          <div className="footer-middle">
            <h4 className="footer-section-title">Menú</h4>
            <nav className="footer-menu">
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(inicioRef)}
              >
                Inicio
              </button>
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(nosotrosRef)}
              >
                Nosotros
              </button>
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(cursosRef)}
              >
                Cursos
              </button>
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(contactoRef)}
              >
                Contactos
              </button>
            </nav>

            <h4 className="footer-section-title footer-social-title">
              ¡Síguenos!
            </h4>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/share/19srLS1HBi/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://www.instagram.com/eduka_ce?igsh=cDR2dnM5ejZnZnc4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.tiktok.com/@eduka397?_t=ZM-8xGVPfqbdOK&_r=1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok />
              </a>
            </div>
          </div>

          {/* Columna derecha: contacto + plataforma */}
          <div className="footer-right">
            <div className="footer-block">
              <h4 className="footer-section-title">¡Escríbenos!</h4>
              <a
                href="mailto:eduka.corporacioneducativa@gmail.com"
                className="footer-text-link"
              >
                eduka.corporacioneducativa@gmail.com
              </a>
            </div>

            <div className="footer-block">
              <h4 className="footer-section-title">¡Llámanos!</h4>
              <a href="tel:+593980773229" className="footer-text-link">
                +593 980 773 229
              </a>
            </div>

            <div className="footer-block">
              <h4 className="footer-section-title">¡Ubícanos!</h4>
              <a
                href="https://www.google.com/maps?q=-0.200737103819847,-78.4886245727539"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-text-link"
              >
                Reina Victoria y Cristobal Colón
                <br />
                Quito - Ecuador
              </a>
            </div>

            <div className="footer-block">
              <h4 className="footer-section-title">Plataforma educativa</h4>
              <a
                href="https://acadexeduc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-text-link"
              >
                Accede a nuestra plataforma educativa
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Copyright 2025 Eduka Corporación Educativa</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
