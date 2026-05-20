import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import IsLoading from "../../components/shared/isLoading";
import useCrud from "../../hooks/useCrud";

const Login = () => {
  const token = localStorage.getItem("token");
  const PATH_SENPLADES = "/senplades";
  const PATH_VARIABLES = "/variables";
  const [prevUser, setPrevUser] = useState(null);
  const [isNewLogin, setIsNewLogin] = useState(false);
  const [isInfoComplete, setIsInfoComplete] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userEdit, setUserEdit] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [formReady, setFormReady] = useState(false);
  const [firstChargeVar, setFirstChargeVar] = useState(false);
  const [senplades, getSenplades, , , , ,] = useCrud();
  const [cantonesOption, setCantonesOption] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedGenero, setSelectedGenero] = useState("");
  const [selectedGrado, setSelectedGrado] = useState("");
  const [selectedSubsistema, setSelectedSubsistema] = useState("");
  const [lastCreds, setLastCreds] = useState(null);

  const [variables, getVariables, , , , ,] = useCrud();

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
    userUpdate,
    userLogged,
    setUserLogged,
  ] = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    value,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm();

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

  //   useEffect(()=>{
  // loggedUser();
  //   },[])

  //   console.log(userLogged)

  const senpladesVal = senplades ? senplades : [];

  const obtenerCantonesPorProvincia = (provincia) => {
    return senpladesVal.filter((item) => item.provincia === provincia);
  };

  const handleProvinciaChange = (selected) => {
    setSelectedProvincia(selected);
    const cantonesByProvinca = obtenerCantonesPorProvincia(selected);
    setCantonesOption(cantonesByProvinca);
  };

  const handleLogout = () => {
    if (userLogged) {
      dispatch(
        showAlert({
          message: `⚠️ Hasta pronto ${userLogged?.firstName} ${userLogged?.lastName}, te esperamos.`,
          alertType: 4,
        })
      );
    }

    // ✅ avisar a la APK que fue logout voluntario
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "LOGOUT" }));
    }

    localStorage.removeItem("token");
    setUserLogged();
    reset({ email: "", password: "" });
    navigate("/");
  };

  useEffect(() => {
    if (error) {
      const message = error.response?.data?.message ?? "Error inesperado";
      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        })
      );
    }
  }, [error]);

  useEffect(() => {
    if (userLogged && prevUser === null && isNewLogin) {
      // ✅ si estás dentro de la APK (WebView), guarda credenciales en SecureStore
      if (
        lastCreds?.email &&
        lastCreds?.password &&
        window.ReactNativeWebView
      ) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "SAVE_CREDS",
            email: lastCreds.email,
            password: lastCreds.password,
          })
        );
      }

      dispatch(
        showAlert({
          message: `⚠️ Bienvenido ${userLogged?.firstName} ${userLogged?.lastName} a UNICAP, tu Plataforma Educativa`,
          alertType: 2,
        })
      );
      setPrevUser(userLogged);
      setIsNewLogin(false);
      navigate("/home");
    }
  }, [userLogged, prevUser, isNewLogin, dispatch, lastCreds]);

  useEffect(() => {
    if (userUpdate) {
      loggedUser();
      dispatch(
        showAlert({
          message: `⚠️ Estimado ${userLogged?.firstName} ${userLogged?.lastName}, se actualizo tu información correctamente`,
          alertType: 2,
        })
      );
    }
  }, [userUpdate]);

  useEffect(() => {
    if (userLogged && senplades) {
      setSelectedProvincia(userLogged.province || "");
      setCantonesOption(obtenerCantonesPorProvincia(userLogged.province));
      setSelectedCanton(userLogged.city || "");
      setSelectedGenero(userLogged.genre || "");
      setSelectedGrado(userLogged.grado || "");
      setSelectedSubsistema(userLogged.subsistema || "");

      setFormReady(true);
    }
  }, [userLogged, senplades]);

  useEffect(() => {
    if (formReady) {
      reset({
        email: userLogged.email,
        firstName: userLogged.firstName,
        lastName: userLogged.lastName,
        dateBirth: userLogged.dateBirth,
        cI: userLogged.cI,
        cellular: userLogged.cellular,
        province: selectedProvincia,
        city: selectedCanton,
        genre: selectedGenero,
        grado: selectedGrado,
        subsistema: selectedSubsistema,
      });

      setFormReady(false);
      setFirstChargeVar(true);
    }
  }, [formReady, userEdit]);

  const submit = (data) => {
    setLastCreds({ email: data.email, password: data.password }); // 👈 guardar para la APK
    loginUser(data);
    setIsNewLogin(true);
  };

  const validarCedula = (cedula) => {
    // Eliminar todos los caracteres que no sean dígitos
    cedula = cedula ? cedula.replace(/\D/g, "") : "";

    // Verificar que tenga exactamente 10 dígitos
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

  const capitalizeWords = (str) => {
    return str
      .trim() // elimina espacios al inicio y fin
      .split(/\s+/) // separa por uno o más espacios
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const submitUpdate = (data) => {
    const cedulaLimpia = data.cI ? data.cI.trim().replace(/\D/g, "") : "";
    const isValidCedula = validarCedula(cedulaLimpia);
    const celularLimpio = data.cellular
      ? data.cellular.trim().replace(/\D/g, "")
      : "";
    const isValidCellular = /^09\d{8}$/.test(celularLimpio);
    const emailFormateado = data.email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormateado);

    if (!isValidCedula)
      return dispatch(
        showAlert({
          message: "⚠️ La cédula ingresada es incorrecta.",
          alertType: 1,
        })
      );

    if (!isValidEmail)
      return dispatch(
        showAlert({ message: "⚠️ El email es incorrecto.", alertType: 1 })
      );

    if (!isValidCellular)
      return dispatch(
        showAlert({
          message:
            "⚠️ Celular inválido. Debe empezar con 09 y tener 10 dígitos.",
          alertType: 1,
        })
      );

    // Capitalizar nombres y apellidos
    const formattedData = {
      ...data,
      firstName: capitalizeWords(data.firstName),
      lastName: capitalizeWords(data.lastName),
      cI: cedulaLimpia,
      cellular: celularLimpio,
    };

    if (
      data?.dateBirth &&
      data?.cI &&
      data?.cellular &&
      data?.province &&
      data?.city &&
      data?.genre &&
      data?.grado &&
      data?.subsistema
    ) {
      setIsInfoComplete(true);
    } else {
      setIsNewLogin(false);
      setIsInfoComplete(false);
    }

    updateUser(formattedData, userLogged.id);
    setUserEdit(false);
  };

  useEffect(() => {
    if (userLogged) {
      getSenplades(PATH_SENPLADES);
      getVariables(PATH_VARIABLES);
    }

    if (
      userLogged?.dateBirth &&
      userLogged?.cI &&
      userLogged?.cellular &&
      userLogged?.province &&
      userLogged?.city &&
      userLogged?.genre &&
      userLogged?.grado &&
      userLogged?.subsistema
    ) {
      setIsInfoComplete(true);
    } else {
      setIsInfoComplete(false);
    }
  }, [firstChargeVar]);

  return (
    <div className="login_page">
      {isLoading && <IsLoading />}

      <section className="login_shell">
        <div className="login_card">
          {userLogged ? (
            <section className="profile_wrap">
              <div className="profile_header">
                <h2 className="profile_title">Mi perfil</h2>
                <p className="profile_subtitle">
                  Completa o actualiza tu información para continuar.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(submitUpdate)}
                className="form__user__info"
              >
                {/* ===== tu mismo contenido (NO CAMBIA) ===== */}
                <article className="form__user__seccion">
                  <label className="label__user__info">
                    <span className="span__user__info">Nombres: </span>
                    <input
                      readOnly={!userEdit}
                      style={{ border: "none" }}
                      required
                      {...register("firstName")}
                      className="input__form__info"
                      type="text"
                    />
                  </label>

                  <label className="label__user__info">
                    <span className="span__user__info">Apellidos: </span>
                    <input
                      readOnly={!userEdit}
                      style={{ border: "none" }}
                      required
                      {...register("lastName")}
                      className="input__form__info"
                      type="text"
                    />
                  </label>

                  <label className="label__user__info">
                    <span className="span__user__info">Email: </span>
                    <input
                      readOnly
                      style={{ border: "none" }}
                      required
                      {...register("email")}
                      className="input__form__info"
                      type="text"
                    />
                  </label>

                  <label className="label__user__info">
                    <span className="span__user__info">
                      Fecha de Nacimiento:{" "}
                    </span>
                    <input
                      readOnly={!userEdit}
                      style={{
                        border: userEdit ? "2px solid #cfd5e6" : "none",
                      }}
                      required
                      {...register("dateBirth", {
                        setValueAs: (value) => (value === "" ? null : value),
                      })}
                      className="input__form__info"
                      type="date"
                    />
                  </label>
                </article>

                <article className="form__user__seccion">
                  <label className="label__user__info">
                    <span className="span__user__info">Número de Cédula: </span>
                    <input
                      readOnly={!userEdit}
                      style={{
                        border: userEdit ? "2px solid #cfd5e6" : "none",
                      }}
                      required
                      {...register("cI")}
                      className="input__form__info"
                      type="text"
                    />
                  </label>

                  <label className="label__user__info">
                    <span className="span__user__info">
                      Número de Celular:{" "}
                    </span>
                    <input
                      readOnly={!userEdit}
                      style={{
                        border: userEdit ? "2px solid #cfd5e6" : "none",
                      }}
                      required
                      {...register("cellular")}
                      className="input__form__info"
                      type="text"
                    />
                  </label>

                  <label className="label__user__info">
                    <span className="span__user__info">Género:</span>
                    {!userEdit ? (
                      <input
                        className="input__form__info"
                        readOnly={!userEdit}
                        {...register("genre")}
                        style={{ border: "none" }}
                      />
                    ) : (
                      <select
                        style={{ border: "2px solid #cfd5e6" }}
                        {...register("genre")}
                        className="input__form__info"
                        value={selectedGenero}
                        onChange={(e) => setSelectedGenero(e.target.value)}
                      >
                        <option value="">Seleccione su Género</option>
                        {variables
                          ?.filter((e) => e.genero)
                          .map((genero) => (
                            <option key={genero.id} value={genero.genero}>
                              {genero.genero}
                            </option>
                          ))}
                      </select>
                    )}
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (!userEdit) setUserEdit(true);
                      else handleSubmit(submitUpdate)();
                    }}
                    className="btn_primary"
                  >
                    {userEdit
                      ? "Actualizar"
                      : isInfoComplete
                      ? "Editar perfil"
                      : "Completar Perfil"}{" "}
                    <span className="btn_arrow">➜</span>
                  </button>
                </article>

                <article className="form__user__seccion">
                  <label className="label__user__info">
                    <span className="span__user__info">Provincia:</span>
                    {!userEdit ? (
                      <input
                        className="input__form__info"
                        readOnly={!userEdit}
                        {...register("province")}
                        style={{ border: "none" }}
                      />
                    ) : (
                      <select
                        style={{ border: "2px solid #cfd5e6" }}
                        {...register("province")}
                        className="input__form__info"
                        value={selectedProvincia}
                        onChange={(e) => handleProvinciaChange(e.target.value)}
                      >
                        <option value="">Seleccione la Provincia</option>
                        {[...new Set(senplades?.map((e) => e.provincia))].map(
                          (provincia) => (
                            <option key={provincia} value={provincia}>
                              {provincia}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </label>

                  <label className="label__user__info">
                    <span className="span__user__info">Ciudad:</span>
                    {!userEdit ? (
                      <input
                        className="input__form__info"
                        readOnly={!userEdit}
                        {...register("city")}
                        style={{ border: "none" }}
                      />
                    ) : (
                      <select
                        style={{ border: "2px solid #cfd5e6" }}
                        {...register("city")}
                        className="input__form__info"
                        value={selectedCanton}
                        onChange={(e) => setSelectedCanton(e.target.value)}
                      >
                        <option value="">Seleccione la Ciudad</option>
                        {[...new Set(cantonesOption?.map((e) => e.canton))].map(
                          (canton) => (
                            <option key={canton} value={canton}>
                              {canton}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </label>

                  <label className="label__user__info">
                    <span className="span__user__info">Eje Policial:</span>
                    {!userEdit ? (
                      <input
                        className="input__form__info"
                        readOnly={!userEdit}
                        {...register("subsistema")}
                        style={{ border: "none" }}
                      />
                    ) : (
                      <select
                        style={{ border: "2px solid #cfd5e6" }}
                        {...register("subsistema")}
                        className="input__form__info"
                        value={selectedSubsistema}
                        onChange={(e) => setSelectedSubsistema(e.target.value)}
                      >
                        <option value="">Seleccione el Eje Policial</option>
                        {variables
                          ?.filter((e) => e.subsistema)
                          .map((subsistema) => (
                            <option
                              key={subsistema.id}
                              value={subsistema.subsistema}
                            >
                              {subsistema.subsistema}
                            </option>
                          ))}
                      </select>
                    )}
                  </label>

                  <label className="label__user__info">
                    <span className="span__user__info">Grado:</span>
                    {!userEdit ? (
                      <input
                        className="input__form__info"
                        readOnly={!userEdit}
                        {...register("grado")}
                        style={{ border: "none" }}
                      />
                    ) : (
                      <select
                        style={{ border: "2px solid #cfd5e6" }}
                        {...register("grado")}
                        className="input__form__info"
                        value={selectedGrado}
                        onChange={(e) => setSelectedGrado(e.target.value)}
                      >
                        <option value="">Seleccione su Grado</option>
                        {variables
                          ?.filter((e) => e.grado)
                          .map((grado) => (
                            <option key={grado.id} value={grado.grado}>
                              {grado.grado}
                            </option>
                          ))}
                      </select>
                    )}
                  </label>
                </article>
              </form>
            </section>
          ) : (
            <section className="login_wrap">
              <div className="login_header">
                <h2 className="login__title">Iniciar Sesión</h2>
                <p className="login_subtitle">
                  Ingresa con tu correo y contraseña para acceder a la
                  plataforma.
                </p>
              </div>

              <form className="form__login" onSubmit={handleSubmit(submit)}>
                <label className="label__form__login">
                  <span className="span__form__login">Email</span>
                  <input
                    required
                    {...register("email")}
                    className="input__form__login"
                    type="text"
                  />
                </label>

                <label className="label__form__login">
                  <span className="span__form__login">Contraseña</span>
                  <div className="password_row">
                    <input
                      className="input__form__login input__form__login--password"
                      required
                      {...register("password")}
                      type={hidePassword ? "password" : "text"}
                    />
                    <button
                      type="button"
                      className="toggle_pass"
                      onClick={() => setHidePassword(!hidePassword)}
                      aria-label="Mostrar/Ocultar contraseña"
                    >
                      <img
                        className="img__show"
                        src={`../../../${hidePassword ? "show" : "hide"}.png`}
                        alt=""
                      />
                    </button>
                  </div>
                </label>

                <Link className="login_link" to="/reset_password">
                  ¿Olvidaste tu contraseña?
                </Link>

                <button className="btn_primary_full" type="submit">
                  Iniciar <span className="btn_arrow">➜</span>
                </button>
              </form>
            </section>
          )}
        </div>
      </section>
    </div>
  );
};

export default Login;
