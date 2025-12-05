// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  const btnCalculate = document.querySelector('.btn-calculate');
  if (btnCalculate) {
    btnCalculate.addEventListener('click', calculerROI);
  }
});

// Fonction principale de calcul ROI
function calculerROI() {
  console.log('Fonction calculerROI appelée');

  // 1. Récupération des valeurs
  const trafic = parseFloat(document.getElementById('trafic').value) || 0;
  const ventes = parseFloat(document.getElementById('ventes').value) || 0;
  const panier = parseFloat(document.getElementById('panier').value) || 0;
  const investissement = parseFloat(document.getElementById('investissement').value) || 0;
  const coutsMensuels = parseFloat(document.getElementById('couts_mensuels').value) || 0;

  if (trafic <= 0 || ventes <= 0 || panier <= 0) {
    alert('Veuillez renseigner tous les champs avec des valeurs positives.');
    return;
  }

  // === 2. LOGIQUE DE CALCUL ===
  
  // Situation AVANT
  const tauxConversion = ventes / trafic;
  const caAvant = ventes * panier;

  // Situation APRÈS (+33% trafic, +29.5% panier)
  const traficApres = trafic * 1.33; 
  const ventesApres = traficApres * tauxConversion;
  const panierApres = panier * 1.295; 
  const caApres = ventesApres * panierApres;
  
  // Gains et Trésorerie
  const gainMensuel = caApres - caAvant;
  const gainAnnuelCA = gainMensuel * 12; // CORRECTION DU NOM DE VARIABLE
  const coutInaction = gainMensuel * 6;
  
  // Trésorerie Nette (Gain - Coûts récurrents)
  const tresorerieNetteMensuelle = gainMensuel - coutsMensuels;
  
  // Bénéfice Net Année 1 (pour le ROI)
  const coutsAnnuels = coutsMensuels * 12;
  const beneficeNetAn1 = gainAnnuelCA - coutsAnnuels - investissement;

  // Calcul du ROI Année 1 (%)
  let roiAn1 = 0;
  if (investissement > 0) {
    roiAn1 = (beneficeNetAn1 / investissement) * 100;
  }

  // Calcul du Point Mort (Amortissement)
  // On réintègre ce calcul car le script l'utilise plus bas
  let pointMort = 0;
  if (tresorerieNetteMensuelle > 0) {
    pointMort = investissement / tresorerieNetteMensuelle;
  }

  // Calculs ROI sur 3 ans (nécessaires si vous avez gardé les champs cachés)
  const calculROI = (mois) => {
    const gainNetCumule = (tresorerieNetteMensuelle * mois) - investissement;
    return (gainNetCumule / investissement) * 100;
  };
  const roi12 = calculROI(12); // = roiAn1
  const roi24 = calculROI(24);
  const roi36 = calculROI(36);


  // === 3. AFFICHAGE DES RÉSULTATS ===
  
  // -- A. Les 4 Cartes Financières (Nouvelle version Sales) --
  
  // Carte 1 : Investissement
  const elInvest = document.getElementById('res_invest');
  if(elInvest) elInvest.textContent = formatEuro(investissement);
  
  // Carte 2 : CA Annuel
  const elCa1An = document.getElementById('res_ca_1an');
  if(elCa1An) elCa1An.textContent = formatEuro(gainAnnuelCA);
  
  // Carte 3 : Bénéfice Net
  const elBenefice = document.getElementById('res_benefice');
  if (elBenefice) {
    const signe = beneficeNetAn1 > 0 ? '+' : '';
    elBenefice.textContent = signe + formatEuro(beneficeNetAn1);
    elBenefice.style.color = beneficeNetAn1 >= 0 ? '#DE0B19' : '#1A1A1A'; 
  }
  
  // Carte 4 : ROI
  const elROI = document.getElementById('res_roi');
  if (elROI) {
    elROI.textContent = formatPourcent(roiAn1);
    elROI.style.color = roiAn1 >= 0 ? '#DE0B19' : '#1A1A1A';
  }

  // -- B. Le Tableau Comparatif (Avant / Après) --
  document.getElementById('trafic_avant').textContent = formatNumber(trafic) + ' visit.';
  document.getElementById('ventes_avant').textContent = formatNumber(ventes) + ' ventes';
  document.getElementById('panier_avant').textContent = formatEuro(panier);
  document.getElementById('ca_avant').textContent = formatEuro(caAvant);

  document.getElementById('trafic_apres').textContent = formatNumber(Math.round(traficApres)) + ' visit.';
  document.getElementById('ventes_apres').textContent = formatNumber(Math.round(ventesApres)) + ' ventes';
  document.getElementById('panier_apres').textContent = formatEuro(panierApres);
  document.getElementById('ca_apres').textContent = formatEuro(caApres);

  // -- C. Les Bannières et Alertes --
  document.getElementById('gain_mensuel').textContent = formatEuro(gainMensuel);
  
  const elGainAnnuel = document.getElementById('gain_annuel');
  if (elGainAnnuel) elGainAnnuel.textContent = formatEuro(gainAnnuelCA);
    
  const elCoutInaction = document.getElementById('cout_inaction');
  if (elCoutInaction) elCoutInaction.textContent = formatEuro(coutInaction);

  // -- D. Gestion de la Trésorerie Nette (si présente) --
  const elTreso = document.getElementById('tresorerie_nette');
  if (elTreso) {
      const signe = tresorerieNetteMensuelle > 0 ? '+' : '';
      elTreso.textContent = signe + formatEuro(tresorerieNetteMensuelle) + ' /mois';
      elTreso.style.color = tresorerieNetteMensuelle >= 0 ? '#00BDA5' : '#DE0B19'; // Vert ou Rouge
  }

  // -- E. Anciens champs (Point mort, ROI 24/36) --
  // On met des sécurités (if) au cas où vous les auriez supprimés du HTML
  const elPointMort = document.getElementById('point_mort');
  if(elPointMort) elPointMort.textContent = pointMort > 0 ? Math.ceil(pointMort) + ' mois' : 'Immédiat';
  
  const elRoi12 = document.getElementById('roi_12');
  if(elRoi12) elRoi12.textContent = formatPourcent(roi12);

  const elRoi24 = document.getElementById('roi_24');
  if(elRoi24) elRoi24.textContent = formatPourcent(roi24);

  const elRoi36 = document.getElementById('roi_36');
  if(elRoi36) elRoi36.textContent = formatPourcent(roi36);


  // === 4. AFFICHAGE FINAL & TRACKING ===
  
  const resultsSection = document.getElementById('results');
  resultsSection.style.display = 'block';
  
  setTimeout(function() {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);

  // Tracking HubSpot
  if (typeof window._hsq !== 'undefined') {
    window._hsq.push(['trackCustomBehavioralEvent', {
      name: 'calculateur_roi_utilise',
      properties: {
        trafic: trafic,
        gain_mensuel: gainMensuel,
        roi_12mois: roiAn1
      }
    }]);
  }

  // Transfert Formulaire
  const donneesATransferer = {
    'trafic_visiteurs_mensuel': trafic,
    'gain_mensuel_estime': Math.round(gainMensuel),
    'roi_previsionnel_12_mois': Math.round(roiAn1),
    'budget_investissement_estime': investissement
  };

  for (const [nomInterne, valeur] of Object.entries(donneesATransferer)) {
    const champ = document.querySelector(`input[name="${nomInterne}"]`);
    if (champ) {
      champ.value = valeur;
      champ.dispatchEvent(new Event('input', { bubbles: true }));
      champ.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

// Fonctions utilitaires
function formatEuro(value) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value); }
function formatNumber(value) { return new Intl.NumberFormat('fr-FR').format(value); }
function formatPourcent(value) { return (value >= 0 ? '+' : '') + value.toFixed(0) + '%'; }
