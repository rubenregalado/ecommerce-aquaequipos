require('dotenv').config();
const axios = require('axios');

const WooCommerceApi = axios.create({
  baseURL: `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  params: {
    consumer_key: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET
  }
});

module.exports = WooCommerceApi;