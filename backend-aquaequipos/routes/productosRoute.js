const express = require("express");
const router = express.Router();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const api = new WooCommerceRestApi({
  url: "https://aquaequipos.com/tienda",
  consumerKey: "ck_33c6f7d90e13b4e228bec54192541df8509f06de",
  consumerSecret: "cs_7736c2968cc84082c28c6aec7113c2465794fe1d",
  version: "wc/v3"
});

router.get("/", async (req, res) => {
  try {
    const response = await api.get("products", {
      per_page: 100, // Puedes ajustar este número según tus necesidades
      _fields: "id,name,price,regular_price,images"
    });

    // Si solo quieres devolver la imagen principal y el precio, puedes filtrar aquí:
    const productos = response.data.map(producto => ({
      id: producto.id,
      name: producto.name,
      price: producto.price,
      regular_price: producto.regular_price,
      image: producto.images && producto.images.length > 0 ? producto.images[0].src : null
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al obtener productos", detalle: error.response?.data || error.message });
  }
});

module.exports = router;

