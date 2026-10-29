"use strict";
const $ = (id) => document.getElementById(id);
const presets = [
{name:"Snow",detail:"Soft and quiet",background:"#F0F0EC",accent:"#8D948B",text:"#292B28"},
{name:"Graphite",detail:"Monochrome",background:"#30312F",accent:"#C5C6BF",text:"#F1F0EA"},
{name:"Sage",detail:"Natural calm",background:"#E3E8DE",accent:"#71866B",text:"#263126"},
{name:"Sand",detail:"Warm minimal",background:"#E9DDCC",accent:"#A77852",text:"#3B3028"},
{name:"Blush",detail:"Soft pink",background:"#F2E4E3",accent:"#C18E91",text:"#402F33"},
{name:"Ocean",detail:"Cool blue",background:"#DFE9ED",accent:"#638A9A",text:"#23343C"},
{name:"Lavender",detail:"Muted purple",background:"#E9E3F0",accent:"#9381B1",text:"#342C40"},
{name:"Midnight",detail:"Deep contrast",background:"#171B22",accent:"#8CA9D6",text:"#F0F3F9"}
];
const STORAGE_KEY="minimal-studio-themes-v1", MODE_KEY="minimal-studio-mode-v1";
let wallpaperData="", selectedPreset="", savedThemes=readSavedThemes();
function readSavedThemes(){try{const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(data)?data:[]}catch{return[]}}
function currentTheme(){return{id:globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random().toString(16).slice(2),name:$("themeName").value.trim()||"Untitled Theme",background:$("backgroundColor").value,accent:$("accentColor").value,text:$("textColor").value,wallpaper:wallpaperData,updatedAt:new Date().toISOString()}}
function setStatus(message){$("statusMessage").textContent=message}
function setColor(inputId,hexId,value){$(inputId).value=value;$(hexId).textContent=value.toUpperCase()}
function updatePreview(){
 const theme=currentTheme(),phone=$("phonePreview");
 phone.style.setProperty("--wallpaper",theme.background);phone.style.setProperty("--phone-accent",theme.accent);phone.style.setProperty("--phone-ink",theme.text);
 phone.style.backgroundColor=theme.background;
 phone.style.backgroundImage=wallpaperData?`linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.05)),url("${wallpaperData}")`:"none";
 $("backgroundHex").textContent=theme.background.toUpperCase();$("accentHex").textContent=theme.accent.toUpperCase();$("textHex").textContent=theme.text.toUpperCase();
 document.querySelectorAll(".preset-card").forEach(card=>card.classList.toggle("selected",card.dataset.name===selectedPreset));
}
function applyTheme(theme){
 $("themeName").value=theme.name||"My Theme";
 setColor("backgroundColor","backgroundHex",theme.background||"#E9E7E0");setColor("accentColor","accentHex",theme.accent||"#75816A");setColor("textColor","textHex",theme.text||"#252722");
 wallpaperData=theme.wallpaper||"";
 selectedPreset=presets.find(p=>p.background.toLowerCase()===theme.background.toLowerCase()&&p.accent.toLowerCase()===theme.accent.toLowerCase()&&p.text.toLowerCase()===theme.text.toLowerCase())?.name||"";
 $("removeWallpaper").classList.toggle("hidden",!wallpaperData);updatePreview();
}
function renderPresets(){
 const grid=$("presetGrid");grid.replaceChildren();
 presets.forEach(preset=>{
  const button=document.createElement("button");button.type="button";button.className="preset-card";button.dataset.name=preset.name;button.setAttribute("aria-label",`Use ${preset.name} theme`);
  const swatch=document.createElement("div");swatch.className="swatch-preview";swatch.style.background=preset.background;
  const line1=document.createElement("span");line1.className="swatch-line";line1.style.background=preset.text;
  const line2=document.createElement("span");line2.className="swatch-line short";line2.style.background=preset.accent;swatch.append(line1,line2);
  const name=document.createElement("span");name.className="preset-name";name.textContent=preset.name;
  const detail=document.createElement("span");detail.className="preset-detail";detail.textContent=preset.detail;
  button.append(swatch,name,detail);button.addEventListener("click",()=>{applyTheme({...preset,name:preset.name,wallpaper:""});selectedPreset=preset.name;updatePreview();setStatus(`${preset.name} theme selected.`)});grid.append(button);
 });
}
function renderSavedThemes(){
 const grid=$("savedThemes");grid.replaceChildren();$("savedCount").textContent=`${savedThemes.length} SAVED`;
 if(!savedThemes.length){const empty=document.createElement("div");empty.className="empty-state";empty.textContent="Your collection starts here. Create a look and save your first theme.";grid.append(empty);return}
 savedThemes.forEach(theme=>{
  const card=document.createElement("article");card.className="saved-card";
  const preview=document.createElement("div");preview.className="saved-preview";preview.style.backgroundColor=theme.background;preview.style.backgroundImage=theme.wallpaper?`url("${theme.wallpaper}")`:`linear-gradient(135deg, ${theme.background}, ${theme.accent})`;preview.style.backgroundSize="cover";preview.style.backgroundPosition="center";
  const name=document.createElement("div");name.className="saved-title";name.textContent=theme.name;
  const actions=document.createElement("div");actions.className="saved-actions";
  const load=document.createElement("button");load.className="small-button";load.type="button";load.textContent="Open";load.addEventListener("click",()=>{applyTheme(theme);setStatus(`Loaded "${theme.name}".`);$("themeName").scrollIntoView({behavior:"smooth",block:"center"})});
  const remove=document.createElement("button");remove.className="small-button";remove.type="button";remove.textContent="Delete";remove.addEventListener("click",()=>{savedThemes=savedThemes.filter(item=>item.id!==theme.id);if(persistThemes()){renderSavedThemes();setStatus(`Deleted "${theme.name}".`)}});
  actions.append(load,remove);card.append(preview,name,actions);grid.append(card);
 });
}
function persistThemes(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(savedThemes));return true}catch{setStatus("Storage is full. Try a smaller wallpaper or delete saved themes.");return false}}
function saveTheme(){
 const theme=currentTheme(),index=savedThemes.findIndex(item=>item.name.toLowerCase()===theme.name.toLowerCase());
 if(index>=0){theme.id=savedThemes[index].id;savedThemes[index]=theme}else savedThemes.unshift(theme);
 if(persistThemes()){renderSavedThemes();setStatus(`"${theme.name}" saved on this device.`)}
}
function importWallpaper(file){
 if(!file)return;if(!file.type.startsWith("image/")){setStatus("Please choose an image file.");return}
 if(file.size>4*1024*1024){setStatus("Choose an image smaller than 4 MB for easier saving.");return}
 const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{
  const maxDimension=1600,scale=Math.min(1,maxDimension/Math.max(image.width,image.height)),canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
  const ctx=canvas.getContext("2d");ctx.drawImage(image,0,0,canvas.width,canvas.height);wallpaperData=canvas.toDataURL("image/jpeg",.82);
  $("removeWallpaper").classList.remove("hidden");updatePreview();setStatus("Wallpaper imported. Save your theme to keep it.");
 };image.onerror=()=>setStatus("That image could not be opened.");image.src=reader.result};reader.onerror=()=>setStatus("Unable to read that image.");reader.readAsDataURL(file)
}
function exportWallpaper(){
 const theme=currentTheme(),canvas=document.createElement("canvas");canvas.width=1170;canvas.height=2532;const ctx=canvas.getContext("2d");
 ctx.fillStyle=theme.background;ctx.fillRect(0,0,canvas.width,canvas.height);
 function finishExport(){
  ctx.fillStyle=theme.accent;ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(930,400,500,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle=theme.text;ctx.globalAlpha=.8;ctx.font="500 28px sans-serif";ctx.fillText("A LITTLE SPACE TO BREATHE.",78,210);ctx.globalAlpha=1;
  canvas.toBlob(blob=>{if(!blob){setStatus("Could not export the wallpaper.");return}const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=`${theme.name.replace(/[^a-z0-9_-]/gi,"-")}-wallpaper.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);setStatus("Wallpaper exported. Open it and save it to Photos.")},"image/png")
 }
 if(wallpaperData){const image=new Image();image.onload=()=>{const scale=Math.max(canvas.width/image.width,canvas.height/image.height),width=image.width*scale,height=image.height*scale;ctx.save();ctx.beginPath();ctx.rect(0,0,canvas.width,canvas.height);ctx.clip();ctx.drawImage(image,(canvas.width-width)/2,(canvas.height-height)/2,width,height);ctx.restore();finishExport()};image.onerror=()=>setStatus("Could not export that wallpaper. Try importing it again.");image.src=wallpaperData}else finishExport()
}
function toggleDarkMode(){document.body.classList.toggle("dark");const isDark=document.body.classList.contains("dark");try{localStorage.setItem(MODE_KEY,isDark?"dark":"light")}catch{}$("modeButton").setAttribute("aria-label",isDark?"Switch to light mode":"Switch to dark mode")}
function updateClock(){const now=new Date();$("previewClock").textContent=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:true});$("previewDate").textContent=now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase()}
["backgroundColor","accentColor","textColor"].forEach(id=>$(id).addEventListener("input",()=>{selectedPreset="";updatePreview()}));
$("themeName").addEventListener("input",updatePreview);$("wallpaperInput").addEventListener("change",event=>{importWallpaper(event.target.files?.[0]);event.target.value=""});
$("removeWallpaper").addEventListener("click",()=>{wallpaperData="";$("removeWallpaper").classList.add("hidden");updatePreview();setStatus("Wallpaper removed.")});
$("saveButton").addEventListener("click",saveTheme);$("exportButton").addEventListener("click",exportWallpaper);$("modeButton").addEventListener("click",toggleDarkMode);
try{if(localStorage.getItem(MODE_KEY)==="dark")document.body.classList.add("dark")}catch{}
renderPresets();renderSavedThemes();updatePreview();updateClock();setInterval(updateClock,30000);
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
