// routes/cotizacionRoute.js
const express = require('express');
const router = express.Router();
const { enviarCorreo } = require('../utils/mailer');

router.post('/notificar-cotizacion', async (req, res) => {
  try {
    const { emailCliente, detallesCotizacion } = req.body;

    const mensaje = `
      El cliente ${emailCliente || 'desconocido'} ha solicitado una cotización.
      Detalles: ${detallesCotizacion}
      Fecha: ${new Date().toLocaleString()}
    `;

    await enviarCorreo({
      asunto: 'Nueva solicitud de cotización',
      mensaje,
      destinatario: process.env.NOTIFICACION_DESTINATARIO,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando correo:', error);
    res.status(500).json({ error: 'Error enviando correo' });
  }
});

module.exports = router;
