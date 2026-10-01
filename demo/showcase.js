import { createPavilion } from "./pavilion.js";
const video = new URLSearchParams(location.search).has("video");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (video) document.body.classList.add("video-mode");
const pavilion = createPavilion(document.querySelector("#scene"), {
  theme: "dark",
  interactive: !video,
  reducedMotion,
  pixelRatio: video ? 0.5 : undefined,
});
let theme = "dark";
document.querySelector("#theme").addEventListener("click", () => {
  theme = theme === "dark" ? "warm" : "dark";
  document.body.dataset.theme = theme;
  document.querySelector("#theme").textContent =
    theme === "dark" ? "切换为日光" : "切换为暮色";
  pavilion.setTheme(theme);
});
const stages = [
  {
    start: 0,
    end: 5,
    title: "先选风格。<br>再写界面。",
    text: "Frontend Style Discovery<br>选图式前端设计",
    shot: "detail",
    region: null,
  },
  {
    start: 5,
    end: 10,
    title: "从真实案例，<br>找到喜欢的部分。",
    text: "第一轮探索 10–20 个方向。<br>每个案例都有编号与原作链接。",
    shot: "wide",
    region: "sources",
  },
  {
    start: 10,
    end: 16,
    title: "喜欢的细节，<br>可以继续拼接。",
    text: "把场景、材质、布局和交互分开选择。<br>下一轮，只解决还没选定的部分。",
    shot: "wide",
    region: "axes",
  },
  {
    start: 16,
    end: 24,
    title: "多轮反馈。<br>拼成你的界面。",
    text: "保留已经喜欢的空间结构。<br>根据反馈，换成更明亮的暖色碰撞。",
    shot: "wide",
    region: "concepts",
  },
  {
    start: 24,
    end: 32,
    title: "选定之后，<br>直接进入开发。",
    text: "一个布局，日光与暮色两套主题。<br>开源 skill · 本地选图 · 可复用流程",
    shot: "wide",
    region: null,
  },
];
window.renderFrame = (seconds) => {
  const stage =
    stages.find((item) => seconds >= item.start && seconds < item.end) ||
    stages.at(-1);
  const warmth = Math.max(0, Math.min(1, (seconds - 16) / 4));
  document.body.dataset.theme = warmth > 0.5 ? "warm" : "dark";
  document.querySelector("h1").innerHTML = stage.title;
  document.querySelector("#description").innerHTML = stage.text;
  for (const id of ["sources", "axes", "concepts"])
    document.querySelector(`#${id}`).hidden = stage.region !== id;
  const local = seconds - stage.start;
  const fade = Math.min(1, local / 0.45, (stage.end - seconds) / 0.3);
  const copy = document.querySelector("#copy");
  copy.style.opacity = Math.max(0.02, fade);
  copy.style.transform = `translateY(${(1 - Math.min(1, local / 0.6)) * 14}px)`;
  document.querySelector("#footer-copy").textContent =
    seconds < 24
      ? "$frontend-style-discovery"
      : "github.com/yanghongliang1010-stack/frontend-style-discovery";
  pavilion.renderAt(seconds, stage.shot, warmth);
};
window.showcase = { pavilion, stages };
window.showcaseReady = true;
addEventListener("pagehide", () => pavilion.dispose(), { once: true });
