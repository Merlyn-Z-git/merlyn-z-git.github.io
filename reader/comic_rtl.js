let comicData;
let currentPage = 1;

const params = new URLSearchParams(window.location.search);
const work = params.get("work");
const chapter = params.get("chapter");

const container = document.getElementById("comic-container");
const pageSelect = document.getElementById("page-select");
const totalPagesSpan = document.getElementById("total-pages");

async function loadComic() {
  if (!work || !chapter) {
    container.innerHTML = "<p class='error'>缺少漫画数据文件信息</p>";
    return;
  }

  try {
    const path = `../works/${work}/${chapter}/metadata.json`;
    const response = await fetch(path);
    comicData = await response.json();

    document.title = `${comicData.title.zh} - ${comicData.chapter.zh}`;
    document.getElementById("comic-title").innerText = comicData.title.zh;
    document.getElementById("chapter-title").innerText = comicData.chapter.zh;

    loadProgress();
    initPageSelect(); // 初始化页码下拉框
    render();
    showRtlToast(); // 显示 RTL 阅读提示
  } catch (e) {
    container.innerHTML = "<p class='error'>加载漫画元数据失败</p>";
  }
}

// 初始化页码下拉框选项
function initPageSelect() {
  pageSelect.innerHTML = "";
  for (let i = 1; i <= comicData.pages; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = String(i).padStart(3, "0");
    pageSelect.appendChild(option);
  }
  totalPagesSpan.innerText = `/ ${comicData.pages}`;
}

// 同步更新下拉框选中值
function updatePageSelect() {
  if (pageSelect) {
    pageSelect.value = currentPage;
  }
}

function render() {
  container.innerHTML = "";

  // 渲染当前页图片
  let img = createImage(currentPage);
  container.appendChild(img);

  // 同步下拉框状态并预加载
  updatePageSelect();
  preloadImages();
}

function createImage(number) {
  let img = document.createElement("img");
  let filename = String(number).padStart(3, "0") + ".png";
  img.src = `../works/${work}/${chapter}/${comicData.path}${filename}`;
  img.alt = `Page ${number}`;
  img.loading = "eager";
  return img;
}

function nextPage() {
  if (currentPage < comicData.pages) {
    currentPage++;
    saveProgress();
    render();
  }
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    saveProgress();
    render();
  }
}

function preloadImages() {
  if (currentPage < comicData.pages) {
    const nextImg = new Image();
    const nextFilename = String(currentPage + 1).padStart(3, "0") + ".png";
    nextImg.src = `../works/${work}/${chapter}/${comicData.path}${nextFilename}`;
  }
  if (currentPage > 1) {
    const prevImg = new Image();
    const prevFilename = String(currentPage - 1).padStart(3, "0") + ".png";
    prevImg.src = `../works/${work}/${chapter}/${comicData.path}${prevFilename}`;
  }
}

function saveProgress() {
  localStorage.setItem(`${work}-${chapter}`, currentPage);
}

function loadProgress() {
  let saved = localStorage.getItem(`${work}-${chapter}`);
  if (saved) {
    let pageNum = Number(saved);
    if (pageNum >= 1) currentPage = pageNum;
  }
}

function showRtlToast() {
  const toast = document.getElementById("rtl-toast");
  if (!toast) return;

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// 页码选择器变更事件 (手动选页)
pageSelect.addEventListener("change", function (e) {
  currentPage = Number(e.target.value);
  saveProgress();
  render();
});

// 阻止下拉框内部点击事件冒泡到 container 触发误翻页
pageSelect.addEventListener("click", function (e) {
  e.stopPropagation();
});

// 全屏功能
document.getElementById("fullscreen").onclick = function (e) {
  e.stopPropagation();
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// RTL 点击热区（点击顶栏等元素不会触发）
container.addEventListener("click", function (e) {
  const width = window.innerWidth;
  const clickX = e.clientX;

  if (clickX < width * 0.4) {
    nextPage(); // RTL: 左侧前进
  } else if (clickX > width * 0.6) {
    previousPage(); // RTL: 右侧后退
  } else {
    document.querySelector(".reader-header").classList.toggle("header-hidden");
  }
});

// RTL 键盘事件：← 左键下一页，→ 右键上一页
document.addEventListener("keydown", function (e) {
  // 如果焦点在 Select 上，允许方向键正常选择下拉项
  if (document.activeElement === pageSelect) return;

  if (e.key === "ArrowLeft") {
    nextPage();
  } else if (e.key === "ArrowRight") {
    previousPage();
  }
});

loadComic();