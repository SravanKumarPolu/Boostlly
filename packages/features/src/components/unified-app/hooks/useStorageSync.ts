/**
 * Storage Sync Hook
 * 
 * Handles synchronization of voice settings and other preferences
 */

import { useEffect } from 'react';
import { logWarning } from '@boostlly/core';
import { StorageLike } from '../types';

export function useStorageSync(storage: StorageLike | null) {
  // Persist voice settings updates coming from VoiceCommands/GlobalListener
  useEffect(() => {
    const onSettingsUpdate = async (e: any) => {
      try {
        const detail = e?.detail || {};
        if (!storage) return;

        // Handle speech rate updates
        if (typeof detail.speechRate === "number") {
          await (storage as any).set("speechRate", detail.speechRate);
        } else if (
          detail.speechRate === "INCREMENT" ||
          detail.speechRate === "DECREMENT"
        ) {
          const current = (await (storage as any).get("speechRate")) ?? 0.8;
          const delta = detail.speechRate === "INCREMENT" ? 0.1 : -0.1;
          const next = Math.max(
            0.5,
            Math.min(2, Number((current + delta).toFixed(1))),
          );
          await (storage as any).set("speechRate", next);
        }

        // Handle speech volume updates (stored as 0-100 integer)
        if (typeof detail.speechVolume === "number") {
          await (storage as any).set(
            "speechVolume",
            Math.max(0, Math.min(100, detail.speechVolume)),
          );
        } else if (
          detail.speechVolume === "INCREMENT" ||
          detail.speechVolume === "DECREMENT"
        ) {
          const currentRaw = await (storage as any).get("speechVolume");
          const current = typeof currentRaw === "number" ? currentRaw : 80;
          const delta = detail.speechVolume === "INCREMENT" ? 10 : -10;
          const next = Math.max(0, Math.min(100, current + delta));
          await (storage as any).set("speechVolume", next);
        }

        if (typeof detail.textToSpeech === "boolean") {
          await (storage as any).set("textToSpeech", detail.textToSpeech);
        }
      } catch (err) {
        logWarning("Failed to persist settings", { error: err });
      }
    };
    window.addEventListener(
      "boostlly:settings:update",
      onSettingsUpdate as any,
    );
    // Respond to settings seed requests from child components (e.g., Voice tab)
    const onRequest = async () => {
      try {
        if (!storage) return;
        const seedRate = (await (storage as any).get("speechRate")) ?? 0.8;
        const seedVol = (await (storage as any).get("speechVolume")) ?? 80;
        const seedTts = await (storage as any).get("textToSpeech");
        window.dispatchEvent(
          new CustomEvent("boostlly:settings:update", {
            detail: {
              speechRate: typeof seedRate === "number" ? seedRate : 0.8,
              speechVolume: typeof seedVol === "number" ? seedVol : 80,
              ...(typeof seedTts === "boolean"
                ? { textToSpeech: seedTts }
                : {}),
            },
          }),
        );
      } catch {}
    };
    window.addEventListener("boostlly:settings:request", onRequest as any);
    return () => {
      window.removeEventListener(
        "boostlly:settings:update",
        onSettingsUpdate as any,
      );
      window.removeEventListener("boostlly:settings:request", onRequest as any);
    };
  }, [storage]);

  // Seed voice settings on mount
  useEffect(() => {
    if (!storage) return;
    (async () => {
      try {
        const seedRate = (await (storage as any).get("speechRate")) ?? 0.8;
        const seedVol = (await (storage as any).get("speechVolume")) ?? 80;
        const seedTts = await (storage as any).get("textToSpeech");
        window.dispatchEvent(
          new CustomEvent("boostlly:settings:update", {
            detail: {
              speechRate: typeof seedRate === "number" ? seedRate : 0.8,
              speechVolume: typeof seedVol === "number" ? seedVol : 80,
              ...(typeof seedTts === "boolean"
                ? { textToSpeech: seedTts }
                : {}),
            },
          }),
        );
      } catch {}
    })();
  }, [storage]);
}
