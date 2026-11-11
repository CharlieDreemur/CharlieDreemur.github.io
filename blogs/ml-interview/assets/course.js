// Training Infra 速成课的导航。课表只在这里维护一份：
//   - infra-course.html：按课表生成课程列表（放在 id="lessons" 的元素里）
//   - 各课页面：顶部加"课程目录 + 第几课 + 上一课/下一课"，底部加上一课/下一课，键盘 ← → 翻页
(function () {
  var LESSONS = [
    ["infra-l0", "GPU 只关心两件事：算得多快、搬得多快", "compute-bound vs memory-bound、roofline、kernel fusion"],
    ["infra-l1", "v0 单卡：一个 training step 花多少 compute 和 memory", "6ND、MFU、16 bytes/param、activation"],
    ["infra-l2", "v1 单卡上的三招：BF16、activation checkpointing、FlashAttention", "省 activation、提速，但 model state 一点没少"],
    ["infra-l3", "通信 101：GPU 之间怎么传数据", "all-reduce、reduce-scatter、all-gather、all-to-all、ring"],
    ["infra-l4", "v2 → v3：DDP 到 ZeRO / FSDP", "你在 TikTok 用的 DeepSpeed 就在这一课"],
    ["infra-l5", "v4：Tensor Parallel 与 Sequence Parallel", "Megatron 的核心，NVIDIA 原题"],
    ["infra-l6", "v5：Pipeline Parallel", "按层切、bubble、1F1B、interleaved"],
    ["infra-l7", "v6：长序列和 MoE：Context Parallel 与 Expert Parallel", "ring attention、router、all-to-all"],
    ["infra-l8", "v7：拼成完整配置、跑快、出问题怎么查", "选 parallelism、overlap、FP8、慢和 hang"],
    ["infra-l9", "Megatron Core 代码地图与 RL 训推", "每个概念在哪个文件；verl 的训推权重同步"],
    ["infra-l10", "手写题和项目故事", "KV cache、MoE、TP Linear、INT8、autograd；TikTok SFT 怎么讲"]
  ];

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  var here = decodeURIComponent(location.pathname.split("/").pop() || "").replace(/\.html$/, "");

  function buildList(box) {
    var ol = el("ol", { class: "toc" });
    LESSONS.forEach(function (l, i) {
      var li = el("li");
      li.appendChild(el("span", { class: "num" }, String(i)));
      li.appendChild(el("a", { href: l[0] + ".html" }, l[1]));
      li.appendChild(el("span", { class: "toc-sub" }, l[2]));
      ol.appendChild(li);
    });
    box.appendChild(ol);
  }

  function buildNav(i) {
    var main = document.querySelector("main");
    if (!main) return;
    var prev = LESSONS[i - 1], next = LESSONS[i + 1];
    function link(l, text) { return el("a", { href: l[0] + ".html" }, text); }

    var bar = el("nav", { class: "sitebar", "aria-label": "课程导航" });
    bar.appendChild(el("a", { href: "index.html#infra-course", class: "home" }, "← 课程目录"));
    bar.appendChild(el("span", { class: "where" }, "Training Infra 速成课 · 第 " + i + " 课 / 共 " + (LESSONS.length - 1) + " 课"));
    var side = el("span", { class: "step" });
    if (prev) side.appendChild(link(prev, "上一课"));
    if (next) side.appendChild(link(next, "下一课"));
    bar.appendChild(side);
    main.insertBefore(bar, main.firstChild);

    var pager = el("nav", { class: "pager", "aria-label": "上一课和下一课" });
    pager.appendChild(prev ? link(prev, "← 第 " + (i - 1) + " 课 " + prev[1]) : el("a", { href: "index.html#infra-course" }, "← 课程目录"));
    pager.appendChild(next ? link(next, "第 " + (i + 1) + " 课 " + next[1] + " →") : el("a", { href: "index.html" }, "学完了：回到速查目录 →"));
    main.appendChild(pager);

    document.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var t = e.target && e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && prev) location.href = prev[0] + ".html";
      if (e.key === "ArrowRight" && next) location.href = next[0] + ".html";
    });
  }

  function start() {
    var box = document.getElementById("lessons");
    if (box) { buildList(box); return; }
    for (var i = 0; i < LESSONS.length; i++) {
      if (LESSONS[i][0] === here) { buildNav(i); return; }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
