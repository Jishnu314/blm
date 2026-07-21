import { useState, useEffect, useRef } from "react";
import { STORAGE_KEY } from "./constants";

export function useLedgerStore() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState({
    setupDone: false,
    self: null,
    agents: [],
    customers: [],
    schemes: [],
  });
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = window.storage
          ? (await window.storage.get(STORAGE_KEY, false))?.value
          : localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setData((d) => ({ ...d, ...parsed }));
        }
      } catch {
        /* no data yet */
      }
      setLoaded(true);
    })();
  }, []);

  const persist = (next) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const value = JSON.stringify(next);
        if (window.storage) await window.storage.set(STORAGE_KEY, value, false);
        else localStorage.setItem(STORAGE_KEY, value);
      } catch (e) {
        console.error("save failed", e);
      }
    }, 250);
  };

  const update = (fn) => {
    setData((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      persist(next);
      return next;
    });
  };

  return { data, update, loaded };
}
