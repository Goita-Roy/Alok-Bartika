import { createContext, useContext } from "react";
import type { RefObject } from "react";

const ScrollContext = createContext<RefObject<HTMLElement> | null>(null);

export function useScrollContainer() {
  return useContext(ScrollContext);
}

export default ScrollContext;
