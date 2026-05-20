import React from "react";

// Componente para etiqueta personalizada
const CustomLabel = ({ x, y, stroke, value }) => {
  // Si y es muy pequeño (muy arriba), lo desplazamos hacia abajo (ejemplo: mínimo 20px)
  const yPos = y < 20 ? 20 : y - 5; // Ajusta según tu preferencia

  return (
    <text
      x={x}
      y={yPos}
      fill={stroke}
      fontSize={12}
      fontWeight="bold"
      textAnchor="middle"
    >
      {value}
    </text>
  );
};
export default CustomLabel;
