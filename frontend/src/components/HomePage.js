import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './HomePage.css';
import AppelList from "./AppelList";
import HistoriqueCout from "./HistoriqueCout";
import AppelsInterFiliales from "./AppelsInterFiliales";
import AppelsNationauxInternationaux from "./AppelsNationauxInternationaux";
import GestionUtilisateurs from "./GestionUtilisateurs";
import BudgetInfo from './BudgetInfo';
import {
  FiFolder, FiPhone, FiBarChart2, FiGitBranch, FiGlobe,
  FiUsers, FiXCircle, FiFileText, FiSearch, FiActivity
} from 'react-icons/fi';
import FactureList from './FactureList';
import GatewaySearch from './GatewaySearch';
import PrefixeSearch from './PrefixeSearch';
import UtilisateursParGroupe from "./UtilisateursParGroupe";
import RealtimeStats from "./RealtimeStats"; // ✅

const HomePage = () => {
  const [vueActive, setVueActive] = useState(null);
  const [openComm, setOpenComm] = useState(false);
  const [openRoutage, setOpenRoutage] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem('userRole');
  const numeroPoste = localStorage.getItem('numeroPoste');

  useEffect(() => {
    if (!role) {
      navigate('/auth');
    }
  }, [role, navigate]);

  const closeVue = () => setVueActive(null);

  return (
    <div className="home-container">
      <div className="home-header">
        <span className="home-title">📞 Poulina Groupe Holding</span>
        <button className="logout-button" onClick={() => {
          localStorage.clear();
          window.location.href = '/auth';
        }}>
          Se déconnecter
        </button>
      </div>

      {!vueActive && (
        <div className="nav-bar-fixed">
          <div className="nav-bar">
            <button onClick={() => setOpenComm(!openComm)}>
              <FiFolder style={{ marginRight: 6 }} /> Gestion des Communications {openComm ? '▲' : '▼'}
            </button>

            {openComm && (
              <div className="comm-dropdown">
                <button onClick={() => setVueActive("appels")}><FiPhone style={{ marginRight: 6 }} /> Appels</button>
                <button onClick={() => setVueActive("historique")}><FiBarChart2 style={{ marginRight: 6 }} /> Historique</button>
                {role === "ADMIN" && (
                  <>
                    <button onClick={() => setVueActive("inter-filiales")}><FiGitBranch style={{ marginRight: 6 }} /> Appels Inter-Filiales</button>
                    <button onClick={() => setVueActive("nationaux")}><FiGlobe style={{ marginRight: 6 }} /> Appels Nationaux/Internationaux</button>
                    <button onClick={() => setVueActive("stats-realtime")}><FiActivity style={{ marginRight: 6 }} /> Appels Temps Réel</button>
                    <button onClick={() => setVueActive("stats-realtime")}>
  <FiActivity style={{ marginRight: 6 }} /> Statistiques par poste
</button>

                  </>
                )}
              </div>
            )}

            {role === "ADMIN" && (
              <>
                <button onClick={() => setVueActive("utilisateurs")}><FiUsers style={{ marginRight: 6 }} /> Gérer les Utilisateurs</button>
                <button onClick={() => setVueActive("factures")}><FiFileText style={{ marginRight: 6 }} /> Facturation</button>

                <button onClick={() => setOpenRoutage(!openRoutage)}>
                  <FiSearch style={{ marginRight: 6 }} /> Paramètres de Routage {openRoutage ? '▲' : '▼'}
                </button>

                {openRoutage && (
                  <div className="comm-dropdown">
                    <button onClick={() => setVueActive("gateway")}><FiSearch style={{ marginRight: 6 }} /> Gateways</button>
                    <button onClick={() => setVueActive("prefixe")}><FiSearch style={{ marginRight: 6 }} /> Préfixes</button>
                  </div>
                )}

                <button onClick={() => setVueActive("utilisateurs-groupe")}>👤 Utilisateurs Poulina</button>
              </>
            )}
          </div>
        </div>
      )}

      {!vueActive && (
        <div className="budget-info">
          <BudgetInfo numeroPoste={numeroPoste} />
        </div>
      )}

      {vueActive && (
        <div className="vue-active">
          <button className="close-button" onClick={closeVue}>
            <FiXCircle style={{ marginRight: 6 }} /> Fermer
          </button>

          {vueActive === "appels" && <AppelList />}
          {vueActive === "historique" && <HistoriqueCout />}
          {vueActive === "inter-filiales" && role === "ADMIN" && <AppelsInterFiliales />}
          {vueActive === "nationaux" && role === "ADMIN" && <AppelsNationauxInternationaux />}
          {vueActive === "factures" && role === "ADMIN" && <FactureList />}
          {vueActive === "utilisateurs" && role === "ADMIN" && <GestionUtilisateurs />}
          {vueActive === "gateway" && role === "ADMIN" && <GatewaySearch />}
          {vueActive === "prefixe" && role === "ADMIN" && <PrefixeSearch />}
          {vueActive === "utilisateurs-groupe" && role === "ADMIN" && <UtilisateursParGroupe />}
          {vueActive === "stats-realtime" && role === "ADMIN" && <RealtimeStats />} {/* ✅ fix here */}
        </div>
      )}
    </div>
  );
};

export default HomePage;
