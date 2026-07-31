import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Alert from "./components/shared/Alert";
import Home from "./pages/Home";
import PrincipalHeader from "./components/shared/PrincipalHeader";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import ResetPasswordSendEmail from "./pages/auth/ResetPasswordSendEmail";
import ChangePassword from "./pages/auth/ChangePassword";
import Footer from "./components/shared/Footer";
import RegistroAlumnos from "./components/Formularios/RegistroAlumnos";
import { RegistroPagos } from "./components/Formularios/RegistroPagos";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import ValidadorProtectedRoute from "./routes/ValidadorProtectedRoute";
import SubAdminProtectedRoutes from "./routes/SubAdminProtectedRoutes";
import ValidacionPago from "./pages/ValidacionPago";
import Dashboard from "./pages/Dashboard";
import Secretaria from "./pages/Secretaria";
import SecretariaRoutes from "./routes/SecretariaRoutes";

import Instituto from "./pages/Instituto";
import InstitutoProtectedRoute from "./routes/InstitutoProtectedRoute";
import SuperAdminProtectedRoute from "./routes/SuperAdminProtectedRoute";
import UserEdit from "./pages/UserEdit";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import Cmcsce from "./components/Cursos/Cmcsce";
import Cebtspidpc from "./components/Cursos/Cebtspidpc";

const App = () => {
  const location = useLocation();
  const showHeader = location.pathname !== "/";

  // main.jsx o App.jsx (una sola vez)
  useEffect(() => {
    window.__RN_LOGOUT__ = () => {
      try {
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({ type: "LOGOUT" }),
        );
      } catch { }
    };
  }, []);

  return (
    <div>
      {location.pathname !== "/" && <PrincipalHeader />}
      <main
        className={showHeader ? "app-main app-main--with-header" : "app-main"}
      ></main>

      {/* <Routes>
        <Route path="/register_discente/:code" element={<RegistroAlumnos />} />
        <Route path="/register_pago/:code" element={<RegistroPagos />} />
        <Route path="/cimcsce" element={<Cimcsce />} />

        <Route path="*" element={<Navigate to="/cimcsce" replace />} />
      </Routes> */}

      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:code" element={<Verify />} />
        <Route path="/reset_password" element={<ResetPasswordSendEmail />} />
        <Route path="/reset_password/:code" element={<ChangePassword />} />

        <Route path="/register_discente/:code" element={<RegistroAlumnos />} />
        <Route path="/register_pago/:code" element={<RegistroPagos />} />

        <Route path="/cmcsce" element={<Cmcsce />} />

        <Route path="/cebtspidpc" element={<Cebtspidpc />} />


        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<Home />} />

          <Route element={<InstitutoProtectedRoute />}>
            <Route path="/instituto" element={<Instituto />} />
          </Route>

          <Route element={<SecretariaRoutes />}>
            <Route path="/secre" element={<Secretaria />} />
          </Route>

          <Route element={<ValidadorProtectedRoute />}>
            <Route path="/validacion" element={<ValidacionPago />} />

            <Route element={<SubAdminProtectedRoutes />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route element={<SuperAdminProtectedRoute />}>
                <Route path="/edit_user" element={<UserEdit />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
      {/* <Footer /> */}
      <Alert />
    </div>
  );
};

export default App;
