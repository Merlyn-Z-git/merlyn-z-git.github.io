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

const params = new URLSearchParams(window.location.search);
const work = params.get("work");
const chapter = params.get("chapter");

const container = document.getElementById("comic-container");

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
    render();
    showRtlToast(); // 显示从右往左阅读提示
  } catch (e) {
    container.innerHTML = "<p class='error'>加载漫画元数据失败</p>";
  }
}

function render() {
  container.innerHTML = "";

  // 渲染当前页图片
  let img = createImage(currentPage);
  container.appendChild(img);

  // 预加载前后页图片
  preloadImages();
}

function createImage(number) {
  let img = document.createElement("img");
  let filename = String(number).padStart(3, "0") + ".png";
  img.src = `../works/${work}/${chapter}/${comicData.path}${filename}`;
  img.alt = `Page ${number}`;
  img.loading = "eager"; // 当前页快速加载
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

// 预加载上一页与下一页，提升切页流畅度
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
    currentPage = Number(saved);
  }
}

// 首次加载淡入淡出引导 Toast
function showRtlToast() {
  const toast = document.getElementById("rtl-toast");
  if (!toast) return;

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// 全屏功能
document.getElementById("fullscreen").onclick = function () {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// RTL 点击热区：点击屏幕左侧 40% 进下一页，右侧 40% 退上一页，中间 20% 隐藏/唤出顶栏
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
  if (e.key === "ArrowLeft") {
    nextPage();
  } else if (e.key === "ArrowRight") {
    previousPage();
  }
});

loadComic();
