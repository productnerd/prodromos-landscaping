import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Saves the garden plan to a file on disk while the dev server is running.
 *
 * Browser storage in the preview pane is cleared when the app restarts, which
 * has lost the plan twice, so the file is the real copy: the app loads from it
 * on startup and writes to it after every change, without anyone clicking.
 */
export function planStore(file = 'backups/plan.json'): Plugin {
  const path = resolve(process.cwd(), file);

  return {
    name: 'plan-store',
    configureServer(server) {
      // Mount under the app's base, which is where the page asks for it.
      const route = `${server.config.base.replace(/\/$/, '')}/__plan`;
      server.middlewares.use(route, (req, res) => {
        const send = (code: number, body: string) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json');
          res.end(body);
        };

        if (req.method === 'GET') {
          readFile(path, 'utf8')
            .then((text) => send(200, text))
            .catch(() => send(404, '{}'));
          return;
        }

        if (req.method === 'PUT') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', async () => {
            try {
              const plan = JSON.parse(body);
              if (!Array.isArray(plan?.placedPlants) || !Array.isArray(plan?.placedBuildings)) {
                return send(400, '{"error":"not a plan"}');
              }
              const previous = await readFile(path, 'utf8').catch(() => null);
              // Never let an empty plan overwrite a file that holds plants.
              if (previous) {
                const old = JSON.parse(previous);
                if (plan.placedPlants.length === 0 && old.placedPlants?.length > 0) {
                  return send(409, '{"error":"refusing to save an empty plan"}');
                }
                // Keep the last version alongside, in case a save goes wrong.
                await copyFile(path, `${path}.previous`).catch(() => {});
              }
              await mkdir(dirname(path), { recursive: true });
              await writeFile(path, JSON.stringify({ savedAt: new Date().toISOString(), ...plan }, null, 2));
              send(200, '{"ok":true}');
            } catch {
              send(400, '{"error":"bad request"}');
            }
          });
          return;
        }

        send(405, '{"error":"method not allowed"}');
      });
    },
  };
}
