const { generatePDF } = require("../server/services/pdfService");

module.exports = async (req, res) => {
  try {
    const pdfBuffer = await generatePDF(req.body);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    res.send(pdfBuffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};