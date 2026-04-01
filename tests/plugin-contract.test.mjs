import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const repoRoot = 'C:\\Users\\haz\\dev\\tauri-plugin-edge-to-edge'

const readRepoFile = (relativePath) => readFileSync(join(repoRoot, relativePath), 'utf8')

test('android safe-area injection stays raw and does not bake in layout policy', () => {
  const androidPlugin = readRepoFile('android/src/main/java/EdgeToEdgePlugin.kt')

  assert.match(androidPlugin, /style\.setProperty\('--safe-area-inset-top'/)
  assert.match(androidPlugin, /style\.setProperty\('--keyboard-height'/)
  assert.doesNotMatch(androidPlugin, /maxOf\(bottomDp,\s*48f\)/)
  assert.doesNotMatch(androidPlugin, /'48px'/)
  assert.doesNotMatch(androidPlugin, /--safe-area-bottom-computed/)
  assert.doesNotMatch(androidPlugin, /--safe-area-bottom-min/)
  assert.doesNotMatch(androidPlugin, /--content-bottom-padding/)
})

test('android plugin mirrors Capacitor-style viewport and inset handling', () => {
  const androidPlugin = readRepoFile('android/src/main/java/EdgeToEdgePlugin.kt')

  assert.match(androidPlugin, /WEBVIEW_VERSION_WITH_SAFE_AREA_FIX\s*=\s*140/)
  assert.match(androidPlugin, /WEBVIEW_VERSION_WITH_SAFE_AREA_KEYBOARD_FIX\s*=\s*144/)
  assert.match(androidPlugin, /viewport-fit=cover/)
  assert.match(androidPlugin, /WebViewCompat\.addWebMessageListener/)
  assert.match(androidPlugin, /WebViewCompat\.addDocumentStartJavaScript/)
  assert.match(androidPlugin, /WindowInsetsCompat\.Builder\(windowInsets\)/)
  assert.match(androidPlugin, /Insets\.of\(0,\s*0,\s*0,\s*0\)/)
  assert.match(androidPlugin, /getBottomInset\(/)
  assert.match(androidPlugin, /hasViewportCover && getWebViewMajorVersion\(\) >= WEBVIEW_VERSION_WITH_SAFE_AREA_FIX/)
  assert.match(androidPlugin, /requireInsetHostView\(\)/)
})

test('ios safe-area injection stays raw and does not bake in layout policy', () => {
  const iosPlugin = readRepoFile('ios/Sources/EdgeToEdgePlugin.swift')

  assert.match(iosPlugin, /style\.setProperty\('--safe-area-inset-top'/)
  assert.match(iosPlugin, /style\.setProperty\('--keyboard-height'/)
  assert.doesNotMatch(iosPlugin, /max\(bottom,\s*34(?:\.0)?\)/)
  assert.doesNotMatch(iosPlugin, /safe-area-bottom-computed/)
  assert.doesNotMatch(iosPlugin, /safe-area-bottom-min/)
  assert.doesNotMatch(iosPlugin, /content-bottom-padding/)
  assert.doesNotMatch(iosPlugin, /keyboardVisible \{\s*computedBottom = 0/s)
})

test('ios plugin does not hardcode host window colors', () => {
  const iosPlugin = readRepoFile('ios/Sources/EdgeToEdgePlugin.swift')

  assert.doesNotMatch(iosPlugin, /window\.backgroundColor = UIColor\(red:/)
  assert.doesNotMatch(iosPlugin, /window\.rootViewController\?\.view\.backgroundColor = window\.backgroundColor/)
})

test('guest-js exports the plugin commands instead of the leftover ping stub', () => {
  const guestJs = readRepoFile('guest-js/index.ts')

  assert.match(guestJs, /export async function getSafeAreaInsets/)
  assert.match(guestJs, /export async function getKeyboardInfo/)
  assert.match(guestJs, /export async function enable/)
  assert.match(guestJs, /export async function disable/)
  assert.match(guestJs, /export async function showKeyboard/)
  assert.match(guestJs, /export async function hideKeyboard/)
  assert.match(guestJs, /export function onSafeAreaChanged/)
  assert.match(guestJs, /plugin:edge-to-edge\|\$\{command\}/)
  assert.match(guestJs, /'get_safe_area_insets'/)
  assert.match(guestJs, /'get_keyboard_info'/)
  assert.match(guestJs, /'show_keyboard'/)
  assert.match(guestJs, /safeAreaChanged/)
  assert.doesNotMatch(guestJs, /export async function ping/)
})

test('default plugin permissions match the real command surface', () => {
  const defaultPermissions = readRepoFile('permissions/default.toml')

  assert.match(defaultPermissions, /\$schema/)
  assert.match(defaultPermissions, /allow-get-safe-area-insets/)
  assert.match(defaultPermissions, /allow-get-keyboard-info/)
  assert.match(defaultPermissions, /allow-enable/)
  assert.match(defaultPermissions, /allow-disable/)
  assert.match(defaultPermissions, /allow-show-keyboard/)
  assert.match(defaultPermissions, /allow-hide-keyboard/)
  assert.doesNotMatch(defaultPermissions, /allow-ping/)
})
