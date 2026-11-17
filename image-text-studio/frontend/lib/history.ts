"use client";
import { useCallback, useReducer } from "react";

interface State<T> {
  past: T[];
  present: T;
  future: T[];
}

type Action<T> =
  | { type: "set"; value: T; merge?: boolean }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; value: T };

function reducer<T>(s: State<T>, a: Action<T>): State<T> {
  switch (a.type) {
    case "set":
      if (a.value === s.present) return s;
      // merge: تجميع ضغطات المفاتيح المتتالية في خطوة تراجع واحدة
      if (a.merge && s.past.length) return { ...s, present: a.value, future: [] };
      return { past: [...s.past, s.present].slice(-500), present: a.value, future: [] };
    case "undo":
      if (!s.past.length) return s;
      return { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] };
    case "redo":
      if (!s.future.length) return s;
      return { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) };
    case "reset":
      return { past: [], present: a.value, future: [] };
  }
}

/** تاريخ غير محدود للتراجع والإعادة. */
export function useHistory<T>(initial: T) {
  const [s, dispatch] = useReducer(reducer<T>, { past: [], present: initial, future: [] });
  return {
    value: s.present,
    set: useCallback((value: T, merge = false) => dispatch({ type: "set", value, merge }), []),
    undo: useCallback(() => dispatch({ type: "undo" }), []),
    redo: useCallback(() => dispatch({ type: "redo" }), []),
    reset: useCallback((value: T) => dispatch({ type: "reset", value }), []),
    canUndo: s.past.length > 0,
    canRedo: s.future.length > 0,
  };
}
