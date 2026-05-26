# Sealmark

Application web de signature de PDF et de vérification d'intégrité par empreinte SHA-256. Traitement client : les fichiers ne sont pas envoyés sur un serveur.

## Fonctionnalités

- Apposition d'une signature manuscrite (souris, stylet, tactile) sur la dernière page d'un PDF.
- Calcul de l'empreinte SHA-256 du document signé.
- Vérification d'intégrité par comparaison d'empreinte.
- Chiffrement de texte par mot de passe (AES-256-CBC, clé dérivée par PBKDF2).
- Fonctionne hors ligne une fois chargée.

## Installation

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production (dist/)
npm run preview  # prévisualisation du build
```

Accessible par défaut sur `http://localhost:5173`.

## Usages

### Signer un document
1. Déposez un PDF dans la zone de chargement.
2. Cliquez sur la dernière page à l'emplacement souhaité.
3. Tracez la signature dans le pavé.
4. Téléchargez le PDF signé et conservez l'empreinte affichée.

### Vérifier l'intégrité
1. Chargez le document.
2. Renseignez l'empreinte de référence.
3. Sealmark recalcule l'empreinte et compare.

### Chiffrer un message
1. Saisissez le texte et un mot de passe.
2. La chaîne chiffrée (base64) inclut le sel et l'IV.
3. Le destinataire la déchiffre avec le même mot de passe.

## Paramètres cryptographiques

| Mécanisme | Détail |
|---|---|
| Empreinte de document | SHA-256 sur l'intégralité du PDF signé |
| Chiffrement de texte | AES-256-CBC, IV aléatoire 128 bits par message |
| Dérivation de clé | PBKDF2, 100 000 itérations, SHA-256, sel aléatoire 128 bits |
| Transport | Aucun, traitement local |

## Interface

- Trois thèmes disponibles (Notary Office, Crypto Vault, Hand Signed) avec bascule clair / sombre, persistés en `localStorage`.
- Pavé de signature redimensionnable (8 poignées).

## Compatibilité

Navigateurs récents (Chrome, Firefox, Safari, Edge). Support tactile.
