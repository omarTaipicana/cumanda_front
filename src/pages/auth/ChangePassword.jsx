import React, { useEffect, useState } from "react";
import "./styles/ChangePassword.css";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import useAuth from "../../hooks/useAuth";
import IsLoading from "../../components/shared/isLoading";

const ChangePassword = () => {
  const { code: code } = useParams();
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();
  const [hidePassword_1, setHidePassword_1] = useState(true);
  const [hidePassword_2, setHidePassword_2] = useState(true);
  const [
    registerUser,
    updateUser,
    loginUser,
    loggedUser,
    verifyUser,
    userRegister,
    isLoading,
    error,
    verified,
    sendEmail,
    userResetPassword,
    changePassword,
  ] = useAuth();
  useEffect(() => {
    localStorage.removeItem("token");
  }, [code]);

  const submit = (data) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

    if (!passwordRegex.test(data.password)) {
      return dispatch(
        showAlert({
          message:
            "⚠️ La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.",
          alertType: 1,
        })
      );
    }

    if (data.password === data.confirmPassword) {
      const body = {
        password: data.password,
      };
      changePassword(body, code);
      dispatch(
        showAlert({
          message: "⚠️ Su Contraseña se cambio Correctamente",
          alertType: 2,
        })
      );
    } else {
      dispatch(
        showAlert({
          message: "⚠️ Sus contraseñas no Coinciden",
          alertType: 1,
        })
      );
    }
    reset({
      password: "",
      confirmPassword: "",
    });
  };

  useEffect(() => {
    if (error) {
      dispatch(
        showAlert({
          message: `⚠️ ${error.response?.data?.message}` || "Error inesperado",
          alertType: 1,
        })
      );
    }
  }, [error]);

  return (
    <div className="changePage">
      {isLoading && <IsLoading />}

      <div className="changeContainer">
        <section className="changeCard">
          <div className="changeHeader">
            <h2 className="changeTitle">Cambia tu contraseña</h2>
            <p className="changeSubtitle">
              Crea una contraseña segura y confírmala para continuar.
            </p>
          </div>

          <form className="changeForm" onSubmit={handleSubmit(submit)}>
            <label className="changeLabel">
              <span>Nueva contraseña</span>

              <div className="changePasswordWrap">
                <input
                  className="changeInput"
                  type={hidePassword_1 ? "password" : "text"}
                  required
                  {...register("password")}
                  placeholder="Ingresa tu nueva contraseña"
                />
                <img
                  className="changeEye"
                  onClick={() => setHidePassword_1(!hidePassword_1)}
                  src={`../../../${hidePassword_1 ? "show" : "hide"}.png`}
                  alt=""
                />
              </div>
            </label>

            <label className="changeLabel">
              <span>Confirmar contraseña</span>

              <div className="changePasswordWrap">
                <input
                  className="changeInput"
                  type={hidePassword_2 ? "password" : "text"}
                  required
                  {...register("confirmPassword")}
                  placeholder="Confirma tu contraseña"
                />
                <img
                  className="changeEye"
                  onClick={() => setHidePassword_2(!hidePassword_2)}
                  src={`../../../${hidePassword_2 ? "show" : "hide"}.png`}
                  alt=""
                />
              </div>
            </label>

            <button className="changeBtn" type="submit">
              Guardar <span className="arrow">➜</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ChangePassword;
