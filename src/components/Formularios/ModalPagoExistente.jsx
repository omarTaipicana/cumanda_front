import React from "react";
import "./styles/ModalPagoExistente.css";

const ModalPagoExistente = ({ pagos, onClose, onRegistrarNuevo, inscrito }) => {
  const pagosOrdenados = [...(pagos || [])]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .filter((pago) => pago.inscripcionId === inscrito.id);

  return (
    <div className="modal_pago_overlay">
      <div className="modal_pago_content">
        <h2>⚠️ Pagos ya registrados</h2>

        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            padding: "1em",
            borderRadius: "8px",
            marginBottom: "1.5em",
            color: "#856404",
            fontSize: "0.95em",
            lineHeight: "1.5",
          }}
        >
          📌 <strong>Importante:</strong> Para verificar tus comprobantes de pago, accede a la plataforma <strong>EDUKA</strong> con el <strong>mismo correo</strong> con el que te inscribiste. Ahí podrás visualizar el estado y detalles de tus pagos realizados.
        </div>

        {pagosOrdenados?.map((pago, i) => {
          const extras = [];
          if (pago.moneda) extras.push("moneda");
          if (pago.distintivo) extras.push("distintivo");

          return (
            <div key={i} className="pago_item">
              <p>
                Pago #{i + 1}{" "}
                {i === 0
                  ? `por el certificado${
                      extras.length > 0
                        ? ", incluyendo " + extras.join(" y ")
                        : ""
                    }.`
                  : extras.length > 0
                  ? `por ${extras.join(" y ")}.`
                  : ""}
              </p>
              <p>
                Estado: {pago.verificado ? "✅ Verificado" : "⏳ Por verificar"}
              </p>
              <p>Monto: ${pago.valorDepositado}</p>
              <hr />
            </div>
          );
        })}

        <p>
          Si deseas registrar un nuevo pago por la moneda o distintivo, haz clic
          en el botón <strong>Nuevo Pago</strong>, caso contrario cierra esta ventana.
        </p>

        <div className="modal_pago_botones">
          <button className="modal_pago_cerrar" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal_pago_nuevo" onClick={onRegistrarNuevo}>
            Nuevo pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPagoExistente;
