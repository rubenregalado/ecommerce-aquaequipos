const WooCommerceApi = require("../utils/woocommerceClient");
const { parseAtributosWoo } = require("../utils/woocommerceParser");

function calcularCDT({ altura_vertical, longitud_tuberia, numero_codos, diametro_tuberia }) {
  const diametro_metros = diametro_tuberia * 0.0254;
  const perdidas_por_rozamiento = (longitud_tuberia / diametro_metros) * 0.02;
  const perdidas_por_codos = numero_codos * 0.5;
  return parseFloat((altura_vertical + perdidas_por_rozamiento + perdidas_por_codos).toFixed(2));
}

function calcularCaudalEstimado({ largo, ancho, altura, tiempo_deseado_minutos }) {
  const volumen_m3 = largo * ancho * altura;
  const litros = volumen_m3 * 1000;
  return parseFloat((litros / tiempo_deseado_minutos).toFixed(2));
}

function normalizarTexto(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

async function obtenerTodosLosProductos() {
  const productos = [];
  let page = 1;
  const authParams = {
    consumer_key: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET
  };
  while (true) {
    const { data } = await WooCommerceApi.get("products", {
      params: { ...authParams, per_page: 100, page }
    });
    productos.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return productos;
}

function interpolarCaudal(altura, altura_min, altura_max, caudal_min, caudal_max) {
  if (altura < altura_min || altura > altura_max) return null;
  const pendiente = (caudal_max - caudal_min) / (altura_max - altura_min);
  return Math.round(caudal_max - pendiente * (altura - altura_min));
}

async function asesoriaTecnica(req, res) {
  const {
    aplicacion, fase, voltaje,
    altura_vertical, longitud_tuberia, numero_codos, diametro_tuberia,
    dimensiones_tanque, tiempo_deseado_minutos, caudal_manual_lmin
  } = req.body;

  const error = (msg) => res.status(400).json({ status: "error", error: msg });
  const fases_validas = ["monofasico", "trifasico"];
  const voltajes_validos = ["110V", "115V", "220V", "230V", "380V", "24V"];

  if (!fases_validas.includes(normalizarTexto(fase))) return error("Fase no válida");
  if (!voltajes_validos.includes(voltaje)) return error("Voltaje no válido");
  if (!aplicacion || altura_vertical <= 0) return error("Altura inválida");
  if (!caudal_manual_lmin && !(dimensiones_tanque && tiempo_deseado_minutos)) {
    return error("Debe ingresar caudal o datos del tanque");
  }

  const cdt = calcularCDT({ altura_vertical, longitud_tuberia, numero_codos, diametro_tuberia });
  let caudal_estimado = caudal_manual_lmin;
  if (!caudal_estimado && dimensiones_tanque && tiempo_deseado_minutos) {
    caudal_estimado = calcularCaudalEstimado({ ...dimensiones_tanque, tiempo_deseado_minutos });
  }

  try {
    const productos = await obtenerTodosLosProductos();
    const bombas = productos.map(p => {
      const atributos = parseAtributosWoo(p.attributes);
      return {
        nombre: p.name,
        url: p.permalink,
        categoria: p.categories?.[0]?.slug || "desconocida",
        price: p.price || p.regular_price || null,
        image: p.images?.[0]?.src || null,
        ...atributos,
      };
    });

    const bombasValidas = bombas.filter(b => b.aplicaciones && b.voltaje && b.fase);
    const bombasCoincidentes = bombasValidas.filter(b =>
      b.aplicaciones.includes(aplicacion) &&
      b.voltaje === voltaje &&
      normalizarTexto(b.fase) === normalizarTexto(fase)
    );
    const bombasDeRespaldo = bombasValidas.filter(b =>
      b.voltaje === voltaje &&
      normalizarTexto(b.fase) === normalizarTexto(fase)
    );

    const bombasUsadas = bombasCoincidentes.length > 0 ? bombasCoincidentes : bombasDeRespaldo;
    const tipoRecomendacion = bombasCoincidentes.length > 0 ? "coincidentes" : "de respaldo";

    const resultados_crudos = bombasUsadas.map(bomba => {
      let estado = "";
      let prioridad = 3;

      const caudalInterpolado = interpolarCaudal(
        cdt,
        bomba.altura_min,
        bomba.altura_max,
        bomba.caudal_maximo_lmin,
        bomba.caudal_seguro_min
      );

      const caudalCumpleMaximo = caudal_estimado <= bomba.caudal_maximo_lmin;

      if (!caudalCumpleMaximo) {
        estado = "No cumple con el caudal requerido";
      } else if (cdt >= bomba.altura_segura_min && cdt <= bomba.altura_segura_max) {
        estado = "Dentro del rango ideal de operación";
        prioridad = 1;
      } else if (cdt >= bomba.altura_min && cdt <= bomba.altura_max) {
        estado = "Funciona, pero fuera del rango ideal";
        prioridad = 2;
      } else {
        estado = "❌ No compatible con esta bomba";
      }

      return {
        nombre: bomba.nombre,
        url: bomba.url,
        categoria: bomba.categoria,
        estado,
        prioridad,
        rendimiento_estimado: caudalInterpolado !== null
          ? `${caudalInterpolado} L/min a ${cdt} m`
          : "No disponible para esta altura",
        nota_tecnica: `Tu requerimiento fue de ${caudal_estimado} L/min a ${cdt} m.`,
        price: bomba.price,
        image: bomba.image
      };
    });

    const resultados_ordenados = resultados_crudos
      .filter(r => r.prioridad <= 2)
      .sort((a, b) => a.prioridad - b.prioridad);

    res.json({
      status: "ok",
      aplicacion,
      fase,
      voltaje,
      tipo_recomendacion: tipoRecomendacion,
      CDT_calculada: cdt,
      caudal_estimado,
      resultados: resultados_ordenados.slice(0, 4),
      bombas_totales_evaluadas: bombasUsadas.length
    });

  } catch (e) {
    console.error("❌ Error al obtener productos desde WooCommerce:", e.message);
    res.status(500).json({ status: "error", error: "Error al obtener productos desde WooCommerce." });
  }
}

module.exports = { asesoriaTecnica };
