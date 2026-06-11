#!/usr/bin/env node
/**
 * Prospection SmartFeedback AI — liste les restaurants d'une zone via l'API
 * Google Places (New) et les classe par potentiel commercial.
 *
 * L'API Places n'expose pas les réponses du propriétaire aux avis ; le score
 * repose donc sur les signaux disponibles (volume d'avis + note moyenne) et
 * le CSV fournit le lien direct vers la fiche pour vérifier en 10 secondes
 * si les avis sont laissés sans réponse.
 *
 * Usage :
 *   set GOOGLE_MAPS_API_KEY=...        (ou $env:GOOGLE_MAPS_API_KEY = "...")
 *   node tools/prospection.js "restaurants Villeray Montréal"
 *   node tools/prospection.js "restaurants Plateau Mont-Royal" --min-avis 30 --out prospects.csv
 *
 * Prérequis : activer "Places API (New)" dans le projet Google Cloud
 * (console.cloud.google.com → APIs & Services). Node 18+.
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.websiteUri',
  'places.nationalPhoneNumber',
  'nextPageToken'
].join(',');

function parseArgs(argv) {
  const args = { query: null, minAvis: 20, out: 'prospects.csv', maxPages: 3 };
  const rest = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--min-avis') args.minAvis = parseInt(argv[++i], 10);
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--pages') args.maxPages = parseInt(argv[++i], 10);
    else rest.push(a);
  }
  args.query = rest.join(' ').trim();
  return args;
}

async function searchPage(apiKey, query, pageToken) {
  const body = pageToken
    ? { textQuery: query, pageToken }
    : { textQuery: query, languageCode: 'fr', maxResultCount: 20 };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Places API ${res.status} — ${text}`);
  }
  return res.json();
}

/**
 * Score de potentiel : on cherche des établissements établis (assez d'avis
 * pour que la gestion devienne une corvée) dont la note laisse de la marge
 * d'amélioration — la douleur est réelle et visible.
 */
function score(place) {
  const n = place.userRatingCount || 0;
  const r = place.rating || 0;
  if (n < 10) return 0;
  let s = 0;
  if (n >= 200) s += 3; else if (n >= 75) s += 2; else if (n >= 30) s += 1;
  if (r >= 3.2 && r <= 4.3) s += 3;       // note améliorable = argument de vente
  else if (r > 4.3 && r <= 4.6) s += 1;   // bon resto, veut protéger sa note
  return s;
}

function priorite(s) {
  if (s >= 5) return 'HAUTE';
  if (s >= 3) return 'moyenne';
  return 'basse';
}

function csvCell(v) {
  const s = String(v == null ? '' : v);
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
  return '"' + safe.replace(/"/g, '""') + '"';
}

async function main() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const { query, minAvis, out, maxPages } = parseArgs(process.argv);

  if (!apiKey) {
    console.error('Clé manquante. Définir GOOGLE_MAPS_API_KEY puis relancer.');
    console.error('PowerShell :  $env:GOOGLE_MAPS_API_KEY = "votre-clé"');
    process.exit(1);
  }
  if (!query) {
    console.error('Usage : node tools/prospection.js "restaurants <quartier> <ville>" [--min-avis 20] [--out prospects.csv]');
    process.exit(1);
  }

  console.log(`Recherche : « ${query} » …`);
  const places = [];
  let pageToken = null;
  for (let page = 0; page < maxPages; page++) {
    const data = await searchPage(apiKey, query, pageToken);
    places.push(...(data.places || []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
    // le token de page suivante met ~2 s à devenir valide
    await new Promise(r => setTimeout(r, 2000));
  }

  const prospects = places
    .filter(p => (p.userRatingCount || 0) >= minAvis)
    .map(p => ({
      nom: p.displayName && p.displayName.text || '',
      note: p.rating || '',
      avis: p.userRatingCount || 0,
      score: score(p),
      adresse: p.formattedAddress || '',
      telephone: p.nationalPhoneNumber || '',
      site: p.websiteUri || '',
      fiche: p.googleMapsUri || ''
    }))
    .sort((a, b) => b.score - a.score || b.avis - a.avis);

  if (!prospects.length) {
    console.log(`Aucun établissement avec au moins ${minAvis} avis. Essayer --min-avis plus bas ou une zone plus large.`);
    return;
  }

  const header = ['Priorité', 'Nom', 'Note', 'Nb avis', 'Téléphone', 'Adresse', 'Site web', 'Fiche Google (vérifier les avis sans réponse)', 'Contacté le', 'Canal', 'Réponse'];
  const rows = prospects.map(p => [
    priorite(p.score), p.nom, p.note, p.avis, p.telephone, p.adresse, p.site, p.fiche, '', '', ''
  ].map(csvCell).join(','));
  const outPath = path.resolve(out);
  fs.writeFileSync(outPath, '﻿' + header.map(csvCell).join(',') + '\r\n' + rows.join('\r\n'), 'utf8');

  console.log(`\n${prospects.length} prospects (${prospects.filter(p => priorite(p.score) === 'HAUTE').length} priorité HAUTE) → ${outPath}\n`);
  for (const p of prospects.slice(0, 15)) {
    console.log(`  [${priorite(p.score).padEnd(7)}] ${p.nom} — ${p.note}★ (${p.avis} avis)`);
  }
  console.log('\nÉtape suivante : ouvrir chaque fiche Google, repérer 1 avis négatif sans réponse,');
  console.log('et utiliser marketing/messages-prospection.md (modèle A) avec cet avis en exemple.');
}

main().catch(err => {
  console.error('Erreur :', err.message);
  process.exit(1);
});
