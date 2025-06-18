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
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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

function estimarCaudal(altura, bomba) {
  const {
    caudal_seguro_min,
    caudal_seguro_max,
    caudal_maximo_lmin,
    altura_segura_min,
    altura_segura_max,
    altura_max
  } = bomba;

  if (
    caudal_seguro_min == null || caudal_seguro_max == null ||
    caudal_maximo_lmin == null || altura_segura_min == null ||
    altura_segura_max == null || altura_max == null
  ) return null; // datos incompletos

  if (altura >= altura_max) return 0;

  if (altura >= altura_segura_max && altura <= altura_max) {
    // De segura max a altura máxima (baja de caudal seguro min a 0)
    const pendiente = (0 - caudal_seguro_min) / (altura_max - altura_segura_max);
    return Math.round(caudal_seguro_min + pendiente * (altura - altura_segura_max));
  }

  if (altura >= altura_segura_min && altura < altura_segura_max) {
    // Rango seguro (sube desde caudal seguro max a min)
    const pendiente = (caudal_seguro_min - caudal_seguro_max) / (altura_segura_max - altura_segura_min);
    return Math.round(caudal_seguro_max + pendiente * (altura - altura_segura_min));
  }

  if (altura >= 0 && altura < altura_segura_min) {
    // De 0 a segura min (sube desde caudal máximo a caudal seguro max)
    const pendiente = (caudal_seguro_max - caudal_maximo_lmin) / altura_segura_min;
    return Math.round(caudal_maximo_lmin + pendiente * altura);
  }

  return null;
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

    // Logs para ver resultados en terminal
    console.log(`📦 Total de productos recibidos: ${productos.length}`);
    productos.forEach(p => {
      console.log(`→ ${p.name}`);
      console.log(p.attributes);
    });

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

    const bombasValidas = bombas.filter(b => {
      const completas = b.aplicaciones && b.voltaje && b.fase;
      if (!completas) {
        console.warn(`🚫 Bomba con atributos incompletos: ${b.nombre}`);
      }
      return completas;
    });

    console.log("💧 Bombas válidas encontradas:", bombasValidas.length);
    console.log("👉 Aplicación solicitada:", aplicacion);
    console.log("👉 Voltaje solicitado:", voltaje);
    console.log("👉 Fase solicitada:", fase);

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

      const caudalInterpolado = estimarCaudal(cdt, bomba);

       



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
        rendimiento_sugerido: {
          caudal_estimado_a_esa_altura_lmin: caudalInterpolado !== null ? caudalInterpolado : "No disponible",
          caudal_aproximado_lmin: bomba.caudal_maximo_lmin || "No disponible",
          altura_aproximada_m: bomba.altura_max || "No disponible"
        },
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
