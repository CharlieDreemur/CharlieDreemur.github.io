// 加载 KaTeX 并渲染页面里的公式。行内用 \( ... \)，独立公式用 \[ ... \] 或 $$ ... $$。
// 渲染完成后在 document 上派发 "math-rendered" 事件。
(function () {
  var base = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/";
  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = base + "katex.min.css";
  document.head.appendChild(css);

  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  load(base + "katex.min.js")
    .then(function () { return load(base + "contrib/auto-render.min.js"); })
    .then(function () {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
      document.dispatchEvent(new Event("math-rendered"));
    })
    .catch(function () {
      // 离线时公式保留为 TeX 源码
      document.documentElement.classList.add("no-math");
    });
})();
