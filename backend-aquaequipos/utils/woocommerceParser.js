// utils/woocommerceParser.js

function parseAtributosWoo(attributes) {
  const atributos = {};

  function parseRango(valor) {
    if (!valor.includes('-')) return [parseFloat(valor.trim())];
    const [min, max] = valor.split('-').map(v => parseFloat(v.trim()));
    return [min, max];
  }

  function mapAplicacion(valor) {
    const normalizado = valor.toLowerCase().trim();
    if (normalizado.includes("cisterna") && normalizado.includes("tanque")) return "cisterna_tanque";
    if (normalizado.includes("pozo") && normalizado.includes("tanque")) return "pozo_tanque";
    if (normalizado.includes("pozo") && normalizado.includes("hidroneumático")) return "pozo_hidroneumatico";
    if (normalizado.includes("cisterna") && normalizado.includes("hidroneumático")) return "cisterna_hidroneumatico";
    return valor;
  }

  attributes.forEach(attr => {
    const nombre = attr.name.toLowerCase();
    const options = attr.options || [];
    const valor = options[0] || "";

    switch (nombre) {
      case "aplicación":
        atributos.aplicaciones = options.map(mapAplicacion);
        break;
      case "voltaje":
        atributos.voltaje = valor;
        break;
      case "fase":
        atributos.fase = valor.toLowerCase();
        break;
      case "caudal seguro (l/min)":
        [atributos.caudal_seguro_min, atributos.caudal_seguro_max] = parseRango(valor);
        break;
      case "caudal máximo (l/min)":
        atributos.caudal_maximo_lmin = parseFloat(valor);
        break;
      case "altura mínima (m)":
        atributos.altura_min = parseFloat(valor);
        break;
      case "altura máxima (m)":
        atributos.altura_max = parseFloat(valor);
        break;
      case "altura segura (m)":
        [atributos.altura_segura_min, atributos.altura_segura_max] = parseRango(valor);
        break;
    }
  });

  return atributos;
}

module.exports = { parseAtributosWoo };
