// Fix duplicate Unsplash photos in seed-blog.mjs
const fs = require("fs");
let content = fs.readFileSync("prisma/seed-blog.mjs", "utf8");

const pexelsReplacements = {
  "1578575437130": [
    "https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
    "https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
    "https://images.pexels.com/photos/2226458/pexels-photo-2226458.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
    "https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
    "https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
    "https://images.pexels.com/photos/2539462/pexels-photo-2539462.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  ],
  "1553413077": [
    "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
    "https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  ],
  "1556742049": ["https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"],
  "1559666126": ["https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"],
  "1513828583688": ["https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"],
  "1587300003388": ["https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"],
  "1586528116311": ["https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"],
  "1617806118233": ["https://images.pexels.com/photos/7563687/pexels-photo-7563687.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"],
  "1565043589221": ["https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"],
};

let totalReplaced = 0;
for (const [photoId, replacementUrls] of Object.entries(pexelsReplacements)) {
  const pattern = "photo-" + photoId;
  let count = 0;
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(pattern)) {
      count++;
      if (count > 1 && replacementUrls[count - 2]) {
        const oldUrlMatch = lines[i].match(/https:\/\/images\.unsplash\.com\/photo-[^?]+\?[^)"']*/);
        if (oldUrlMatch) {
          lines[i] = lines[i].replace(oldUrlMatch[0], replacementUrls[count - 2]);
          totalReplaced++;
        }
      }
    }
  }
  content = lines.join("\n");
}

fs.writeFileSync("prisma/seed-blog.mjs", content);
console.log("Replaced " + totalReplaced + " duplicate images");

// Verify no more duplicates
const verify = fs.readFileSync("prisma/seed-blog.mjs", "utf8");
const ids = [...verify.matchAll(/photo-(\d+)/g)].map(m => m[1]);
const counts = {};
ids.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
const stillDuped = Object.entries(counts).filter(([, c]) => c > 1);
if (stillDuped.length === 0) {
  console.log("All images are now unique!");
} else {
  console.log("Still duplicated:", stillDuped.map(([id, c]) => "photo-" + id + " (" + c + "x)").join(", "));
}
