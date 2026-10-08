import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'

const DEFAULT_API_URL = ''
const CHECK_TIMEOUT_MS = 5000

interface ReadyPayload {
  status: string
  database?: {
    ok: boolean
    keyspace?: string
    tables?: number
    error?: string
  }
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json() as Promise<unknown>
}

/** Logs backend reachability once the dev server starts listening. */
function backendHealthPlugin(apiUrl: string): Plugin {
  const check = async (server: ViteDevServer): Promise<void> => {
    const startedAt = Date.now()
    try {
      await fetchJson(`${apiUrl}/health`, CHECK_TIMEOUT_MS)
      const ready = (await fetchJson(
        `${apiUrl}/ready`,
        CHECK_TIMEOUT_MS,
      )) as ReadyPayload
      const db = ready.database
      const tookMs = Date.now() - startedAt
      server.config.logger.info(
        `[api] backend connected: ${apiUrl} (${tookMs}ms)`,
        { timestamp: true },
      )
      if (db?.ok) {
        server.config.logger.info(
          `[api] database ready: keyspace=${db.keyspace} tables=${db.tables}`,
          { timestamp: true },
        )
      } else {
        server.config.logger.warn(
          `[api] backend up but database check failed: ${db?.error ?? 'unknown'}`,
        )
      }
    } catch (error) {
      server.config.logger.warn(
        `[api] backend unreachable at ${apiUrl}: ${error instanceof Error ? error.message : error} (start amigoact-be on :8100)`,
      )
    }
  }

  return {
    name: 'amigoact-backend-health',
    configureServer(server: ViteDevServer) {
      server.httpServer?.once('listening', () => {
        void check(server)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = (env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      backendHealthPlugin(apiUrl),
    ],
  }
})
