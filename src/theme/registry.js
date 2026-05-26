import notaryOffice from '@themes/notary-office/manifest.js'
import cryptoVault from '@themes/crypto-vault/manifest.js'
import handSigned from '@themes/hand-signed/manifest.js'

import NotaryOfficeLayout from '@themes/notary-office/Layout.vue'
import CryptoVaultLayout from '@themes/crypto-vault/Layout.vue'
import HandSignedLayout from '@themes/hand-signed/Layout.vue'

export const THEME_REGISTRY = {
  'notary-office': { manifest: notaryOffice, Layout: NotaryOfficeLayout },
  'crypto-vault': { manifest: cryptoVault, Layout: CryptoVaultLayout },
  'hand-signed': { manifest: handSigned, Layout: HandSignedLayout }
}

export const THEME_LIST = Object.values(THEME_REGISTRY).map((t) => t.manifest)

export const DEFAULT_THEME_SLUG = 'notary-office'

export function getTheme(slug) {
  return THEME_REGISTRY[slug] || THEME_REGISTRY[DEFAULT_THEME_SLUG]
}
