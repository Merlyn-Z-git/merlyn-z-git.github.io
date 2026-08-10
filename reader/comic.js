// let comicData;

// let currentPage = 1;

// let singleMode = false;



// const params =
// new URLSearchParams(
// window.location.search
// );


// const work =
// params.get("work");


// const chapter =
// params.get("chapter");



// const container =
// document.getElementById(
// "comic-container"
// );



// async function loadComic(){


// if(!work || !chapter){

// container.innerHTML =
// "Missing comic information";

// return;

// }



// const path =
// `../works/${work}/${chapter}/metadata.json`;



// const response =
// await fetch(path);



// comicData =
// await response.json();



// document.title =
// comicData.title.zh;



// document.getElementById(
// "comic-title"
// ).innerHTML =
// comicData.title.zh;



// document.getElementById(
// "chapter-title"
// ).innerHTML =
// comicData.chapter.zh;



// if(comicData.direction==="rtl"){

// container.classList.add("rtl");

// }



// loadProgress();


// render();


// }



// function render(){


// container.innerHTML="";


// if(singleMode){

// renderSingle();

// }

// else{

// renderLong();

// }


// }



// function renderLong(){


// for(
// let i=1;
// i<=comicData.pages;
// i++
// ){


// let img =
// createImage(i);


// container.appendChild(img);


// }

// }



// function renderSingle(){


// container.className="single-page";


// let img =
// createImage(currentPage);


// container.appendChild(img);


// }



// function createImage(number){


// let img =
// document.createElement("img");


// let filename =
// String(number)
// .padStart(2,"0")
// +".png";



// img.src =
// `../works/${work}/${chapter}/${comicData.path}${filename}`;



// img.loading="lazy";



// img.onclick=function(){


// if(singleMode){

// nextPage();

// }

// };



// return img;

// }




// function nextPage(){


// if(currentPage < comicData.pages){

// currentPage++;

// saveProgress();

// render();

// }

// }



// function previousPage(){


// if(currentPage>1){

// currentPage--;

// saveProgress();

// render();

// }

// }



// function saveProgress(){


// localStorage.setItem(

// `${work}-${chapter}`,

// currentPage

// );


// }



// function loadProgress(){


// let saved =
// localStorage.getItem(
// `${work}-${chapter}`
// );



// if(saved){

// currentPage =
// Number(saved);

// }

// }




// document
// .getElementById(
// "toggle-mode"
// )
// .onclick=function(){


// singleMode=!singleMode;


// this.innerHTML =
// singleMode?
// "单页模式":
// "长条模式";


// render();


// };




// document
// .getElementById(
// "fullscreen"
// )
// .onclick=function(){


// document.documentElement
// .requestFullscreen();

// };





// document.addEventListener(
// "keydown",
// function(e){


// if(e.key==="ArrowRight"){

// previousPage();

// }



// if(e.key==="ArrowLeft"){

// nextPage();

// }



// });



// loadComic();



let comicData;
let currentPage = 1;
let singleMode = false;

const params = new URLSearchParams(window.location.search);
const work = params.get("work");
const chapter = params.get("chapter");

const container = document.getElementById("comic-container");

async function loadComic() {
  if (!work || !chapter) {
    container.innerHTML = "<p class='error'>Missing comic information</p>";
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
    render();
  } catch (e) {
    container.innerHTML = "<p class='error'>Failed to load comic metadata.</p>";
  }
}

function render() {
  container.innerHTML = "";

  // 1. 统一管理 class 状态，防止 single-page 覆盖 rtl
  container.className = "";
  if (comicData && comicData.direction === "rtl") {
    container.classList.add("rtl");
  }

  if (singleMode) {
    renderSingle();
  } else {
    renderLong();
  }
}

function renderLong() {
  container.classList.add("long-mode");
  for (let i = 1; i <= comicData.pages; i++) {
    let img = createImage(i);
    container.appendChild(img);
  }
}

function renderSingle() {
  container.classList.add("single-mode");

  // 渲染当前页
  let img = createImage(currentPage);
  container.appendChild(img);

  // 预加载下一页 & 上一页 (提升流畅度)
  preloadImages();
}

function createImage(number) {
  let img = document.createElement("img");
  let filename = String(number).padStart(2, "0") + ".png";
  img.src = `../works/${work}/${chapter}/${comicData.path}${filename}`;
  img.loading = "lazy";
  img.alt = `Page ${number}`;
  return img;
}

function nextPage() {
  if (currentPage < comicData.pages) {
    currentPage++;
    saveProgress();
    render();
    window.scrollTo(0, 0);
  }
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    saveProgress();
    render();
    window.scrollTo(0, 0);
  }
}

function preloadImages() {
  if (currentPage < comicData.pages) {
    const nextImg = new Image();
    const nextFilename = String(currentPage + 1).padStart(2, "0") + ".png";
    nextImg.src = `../works/${work}/${chapter}/${comicData.path}${nextFilename}`;
  }
  if (currentPage > 1) {
    const prevImg = new Image();
    const prevFilename = String(currentPage - 1).padStart(2, "0") + ".png";
    prevImg.src = `../works/${work}/${chapter}/${comicData.path}${prevFilename}`;
  }
}

function saveProgress() {
  localStorage.setItem(`${work}-${chapter}`, currentPage);
}

function loadProgress() {
  let saved = localStorage.getItem(`${work}-${chapter}`);
  if (saved) {
    currentPage = Number(saved);
  }
}

// 模式切换按钮逻辑
const toggleBtn = document.getElementById("toggle-mode");
toggleBtn.onclick = function () {
  singleMode = !singleMode;
  this.innerText = singleMode ? "单页模式" : "长条模式";
  render();
};

// 全屏按钮
document.getElementById("fullscreen").onclick = function () {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// RTL 专有点击逻辑：屏幕左侧进，右侧退
container.addEventListener("click", function (e) {
  if (!singleMode) return; // 长条模式下不触发点击翻页

  const width = window.innerWidth;
  const clickX = e.clientX;

  // 屏幕划分为 40% | 20% | 40%
  if (clickX < width * 0.4) {
    // 点击左侧 -> RTL 下一页
    nextPage();
  } else if (clickX > width * 0.6) {
    // 点击右侧 -> RTL 上一页
    previousPage();
  } else {
    // 点击中间 -> 隐藏/显示 Header 顶栏
    document.querySelector(".reader-header").classList.toggle("header-hidden");
  }
});

// 键盘控制（RTL 方向修正）
document.addEventListener("keydown", function (e) {
  if (!singleMode) return;

  if (e.key === "ArrowRight") {
    previousPage(); // 右箭头：退回上一页
  } else if (e.key === "ArrowLeft") {
    nextPage(); // 左箭头：前进下一页
  }
});

loadComic();
