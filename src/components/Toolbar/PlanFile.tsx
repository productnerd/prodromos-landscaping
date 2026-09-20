import { useEffect, useRef, useState } from 'react';
import { useGardenStore } from '../../stores/gardenStore';
import {
  canUsePlanFile,
  choosePlanFile,
  downloadPlan,
  fileIsWritable,
  forgetFile,
  openPlanFile,
  readPlan,
  readPlanFromBlob,
  rememberedFile,
  writePlan,
  wouldWipePlants,
  type Plan,
} from '../../utils/planFile';

const BTN =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)] hover:border-[var(--warm-gray)] transition-colors';

const planOf = (): Plan => {
  const { placedPlants, placedBuildings } = useGardenStore.getState();
  return { placedPlants, placedBuildings };
};

/**
 * Keeps the plan in a file on disk. The file is the safe copy: browser storage
 * can be cleared without warning, and has been.
 */
export default function PlanFile() {
  const loadPlan = useGardenStore((s) => s.loadPlan);
  const [handle, setHandle] = useState<FileSystemFileHandle | null>(null);
  const [status, setStatus] = useState<string>('');
  const [needsPermission, setNeedsPermission] = useState(false);
  const savedRef = useRef<string>('');
  const importRef = useRef<HTMLInputElement>(null);

  // Reconnect to the file chosen last time, and load whatever it holds.
  useEffect(() => {
    if (!canUsePlanFile) return;
    let cancelled = false;
    (async () => {
      const saved = await rememberedFile();
      if (!saved || cancelled) return;
      setHandle(saved);
      if (!(await fileIsWritable(saved, false))) {
        setNeedsPermission(true);
        setStatus(`${saved.name} — click to reconnect`);
        return;
      }
      const plan = await readPlan(saved);
      if (plan && !cancelled) {
        loadPlan(plan);
        savedRef.current = JSON.stringify(plan);
        setStatus(`Loaded from ${saved.name}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPlan]);

  // Write every change to the file, a moment after it settles.
  useEffect(() => {
    if (!handle || needsPermission) return;
    let timer: number | undefined;
    const unsubscribe = useGardenStore.subscribe((s, prev) => {
      if (s.placedPlants === prev.placedPlants && s.placedBuildings === prev.placedBuildings) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        const plan = planOf();
        const previous = savedRef.current ? (JSON.parse(savedRef.current) as Plan) : null;
        if (wouldWipePlants(plan, previous)) {
          setStatus('Not saving: the plan looks empty. Reload the page.');
          return;
        }
        try {
          await writePlan(handle, plan);
          savedRef.current = JSON.stringify(plan);
          setStatus(`Saved to ${handle.name} at ${new Date().toLocaleTimeString()}`);
        } catch {
          setStatus('Could not write the file');
        }
      }, 600);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [handle, needsPermission]);

  const connect = async (pick: () => Promise<FileSystemFileHandle>, load: boolean) => {
    try {
      const chosen = await pick();
      if (!(await fileIsWritable(chosen, true))) return;
      if (load) {
        const plan = await readPlan(chosen);
        if (plan) loadPlan(plan);
      }
      const plan = planOf();
      await writePlan(chosen, plan);
      savedRef.current = JSON.stringify(plan);
      setHandle(chosen);
      setNeedsPermission(false);
      setStatus(`Saved to ${chosen.name}`);
    } catch {
      /* the picker was dismissed */
    }
  };

  if (!canUsePlanFile) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <button className={BTN} onClick={() => downloadPlan(planOf())} title="Download the plan as a file">
          Save plan
        </button>
        <button className={BTN} onClick={() => importRef.current?.click()} title="Load a plan from a file">
          Open plan
        </button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            const plan = await readPlanFromBlob(file);
            if (plan) loadPlan(plan);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {handle && needsPermission && (
        <button
          className={BTN}
          onClick={async () => {
            if (!(await fileIsWritable(handle, true))) return;
            const plan = await readPlan(handle);
            if (plan) loadPlan(plan);
            setNeedsPermission(false);
            setStatus(`Loaded from ${handle.name}`);
          }}
        >
          Reconnect plan file
        </button>
      )}
      {!handle && (
        <>
          <button className={BTN} onClick={() => connect(choosePlanFile, false)} title="Choose a file to keep this plan in">
            Save plan to file…
          </button>
          <button className={BTN} onClick={() => connect(openPlanFile, true)} title="Open a plan file and keep saving to it">
            Open plan file…
          </button>
        </>
      )}
      {handle && !needsPermission && (
        <button
          className={BTN}
          onClick={async () => {
            await forgetFile();
            setHandle(null);
            setStatus('');
          }}
          title={`Saving to ${handle.name}. Click to choose a different file.`}
        >
          📄 {handle.name}
        </button>
      )}
      {status && <span className="text-[var(--ink-light)] max-w-56 truncate" title={status}>{status}</span>}
    </div>
  );
}
