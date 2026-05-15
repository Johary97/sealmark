# Sealmark

> Signez vos PDF. Prouvez leur intégrité.

Sealmark est une application web qui vous permet de signer un document PDF, de le sceller avec une empreinte cryptographique infalsifiable, et de vérifier à tout moment que ce document n'a pas été modifié depuis sa signature. Le traitement se fait intégralement dans votre navigateur : aucun fichier n'est téléversé sur un serveur.

## Pourquoi Sealmark

- **Confidentialité totale** — Vos documents ne quittent jamais votre appareil. Aucun envoi, aucun stockage distant, aucun compte à créer.
- **Signature manuscrite** — Tracez votre signature à la souris, au stylet ou au doigt, choisissez sa couleur, son épaisseur, sa taille, et placez-la exactement où vous le souhaitez sur la page.
- **Empreinte cryptographique** — Chaque document scellé reçoit une empreinte SHA-256 unique. Si une seule virgule est modifiée par la suite, l'empreinte change : la falsification est détectée immédiatement.
- **Coffre-fort de texte** — Chiffrez n'importe quel message sensible avec un mot de passe que vous seul connaissez (AES-256, PBKDF2).
- **Hors ligne** — Une fois la page chargée, Sealmark fonctionne sans connexion.

## Démarrage rapide

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production (dossier dist/)
npm run preview  # prévisualiser le build de production
```

L'application est ensuite accessible sur `http://localhost:5173`.

## Trois usages

### Signer un document
1. Glissez-déposez votre PDF dans la zone prévue.
2. Cliquez sur l'emplacement souhaité sur la page d'aperçu.
3. Tracez votre signature dans le pavé dédié.
4. Téléchargez le document signé et conservez son empreinte.

### Vérifier l'intégrité
1. Chargez le document à vérifier.
2. Collez l'empreinte de référence.
3. Sealmark confirme — ou non — que le document est intact, à l'octet près.

### Chiffrer un message
1. Saisissez votre texte et un mot de passe.
2. Récupérez la chaîne chiffrée, transmissible en toute confiance.
3. Le destinataire la déchiffre avec le même mot de passe.

## Sécurité

| Mécanisme | Détail |
|---|---|
| Empreinte de document | SHA-256, calculée sur l'intégralité du PDF scellé |
| Chiffrement de texte | AES-256-CBC, IV aléatoire par message |
| Dérivation de clé | PBKDF2, 100 000 itérations, SHA-256, salt aléatoire 128 bits |
| Transport | Aucun — tout reste dans le navigateur |

## Personnalisation

- Bascule **mode clair / mode sombre** disponible dans l'en-tête, persistée localement.
- Le pavé de signature est entièrement redimensionnable (8 poignées).

## Compatibilité

Navigateurs modernes (Chrome, Firefox, Safari, Edge) à jour. Fonctionne sur mobile et tablette.
