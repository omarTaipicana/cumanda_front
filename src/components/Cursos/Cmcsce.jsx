import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./styles/Cmcsce.css";
import IsLoading from "../shared/isLoading";

pdfjs.GlobalWorkerOptions.workerSrc = `../../../files/pdf.worker.min.js`;

const Cmcsce = () => {
  const urlRegister = `${location.protocol}//${location.host}/#/register_discente/cmcsce`;
  const urlPago = `${location.protocol}//${location.host}/#/register_pago/cmcsce`;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingPdf, setLoadingPdf] = useState(true);

  const containerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(430);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 28;
        setPdfWidth(Math.min(width, 430));
      }
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadingPdf(false);
  }

  function goToPrevPage() {
    setPageNumber((prev) => (prev <= 1 ? 1 : prev - 1));
  }

  function goToNextPage() {
    setPageNumber((prev) => (prev >= numPages ? numPages : prev + 1));
  }

  return (
    <div className="cmcsce_page">
      {loadingPdf && <IsLoading />}

      <section className="cmcsce_hero">
        <div className="cmcsce_backdrop" />

        <div className="cmcsce_layout">
          <aside className="cmcsce_sidebar">

            <h1 className="cmcsce_main_title">
              Curso de Manejo de Conflictos Sociales y Crisis Emocionales
            </h1>

            <p className="cmcsce_subtitle">
              Desarrollar competencias integrales en la identificación, manejo y
              resolución de conflictos sociales y crisis emocionales, mediante la
              aplicación de estrategias de negociación, comunicación asertiva.
            </p>

            <div className="cmcsce_stats">
              <div className="cmcsce_stat">
                <strong>Certificación</strong>
                <span>Oficial</span>
              </div>

              <div className="cmcsce_stat">
                <strong>300</strong>
                <span>Horas</span>
              </div>

              <div className="cmcsce_stat">
                <strong>100%</strong>
                <span>En línea</span>
              </div>
            </div>

            <div className="cmcsce_info_panel">
              <span className="cmcsce_mini_badge">Información del curso</span>

              <h3 className="cmcsce_title">
                Formación profesional con enfoque social y emocional
              </h3>

              <p className="cmcsce_description">
                Un programa diseñado para fortalecer la comunicación, la gestión
                emocional y la resolución estratégica de conflictos en contextos
                educativos, comunitarios e institucionales.
              </p>

              <div className="cmcsce_feature_list">
                <div className="cmcsce_feature_item">
                  <strong>Modalidad</strong>
                  <span>Virtual E-Learning</span>
                </div>

                <div className="cmcsce_feature_item">
                  <strong>Enfoque</strong>
                  <span>Comunicación e inclusión</span>
                </div>

                <div className="cmcsce_feature_item">
                  <strong>Certificación</strong>
                  <span>Disponible al aprobar</span>
                </div>
              </div>
            </div>

            <div className="button_group button_group--hero">
              <a href={urlRegister} rel="noopener noreferrer" className="btn_primary">
                Inscribirse ➜
              </a>

              <a
                href={urlPago}
                rel="noopener noreferrer"
                className="btn_primary btn_primary--secondary"
              >
                Registrar pago ➜
              </a>

              <a
                href="/files/cmcsce_c.pdf"
                download="Brochure-cmcsce.pdf"
                className="btn_primary btn_primary--ghost"
              >
                Descargar PDF ➜
              </a>
            </div>
          </aside>

          <main className="cmcsce_pdf_area">
            <div className="cmcsce_pdf_panel" ref={containerRef}>
              <div className="cmcsce_panel_head">
                <div>
                  <span className="cmcsce_panel_kicker">Brochure oficial</span>
                  <h2>Vista previa del programa</h2>
                </div>

                <div className="cmcsce_panel_dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              <div className="cmcsce_pdf_viewer">
                <Document
                  file="/files/cmcsce_c.pdf"
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading="Cargando PDF..."
                >
                  <Page
                    pageNumber={pageNumber}
                    width={pdfWidth}
                    className="cmcsce_pdf"
                  />
                </Document>
              </div>

              <div className="pagination_controls">
                <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
                  Anterior
                </button>

                <span>
                  Página {pageNumber} de {numPages || "--"}
                </span>

                <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
                  Siguiente
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
};

export default Cmcsce;