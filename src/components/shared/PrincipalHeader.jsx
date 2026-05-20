import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./styles/PrincipalHeader.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import useAuth from "../../hooks/useAuth";

import { FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";

const PrincipalHeader = () => {
  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;

  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [grados, setGrados] = useState({
    grado1: false,
    grado2: false,
    grado3: false,
    grado4: false,
    grado5: false,
    grado6: false,
    grado7: false,
  });

  const onlyLogoRoutes = ["/register_discente", "/register_pago"];

  const showOnlyLogo = onlyLogoRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // Configurar grados según CI o rol
  useEffect(() => {
    if (!user?.role) return;

    const ci = user?.cI;
    const role = user?.role;

    setGrados({
      grado1: ci === superAdmin, // Superadmin (acceso total)
      grado2: role === "Administrador",
      grado3: role === "Sub-Administrador",
      grado4: role === "Validador",
      grado5: role === "Secretaria",
      grado6: role?.slice(0, 9) === "instituto",
      grado7: ![
        superAdmin,
        "Administrador",
        "Sub-Administrador",
        "Validador",
        "Secretaria",
      ].includes(role),
    });
  }, [user]);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;

      const success = await loggedUser();

      if (!success) {
        console.log("❌ Token inválido, removido");
        localStorage.removeItem("token");
        setUserLogged(null);
        window.__RN_LOGOUT__?.();
      }
    };
    checkToken();
  }, [token]);

  const handleLogout = () => {
    if (user) {
      const capitalizeWord = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

      const firstName = capitalizeWord(user?.firstName);
      const lastName = capitalizeWord(user?.lastName);

      dispatch(
        showAlert({
          message: `⚠️ Hasta pronto ${firstName} ${lastName}, te esperamos.`,
          alertType: 4,
        })
      );
    }
    localStorage.removeItem("token");
    setUserLogged();
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  /** LINKS SEGÚN ROL (misma lógica que antes, solo encapsulada) */
  const renderRoleLinks = (onClick) => {
    if (!token) return null;

    if (grados.grado1) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/instituto" onClick={onClick}>
            Instituto
          </Link>
          <Link to="/secre" onClick={onClick}>
            Secretaria
          </Link>
        </>
      );
    }

    if (grados.grado2) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/secre" onClick={onClick}>
            Secretaria
          </Link>
        </>
      );
    }

    if (grados.grado3) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/validacion" onClick={onClick}>
            Validacion
          </Link>
        </>
      );
    }

    if (grados.grado4) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
        </>
      );
    }

    if (grados.grado5) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
        </>
      );
    }

    if (grados.grado6) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
        </>
      );
    }

    if (grados.grado7) {
      return (
        <Link to="/home" onClick={onClick}>
          Home
        </Link>
      );
    }

    return null;
  };

  /** AUTH EN NAVBAR (derecha, desktop) */

  const renderAuthDesktop = (onClick) => {
    if (!token) return null;

    return (
      <>
        {grados.grado1 && (
          <>
            <Link to="/dashboard" onClick={onClick}>
              Dashboard
            </Link>
            <Link to="/validacion" onClick={onClick}>
              Validacion
            </Link>
            <Link to="/edit_user" onClick={onClick}>
              Editar Usuario
            </Link>
          </>
        )}

        {grados.grado2 && (
          <>
            <Link to="/dashboard" onClick={onClick}>
              Dashboard
            </Link>
            <Link to="/validacion" onClick={onClick}>
              Validacion
            </Link>
          </>
        )}

        {grados.grado3 && (
          <Link to="/secre" onClick={onClick}>
            Secretaria
          </Link>
        )}

        {grados.grado4 && (
          <Link to="/validacion" onClick={onClick}>
            Validacion
          </Link>
        )}

        {grados.grado5 && (
          <Link to="/secre" onClick={onClick}>
            Secretaria
          </Link>
        )}

        {grados.grado6 && (
          <Link to="/instituto" onClick={onClick}>
            Instituto
          </Link>
        )}

        {/* perfil */}
        <Link to="/login" onClick={closeMenu}>
          <img
            className="user__icon"
            src="../../../user.png"
            alt="User Icon"
          />
        </Link>

        {/* logout desktop */}
        <button
          onClick={handleLogout}
          className="logout__button"
          type="button"
        >
          Salir
        </button>
      </>
    );
  };

  /** AUTH EN MOBILE MENU */
  /** AUTH EN MOBILE MENU (igual que desktop) */
  const renderAuthMobile = () => {
    if (!token) {
      return (
        <>
          <Link to="/register" onClick={closeMenu}>
            Register
          </Link>
          <Link to="/login" onClick={closeMenu}>
            Login
          </Link>
        </>
      );
    }

    return (
      <>
        {/* mismos links que desktop (derecha) */}
        {renderAuthDesktop(closeMenu)}


      </>
    );
  };

  return (
    <header className="header_nav">
      {showOnlyLogo ? (
        <nav className={`navbar ${showOnlyLogo ? "navbar--only-logo" : ""}`}>
          <Link to="/" className="logo_link">
            <img
              src="/images/cumanda_sf.png"
              alt="Logo Eduka"
              className="logo_navbar_ph"
            />
          </Link>
        </nav>
      ) : (
        <>
          <nav className="navbar">
            <button
              className={`menu_icon ${menuOpen ? "menu_icon--open" : ""}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div className="navbar_links navbar_links-left">
              {renderRoleLinks(closeMenu)}
            </div>

            <Link to="/cmcsce" onClick={closeMenu} className="logo_link">
              <img
                src="/images/cumanda_sf.png"
                alt="Logo Eduka"
                className="logo_navbar_ph"
              />
            </Link>

            <div className="navbar_links navbar_links-right">
              {renderAuthDesktop(closeMenu)}
            </div>
          </nav>

          <div
            className={`navbar_mobile_menu ${menuOpen ? "navbar_mobile_menu--open" : ""
              }`}
          >
            {renderRoleLinks(closeMenu)}
            {renderAuthMobile()}
          </div>
        </>
      )}
    </header>
  );
};

export default PrincipalHeader;
