import { useState } from "react";
import axios from "axios";
import getConfigToken from "../services/getConfigToken";

const useCrud = () => {
  const BASEURL =
    import.meta.env.VITE_API_URL;

  const [response, setResponse] =
    useState([]);

  const [newReg, setNewReg] =
    useState();

  const [newUpload, setNewUpload] =
    useState();

  const [deleteReg, setDeleteReg] =
    useState();

  const [updateReg, setUpdateReg] =
    useState();

  const [error, setError] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(false);

  /*
   * =====================================================
   * ACTUALIZAR UN REGISTRO EN LA RESPUESTA
   * =====================================================
   *
   * Soporta:
   *
   * 1. Respuesta tradicional:
   *    [
   *      { id: 1 },
   *      { id: 2 }
   *    ]
   *
   * 2. Respuesta paginada:
   *    {
   *      total: 100,
   *      page: 1,
   *      limit: 15,
   *      data: [
   *        { id: 1 }
   *      ]
   *    }
   */

  const actualizarRegistroEnResponse = (
    estadoActual,
    id,
    registroActualizado,
  ) => {
    if (Array.isArray(estadoActual)) {
      return estadoActual.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                ...registroActualizado,
              }
            : item,
      );
    }

    if (
      estadoActual &&
      typeof estadoActual ===
        "object" &&
      Array.isArray(
        estadoActual.data,
      )
    ) {
      return {
        ...estadoActual,

        data:
          estadoActual.data.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    ...registroActualizado,
                  }
                : item,
          ),
      };
    }

    return estadoActual;
  };

  /*
   * =====================================================
   * AGREGAR UN REGISTRO A LA RESPUESTA
   * =====================================================
   */

  const agregarRegistroAResponse = (
    estadoActual,
    nuevoRegistro,
  ) => {
    if (Array.isArray(estadoActual)) {
      return [
        ...estadoActual,
        nuevoRegistro,
      ];
    }

    if (
      estadoActual &&
      typeof estadoActual ===
        "object" &&
      Array.isArray(
        estadoActual.data,
      )
    ) {
      const limit =
        Number(
          estadoActual.limit,
        ) || null;

      let nuevaData = [
        nuevoRegistro,
        ...estadoActual.data,
      ];

      /*
       * Si la respuesta está paginada y conocemos
       * el límite, evitamos que la página tenga
       * más registros de los permitidos.
       */
      if (
        limit &&
        nuevaData.length > limit
      ) {
        nuevaData =
          nuevaData.slice(
            0,
            limit,
          );
      }

      const nuevoTotal =
        Number(
          estadoActual.total || 0,
        ) + 1;

      const totalPages =
        limit
          ? Math.max(
              Math.ceil(
                nuevoTotal /
                  limit,
              ),
              1,
            )
          : estadoActual.totalPages;

      return {
        ...estadoActual,

        total:
          nuevoTotal,

        totalPages,

        data:
          nuevaData,
      };
    }

    /*
     * Si todavía no había respuesta,
     * creamos un arreglo.
     */
    return [
      nuevoRegistro,
    ];
  };

  /*
   * =====================================================
   * ELIMINAR UN REGISTRO DE LA RESPUESTA
   * =====================================================
   */

  const eliminarRegistroDeResponse = (
    estadoActual,
    id,
  ) => {
    if (Array.isArray(estadoActual)) {
      return estadoActual.filter(
        (item) =>
          item.id !== id,
      );
    }

    if (
      estadoActual &&
      typeof estadoActual ===
        "object" &&
      Array.isArray(
        estadoActual.data,
      )
    ) {
      const dataFiltrada =
        estadoActual.data.filter(
          (item) =>
            item.id !== id,
        );

      const fueEliminado =
        dataFiltrada.length !==
        estadoActual.data.length;

      if (!fueEliminado) {
        return estadoActual;
      }

      const nuevoTotal =
        Math.max(
          Number(
            estadoActual.total || 0,
          ) - 1,
          0,
        );

      const limit =
        Number(
          estadoActual.limit,
        ) || null;

      const totalPages =
        limit
          ? Math.max(
              Math.ceil(
                nuevoTotal /
                  limit,
              ),
              1,
            )
          : estadoActual.totalPages;

      return {
        ...estadoActual,

        total:
          nuevoTotal,

        totalPages,

        data:
          dataFiltrada,
      };
    }

    return estadoActual;
  };

  /*
   * =====================================================
   * GET
   * =====================================================
   */

  const getApi = async (
    path,
  ) => {
    setIsLoading(true);
    setError(null);

    const url =
      `${BASEURL}${path}`;

    try {
      const res =
        await axios.get(
          url,
          getConfigToken(),
        );

      setResponse(
        res.data,
      );

      return res.data;
    } catch (err) {
      setError(err);

      throw err;
    } finally {
      setIsLoading(
        false,
      );
    }
  };

  /*
   * =====================================================
   * POST
   * =====================================================
   */

  const postApi = async (
    path,
    data,
  ) => {
    setIsLoading(true);
    setError(null);

    const url =
      `${BASEURL}${path}`;

    try {
      const res =
        await axios.post(
          url,
          data,
          getConfigToken(),
        );

      setResponse(
        (
          estadoActual,
        ) =>
          agregarRegistroAResponse(
            estadoActual,
            res.data,
          ),
      );

      setNewReg(
        res.data,
      );

      return res.data;
    } catch (err) {
      setError(err);

      console.error(
        "Error en postApi:",
        err,
      );

      throw err;
    } finally {
      setIsLoading(
        false,
      );
    }
  };

  /*
   * =====================================================
   * DELETE
   * =====================================================
   */

  const deleteApi = async (
    path,
    id,
  ) => {
    setIsLoading(true);
    setError(null);

    const url =
      `${BASEURL}${path}/${id}`;

    try {
      const res =
        await axios.delete(
          url,
          getConfigToken(),
        );

      setResponse(
        (
          estadoActual,
        ) =>
          eliminarRegistroDeResponse(
            estadoActual,
            id,
          ),
      );

      setDeleteReg(
        res.data,
      );

      return res.data;
    } catch (err) {
      setError(err);

      throw err;
    } finally {
      setIsLoading(
        false,
      );
    }
  };

  /*
   * =====================================================
   * PUT
   * =====================================================
   */

  const updateApi = async (
    path,
    id,
    data,
  ) => {
    setIsLoading(true);
    setError(null);

    const url =
      `${BASEURL}${path}/${id}`;

    try {
      const res =
        await axios.put(
          url,
          data,
          getConfigToken(),
        );

      setResponse(
        (
          estadoActual,
        ) =>
          actualizarRegistroEnResponse(
            estadoActual,
            id,
            res.data,
          ),
      );

      setUpdateReg(
        res.data,
      );

      return res.data;
    } catch (err) {
      setError(err);

      throw err;
    } finally {
      setIsLoading(
        false,
      );
    }
  };

  /*
   * =====================================================
   * SUBIR COMPROBANTE
   * =====================================================
   */

  const uploadPdf = async (
    path,
    data,
    file,
  ) => {
    setIsLoading(true);
    setError(null);

    const formData =
      new FormData();

    formData.append(
      "imagePago",
      file,
    );

    Object.entries(
      data || {},
    ).forEach(
      ([key, value]) => {
        if (
          value !==
            undefined &&
          value !== null
        ) {
          formData.append(
            key,
            value,
          );
        }
      },
    );

    const url =
      `${BASEURL}${path}`;

    try {
      const config =
        getConfigToken();

      /*
       * No es necesario colocar manualmente:
       *
       * Content-Type: multipart/form-data
       *
       * Axios agrega automáticamente el boundary.
       */

      const res =
        await axios.post(
          url,
          formData,
          {
            ...config,

            headers: {
              ...config.headers,
            },
          },
        );

      setResponse(
        (
          estadoActual,
        ) =>
          agregarRegistroAResponse(
            estadoActual,
            res.data,
          ),
      );

      setNewUpload(
        res.data,
      );

      return res.data;
    } catch (err) {
      setError(err);

      console.error(
        "Error al subir comprobante:",
        err,
      );

      throw err;
    } finally {
      setIsLoading(
        false,
      );
    }
  };

  /*
   * =====================================================
   * GET POR ID
   * =====================================================
   */

  const getApiById = async (
    path,
  ) => {
    setIsLoading(true);
    setError(null);

    const url =
      `${BASEURL}${path}`;

    try {
      const res =
        await axios.get(
          url,
          getConfigToken(),
        );

      setResponse(
        res.data,
      );

      return res.data;
    } catch (err) {
      setError(err);

      throw err;
    } finally {
      setIsLoading(
        false,
      );
    }
  };

  /*
   * =====================================================
   * DESCARGAR ZIP
   * =====================================================
   */

  const postApiDownloadZip =
    async (
      path,
      data,
      filenameFallback =
        "certificados.zip",
    ) => {
      setIsLoading(true);
      setError(null);

      const url =
        `${BASEURL}${path}`;

      try {
        const res =
          await axios.post(
            url,
            data,
            {
              ...getConfigToken(),

              responseType:
                "blob",
            },
          );

        const disposition =
          res.headers?.[
            "content-disposition"
          ] || "";

        const match =
          disposition.match(
            /filename="?([^"]+)"?/i,
          );

        const filename =
          match?.[1] ||
          filenameFallback;

        const blob =
          new Blob(
            [res.data],
            {
              type:
                "application/zip",
            },
          );

        const objectUrl =
          window.URL
            .createObjectURL(
              blob,
            );

        const link =
          document.createElement(
            "a",
          );

        link.href =
          objectUrl;

        link.download =
          filename;

        document.body
          .appendChild(
            link,
          );

        link.click();

        link.remove();

        window.URL
          .revokeObjectURL(
            objectUrl,
          );

        return true;
      } catch (err) {
        setError(err);

        console.error(
          "Error al descargar ZIP:",
          err,
        );

        return false;
      } finally {
        setIsLoading(
          false,
        );
      }
    };

  /*
   * =====================================================
   * SUBIR ZIP DE CERTIFICADOS
   * =====================================================
   */

  const uploadCertificadosZip =
    async (
      path,
      file,
    ) => {
      setIsLoading(true);
      setError(null);

      const formData =
        new FormData();

      /*
       * Debe coincidir con:
       * upload.single("zip")
       */
      formData.append(
        "zip",
        file,
      );

      const url =
        `${BASEURL}${path}`;

      try {
        const config =
          getConfigToken();

        const res =
          await axios.post(
            url,
            formData,
            {
              ...config,

              headers: {
                ...config.headers,
              },
            },
          );

        setResponse(
          (
            estadoActual,
          ) =>
            agregarRegistroAResponse(
              estadoActual,
              res.data,
            ),
        );

        setNewUpload(
          res.data,
        );

        return res.data;
      } catch (err) {
        setError(err);

        console.error(
          "Error al subir ZIP:",
          err,
        );

        throw err;
      } finally {
        setIsLoading(
          false,
        );
      }
    };

  /*
   * No cambiar el orden.
   * Los componentes consumen el hook
   * mediante posiciones del arreglo.
   */

  return [
    response,
    getApi,
    postApi,
    deleteApi,
    updateApi,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    uploadPdf,
    newUpload,
    getApiById,
    postApiDownloadZip,
    uploadCertificadosZip,
  ];
};

export default useCrud;