/**
 * Shares the sheet's Pan gesture down to inputs so they can declare themselves
 * "simultaneous" with it — letting a tap focus the input while a downward drag
 * still drives the sheet (fixes TextInput swallowing the drag gesture).
 */
import { createContext } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SheetDragContext = createContext<any>(null);
