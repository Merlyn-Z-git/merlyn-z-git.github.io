let comicData;

let currentPage = 1;

let singleMode = false;



const params =
new URLSearchParams(
window.location.search
);


const work =
params.get("work");


const chapter =
params.get("chapter");



const container =
document.getElementById(
"comic-container"
);



async function loadComic(){


if(!work || !chapter){

container.innerHTML =
"Missing comic information";

return;

}



const path =
`../works/${work}/${chapter}/metadata.json`;



const response =
await fetch(path);



comicData =
await response.json();



document.title =
comicData.title.zh;



document.getElementById(
"comic-title"
).innerHTML =
comicData.title.zh;



document.getElementById(
"chapter-title"
).innerHTML =
comicData.chapter.zh;



if(comicData.direction==="rtl"){

container.classList.add("rtl");

}



loadProgress();


render();


}



function render(){


container.innerHTML="";


if(singleMode){

renderSingle();

}

else{

renderLong();

}


}



function renderLong(){


for(
let i=1;
i<=comicData.pages;
i++
){


let img =
createImage(i);


container.appendChild(img);


}

}



function renderSingle(){


container.className="single-page";


let img =
createImage(currentPage);


container.appendChild(img);


}



function createImage(number){


let img =
document.createElement("img");


let filename =
String(number)
.padStart(2,"0")
+".png";



img.src =
`../works/${work}/${chapter}/${comicData.path}${filename}`;



img.loading="lazy";



img.onclick=function(){


if(singleMode){

nextPage();

}

};



return img;

}




function nextPage(){


if(currentPage < comicData.pages){

currentPage++;

saveProgress();

render();

}

}



function previousPage(){


if(currentPage>1){

currentPage--;

saveProgress();

render();

}

}



function saveProgress(){


localStorage.setItem(

`${work}-${chapter}`,

currentPage

);


}



function loadProgress(){


let saved =
localStorage.getItem(
`${work}-${chapter}`
);



if(saved){

currentPage =
Number(saved);

}

}




document
.getElementById(
"toggle-mode"
)
.onclick=function(){


singleMode=!singleMode;


this.innerHTML =
singleMode?
"单页模式":
"长条模式";


render();


};




document
.getElementById(
"fullscreen"
)
.onclick=function(){


document.documentElement
.requestFullscreen();

};





document.addEventListener(
"keydown",
function(e){


if(e.key==="ArrowRight"){

previousPage();

}



if(e.key==="ArrowLeft"){

nextPage();

}



});



loadComic();
