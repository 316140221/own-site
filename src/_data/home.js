const buildTime = require("./buildTime.js");
const toolsData = require("./tools.js");

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleWithoutReplacement(list, size, rng) {
  const items = Array.isArray(list) ? list.slice() : [];
  if (!items.length) return [];

  const desired = Number.isFinite(Number(size)) ? Math.max(0, Math.min(items.length, Number(size))) : 0;
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items.slice(0, desired);
}

module.exports = function () {
  const tools = toolsData && Array.isArray(toolsData.all) ? toolsData.all : [];
  const seed = buildTime instanceof Date ? buildTime.getTime() : Date.now();
  const rng = mulberry32(seed);

  return {
    randomTools: sampleWithoutReplacement(tools, 8, rng),
  };
};
