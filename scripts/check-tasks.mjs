import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toPosixPath } from "./lib/path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const todoPath = path.join(__dirname, "..", "开发TODO.md");
const todorPath = path.join(__dirname, "..", "todor.md");
const MAX_TODOR_ITEMS = 30;

function normalize(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function collectTodoStatus(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`缺少文件：${toPosixPath(filePath)}`);
  }

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  let inBacklog = false;
  const blocking = [];
  const duplicates = new Map();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      inBacklog = heading[1].includes("Backlog");
    }

    const todo = line.match(/^- \[( |x)\]\s*(.+)$/);
    if (!todo) continue;

    const status = todo[1] === "x" ? "done" : "todo";
    const text = todo[2].trim();
    const key = normalize(text);

    const existing = duplicates.get(key) || [];
    existing.push({ line: i + 1, text, status, inBacklog });
    duplicates.set(key, existing);

    if (!inBacklog && status === "todo") {
      blocking.push({ line: i + 1, text });
    }
  }

  const duplicateList = [...duplicates.values()]
    .filter((items) => items.length > 1)
    .map((items) => ({
      text: items[0].text,
      lines: items.map((item) => item.line),
    }));

  return { blocking, duplicateList };
}

function stripTodorPrefix(text) {
  return text.replace(/^todor\s*\d+\s*[:：]\s*/i, "");
}

function collectTodorStatus(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`缺少文件：${toPosixPath(filePath)}`);
  }

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  const duplicates = new Map();
  const pendingItems = [];
  let total = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const todo = lines[i].match(/^- \[( |x)\]\s*(.+)$/);
    if (!todo) continue;

    const status = todo[1] === "x" ? "done" : "todo";
    const text = todo[2].trim();
    const key = normalize(stripTodorPrefix(text));
    total += 1;

    const existing = duplicates.get(key) || [];
    existing.push({ line: i + 1, text, status });
    duplicates.set(key, existing);

    if (status === "todo") {
      pendingItems.push({ line: i + 1, text });
    }
  }

  const duplicateList = [...duplicates.values()]
    .filter((items) => items.length > 1)
    .map((items) => ({
      text: stripTodorPrefix(items[0].text),
      lines: items.map((item) => item.line),
    }));

  return {
    total,
    pending: pendingItems.length,
    pendingItems,
    duplicateList,
  };
}

function main() {
  const todoStatus = collectTodoStatus(todoPath);
  const todorStatus = collectTodorStatus(todorPath);

  const errors = [];

  if (todoStatus.blocking.length > 0) {
    errors.push(
      [
        "未完成任务阻止新增（非 Backlog 区域）：",
        ...todoStatus.blocking
          .slice(0, 8)
          .map((item) => `- 行 ${item.line}：${item.text}`),
        todoStatus.blocking.length > 8
          ? `... 还有 ${todoStatus.blocking.length - 8} 项`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (todoStatus.duplicateList.length > 0) {
    errors.push(
      [
        "发现重复 TODO，请去重后再新增：",
        ...todoStatus.duplicateList.map(
          (item) => `- ${item.text}（行 ${item.lines.join(", ")}）`
        ),
      ].join("\n")
    );
  }

  if (todorStatus.duplicateList.length > 0) {
    errors.push(
      [
        "todor.md 存在重复优化任务，去重后再新增：",
        ...todorStatus.duplicateList.map(
          (item) => `- ${item.text}（行 ${item.lines.join(", ")}）`
        ),
      ].join("\n")
    );
  }

  if (todorStatus.total === 0) {
    errors.push(
      "todor.md 当前为空，请先思考新的优化方向并新增至少 1 条 todor 任务后再继续"
    );
  }

  if (todorStatus.pendingItems.length > 0) {
    errors.push(
      [
        "todor.md 还有未完成的优化任务，先解决再新增：",
        ...todorStatus.pendingItems
          .slice(0, 8)
          .map((item) => `- 行 ${item.line}：${item.text}`),
        todorStatus.pendingItems.length > 8
          ? `... 还有 ${todorStatus.pendingItems.length - 8} 项`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (todorStatus.total > MAX_TODOR_ITEMS) {
    errors.push(
      `todor.md 超出 ${MAX_TODOR_ITEMS} 项上限（当前 ${todorStatus.total}），请先收敛再新增`
    );
  }

  if (errors.length > 0) {
    console.error(errors.join("\n\n"));
    process.exit(1);
  }

  console.log("OK：非 Backlog 区域无未完成任务，未发现重复条目");
  console.log(
    `OK：todor 清单 ${todorStatus.total} 项，待完成 ${todorStatus.pending} 项，无重复且未超出 ${MAX_TODOR_ITEMS} 项上限`
  );
}

main();
