const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SOURCE_DIR = path.join(__dirname, "../../frontend/public/Assets");
const DEST_DIR = path.join(__dirname, "../src/uploads");

const FILES = [
  "flyer1.jpeg",
  "poster1.jpeg",
  "poster3.jpg",
  "Print1.png",
  "publication1.png",
  "Print2.png",
  "Merch1.png",
  "Merch3.png",
  "Merch5.png",
  "Animated1.png",
  "Animated3.png",
  "aduio1.jpeg",
  "video1.jpeg",
  "video2.jpeg",
];

const mapping = {};

for (const name of FILES) {
  const ext = path.extname(name);
  const newName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  fs.copyFileSync(path.join(SOURCE_DIR, name), path.join(DEST_DIR, newName));
  mapping[name] = newName;
  console.log(`${name} -> ${newName}`);
}

fs.writeFileSync(
  path.join(__dirname, "legacy-image-mapping.json"),
  JSON.stringify(mapping, null, 2)
);
