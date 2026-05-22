import React, { useEffect, useState } from "react";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useParams } from "react-router-dom";
import "./styles/RegistroPagos.css";
import IsLoading from "../shared/isLoading";
import ModalPagoExistente from "./ModalPagoExistente";

export const RegistroPagos = () => {
  const PATH_COURSES = "/courses";
  const PATH_PAGOS = "/pagos";
  const PATH_PAGOSVALIDATE = "/pagovalidate";

  const dispatch = useDispatch();
  const { code } = useParams();

  const [courses, getCourse, , , , , isLoading3] = useCrud();
  const [, , postVlidate, , , , , newValidate] = useCrud();

  const [usuario, setUsuario] = useState(null);
  const [cursoActual, setCursoActual] = useState(null);
  const [inscrito, setInscrito] = useState(null);
  const [pagoExistente, setPagoExistente] = useState(null);
  const [certificadoPagado, setCertificadoPagado] = useState(false);
  const [total, setTotal] = useState(0);

  const [resUploads, getUpload, , , , , isLoading, , , , uploadPdf, newUpload] =
    useCrud();

  const resUpload = resUploads.filter((p) => p.confirmacion === true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const watchAll = watch([
    "moneda",
    "distintivo",
    "sPolicial",
    "oProfesionales",
  ]);

  const [moneda, distintivo, sPolicial, oProfesionales] = watchAll;

  useEffect(() => {
    getCourse(PATH_COURSES);
    getUpload(PATH_PAGOS);
  }, [inscrito]);

  useEffect(() => {
    let extrasCentavos = 0;

    if (moneda) extrasCentavos += 1500;
    if (distintivo) extrasCentavos += 1000;

    let baseCentavos = 0;

    if (!certificadoPagado) {
      if (oProfesionales) baseCentavos = 3200;
      else baseCentavos = 3000;
    } else {
      baseCentavos = 0;
    }

    setTotal((baseCentavos + extrasCentavos) / 100);
  }, [moneda, distintivo, sPolicial, oProfesionales, certificadoPagado]);

  const cursoActivo = courses.find((c) => c.sigla === code);

  useEffect(() => {
    if (newValidate) {
      setUsuario(newValidate?.user);
      setInscrito(newValidate?.inscripcion);

      if (newValidate?.pagos?.length > 0) {
        setPagoExistente(newValidate?.pagos);
      }

      if (newValidate?.message) {
        dispatch(
          showAlert({
            message: newValidate?.message,
            alertType: 2,
          }),
        );
      }
    }
  }, [newValidate]);

  const buscarCedula = (data) => {
    const cedula = data?.cedula.trim();
    const body = { cedula, code };
    const curso = courses?.find((c) => c.sigla === code);
    setCursoActual(curso);
    postVlidate(PATH_PAGOSVALIDATE, body);
  };

  const submit = (data) => {
    const body = {
      ...data,
      curso: code,
      inscripcionId: inscrito.id,
    };

    const file = data.archivo[0];

    uploadPdf(PATH_PAGOS, body, file);

    reset();
    setCursoActual(null);
    setTotal(26);
  };

  useEffect(() => {
    if (newUpload) {
      const extras = [];

      if (newUpload.moneda) extras.push("moneda");
      if (newUpload.distintivo) extras.push("distintivo");

      const extrasTexto =
        extras.length > 0 ? `, incluyendo ${extras.join(" y ")}` : "";

      dispatch(
        showAlert({
          message: `✅ Estimado/a ${usuario?.firstName} ${usuario?.lastName}, se registró tu pago de $${newUpload.valorDepositado} por el certificado${extrasTexto}.`,
          alertType: 2,
        }),
      );

      setUsuario(null);
      setInscrito(null);
    }
  }, [newUpload]);

  useEffect(() => {
    if (total > 0) {
      setValue("valorDepositado", total);
    }
  }, [total, setValue]);

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

  const onRegistrarNuevo = () => {
    setUsuario(newValidate?.user);

    const curso = courses?.find((c) => c.sigla === pagoExistente[0]?.curso);

    setCursoActual(curso);
    setPagoExistente(null);
    setCertificadoPagado(true);
  };

  return (
    <div className="pagos_scene">
      {isLoading && <IsLoading />}
      {isLoading3 && <IsLoading />}

      {pagoExistente && (
        <ModalPagoExistente
          pagos={resUpload}
          onRegistrarNuevo={onRegistrarNuevo}
          onClose={() => {
            setPagoExistente(null);
            setUsuario(null);
          }}
          inscrito={inscrito}
        />
      )}

      <div
        className="pagos_scene_backdrop"
        style={{
          backgroundImage: `linear-gradient(105deg, rgba(31,67,16,0.96) 0%, rgba(70,120,22,0.9) 42%, rgba(120,168,45,0.58) 68%, rgba(224,236,205,0.16) 100%), url(/images/${code}.jpg)`,
        }}
      />

      <section className="content_pagos_hero">
        <section className="pagos_hero_intro">
          <span className="pagos_hero_badge">CUMANDÁ · Registro de pagos</span>

          <h1 className="pagos_hero_title">
            {usuario
              ? "Completa tu registro de pago"
              : "Solicita tu certificado"}
          </h1>

          <p className="pagos_hero_text">
            Verifica tu inscripción, sube tu comprobante y continúa el proceso
            para la emisión de tu certificado oficial y reconocimientos
            adicionales.
          </p>

          <div className="pagos_hero_stats">
            <div className="pagos_hero_stat">
              <strong>01</strong>
              <span>Validación</span>
            </div>

            <div className="pagos_hero_stat">
              <strong>02</strong>
              <span>Comprobante</span>
            </div>

            <div className="pagos_hero_stat">
              <strong>03</strong>
              <span>Certificación</span>
            </div>
          </div>
        </section>

        <img
          src="/images/cert.jpeg"
          alt="Información de pago"
          className="cert_img"
        />
      </section>

      <main className="pagos_container">
        <div className="pagos_wrapper pagos_medio_alto">
          <section className="pagos_left pagos_animate_left">
            {!usuario ? (
              <form
                className="pagos_form_buscar"
                onSubmit={handleSubmit(buscarCedula)}
              >
                <div className="pagos_felicitacion">
                  <span className="pagos_section_badge">
                    🎉 ¡Felicitaciones por culminar tu curso!
                  </span>

                  <h2>🥳 ¡Lo lograste!</h2>

                  <p>
                    🎓 Has demostrado disciplina, esfuerzo y compromiso para
                    llegar hasta aquí. Completar este proceso académico es un
                    gran logro y queremos felicitarte por ello.
                  </p>

                  <p>
                    ✨ Este certificado representa mucho más que un documento:
                    es el reflejo de tu crecimiento personal, profesional y
                    académico.
                  </p>

                  <p>
                    🚀 Ahora ya puedes solicitar tu certificado oficial y, si lo
                    deseas, adquirir reconocimientos adicionales para destacar
                    aún más tu logro.
                  </p>

                  <p>
                    🎊 ¡Gracias por confiar en CUMANDÁ y ser parte de esta
                    experiencia formativa!
                  </p>
                </div>

                <label className="pagos_label">
                  <div className="pagos_btn_row pagos_btn_row--buscar">
                    <span>Ingrese su cédula:</span>

                    <input
                      className="pagos_input_cedula"
                      required
                      {...register("cedula")}
                    />

                    <button className="pagos_btn" type="submit">
                      Buscar inscripción
                    </button>
                  </div>
                </label>
              </form>
            ) : (
              <form className="pagos_form_dos" onSubmit={handleSubmit(submit)}>
                <div>
                  <div className="pagos_datos_usuario">
                    <span className="pagos_section_badge">
                      Datos del participante
                    </span>

                    {cursoActual && <h2>{cursoActual.nombre}</h2>}

                    <p>
                      <strong>Nombres:</strong> {usuario.firstName}
                    </p>

                    <p>
                      <strong>Apellidos:</strong> {usuario.lastName}
                    </p>

                    <p>
                      <strong>Email:</strong> {usuario.email}
                    </p>

                    <p>
                      <strong>Cédula:</strong> {usuario.cI}
                    </p>
                  </div>

                  <div className="pagos_box">
                    <label className="pagos_check_row">
                      <span>Moneda conmemorativa (+$15)</span>
                      <input type="checkbox" {...register("moneda")} />
                    </label>

                    <label className="pagos_check_row">
                      <span>Distintivo (+$10)</span>
                      <input type="checkbox" {...register("distintivo")} />
                    </label>

                    <label className="pagos_label pagos_label_file">
                      <span>Suba su comprobante PDF o imagen:</span>
                      <input type="file" required {...register("archivo")} />
                    </label>
                  </div>
                </div>

                <div className="pagos_inputs_pago">
                  <p className="pagos_total">Total a pagar: ${total}</p>

                  <label className="pagos_label">
                    <span>Valor depositado:</span>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("valorDepositado", {
                        required: "Debes ingresar el valor depositado.",
                      })}
                    />
                  </label>

                  {errors.valorDepositado && (
                    <p className="pagos_error">
                      {errors.valorDepositado.message}
                    </p>
                  )}

                  <div className="pagos_check_container">
                    <label className="pagos_check_legal">
                      <span>
                        ⚠️ <strong>IMPORTANTE:</strong> <hr />
                        📝 Confirmo que la información mostrada es verídica y
                        autorizo su uso para la emisión del certificado. En caso
                        de requerir correcciones, contactar al equipo de
                        soporte.
                      </span>

                      <input
                        type="checkbox"
                        {...register("confirmacion", {
                          validate: (value) =>
                            value === true || "Debes aceptar para continuar.",
                        })}
                      />
                    </label>

                    {errors.confirmacion && (
                      <p className="pagos_error">
                        {errors.confirmacion.message}
                      </p>
                    )}
                  </div>

                  <div className="pagos_btn_row">
                    <button className="pagos_btn" type="submit">
                      Confirmar pago
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>

          <aside className="pagos_right pagos_animate_right">
            <div className="pagos_panel solo_imagen">
              <div className="pagos_panel_badge">💳 Guía de pago</div>

              <img
                src="/images/pago_all5.jpeg"
                alt="Información de pago"
                className="pagos_img_full"
              />

              <button
                type="button"
                className="btn_copiar_cuenta"
                onClick={(e) => {
                  navigator.clipboard.writeText("2214723388");

                  const btn = e.target;
                  btn.innerText = "✅ ¡Copiado!";

                  setTimeout(() => {
                    btn.innerText = "📋 Copiar cuenta";
                  }, 2000);
                }}
              >
                📋 Copiar cuenta
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default RegistroPagos;
