import { Glob } from "bun";

const bad: string[] = [];
for await (const p of new Glob("**/*.{ts,tsx}").scan({
  cwd: ".",
  onlyFiles: true,
})) {
  const n = p.replaceAll("\\", "/");
  if (n.startsWith("node_modules/") || n.startsWith("dist/")) continue;
  const lines = (await Bun.file(p).text()).split("\n").length;
  const limit = n.endsWith(".tsx") ? 250 : 350;
  if (lines > limit) bad.push(`${n}: ${lines}`);
}
console.log(bad.length ? bad.join("\n") : "OK");

// Character-class alternates keep this file from matching itself when the
// same pattern scans the whole repo.
const forbidden = /shad[o]w|drop-shad[o]w|box-shad[o]w|\brin[g]-/;
let clean = true;
for await (const p of new Glob("**/*.{tsx,ts,css}").scan({
  cwd: ".",
  onlyFiles: true,
})) {
  const n = p.replaceAll("\\", "/");
  if (n.startsWith("node_modules/") || n.startsWith("dist/")) continue;
  (await Bun.file(p).text()).split("\n").forEach((line, i) => {
    if (forbidden.test(line)) {
      clean = false;
      console.log(`${n}:${i + 1}: ${line.trim()}`);
    }
  });
}
if (clean) console.log("css-style gate OK");
