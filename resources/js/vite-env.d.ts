/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly PUSHER_APP_KEY: string
    readonly PUSHER_APP_SECRET: string
    readonly PUSHER_HOST: string
    readonly PUSHER_SCHEME: string
    readonly PUSHER_APP_CLUSTER: string
    readonly PUSHER_PORT: string

}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
