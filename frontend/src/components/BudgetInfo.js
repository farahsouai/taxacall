import React, { useEffect, useState } from "react";
import './BudgetInfo.css';

const BudgetInfo = () => {
  const [numeroPoste, setNumeroPoste] = useState("");
  const [budget, setBudget] = useState("");
  const [consommation, setConsommation] = useState("");
  const [solde, setSolde] = useState("");
  const [listePostes, setListePostes] = useState([]);
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const poste = localStorage.getItem('numeroPoste');
    if (role === "ADMIN") {
      fetch('http://localhost:3005/api/budget/postes')
        .then(res => res.json())
        .then(data => setListePostes(data));
    } else {
      setNumeroPoste(poste);
      setListePostes([poste]);
    }
  }, [role]);

  const handleFetchData = () => {
    if (!numeroPoste) return;

    Promise.all([
      fetch(`http://localhost:3005/api/budget/info/${numeroPoste}`).then(res => {
        if (!res.ok) throw new Error("Budget non trouvé");
        return res.json();
      }),
      fetch(`http://localhost:3005/api/appel/consommation/${numeroPoste}`).then(res => {
        if (!res.ok) throw new Error("Consommation non trouvée");
        return res.json();
      })
    ])
    .then(([budgetData, consoData]) => {
      setBudget(parseFloat(budgetData.budget || 0).toFixed(2));
      setConsommation(parseFloat(consoData.consommation || 0).toFixed(2));
      const soldeCalculé = parseFloat(budgetData.budget || 0) - parseFloat(consoData.consommation || 0);
      setSolde(soldeCalculé.toFixed(2));
    })
    .catch((err) => {
      console.error("❌ Erreur chargement budget ou consommation", err);
      alert("Erreur lors de la récupération des données");
      setBudget("");
      setConsommation("");
      setSolde("");
    });
  };

  return (
    <div style={{
      display: "flex",
      gap: "20px", /* réduit l'espacement */
      alignItems: "flex-end",
    /* aligné à gauche */
      marginTop: "30px",
      flexWrap: "wrap",
      paddingLeft: "20px" /* léger décalage gauche si souhaité */
    }}>
    
      <div style={boxStyle}>
        <label style={labelStyle}>🔢 Numéro de poste</label>
        <select
          value={numeroPoste}
          onChange={(e) => setNumeroPoste(e.target.value)}
          style={inputStyle}
          disabled={role !== "ADMIN"}
        >
          <option value="">--  --</option>
          {listePostes.map((poste) => (
            <option key={poste} value={poste}>{poste}</option>
          ))}
        </select>
      </div>

      <div style={boxStyle}>
        <label style={{ visibility: 'hidden' }}>Bouton</label>
        <button onClick={handleFetchData} style={buttonStyle}>🔍 Charger</button>
      </div>

      <div style={boxStyle}>
        <label style={labelStyle}>💰 Budget</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={boxStyle}>
        <label style={labelStyle}>📞 Consommation</label>
        <input
          type="number"
          value={consommation}
          onChange={(e) => setConsommation(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={boxStyle}>
        <label style={labelStyle}>🧾 Solde</label>
        <input
          type="number"
          value={solde}
          disabled
          style={{
            ...inputStyle,
            backgroundColor: "#e8f5e9",
            fontWeight: "bold",
            color: parseFloat(solde) < 0 ? "#c62828" : "#2e7d32",
          }}
        />
        {parseFloat(solde) < 0 && (
          <div style={{
            color: "#c62828",
            fontWeight: "bold",
            marginTop: "10px",
            fontSize: "14px"
          }}>
            ⚠️ Attention : budget dépassé !
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "8px 12px",
  fontSize: "14px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "140px",
};

const buttonStyle = {
  padding: "10px 16px",
  backgroundColor: "#0073A8",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const boxStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontWeight: "bold",
  marginBottom: "6px",
  fontSize: "13px",
  color: "#333"
};

export default BudgetInfo;
