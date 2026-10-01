# 选图式前端设计 · Frontend Style Discovery

**不会描述也没关系：先看案例，选喜欢的部分，多轮组合，再把定稿做成前端。**

[English](README.md) · [完整操作流程](docs/WORKFLOW.zh-CN.md) · [独立示例](docs/CASE_STUDY.zh-CN.md)

https://github.com/user-attachments/assets/c3c84a07-ba15-4bec-a6af-64b6108e10b3

![独立虚构示例 COMMONPLACE 灵感收藏工具](examples/media/commonplace-editorial.png)

这是一套可复用的 Codex skill。用户只需选几个编号、说说喜欢或不喜欢的部分，助手就能保留已选方向、继续寻找未确定的部分，组合出完整原创界面；获得开发授权后继续实现并验证。

支持收藏工具、工作台、编辑器、仪表盘、移动端和品牌网站，不规定必须使用 3D、暖色或某种框架。

## 包里有什么

- 真实参考搜索、多轮选择、属性提炼、原创组合、反馈修订和开发交接流程。
- 本地选图册：搜索、筛选、喜欢/不喜欢、理由、放大、对比、导入/导出。
- 两个多轮工具：保留原始选择证据；自动固定喜欢的来源并延续编号。
- 决策记录和交接模板：字体、间距、状态、交互、响应式、验收。
- 16 个作者/产品来源入口、两张独立原创 COMMONPLACE 概念和 32 秒原创 WebGL 宣传片。

COMMONPLACE 是新制作的虚构“个人灵感收藏工具”，不包含使用者的私人项目。16 个入口是有核验标签的研究起点，不是假装已经浏览过的应用截图。概念图与实际联网产品分开说明。

## 安装

skill 和图库工具只需 Python 3.10+；Node 只用于宣传展示和浏览器检查。

```sh
git clone https://github.com/yanghongliang1010-stack/frontend-style-discovery.git
cd frontend-style-discovery
python3 scripts/install-local.py
```

安装到 CODEX_HOME/skills，默认 ~/.codex/skills；已有同名技能时拒绝覆盖。技能发现未刷新时在下一轮/新会话使用。

## 怎么用

```text
$frontend-style-discovery
我要重做一个收藏工具，但不知道想要的风格。
先找 10–20 个差异明显的真实界面让我选，先设计，再连接功能。
```

之后只回复编号也可以：

```text
喜欢 3 的收藏阅读顺序，喜欢 10 的材质。
不喜欢那些密集的工作台，下一轮给我看不同的收藏布局。
```

助手会区分选的是布局、颜色、材质还是交互，不把某项喜欢当成整套定稿通过。看完整稿后再提出具体修订，明确“用这套开始做”后进入已授权的开发。

## 立即体验选图和多轮流程

```sh
python3 skills/frontend-style-discovery/scripts/build_gallery.py examples/demo.json --output out/gallery
python3 -m http.server 8780 --bind 127.0.0.1 --directory out/gallery
```

打开 http://127.0.0.1:8780/ 。无需模型密钥或 Node，选择只存本机浏览器；换浏览器/下一轮前导出。导入同时检查项目和来源身份，数据错误时整体拒绝，不会只更新一半。

```sh
python3 skills/frontend-style-discovery/scripts/summarize_choices.py examples/reference-library.json examples/walkthrough/choices.json --output out/preferences.json
python3 skills/frontend-style-discovery/scripts/advance_round.py examples/reference-library.json examples/walkthrough/additions.json --decisions examples/walkthrough/choices.json --output out/round-2
python3 skills/frontend-style-discovery/scripts/build_gallery.py out/round-2/references.json --output out/round-2-gallery
```

自动固定已喜欢来源、保留历史编号、搬运相对图片并另存原始理由。旧输出不会被覆盖。[完整流程](docs/WORKFLOW.zh-CN.md)解释各阶段的交付、反馈和开发方法；[交接模板](skills/frontend-style-discovery/references/handoff-template.md)可以直接复制到项目。

## 宣传展示和验证

```sh
npm ci --ignore-scripts
npm run gallery
npm run demo
# 打开 http://127.0.0.1:8782/demo/
```

真实程序化 3D 雕塑、原创运镜与声音；本地页面中的视频也能直接播放、暂停和拖动。[视频制作方法](docs/VIDEO.md)提供复现命令。

安装 Chromium 后运行 `npm run check`。查看[实际验证与限制](docs/VALIDATION.md)、[行为评估用例](docs/EVALUATION.md)和[贡献方法](CONTRIBUTING.md)。脚本演练不是独立代理评估或真实用户研究，构建成功也不代表后端/生产验证完成。

原创代码和示例采用 MIT；参考网站作品保留作者权利，详情见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
