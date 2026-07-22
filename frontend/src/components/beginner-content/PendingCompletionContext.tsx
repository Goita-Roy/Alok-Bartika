import { createContext, useContext } from "react";

type PendingCompletionRef = { current: Promise<void> | null };

const PendingCompletionContext = createContext<PendingCompletionRef>({ current: null });

export function usePendingCompletion(): PendingCompletionRef {
  return useContext(PendingCompletionContext);
}

export default PendingCompletionContext;
