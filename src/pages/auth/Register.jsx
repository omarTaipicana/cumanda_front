import React, { useEffect, useState } from "react";
import "./styles/Register.css";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import IsLoading from "../../components/shared/isLoading";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hidePassword, setHidePassword] = useState(true);
  const [hidePasswordVerify, setHidePasswordVerify] = useState(true);

  const [
    registerUser,
    ,
    ,
    ,
    ,
    userRegister,
    isLoading,
    error,
  ] = useAuth();

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (error) {
      dispatch(
        showAlert({
          message: `⚠️ ${error.response?.data?.message}` || "Error inesperado",
          alertType: 1,
        })
      );
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (userRegister) {
      dispatch(
        showAlert({
          message: `⚠️ Usuario Registrado, revise su correo electrónico`,
          alertType: 2,
        })
      );
      navigate("/login");
    }
  }, [userRegister, dispatch, navigate]);

  const capitalizeWords = (str) =>
    str
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const submit = (data) => {
    const frontBaseUrl = `${location.protocol}//${location.host}/#/verify`;
    const nombreFormateado = capitalizeWords(data.firstName);
    const apellidoFormateado = capitalizeWords(data.lastName);
    const emailFormateado = data.email.trim().toLowerCase();

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

    if (data.password !== data.confirmPassword) {
      return dispatch(
        showAlert({
          message: "⚠️ Las contraseñas no coinciden.",
          alertType: 1,
        })
      );
    }

    const body = {
      ...data,
      email: emailFormateado,
      firstName: nombreFormateado,
      lastName: apellidoFormateado,
      frontBaseUrl,
      dateBirth: null,
    };

    registerUser(body);

    reset({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="registerPage">
      {isLoading && <IsLoading />}

      <div className="registerContainer">
        <form className="registerCard" onSubmit={handleSubmit(submit)}>
          <div className="registerHeader">
            <h2 className="registerTitle">Regístrate</h2>
            <p className="registerSubtitle">
              Crea tu cuenta para acceder a EDUKA.
            </p>
          </div>

          <label className="registerLabel">
            <span>Nombres</span>
            <input
              required
              {...register("firstName")}
              className="registerInput"
              type="text"
              placeholder="Ingresa tus nombres"
            />
          </label>

          <label className="registerLabel">
            <span>Apellidos</span>
            <input
              required
              {...register("lastName")}
              className="registerInput"
              type="text"
              placeholder="Ingresa tus apellidos"
            />
          </label>

          <label className="registerLabel">
            <span>Email</span>
            <input
              required
              {...register("email")}
              className="registerInput"
              type="text"
              placeholder="Ingresa tu email"
            />
          </label>

          <label className="registerLabel">
            <span>Contraseña</span>
            <div className="registerPassword">
              <input
                className="registerPasswordInput"
                required
                {...register("password")}
                type={hidePassword ? "password" : "text"}
                placeholder="Crea una contraseña segura"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setHidePassword(!hidePassword)}
                aria-label="Mostrar/ocultar contraseña"
              >
                <img
                  className="eyeIcon"
                  src={`../../../${hidePassword ? "show" : "hide"}.png`}
                  alt=""
                />
              </button>
            </div>
          </label>

          <label className="registerLabel">
            <span>Confirmar contraseña</span>
            <div className="registerPassword">
              <input
                className="registerPasswordInput"
                required
                {...register("confirmPassword")}
                type={hidePasswordVerify ? "password" : "text"}
                placeholder="Repite la contraseña"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setHidePasswordVerify(!hidePasswordVerify)}
                aria-label="Mostrar/ocultar confirmación"
              >
                <img
                  className="eyeIcon"
                  src={`../../../${hidePasswordVerify ? "show" : "hide"}.png`}
                  alt=""
                />
              </button>
            </div>
          </label>

          <button className="registerBtn" type="submit">
            Registrarse <span className="arrow">➜</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
