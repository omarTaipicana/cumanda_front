import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import "./styles/Verify.css";

const Verify = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { code } = useParams();

  const [
    ,
    ,
    ,
    ,
    verifyUser,
    ,
    isLoading,
    error,
    verified,
  ] = useAuth();

  useEffect(() => {
    verifyUser(code);
  }, [code]);

  useEffect(() => {
    localStorage.removeItem("token");
  }, [code]);

  useEffect(() => {
    if (verified) {
      dispatch(
        showAlert({
          message: `⚠️ ${verified?.message}` || "Usuario verificado",
          alertType: 2,
        })
      );
    } else if (error) {
      dispatch(
        showAlert({
          message:
            `⚠️ ${error?.response?.data?.message}` ||
            "Error inesperado",
          alertType: 1,
        })
      );
    }
  }, [error, verified, dispatch]);

  return (
    <div className="verifyPage">
      <div className="verifyContainer">
        <section className="verifyCard">
          {!verified ? (
            <>
              <img
                className="verifyIcon"
                src="../../../no_verificado.png"
                alt="No verificado"
              />
              <h3 className="verifyTitle error">
                Código de verificación inválido
              </h3>
              <p className="verifyText">
                El enlace de verificación no es válido o ya fue utilizado.
              </p>
            </>
          ) : (
            <>
              <img
                className="verifyIcon"
                src="../../../verificado.png"
                alt="Verificado"
              />
              <h3 className="verifyTitle success">
                Usuario verificado correctamente
              </h3>
              <p className="verifyText">
                Tu cuenta ha sido activada con éxito. Ya puedes iniciar sesión.
              </p>

              <button
                className="verifyBtn"
                onClick={() => navigate("/login")}
              >
                Iniciar sesión <span>➜</span>
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Verify;
