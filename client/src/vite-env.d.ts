/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_LOG_MODE?: 'silent' | 'minimal' | 'normal' | 'verbose'
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 