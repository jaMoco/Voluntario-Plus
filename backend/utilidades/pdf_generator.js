const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generarCertificado = (nombreVoluntario, horas, proyecto, organizacion) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const filename = `certificado_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../certificados', filename);
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        doc.fontSize(20).text('Voluntario+', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Certificado de Servicio Comunitario', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Otorgado a: ${nombreVoluntario}`);
        doc.text(`Por haber completado ${horas} horas en el proyecto: ${proyecto}`);
        doc.text(`Organización: ${organizacion}`);
        doc.end();

        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

module.exports = { generarCertificado };