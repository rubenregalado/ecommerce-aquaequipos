const express = require('express');
const multer = require('multer');
const upload = multer();
const path = require('path');

const mailerPath = path.resolve(__dirname, '../utils/mailer');
const { enviarCorreo } = require(mailerPath);
console.log('Tipo de enviarCorreo:', typeof enviarCorreo);

const router = express.Router();

router.post('/enviar-cotizacion', upload.single('pdf'), async (req, res) => {
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  
  try {
    const { nombre, correo } = req.body;
    const pdfBuffer = req.file.buffer;

    await enviarCorreo({
      asunto: 'Nueva cotización generada desde la web',
      mensaje: `Cotización generada por ${nombre} (${correo})`,
      destinatario: 'rregalado@aquaequipos.com',
      adjuntos: [
        {
          filename: 'cotizacion.pdf',
          content: pdfBuffer,
        },
      ],
    });

    res.json({ ok: true, mensaje: 'Correo enviado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'No se pudo enviar el correo' });
  }
});

module.exports = router;
