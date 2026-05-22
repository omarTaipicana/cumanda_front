import React, { useEffect, useState } from "react";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useParams } from "react-router-dom";
import "./styles/RegistroAlumnos.css";
import IsLoading from "../shared/isLoading";

const RegistroAlumnos = () => {
  const PATH_COURSES = "/courses";
  const PATH_VARIABLES = "/variables";
  const PATH_VALIDATE = "/validate";
  const PATH_INSCRIPCIONES = "/inscripcion";

  const dispatch = useDispatch();
  const { code } = useParams();

  const [idCourse, setIdCourse] = useState();
  const [course, getCourse, , , , , isLoading, , , ,] = useCrud();
  const [variables, getVariables] = useCrud();
  const [, , postValidate, , , , , validate] = useCrud();

  const [, , postInscripcion, , , error, isLoading2, newInscripcion] =
    useCrud();

  const [inscripcionExistente, setInscripcionExistente] = useState(null);
  const [userValidacion, setUserValidacion] = useState(null);
  const [userRegister, setUserRegister] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getCourse(PATH_COURSES);
    getVariables(PATH_VARIABLES);
  }, []);

  useEffect(() => {
    if (error) {
      const message = error.response?.data?.message ?? "Error inesperado";
      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        }),
      );
    }
  }, [error]);

  useEffect(() => {
    if (newInscripcion) {
      dispatch(
        showAlert({
          message: `⚠️ Estimad@ ${newInscripcion.user.firstName} ${newInscripcion.user.lastName}, se realizo tu inscripción correctamente`,
          alertType: 2,
        }),
      );
    }
  }, [newInscripcion]);

  useEffect(() => {
    if (course.length && code) {
      const foundCourse = course.find((c) => c.sigla === code);
      if (foundCourse) setIdCourse(foundCourse.id);
    }
  }, [course, code]);

  const validarCedula = (cedula) => {
    cedula = cedula?.replace(/\D/g, "");

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
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const submitVal = (data) => {
    const body = { ...data, code };
    postValidate(PATH_VALIDATE, body);
  };

  useEffect(() => {
    if (validate) {
      setUserValidacion(validate);
      setUserRegister(validate.user);
    }
  }, [validate]);

  useEffect(() => {
    if (validate?.enrolled) {
      setInscripcionExistente(validate.user);
      setUserValidacion(null);
      dispatch(
        showAlert({
          message: "⚠️ Ya estás inscrito en este curso.",
          alertType: 2,
        }),
      );
    }
  }, [validate, dispatch]);

  const submit = (data) => {
    const nombreFormateado = data.nombres ? capitalizeWords(data.nombres) : "";
    const apellidoFormateado = data.apellidos
      ? capitalizeWords(data.apellidos)
      : "";

    const emailFormateado = data.email ? data.email?.trim().toLowerCase() : "";
    const confirmEmailFormateado = data.confirmEmail
      ? data.confirmEmail.trim().toLowerCase()
      : "";

    const cedulaLimpia = data.cedula?.trim().replace(/\D/g, "");
    const isValidCedula = validarCedula(cedulaLimpia);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormateado);
    const celularLimpio = data.celular?.replace(/\D/g, "");
    const isValidCellular = /^09\d{8}$/.test(celularLimpio);

    const nombresArray = nombreFormateado.trim().split(/\s+/);
    const apellidosArray = apellidoFormateado.trim().split(/\s+/);

    if (nombresArray.length < 2) {
      return dispatch(
        showAlert({
          message: "⚠️ Debe ingresar mínimo dos nombres.",
          alertType: 1,
        }),
      );
    }

    if (apellidosArray.length < 2) {
      return dispatch(
        showAlert({
          message: "⚠️ Debe ingresar mínimo dos apellidos.",
          alertType: 1,
        }),
      );
    }

    if (!isValidCedula)
      return dispatch(
        showAlert({
          message: "⚠️ La cédula ingresada es incorrecta.",
          alertType: 1,
        }),
      );

    if (!isValidEmail)
      return dispatch(
        showAlert({ message: "⚠️ El email es incorrecto.", alertType: 1 }),
      );

    if (!userRegister && emailFormateado !== confirmEmailFormateado) {
      return dispatch(
        showAlert({
          message: "⚠️ Su correo no coincide con el correo de validación.",
          alertType: 1,
        }),
      );
    }

    if (!isValidCellular)
      return dispatch(
        showAlert({
          message:
            "⚠️ Celular inválido. Debe empezar con 09 y tener 10 dígitos.",
          alertType: 1,
        }),
      );

    const body = {
      ...data,
      cedula: userRegister?.cI ? userRegister.cI : cedulaLimpia,
      nombres: userRegister?.firstName
        ? userRegister.firstName
        : nombreFormateado,
      apellidos: userRegister?.lastName
        ? userRegister.lastName
        : apellidoFormateado,
      email: userRegister?.email ? userRegister.email : emailFormateado,
      grado: userRegister?.grado ? userRegister.grado : data.grado,
      subsistema: userRegister?.subsistema
        ? userRegister.subsistema
        : data.subsistema,
      confirmEmail: confirmEmailFormateado,
      curso: code,
      courseId: idCourse,
    };

    postInscripcion(PATH_INSCRIPCIONES, body);
    setUserValidacion();
    reset();
  };

  const cursoActivo = course.find((c) => c.sigla === code);

  const missing = {
    cedula: !userRegister?.cI?.trim(),
    grado: !userRegister?.grado?.trim(),
    subsistema: !userRegister?.subsistema?.trim(),
    celular: !userRegister?.cellular?.trim(),
    email: !userRegister?.email?.trim(),
    nombres: !userRegister?.firstName?.trim(),
    apellidos: !userRegister?.lastName?.trim(),
  };

  const showFullForm = !userRegister;
  const showConfirmEmail = showFullForm;

  if (!cursoActivo) {
    return (
      <div className="registro_container curso_no_encontrado">
        {isLoading && <IsLoading />}

        <div className="mensaje_curso_caja">
          <h2>❌ Curso no disponible</h2>
          <p>
            El curso con el código <strong>{code}</strong> no se encuentra
            disponible o no existe en nuestra base de datos.
          </p>
          <p>Por favor verifica el enlace o contacta con el administrador.</p>
        </div>
      </div>
    );
  }

  if (cursoActivo?.vigente === false) {
    return (
      <div className="registro_container curso_no_encontrado">
        {isLoading && <IsLoading />}

        <div className="mensaje_curso_caja mensaje_curso_caja--finalizado">
          <h2>⏳ Oferta académica finalizada</h2>
          <p>
            La oferta académica del <strong>{cursoActivo?.nombre}</strong> ha
            finalizado.
          </p>
          <p>
            Si necesitas información, por favor contacta con el administrador o
            revisa nuestros cursos disponibles.
          </p>

          <div className="mensaje_acciones">
            <a className="mensaje_btn" href="/#/">
              Ir al inicio
            </a>
            <a
              className="mensaje_btn mensaje_btn--whatsapp"
              href="https://wa.me/593980773229"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registro_container">
      {isLoading2 && <IsLoading />}

      {!userValidacion ? (
        <section className="registro_landing">
          <div
            className="registro_landing_backdrop"
            style={{
              backgroundImage: `linear-gradient(115deg, rgba(31,52,10,0.94) 0%, rgba(67,102,15,0.84) 42%, rgba(128,172,31,0.42) 68%, rgba(224,236,205,0.18) 100%), url(/images/${code}.jpg)`,
            }}
          />

          <div className="registro_landing_intro">
            <span className="registro_landing_badge">
              CUMANDÁ · Inscripción
            </span>

            <h1 className="registro_landing_title">{cursoActivo?.nombre}</h1>

            <p className="registro_landing_text">
              Verifica tu correo electrónico para comprobar si ya te encuentras
              inscrito o continuar con el proceso de registro en esta oferta
              académica.
            </p>

            <div className="registro_landing_stats">
              <div className="registro_landing_stat">
                <strong>Online</strong>
                <span>Modalidad</span>
              </div>
              <div className="registro_landing_stat">
                <strong>Digital</strong>
                <span>Inscripción</span>
              </div>
              <div className="registro_landing_stat">
                <strong>Activa</strong>
                <span>Disponibilidad</span>
              </div>
            </div>
          </div>

          <div className="registro_verify_card">
            <div className="registro_intro">
              <img
                src="/verifica.png"
                alt="Verifica tu inscripción"
                className="registro_intro_icon"
              />
              <h2 className="registro_intro_title">Verifica tu inscripción</h2>

              <p className="registro_intro_text">
                Ingresa tu correo electrónico para comprobar si ya te encuentras
                inscrito en este curso o si deseas registrarte para iniciar tu
                formación.
              </p>

              <ul className="registro_intro_list">
                <li>
                  Si ya tienes una inscripción, te mostraremos tus datos y el
                  estado de tu participación.
                </li>
                <li>
                  Si aún no te has inscrito, podrás hacerlo fácilmente y
                  comenzar tu aprendizaje con nosotros.
                </li>
              </ul>

              <p className="registro_intro_highlight">
                ¡El primer paso para avanzar en tu capacitación está aquí!
              </p>
            </div>

            <form
              className="formulario_registro_val"
              onSubmit={handleSubmit(submitVal)}
            >
              <div className="registro_val_field">
                <label htmlFor="email" className="registro_label">
                  Email:
                </label>

                <div className="registro_val_row">
                  <input
                    id="email"
                    type="email"
                    required
                    {...register("email")}
                  />
                  <button className="btn_inscripcion" type="submit">
                    Verificar <span>➜</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {inscripcionExistente && (
            <div className="usuario_existente">
              <h3>Ya estás registrado en este curso:</h3>
              <p>
                <strong>Nombres:</strong> {inscripcionExistente.firstName}{" "}
                {inscripcionExistente.lastName}
              </p>
              <p>
                <strong>Email:</strong> {inscripcionExistente.email}
              </p>

              <button
                className="btn_cerrar_existente"
                onClick={() => {
                  setInscripcionExistente(null);
                  setUserValidacion(null);
                  setUserRegister(null);
                }}
              >
                Cerrar
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="registro_form_scene">
          <div
            className="registro_form_scene_backdrop"
            style={{
              backgroundImage: `linear-gradient(115deg, rgba(31,52,10,0.94) 0%, rgba(67,102,15,0.82) 42%, rgba(128,172,31,0.40) 68%, rgba(224,236,205,0.18) 100%), url(/images/${code}.jpg)`,
            }}
          />

          <div className="registro_form_layout">
            <div className="registro_course_panel">
              <div
                className="registro_course_banner"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(67,102,15,0.10), rgba(31,52,10,0.88)), url(/images/${code}.jpg)`,
                }}
              >
                <div className="registro_course_top">
                  <span className="registro_course_chip">Oferta académica</span>
                  <span className="registro_course_chip registro_course_chip--light">
                    {code?.toUpperCase()}
                  </span>
                </div>

                <div className="registro_course_content">
                  <h2>{cursoActivo.nombre}</h2>
                  <p>{cursoActivo.objetivo}</p>

                  <div className="registro_course_features">
                    <div className="registro_course_feature">
                      <strong>Inscripción</strong>
                      <span>Activa</span>
                    </div>
                    <div className="registro_course_feature">
                      <strong>Modalidad</strong>
                      <span>En línea</span>
                    </div>
                    <div className="registro_course_feature">
                      <strong>Proceso</strong>
                      <span>Rápido y guiado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="registro_form_panel animate_slide_left">
              <div className="registro_form_header">
                <span className="registro_form_badge">Formulario</span>
                <h3>Completa tu inscripción</h3>
                <p>
                  Revisa tus datos y completa los campos necesarios para
                  continuar con el proceso.
                </p>
              </div>

              <form
                className="formulario_registro"
                onSubmit={handleSubmit(submit)}
              >
                <div className="form_column">
                  {userRegister && (
                    <div className="incripcion_existente">
                      <h3>✅ Información encontrada</h3>

                      <p>
                        <strong>Grado:</strong>{" "}
                        {userRegister.grado || <em>Falta completar</em>}
                      </p>
                      <p>
                        <strong>Nombres:</strong>{" "}
                        {userRegister.firstName || <em>Falta completar</em>}
                      </p>
                      <p>
                        <strong>Apellidos:</strong>{" "}
                        {userRegister.lastName || <em>Falta completar</em>}
                      </p>
                      <p>
                        <strong>Cédula:</strong>{" "}
                        {userRegister.cI || <em>Falta completar</em>}
                      </p>
                      <p>
                        <strong>Eje Policial:</strong>{" "}
                        {userRegister.subsistema || <em>Falta completar</em>}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {userRegister.email || <em>Falta completar</em>}
                      </p>

                      {(missing.cedula ||
                        missing.grado ||
                        missing.subsistema ||
                        missing.celular) && (
                        <p className="mensaje_inscripcion">
                          Tu perfil está incompleto. Completa los campos
                          faltantes para continuar con la inscripción.
                        </p>
                      )}
                    </div>
                  )}

                  {userRegister && (
                    <>
                      {missing.nombres && (
                        <label className="registro_label">
                          Nombres
                          <input
                            placeholder="Nombres completos"
                            required
                            {...register("nombres")}
                            defaultValue=""
                          />
                        </label>
                      )}

                      {missing.apellidos && (
                        <label className="registro_label">
                          Apellidos
                          <input
                            placeholder="Apellidos completos"
                            required
                            {...register("apellidos")}
                            defaultValue=""
                          />
                        </label>
                      )}

                      {missing.cedula && (
                        <label className="registro_label">
                          Cédula
                          <input
                            required
                            {...register("cedula")}
                            defaultValue=""
                          />
                        </label>
                      )}

                      {missing.grado && (
                        <label className="registro_label">
                          Grado
                          <select
                            required
                            {...register("grado")}
                            className="form_input"
                          >
                            <option value="">Seleccione una opción</option>
                            {[
                              ...new Set(
                                variables.map((v) => v.grado).filter(Boolean),
                              ),
                            ].map((grado, i) => (
                              <option key={i} value={grado}>
                                {grado}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}

                  {userRegister && (
                    <>
                      {!missing.cedula && (
                        <input
                          type="hidden"
                          value={userRegister.cI}
                          {...register("cedula")}
                        />
                      )}
                      {!missing.nombres && (
                        <input
                          type="hidden"
                          value={userRegister.firstName}
                          {...register("nombres")}
                        />
                      )}
                      {!missing.apellidos && (
                        <input
                          type="hidden"
                          value={userRegister.lastName}
                          {...register("apellidos")}
                        />
                      )}
                      {!missing.email && (
                        <input
                          type="hidden"
                          value={userRegister.email}
                          {...register("email")}
                        />
                      )}
                      {!missing.celular && (
                        <input
                          type="hidden"
                          value={userRegister.cellular}
                          {...register("celular")}
                        />
                      )}
                      {!missing.grado && (
                        <input
                          type="hidden"
                          value={userRegister.grado}
                          {...register("grado")}
                        />
                      )}
                      {!missing.subsistema && (
                        <input
                          type="hidden"
                          value={userRegister.subsistema}
                          {...register("subsistema")}
                        />
                      )}
                    </>
                  )}

                  {!userRegister && (
                    <>
                      {showConfirmEmail && (
                        <label className="registro_label">
                          Confirmar Email
                          <input
                            type="email"
                            required
                            {...register("confirmEmail")}
                          />
                        </label>
                      )}

                      <label className="registro_label">
                        Nombres
                        <input
                          placeholder="Nombres completos (tildes y ñ si aplica)"
                          required
                          {...register("nombres")}
                        />
                      </label>

                      <label className="registro_label">
                        Apellidos
                        <input
                          placeholder="Apellidos completos (tildes y ñ si aplica)"
                          required
                          {...register("apellidos")}
                        />
                      </label>

                      <label className="registro_label">
                        Grado
                        <select
                          required
                          {...register("grado")}
                          className="form_input"
                        >
                          <option value="">Seleccione una opción</option>
                          {[
                            ...new Set(
                              variables.map((v) => v.grado).filter(Boolean),
                            ),
                          ].map((grado, i) => (
                            <option key={i} value={grado}>
                              {grado}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="registro_label">
                        Cédula
                        <input
                          required
                          {...register("cedula")}
                          defaultValue={userRegister?.cI || ""}
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="form_column">
                  {userRegister && (
                    <>
                      {missing.celular && (
                        <label className="registro_label">
                          Celular
                          <input
                            required
                            {...register("celular")}
                            defaultValue=""
                          />
                        </label>
                      )}

                      {missing.subsistema && (
                        <label className="registro_label">
                          Eje Policial
                          <select
                            required
                            {...register("subsistema")}
                            className="form_input"
                          >
                            <option value="">Seleccione una opción</option>
                            {[
                              ...new Set(
                                variables
                                  .map((v) => v.subsistema)
                                  .filter(Boolean),
                              ),
                            ].map((s, i) => (
                              <option key={i} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}

                  {!userRegister && (
                    <>
                      <label className="registro_label">
                        Celular
                        <input required {...register("celular")} />
                      </label>

                      <label className="registro_label">
                        Eje Policial
                        <select
                          required
                          {...register("subsistema")}
                          className="form_input"
                        >
                          <option value="">Seleccione una opción</option>
                          {[
                            ...new Set(
                              variables
                                .map((v) => v.subsistema)
                                .filter(Boolean),
                            ),
                          ].map((s, i) => (
                            <option key={i} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}

                  <div className="form_check_container">
                    <label className="form_check_label">
                      Acepto recibir correos electrónicos con información sobre
                      los cursos y otros contenidos relacionados. Entiendo que
                      mis datos serán tratados de acuerdo con la política de
                      privacidad y que puedo dejar de recibirlos en cualquier
                      momento.
                      <input
                        type="checkbox"
                        {...register("aceptacion", {
                          validate: (value) =>
                            value === true ||
                            "Debes aceptar la política para continuar.",
                        })}
                      />
                    </label>
                    {errors.aceptacion && (
                      <p className="form_error">{errors.aceptacion.message}</p>
                    )}
                  </div>

                  <div className="form_button_inscripcion">
                    <button className="btn_inscripcion" type="submit">
                      Inscribirme <span>➜</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default RegistroAlumnos;
