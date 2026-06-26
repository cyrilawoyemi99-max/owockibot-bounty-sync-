import { readFileSync } from "node:fs";

const file = "content/owk-002/public-goods-funding-thread-pack.md";
const source = readFileSync(file, "utf8");
const sections = source.split(/\n---\n/).filter((section) => section.includes("## Thread "));

const errors = [];

if (sections.length !== 5) {
  errors.push(`Expected 5 thread sections, found ${sections.length}.`);
}

sections.forEach((section, index) => {
  const heading = section.match(/## Thread \d+ - .+/)?.[0] || `Thread ${index + 1}`;
  const posts = section
    .split("\n")
    .filter((line) => /^\d+\. /.test(line.trim()))
    .map((line) => line.trim());

  if (posts.length !== 12) {
    errors.push(`${heading}: expected 12 posts, found ${posts.length}.`);
  }

  posts.forEach((post) => {
    const text = post.replace(/^\d+\. /, "");
    if (text.length > 280) {
      errors.push(`${heading}: post exceeds 280 chars (${text.length}): ${text}`);
    }
  });

  const lastPost = posts.at(-1) || "";
  if (!/^\d+\. CTA: /.test(lastPost)) {
    errors.push(`${heading}: final post must start with CTA:.`);
  }

  if (!section.includes("### Sources")) {
    errors.push(`${heading}: missing Sources block.`);
  }
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${sections.length} threads in ${file}.`);
