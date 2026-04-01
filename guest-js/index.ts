import { invoke } from '@tauri-apps/api/core'

export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface KeyboardInfo {
  keyboardHeight: number
  isVisible: boolean
}

export interface SafeAreaChangedDetail extends SafeAreaInsets {
  keyboardHeight: number
  keyboardVisible: boolean
}

const pluginCommand = <T>(command: string): Promise<T> =>
  invoke<T>(`plugin:edge-to-edge|${command}`)

export async function getSafeAreaInsets(): Promise<SafeAreaInsets> {
  return await pluginCommand<SafeAreaInsets>('get_safe_area_insets')
}

export async function getKeyboardInfo(): Promise<KeyboardInfo> {
  return await pluginCommand<KeyboardInfo>('get_keyboard_info')
}

export async function enable(): Promise<void> {
  await pluginCommand('enable')
}

export async function disable(): Promise<void> {
  await pluginCommand('disable')
}

export async function showKeyboard(): Promise<void> {
  await pluginCommand('show_keyboard')
}

export async function hideKeyboard(): Promise<void> {
  await pluginCommand('hide_keyboard')
}

export function onSafeAreaChanged(
  listener: (detail: SafeAreaChangedDetail) => void
): () => void {
  const handler: EventListener = (event) => {
    if (!(event instanceof CustomEvent)) return
    listener(event.detail as SafeAreaChangedDetail)
  }

  window.addEventListener('safeAreaChanged', handler)

  return () => {
    window.removeEventListener('safeAreaChanged', handler)
  }
}
