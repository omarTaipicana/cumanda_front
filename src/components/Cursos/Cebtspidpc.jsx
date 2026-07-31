import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import "./styles/Cebtspidpc.css";
import IsLoading from "../shared/isLoading";

pdfjs.GlobalWorkerOptions.workerSrc =
  "/files/pdf.worker.min.js";

const Cebtspidpc = () => {
  const courseCode = "cebtspidpc";

  const urlRegister =
    `${window.location.protocol}//${window.location.host}` +
    `/#/register_discente/${courseCode}`;

  const urlPago =
    `${window.location.protocol}//${window.location.host}` +
    `/#/register_pago/${courseCode}`;

  const pdfFile =
    "/files/territorio_seguro_360.pdf";

  const [numPages, setNumPages] =
    useState(null);

  const [pageNumber, setPageNumber] =
    useState(1);

  const [loadingPdf, setLoadingPdf] =
    useState(true);

  const [pdfError, setPdfError] =
    useState(false);

  const [pdfWidth, setPdfWidth] =
    useState(430);

  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return;

      const containerWidth =
        containerRef.current.offsetWidth;

      /*
       * Se descuentan los espacios internos del
       * panel para evitar que el PDF se desborde.
       */
      const availableWidth =
        containerWidth - 54;

      setPdfWidth(
        Math.min(
          Math.max(availableWidth, 250),
          430
        )
      );
    };

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateWidth
      );
    };
  }, []);

  const onDocumentLoadSuccess = ({
    numPages: totalPages,
  }) => {
    setNumPages(totalPages);
    setPageNumber(1);
    setLoadingPdf(false);
    setPdfError(false);
  };

  const onDocumentLoadError = (
    error
  ) => {
    console.error(
      "No se pudo cargar el PDF:",
      error
    );

    setLoadingPdf(false);
    setPdfError(true);
  };

  const goToPrevPage = () => {
    setPageNumber((currentPage) =>
      Math.max(currentPage - 1, 1)
    );
  };

  const goToNextPage = () => {
    setPageNumber((currentPage) =>
      Math.min(
        currentPage + 1,
        numPages || 1
      )
    );
  };

  return (
    <div className="cebtspidpc_page">
      {loadingPdf && <IsLoading />}

      <section className="cebtspidpc_hero">
        <div className="cebtspidpc_backdrop" />

        <div className="cebtspidpc_layout">
          <aside className="cebtspidpc_sidebar">
            <span className="cebtspidpc_label">
              Curso de especialización básica
            </span>

            <h1 className="cebtspidpc_main_title">
              Territorio Seguro 360°
            </h1>

            <h2 className="cebtspidpc_course_name">
              Prevención Inteligente del
              Delito y Proximidad Comunitaria
            </h2>

            <p className="cebtspidpc_slogan">
              Observar, anticipar, intervenir
              y construir confianza.
            </p>

            <p className="cebtspidpc_subtitle">
              Fortalece tus capacidades para
              diagnosticar problemas de
              seguridad, anticipar riesgos,
              desarrollar intervenciones
              preventivas y promover la
              participación comunitaria,
              contribuyendo a reducir las
              oportunidades delictivas y
              mejorar la convivencia pacífica.
            </p>

            <div className="cebtspidpc_stats">
              <div className="cebtspidpc_stat">
                <strong>290</strong>
                <span>Horas de formación</span>
              </div>

              <div className="cebtspidpc_stat">
                <strong>100%</strong>
                <span>Modalidad en línea</span>
              </div>

              <div className="cebtspidpc_stat">
                <strong>6</strong>
                <span>Módulos especializados</span>
              </div>

              <div className="cebtspidpc_stat">
                <strong>80/100</strong>
                <span>Nota de aprobación</span>
              </div>
            </div>

            <div className="cebtspidpc_info_panel">
              <span className="cebtspidpc_mini_badge">
                Formación policial preventiva
              </span>

              <h3 className="cebtspidpc_title">
                De la reacción a la prevención
                inteligente del delito
              </h3>

              <p className="cebtspidpc_description">
                Un programa orientado al
                análisis territorial, la
                identificación de factores de
                riesgo, la solución de
                problemas, la prevención
                situacional y la construcción
                de confianza entre la Policía
                y la comunidad.
              </p>

              <div className="cebtspidpc_feature_list">
                <div className="cebtspidpc_feature_item">
                  <span className="cebtspidpc_feature_icon">
                    ◉
                  </span>

                  <div>
                    <strong>
                      Diagnóstico territorial
                    </strong>

                    <span>
                      Mapas de riesgo, puntos
                      críticos y análisis de
                      patrones delictivos.
                    </span>
                  </div>
                </div>

                <div className="cebtspidpc_feature_item">
                  <span className="cebtspidpc_feature_icon">
                    ◎
                  </span>

                  <div>
                    <strong>
                      Proximidad comunitaria
                    </strong>

                    <span>
                      Contacto ciudadano,
                      mediación y construcción
                      de redes de seguridad.
                    </span>
                  </div>
                </div>

                <div className="cebtspidpc_feature_item">
                  <span className="cebtspidpc_feature_icon">
                    ◈
                  </span>

                  <div>
                    <strong>
                      Prevención situacional
                    </strong>

                    <span>
                      Diseño de espacios,
                      rutas y entornos más
                      seguros.
                    </span>
                  </div>
                </div>

                <div className="cebtspidpc_feature_item">
                  <span className="cebtspidpc_feature_icon">
                    ✓
                  </span>

                  <div>
                    <strong>
                      Proyecto final
                    </strong>

                    <span>
                      Elaboración de un Plan
                      Preventivo Territorial
                      360°.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cebtspidpc_distribution">
              <div className="cebtspidpc_section_heading">
                <span>
                  Distribución académica
                </span>

                <h3>
                  Formación aplicada y práctica
                </h3>
              </div>

              <div className="cebtspidpc_distribution_grid">
                <div className="cebtspidpc_distribution_item">
                  <strong>120 h</strong>
                  <span>
                    Formación teórica aplicada
                  </span>
                </div>

                <div className="cebtspidpc_distribution_item">
                  <strong>80 h</strong>
                  <span>
                    Talleres y análisis de casos
                  </span>
                </div>

                <div className="cebtspidpc_distribution_item">
                  <strong>70 h</strong>
                  <span>
                    Simulaciones operativas
                  </span>
                </div>

                <div className="cebtspidpc_distribution_item">
                  <strong>20 h</strong>
                  <span>
                    Elaboración del proyecto
                    final
                  </span>
                </div>
              </div>
            </div>

            <div className="button_group button_group--hero">
              <a
                href={urlRegister}
                className="btn_primary"
                rel="noopener noreferrer"
              >
                <span>Inscribirse</span>
                <span aria-hidden="true">➜</span>
              </a>

              <a
                href={urlPago}
                className="btn_primary btn_primary--secondary"
                rel="noopener noreferrer"
              >
                <span>Registrar pago</span>
                <span aria-hidden="true">➜</span>
              </a>

              <a
                href={pdfFile}
                download="Territorio-Seguro-360.pdf"
                className="btn_primary btn_primary--ghost"
              >
                <span>Descargar brochure</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </aside>

          <main className="cebtspidpc_pdf_area">
            <div
              className="cebtspidpc_pdf_panel"
              ref={containerRef}
            >
              <div className="cebtspidpc_panel_head">
                <div>
                  <span className="cebtspidpc_panel_kicker">
                    Brochure oficial
                  </span>

                  <h2>
                    Información completa del
                    programa
                  </h2>
                </div>

                <div
                  className="cebtspidpc_panel_dots"
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="cebtspidpc_pdf_viewer">
                {pdfError ? (
                  <div className="cebtspidpc_pdf_error">
                    <span>!</span>

                    <h3>
                      No se pudo mostrar el PDF
                    </h3>

                    <p>
                      Verifica que el archivo
                      se encuentre en:
                    </p>

                    <code>
                      public/files/
                      territorio_seguro_360.pdf
                    </code>

                    <a
                      href={pdfFile}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir PDF directamente
                    </a>
                  </div>
                ) : (
                  <Document
                    file={pdfFile}
                    onLoadSuccess={
                      onDocumentLoadSuccess
                    }
                    onLoadError={
                      onDocumentLoadError
                    }
                    loading={
                      <div className="cebtspidpc_pdf_loading">
                        Cargando brochure...
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={pdfWidth}
                      className="cebtspidpc_pdf"
                      renderTextLayer
                      renderAnnotationLayer
                    />
                  </Document>
                )}
              </div>

              {!pdfError && (
                <div className="pagination_controls">
                  <button
                    type="button"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                  >
                    ← Anterior
                  </button>

                  <span>
                    Página{" "}
                    <strong>
                      {pageNumber}
                    </strong>{" "}
                    de{" "}
                    <strong>
                      {numPages || "--"}
                    </strong>
                  </span>

                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={
                      !numPages ||
                      pageNumber >= numPages
                    }
                  >
                    Siguiente →
                  </button>
                </div>
              )}

              <div className="cebtspidpc_project_card">
                <span className="cebtspidpc_project_icon">
                  360°
                </span>

                <div>
                  <strong>
                    Producto final del curso
                  </strong>

                  <p>
                    Plan preventivo policial
                    para un sector, circuito,
                    subcircuito, barrio o
                    comunidad.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
};

export default Cebtspidpc;