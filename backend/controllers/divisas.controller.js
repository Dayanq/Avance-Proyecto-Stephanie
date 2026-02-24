// controllers/divisas.controller.js
const https = require('https');

exports.obtenerConversion = (req, res) => {
    const apiKey = process.env.EXCHANGE_API_KEY;

    // Verificamos que la API Key esté configurada en el .env
    if (!apiKey) {
        return res.status(500).json({ mensaje: 'API Key de divisas no configurada en el servidor' });
    }

    // URL de la API externa — tomamos MXN como moneda base
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/MXN`;

    console.log(`[Divisas] Consultando tasas de cambio en API externa...`);

    // Node.js hace la petición HTTPS a la API externa
    https.get(url, (respuestaApi) => {
        let datos = '';

        // Recibe los datos en fragmentos
        respuestaApi.on('data', (fragmento) => {
            datos += fragmento;
        });

        // Cuando termina de recibir todo el cuerpo de la respuesta
        respuestaApi.on('end', () => {
            try {
                const json = JSON.parse(datos);

                // Verificamos que la API respondió con éxito
                if (json.result !== 'success') {
                    console.error('[Divisas] ❌ La API externa respondió con error:', json['error-type']);
                    return res.status(502).json({
                        mensaje: 'Error al obtener datos de la API externa',
                        detalle: json['error-type'] || 'Respuesta inesperada'
                    });
                }

                // Solo enviamos las monedas relevantes para el Job Board
                const tasas = {
                    MXN: 1,
                    USD: json.conversion_rates.USD,
                    EUR: json.conversion_rates.EUR,
                    CAD: json.conversion_rates.CAD
                };

                console.log(`[Divisas] ✅ Tasas obtenidas correctamente. USD: ${tasas.USD}, EUR: ${tasas.EUR}`);

                res.json({
                    base: 'MXN',
                    tasas,
                    actualizadoEl: json.time_last_update_utc
                });

            } catch (error) {
                console.error('[Divisas] ❌ Error al parsear respuesta:', error.message);
                res.status(500).json({ mensaje: 'Error al procesar la respuesta de la API externa' });
            }
        });

    // Error de red — la API externa no respondió
    }).on('error', (error) => {
        console.error('[Divisas] ❌ Error de conexión con API externa:', error.message);
        res.status(503).json({
            mensaje: 'No se pudo conectar con el servicio de divisas. Intenta más tarde.'
        });
    });
};