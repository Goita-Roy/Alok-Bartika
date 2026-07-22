export type DebugState = {
  currentClass: string | null;
  currentIndex: number | null;
  nextClass: string | null;
  nextPath: string | null;
  buttonClicked: boolean;
  goToNextExecuted: boolean;
  navigateCalled: boolean;
  selectedClassId: string | null;
  classId: string | null;
};

const initialState: DebugState = {
  currentClass: null,
  currentIndex: null,
  nextClass: null,
  nextPath: null,
  buttonClicked: false,
  goToNextExecuted: false,
  navigateCalled: false,
  selectedClassId: null,
  classId: null,
};

let state: DebugState = initialState;
const listeners = new Set<() => void>();

export function setDebug(patch: Partial<DebugState>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getDebug(): DebugState {
  return state;
}

export function subscribeDebug(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
