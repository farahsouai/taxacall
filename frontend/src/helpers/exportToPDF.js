import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportFacturesToPDF = (factures) => {
  const doc = new jsPDF();
  doc.text("Liste des Factures", 14, 16);

  const tableColumn = ["Nom", "Prénom", "Poste", "Mois", "Année", "Montant", "Format", "Date"];
  const tableRows = factures.map(f => [
    f.nom,
    f.prenom,
    f.numeroPoste,
    f.mois,
    f.annee,
    `${f.montant_total} DT`,
    f.format.toUpperCase(),
    new Date(f.date_generation).toLocaleString()
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 22
  });

  doc.save("factures.pdf");
};
