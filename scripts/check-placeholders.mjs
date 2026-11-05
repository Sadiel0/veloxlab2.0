import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const files = ["index.html", "es/index.html", "privacy.html", "styles.css"];

function addJs(dir) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name);
    const full = join(root, rel);
    if (statSync(full).isDirectory()) addJs(rel);
    else if (name.endsWith(".js")) files.push(rel);
  }
}

addJs("js");

const pattern = /data-placeholder\s*=|PLACEHOLDER|PROPOSED/;
const hits = [];

for (const rel of files) {
  const lines = readFileSync(join(root, rel), "utf8").split("\n");
  lines.forEach((line, index) => {
    if (pattern.test(line)) hits.push(`${rel}:${index + 1}: ${line.trim()}`);
  });
}

if (hits.length) {
  console.error(hits.join("\n"));
  console.error(
    `\n${hits.length} placeholder hit(s). Remove every data-placeholder attribute and every PLACEHOLDER or PROPOSED token before a production deploy.`
  );
  process.exit(1);
}

console.log("No data-placeholder attributes or PLACEHOLDER/PROPOSED tokens in the shipped files.");
