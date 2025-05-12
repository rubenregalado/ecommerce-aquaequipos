require('dotenv').config();
const axios = require('axios');

// Configuración del cliente WooCommerce usando Axios
const WooCommerceApi = axios.create({
  baseURL: `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = WooCommerceApi;
