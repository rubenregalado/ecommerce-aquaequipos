require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const calculoRoute = require('./routes/calculoRoute');
const productosRoute = require('./routes/productosRoute');
const cotizacionRoute = require('./routes/cotizacionRoute');
app.use('/api', cotizacionRoute);
app.use("/api/asesoria", calculoRoute);
app.use("/api/productos", productosRoute);

app.get('/', (req, res) => {
  res.send('API de AquaEquipos funcionando 🛠️');
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

