import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import "./styles/ResetPasswordSendEmail.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import IsLoading from "../../components/shared/isLoading";

const ResetPasswordSendEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();

  const [, , , , , , isLoading, error, , sendEmail, userResetPassword] =
    useAuth();

  const submit = (data) => {
    const frontBaseUrl = `${location.protocol}//${location.host}/#/reset_password`;
    sendEmail({ ...data, frontBaseUrl });
    reset({ email: "" });
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
  }, [error, dispatch]);

  useEffect(() => {
    if (userResetPassword) {
      dispatch(
        showAlert({
          message: `⚠️ Estimado ${userResetPassword.firstName} ${userResetPassword.lastName}, revisa tu correo ${userResetPassword.email} para reestablecer tu contraseña`,
          alertType: 2,
        })
      );
      navigate("/login");
    }
  }, [userResetPassword, dispatch, navigate]);

  return (
    <div className="resetPage">
      {isLoading && <IsLoading />}

      <div className="resetContainer">
        <section className="resetCard">
          <div className="resetHeader">
            <h2 className="resetTitle">¿Olvidaste tu contraseña?</h2>
            <p className="resetSubtitle">
              Ingresa tu correo electrónico y te enviaremos un enlace para
              restablecerla.
            </p>
          </div>

          <form className="resetForm" onSubmit={handleSubmit(submit)}>
            <label className="resetLabel">
              <span>Email</span>
              <input
                className="resetInput"
                {...register("email")}
                type="email"
                placeholder="Ingresa tu correo electrónico"
                required
              />
            </label>

            <button className="resetBtn" type="submit">
              Enviar enlace <span className="arrow">➜</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ResetPasswordSendEmail;
