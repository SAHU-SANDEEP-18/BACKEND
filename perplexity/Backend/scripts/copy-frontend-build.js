import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const frontendDist = fileURLToPath(new URL("../../Frontend/dist/", import.meta.url));
const publicDist = fileURLToPath(new URL("../public/dist/", import.meta.url));

rmSync(publicDist, { recursive: true, force: true });
mkdirSync(publicDist, { recursive: true });
cpSync(frontendDist, publicDist, { recursive: true });

console.log(`Copied frontend build to ${publicDist}`);
