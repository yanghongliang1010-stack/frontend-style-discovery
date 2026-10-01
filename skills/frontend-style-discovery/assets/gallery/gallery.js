import manifest from "./manifest.js";
const $ = (selector) => document.querySelector(selector);
const storageKey = `frontend-style-discovery:${manifest.project_id}:v1`;
let decisions = {};
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
  if (stored && typeof stored === "object" && !Array.isArray(stored))
    decisions = stored;
} catch {}
let toastTimer;
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => {
    $("#toast").hidden = true;
  }, 4200);
}
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(decisions));
  } catch {
    toast("浏览器未能保存，请使用“导出选择”保留结果。");
  }
  updateSummary();
}
function choice(id) {
  const item = decisions[id];
  return item && typeof item === "object" ? item : { value: "", notes: "" };
}
function updateSummary() {
  const liked = manifest.references
    .filter((item) => choice(item.id).value === "like")
    .map((item) => item.id);
  $("#summary").textContent =
    `${manifest.references.length} 个参考 · 喜欢 ${liked.length} 个${liked.length ? `：${liked.join("、")}` : ""}`;
}
function openPreview(item) {
  $("#preview-title").textContent = `${item.id} ${item.title}`;
  const img = element("img");
  img.src = item.image;
  img.alt = item.title;
  $("#preview-body").replaceChildren(img);
  $("#preview").showModal();
}
function createCard(item) {
  const card = element("article", undefined, "card");
  card.dataset.id = item.id;
  card.classList.toggle("is-liked", choice(item.id).value === "like");
  if (item.image) {
    const preview = element("button", undefined, "preview-button");
    preview.type = "button";
    preview.setAttribute("aria-label", `放大 ${item.id} ${item.title}`);
    const img = element("img");
    img.src = item.image;
    img.alt = item.title;
    img.loading = "lazy";
    preview.append(img);
    preview.addEventListener("click", () => openPreview(item));
    card.append(preview);
  } else {
    const fallback = element("div", undefined, "link-only");
    fallback.append(
      element("strong", item.title),
      element("span", "原作链接 · 未附带预览图"),
    );
    card.append(fallback);
  }
  const content = element("div", undefined, "card-content");
  const heading = element("div", undefined, "card-heading");
  const titleBlock = element("div");
  titleBlock.append(
    element("h2", item.title),
    element("p", `${item.creator} / ${item.kind}`, "creator"),
  );
  heading.append(
    element("span", String(item.id).padStart(2, "0"), "number"),
    titleBlock,
  );
  if (item.pinned) heading.append(element("span", "已选方向", "pin"));
  content.append(heading);
  if (item.tags.length)
    content.append(element("p", item.tags.join(" / "), "tags"));
  if (item.note) content.append(element("p", item.note, "note"));
  const source = element("a", "打开原作", "source");
  source.href = item.source_url;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  content.append(
    source,
    element("p", `${item.verification}；${item.license}`, "verification"),
  );
  const actions = element("div", undefined, "choices");
  for (const [value, label] of [
    ["like", "喜欢"],
    ["skip", "不喜欢"],
    ["", "暂不选择"],
  ]) {
    const button = element("button", label);
    button.type = "button";
    button.dataset.choice = value;
    button.setAttribute("aria-label", `${label} ${item.id}`);
    button.setAttribute(
      "aria-pressed",
      String(choice(item.id).value === value),
    );
    button.addEventListener("click", () => {
      decisions[item.id] = { ...choice(item.id), value };
      save();
      render();
      const replacement = [
        ...document.querySelectorAll(`[data-id="${item.id}"] [data-choice]`),
      ].find((node) => node.dataset.choice === value);
      (replacement || $("#liked-only")).focus();
    });
    actions.append(button);
  }
  const notes = element("textarea");
  notes.maxLength = 2000;
  notes.placeholder = "喜欢或不喜欢哪些部分？布局、颜色、材质、交互…";
  notes.setAttribute("aria-label", `${item.id} 选择理由`);
  notes.value = String(choice(item.id).notes || "").slice(0, 2000);
  notes.addEventListener("input", () => {
    decisions[item.id] = { ...choice(item.id), notes: notes.value };
    save();
  });
  content.append(actions, notes);
  card.append(content);
  return card;
}
function render() {
  const query = $("#search").value.trim().toLowerCase();
  const tag = $("#tag").value;
  const likedOnly = $("#liked-only").checked;
  const filtered = manifest.references.filter(
    (item) =>
      (!query ||
        `${item.id} ${item.title} ${item.creator} ${item.tags.join(" ")}`
          .toLowerCase()
          .includes(query)) &&
      (!tag || item.tags.includes(tag)) &&
      (!likedOnly || choice(item.id).value === "like"),
  );
  $("#gallery").replaceChildren(...filtered.map(createCard));
  $("#empty").hidden = filtered.length > 0;
  updateSummary();
}
$("#title").textContent = manifest.title;
$("#subtitle").textContent = manifest.subtitle;
$("#round").textContent = `第 ${manifest.round} 轮`;
document.title = manifest.title;
for (const tag of [
  ...new Set(manifest.references.flatMap((item) => item.tags)),
].sort()) {
  const option = element("option", tag);
  option.value = tag;
  $("#tag").append(option);
}
$("#search").addEventListener("input", render);
$("#tag").addEventListener("change", render);
$("#liked-only").addEventListener("change", render);
$("#close-preview").addEventListener("click", () => $("#preview").close());
$("#preview").addEventListener("click", (event) => {
  if (event.target === $("#preview")) $("#preview").close();
});
$("#compare").addEventListener("click", () => {
  const selected = manifest.references.filter(
    (item) => item.image && choice(item.id).value === "like",
  );
  if (selected.length < 2) {
    toast("先喜欢至少两张带预览的参考，再进行对比。");
    return;
  }
  const grid = element("div", undefined, "compare-grid");
  for (const item of selected) {
    const figure = element("figure");
    const img = element("img");
    img.src = item.image;
    img.alt = item.title;
    figure.append(
      img,
      element(
        "figcaption",
        `${item.id} ${item.title} — ${choice(item.id).notes || "未填写理由"}`,
      ),
    );
    grid.append(figure);
  }
  $("#preview-title").textContent = "喜欢的参考对比";
  $("#preview-body").replaceChildren(grid);
  $("#preview").showModal();
});
$("#export").addEventListener("click", () => {
  const exported = {
    schema_version: 1,
    project_id: manifest.project_id,
    round: manifest.round,
    exported_at: new Date().toISOString(),
    choices: manifest.references
      .filter((item) => choice(item.id).value || choice(item.id).notes)
      .map((item) => ({
        id: item.id,
        title: item.title,
        source_url: item.source_url,
        ...choice(item.id),
      })),
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" }),
  );
  const anchor = element("a");
  anchor.href = url;
  anchor.download = "frontend-style-decisions.json";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("已导出选择与理由。");
});
$("#import").addEventListener("change", async (event) => {
  try {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) throw new Error("文件过大");
    const data = JSON.parse(await file.text());
    if (data.schema_version !== 1 || !Array.isArray(data.choices))
      throw new Error("选择文件格式不正确");
    let applied = 0;
    let unmatched = 0;
    const next = { ...decisions };
    const ids = new Set(manifest.references.map((item) => item.id));
    for (const item of data.choices) {
      if (!item || !ids.has(item.id)) {
        unmatched++;
        continue;
      }
      if (
        !["like", "skip", ""].includes(item.value) ||
        typeof item.notes !== "string"
      )
        throw new Error("选择内容格式不正确");
      next[item.id] = { value: item.value, notes: item.notes.slice(0, 2000) };
      applied++;
    }
    decisions = next;
    save();
    render();
    toast(
      `已导入 ${applied} 项${unmatched ? `，${unmatched} 项不属于本轮` : ""}。`,
    );
  } catch (error) {
    toast(`导入失败：${error.message}`);
  } finally {
    event.target.value = "";
  }
});
render();
