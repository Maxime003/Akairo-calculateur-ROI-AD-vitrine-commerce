// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  // Attacher l'événement au bouton
  const btnCalculate = document.querySelector('.btn-calculate');
  if (btnCalculate) {
    btnCalculate.addEventListener('click', calculerROI);
  }
});

// Fonction principale de calcul ROI
function calculerROI() {
  console.log('Fonction calculerROI appelée'); // Pour debug
  
  const trafic = parseFloat(document.getElementById('trafic').value) || 0;
  const ventes = parseFloat(document.getElementById('ventes').value) || 0;
  const panier = parseFloat(document.getElementById('panier').value) || 0;
  const investissement = parseFloat(document.getElementById('investissement').value) || 0;
  const coutsMensuels = parseFloat(document.getElementById('couts_mensuels').value) || 0;

  console.log('Valeurs:', {trafic, ventes, panier, investissement, coutsMensuels}); // Debug

  if (trafic <= 0 || ventes <= 0 || panier <= 0) {
    alert('Veuillez renseigner tous les champs avec des valeurs positives.');
    return;
  }

  // === LOGIQUE EXCEL AKAIRO ===
  
  // Situation AVANT
  const tauxConversion = ventes / trafic;
  const caAvant = ventes * panier;

  // Situation APRÈS avec écran
  const traficApres = trafic * 1.33; // +33%
  const ventesApres = traficApres * tauxConversion;
  const panierApres = panier * 1.295; // +29,5%
  const caApres = ventesApres * panierApres;
  
  const gainMensuel = caApres - caAvant;
  const gainAnnuel = gainMensuel * 12;
  const gainPourcent = ((caApres - caAvant) / caAvant) * 100;
  const beneficeMensuelNet = gainMensuel - coutsMensuels;

  // ROI et amortissement
  let pointMort = 0;
  if (beneficeMensuelNet > 0) {
    pointMort = investissement / beneficeMensuelNet;
  }

  const benefice12mois = (beneficeMensuelNet * 12) - investissement;
  const roi12 = (benefice12mois / investissement) * 100;

  const benefice24mois = (beneficeMensuelNet * 24) - investissement;
  const roi24 = (benefice24mois / investissement) * 100;

  const benefice36mois = (beneficeMensuelNet * 36) - investissement;
  const roi36 = (benefice36mois / investissement) * 100;

  const beneficeAn1 = (gainMensuel * 12) - (coutsMensuels * 12) - investissement;

  console.log('Résultats calculés:', {gainMensuel, roi12, pointMort}); // Debug

  // Affichage des résultats
  document.getElementById('trafic_avant').textContent = formatNumber(trafic) + ' visiteurs';
  document.getElementById('ventes_avant').textContent = formatNumber(ventes) + ' ventes';
  document.getElementById('panier_avant').textContent = formatEuro(panier);
  document.getElementById('ca_avant').textContent = formatEuro(caAvant);

  document.getElementById('trafic_apres').textContent = formatNumber(Math.round(traficApres)) + ' visiteurs';
  document.getElementById('ventes_apres').textContent = formatNumber(Math.round(ventesApres)) + ' ventes';
  document.getElementById('panier_apres').textContent = formatEuro(panierApres);
  document.getElementById('ca_apres').textContent = formatEuro(caApres);

  document.getElementById('gain_mensuel').textContent = formatEuro(gainMensuel);
  const elGainAnnuel = document.getElementById('gain_annuel');
    if (elGainAnnuel) {
      elGainAnnuel.textContent = formatEuro(gainAnnuel);
    }
  document.getElementById('point_mort').textContent = pointMort > 0 ? 
    Math.ceil(pointMort) + ' mois' : 'Immédiat';
  
  document.getElementById('roi_12').textContent = formatPourcent(roi12);
  document.getElementById('roi_24').textContent = formatPourcent(roi24);
  document.getElementById('roi_36').textContent = formatPourcent(roi36);
  document.getElementById('benefice_an1').textContent = formatEuro(beneficeAn1);

  const resultsSection = document.getElementById('results');
  resultsSection.style.display = 'block';
  
  // Scroll vers les résultats
  setTimeout(function() {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);

  // Tracking HubSpot (Analytics)
  if (typeof window._hsq !== 'undefined') {
    window._hsq.push(['trackCustomBehavioralEvent', {
      name: 'calculateur_roi_utilise',
      properties: {
        trafic: trafic,
        gain_mensuel: gainMensuel,
        roi_12mois: roi12
      }
    }]);
  }

  // === TRANSFERT VERS LE FORMULAIRE DE CONTACT HUBSPOT ===
  // Cette partie remplit les champs cachés créés dans HubSpot
  
  const donneesATransferer = {
    'trafic_visiteurs_mensuel': trafic,
    'gain_mensuel_estime': Math.round(gainMensuel),
    'roi_previsionnel_12_mois': Math.round(roi12),
    'budget_investissement_estime': investissement
  };

  console.log('Tentative de transfert vers le formulaire:', donneesATransferer);

  for (const [nomInterne, valeur] of Object.entries(donneesATransferer)) {
    // Cherche l'input hidden correspondant
    const champ = document.querySelector(`input[name="${nomInterne}"]`);
    
    if (champ) {
      champ.value = valeur;
      // Déclenche les événements pour que HubSpot détecte le changement
      champ.dispatchEvent(new Event('input', { bubbles: true }));
      champ.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

// Fonctions utilitaires de formatage
function formatEuro(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(value);
}

function formatPourcent(value) {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(0) + '%';
}
