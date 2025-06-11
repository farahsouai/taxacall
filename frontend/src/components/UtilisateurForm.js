import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GestionUtilisateurs.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UtilisateurForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    numeroPoste: "",
    motDePasse: "",
    role: "UTILISATEUR",
  });

  const [numerosDisponibles, setNumerosDisponibles] = useState([]);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3005/utilisateurs/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setForm({ ...data, motDePasse: "" });
        });
    }

    fetch("http://localhost:3005/utilisateurs/numeros-poulina")
      .then((res) => res.json())
      .then((data) => {
        setNumerosDisponibles(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Erreur chargement numéros :", err));
  }, [id]);

  useEffect(() => {
    if (!id && form.numeroPoste) {
      fetch(`http://localhost:3005/utilisateurs-poulina/${form.numeroPoste}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📦 Données récupérées pour poste :", form.numeroPoste, data);
          if (data && typeof data.nom === "string" && typeof data.prenom === "string") {
            const nomPropre = data.nom === form.numeroPoste ? "" : data.nom;
            const prenomPropre = data.prenom === form.numeroPoste ? "" : data.prenom;

            setForm((prev) => ({
              ...prev,
              nom: nomPropre,
              prenom: prenomPropre,
            }));
          } else {
            setForm((prev) => ({ ...prev, nom: "", prenom: "" }));
          }
        })
        .catch((err) => {
          console.log("❌ Erreur ou utilisateur Poulina inexistant :", err);
          setForm((prev) => ({ ...prev, nom: "", prenom: "" }));
        });
    }
  }, [form.numeroPoste, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = id ? "PUT" : "POST";
    const url = id
      ? `http://localhost:3005/utilisateurs/${id}`
      : "http://localhost:3005/utilisateurs";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(() => {
        alert(id ? "✅ Utilisateur modifié avec succès !" : "✅ Utilisateur ajouté avec succès !");
        navigate("/home?vue=utilisateurs");
      })
      .catch((err) => console.error("Erreur enregistrement :", err));
  };

  const handleRetour = () => {
    navigate("/home?vue=utilisateurs");
  };

  return (
    <div className="gestion-container">
      <div className="retour" onClick={handleRetour}>
        ← Retour à la gestion des utilisateurs
      </div>

      <h2>{id ? "✏️ Modifier Utilisateur" : "➕ Ajouter Utilisateur"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="nom"
          value={form.nom}
          onChange={handleChange}
          placeholder="Nom"
          required
        />
        <input
          name="prenom"
          value={form.prenom}
          onChange={handleChange}
          placeholder="Prénom"
          required
        />

        {!id ? (
          <select
            name="numeroPoste"
            value={form.numeroPoste}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionner un numéro de poste --</option>
            {Array.isArray(numerosDisponibles) &&
              numerosDisponibles.map((num, index) => (
                <option key={index} value={num}>
                  {num}
                </option>
              ))}
          </select>
        ) : (
          <input
            name="numeroPoste"
            value={form.numeroPoste}
            readOnly
            className="readonly-input"
            placeholder="Numéro de poste"
          />
        )}

        {!id && (
          <div style={{ position: 'relative' }}>
            <input
              type={motDePasseVisible ? 'text' : 'password'}
              name="motDePasse"
              value={form.motDePasse}
              onChange={handleChange}
              placeholder="Mot de passe"
              required
            />
            <span
              onClick={() => setMotDePasseVisible(!motDePasseVisible)}
              style={{
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                cursor: 'pointer'
              }}
            >
              {motDePasseVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        )}

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="UTILISATEUR">Utilisateur</option>
        </select>

        <button type="submit">{id ? "Modifier" : "Ajouter"}</button>
      </form>
    </div>
  );
};

export default UtilisateurForm;
