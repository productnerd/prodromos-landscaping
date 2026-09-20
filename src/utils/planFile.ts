import type { PlacedPlant, PlacedBuilding } from '../types/canvas';

export interface Plan {
  placedPlants: PlacedPlant[];
  placedBuildings: PlacedBuilding[];
}

/** Browsers that can write straight to a file the user picks. */
export const canUsePlanFile = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

const DB_NAME = 'prodromos-plan';
const STORE = 'handles';
const KEY = 'plan-file';

function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return new Promise((resolve) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => resolve(null);
    open.onsuccess = () => {
      const req = run(open.result.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    };
  });
}

/** The file chosen last time, remembered across reloads. */
export const rememberedFile = () => withStore<FileSystemFileHandle>('readonly', (s) => s.get(KEY));
export const rememberFile = (handle: FileSystemFileHandle) => withStore('readwrite', (s) => s.put(handle, KEY));
export const forgetFile = () => withStore('readwrite', (s) => s.delete(KEY));

/** Whether we may write to the file; asks the user if the browser wants a fresh nod. */
export async function fileIsWritable(handle: FileSystemFileHandle, ask: boolean): Promise<boolean> {
  const opts = { mode: 'readwrite' as const };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  return ask && (await handle.requestPermission(opts)) === 'granted';
}

export async function choosePlanFile(): Promise<FileSystemFileHandle> {
  const handle = await window.showSaveFilePicker({
    suggestedName: 'prodromos-plan.json',
    types: [{ description: 'Garden plan', accept: { 'application/json': ['.json'] } }],
  });
  await rememberFile(handle);
  return handle;
}

export async function openPlanFile(): Promise<FileSystemFileHandle> {
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: 'Garden plan', accept: { 'application/json': ['.json'] } }],
  });
  await rememberFile(handle);
  return handle;
}

/**
 * Refuse to write a plan with no plants over a file that has some: that is how
 * a cleared browser store would otherwise wipe the file too.
 */
export function wouldWipePlants(next: Plan, saved: Plan | null): boolean {
  return next.placedPlants.length === 0 && !!saved && saved.placedPlants.length > 0;
}

export async function writePlan(handle: FileSystemFileHandle, plan: Plan): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify({ savedAt: new Date().toISOString(), ...plan }, null, 2));
  await writable.close();
}

export async function readPlan(handle: FileSystemFileHandle): Promise<Plan | null> {
  const text = await (await handle.getFile()).text();
  if (!text.trim()) return null;
  const data = JSON.parse(text);
  if (!Array.isArray(data?.placedPlants) || !Array.isArray(data?.placedBuildings)) return null;
  return { placedPlants: data.placedPlants, placedBuildings: data.placedBuildings };
}

/** Save a copy through the browser's downloads, for browsers without file access. */
export function downloadPlan(plan: Plan) {
  const blob = new Blob([JSON.stringify({ savedAt: new Date().toISOString(), ...plan }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'prodromos-plan.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function readPlanFromBlob(file: File): Promise<Plan | null> {
  const data = JSON.parse(await file.text());
  if (!Array.isArray(data?.placedPlants) || !Array.isArray(data?.placedBuildings)) return null;
  return { placedPlants: data.placedPlants, placedBuildings: data.placedBuildings };
}
