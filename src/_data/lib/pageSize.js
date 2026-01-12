const DEFAULT_PAGE_SIZE = 40;

const parsed = Number.parseInt(String(process.env.PAGE_SIZE || ""), 10);
const pageSize = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE_SIZE;

module.exports = pageSize;

