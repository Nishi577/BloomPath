import { Plugin } from "vite";
//#region src/plugin.d.ts
interface LovableTaggerOptions {
  jsxSource?: boolean;
  tailwindConfig?: boolean;
}
declare function lovableTagger({ jsxSource, tailwindConfig }?: LovableTaggerOptions): Plugin;
//#endregion
export { type LovableTaggerOptions, lovableTagger as componentTagger };