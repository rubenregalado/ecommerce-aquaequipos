const { parseAtributosWoo } = require('./utils/woocommerceParser');

const producto = {
  attributes: [
    { name: "Caudal Seguro (L/min)", options: ["70 - 110"] },
    { name: "Caudal (Q) Máximo (L/min)", options: ["120"] },
    { name: "Altura Máxima (m)", options: ["50"] },
    { name: "Altura Mínima (m)", options: ["10"] },
    { name: "Altura Segura (m)", options: ["25 - 40"] },
    { name: "Fase", options: ["monofasico"] },
    { name: "Voltaje", options: ["230V"] },
    { name: "Aplicaciones", options: ["pozo_hidroneumatico, cisterna_tanque"] }
  ]
};

const infoTecnica = parseAtributosWoo(producto.attributes);
console.log("✅ Resultado del parser:\n");
console.log(infoTecnica);
