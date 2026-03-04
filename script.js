const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

const tabs = $$(".tab[data-panel]");
const panelsWrap = $("#panels");
const panels = $$(".panel", panelsWrap);
const panelTitle = $("#panelTitle");
const typed = $("#typed");
const pingEl = $("#ping");
const year = $("#year");
const logEl = $("#log");
const statusEl = $("#status");
const activityHint = $("#activityHint");
const toasts = $("#toasts");

year.textContent = new Date().getFullYear();

const state = {
  active: "home",
  theme: localStorage.getItem("theme") || "green"
};

function nowStamp(){
  const d = new Date();
  return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}

function addLog(msg){
  const li = document.createElement("li");
  li.innerHTML = `<span class="ts">${nowStamp()}</span><span class="msg">${escapeHtml(msg)}</span>`;
  logEl.prepend(li);
  if (logEl.children.length > 6) logEl.lastElementChild.remove();
}

function toast(title, body){
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <div class="toastHead">
      <div class="toastTitle">${escapeHtml(title)}</div>
      <button class="toastClose" aria-label="Close">x</button>
    </div>
    <div class="toastBody">${escapeHtml(body)}</div>
  `;
  const close = $(".toastClose", el);
  close.addEventListener("click", () => el.remove());
  toasts.appendChild(el);
  setTimeout(() => { if (el.isConnected) el.remove(); }, 4200);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function setTheme(t){
  state.theme = t;
  document.documentElement.dataset.theme = (t === "blue") ? "blue" : "green";
  localStorage.setItem("theme", state.theme);
  addLog(`theme set → ${t}`);
}

setTheme(state.theme);

function setActive(panel){
  if (panel === state.active) return;

  const prev = state.active;
  state.active = panel;

  // tabs
  tabs.forEach(b => b.classList.toggle("isActive", b.dataset.panel === panel));

  // panels (slide)
  panels.forEach(p => p.classList.toggle("isActive", p.dataset.panel === panel));

  panelTitle.textContent = titleCase(panel);

  // typing header changes per panel
  runTypingFor(panel);

  addLog(`switched: ${prev} → ${panel}`);
}

function titleCase(s){
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// click handlers
tabs.forEach(btn => {
  btn.addEventListener("click", () => setActive(btn.dataset.panel));
});

$("#themeBtn").addEventListener("click", () => {
  setTheme(state.theme === "blue" ? "green" : "blue");
  toast("Theme", `Switched to ${state.theme}`);
});

// keyboard shortcuts
window.addEventListener("keydown", (e) => {
  if (["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)) return;

  if (e.key === "1") setActive("home");
  if (e.key === "2") setActive("projects");
  if (e.key === "3") setActive("about");
  if (e.key === "4") setActive("contact");
  if (e.key.toLowerCase() === "t") {
    setTheme(state.theme === "blue" ? "green" : "blue");
    toast("Theme", `Switched to ${state.theme}`);
  }
});

// fake ping
function updatePing(){
  const v = Math.floor(8 + Math.random()*52);
  pingEl.textContent = `${v}ms`;
}
updatePing();
setInterval(updatePing, 1800);

// typing effect
let typeTimer = null;
let blinkTimer = null;

const panelCmds = {
  home: "echo 'welcome back' && ./run --status",
  projects: "ls -la ./projects && ./deploy --preview",
  about: "cat ./about.txt | less",
  contact: "open mailto:you@example.com"
};

function runTypingFor(panel){
  clearTimeout(typeTimer);
  if (blinkTimer) clearInterval(blinkTimer);

  const text = panelCmds[panel] || "echo 'hi'";
  typed.textContent = "";

  let i = 0;
  const speed = 22 + Math.random()*18;

  const tick = () => {
    typed.textContent = text.slice(0, i);
    i++;
    if (i <= text.length) {
      typeTimer = setTimeout(tick, speed);
    }
  };
  tick();
}
runTypingFor(state.active);

// buttons
$("#checkBtn")?.addEventListener("click", async () => {
  statusEl.textContent = "RUNNING…";
  activityHint.textContent = "checking…";
  addLog("run check initiated");
  await sleep(650);
  const ok = Math.random() > 0.15;
  statusEl.textContent = ok ? "OK" : "WARN";
  activityHint.textContent = ok ? "done ✅" : "needs attention ⚠️";
  toast(ok ? "Check complete" : "Warning", ok ? "All systems look good." : "One module returned WARN.");
  addLog(ok ? "check complete: OK" : "check complete: WARN");
});

$("#toastBtn")?.addEventListener("click", () => {
  toast("Hey", "This is a clean toast notification 🙂");
});

$("#copyBtn")?.addEventListener("click", async () => {
  const text = panelCmds[state.active] || "";
  try{
    await navigator.clipboard.writeText(text);
    toast("Copied", "Command copied to clipboard.");
    addLog("copied command to clipboard");
  }catch{
    toast("Copy failed", "Clipboard blocked by browser permissions.");
    addLog("copy failed (permissions)");
  }
});

$$("[data-open]").forEach(btn => {
  btn.addEventListener("click", () => {
    const url = btn.getAttribute("data-open");
    window.open(url, "_blank", "noopener,noreferrer");
  });
});

$("#fakeDeploy")?.addEventListener("click", async () => {
  toast("Deploy", "Starting simulated deploy…");
  addLog("deploy started");
  await sleep(700);
  toast("Deploy", "Build step…");
  await sleep(650);
  toast("Deploy", "Deploy complete ✅");
  addLog("deploy complete");
});

$("#clearBtn")?.addEventListener("click", () => {
  $("#name").value = "";
  $("#msg").value = "";
  toast("Cleared", "Form cleared.");
});

$("#contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#name").value.trim();
  const msg = $("#msg").value.trim();
  toast("Sent", `Thanks ${name || "!"} — message queued (demo).`);
  addLog(`contact form submitted (${(name||"anon")})`);
  $("#msg").value = "";
});

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

// first boot log
addLog("boot: terminal UI ready");
addLog("hint: press 1-4 to navigate");const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

const tabs = $$(".tab[data-panel]");
const panelsWrap = $("#panels");
const panels = $$(".panel", panelsWrap);
const panelTitle = $("#panelTitle");
const typed = $("#typed");
const pingEl = $("#ping");
const year = $("#year");
const logEl = $("#log");
const statusEl = $("#status");
const activityHint = $("#activityHint");
const toasts = $("#toasts");

const portal = $("#portal");
const cmdk = $("#cmdk");
const cmdkInput = $("#cmdkInput");
const cmdkHints = $("#cmdkHints");

year.textContent = new Date().getFullYear();

const LINKS = [
  { name: "X (Twitter)", url: "https://x.com/CCT4N" },
  { name: "YouTube",     url: "https://www.youtube.com/@Chipxjzzz" },
  { name: "Twitch",      url: "https://www.twitch.tv/chipsxjz" },
  { name: "TikTok",      url: "https://www.tiktok.com/@trxzp.zq" },
];

const state = {
  active: "home",
  theme: localStorage.getItem("theme") || "green",
  transitions: localStorage.getItem("transitions") ?? "on",
  fx: localStorage.getItem("fx") ?? "on",
  sounds: localStorage.getItem("sounds") ?? "off",
  focus: localStorage.getItem("focus") ?? "off",
  matrix: localStorage.getItem("matrix") ?? "off",
  tstyle: localStorage.getItem("tstyle") || "slide",
  tspeed: Number(localStorage.getItem("tspeed") || 35),
  perf: localStorage.getItem("perf") || "normal",
};

function nowStamp(){
  const d = new Date();
  return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}

function addLog(msg){
  if (!logEl) return;
  const li = document.createElement("li");
  li.innerHTML = `<span class="ts">${nowStamp()}</span><span class="msg">${escapeHtml(msg)}</span>`;
  logEl.prepend(li);
  if (logEl.children.length > 8) logEl.lastElementChild.remove();
}

function toast(title, body){
  if (!toasts) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <div class="toastHead">
      <div class="toastTitle">${escapeHtml(title)}</div>
      <button class="toastClose" aria-label="Close">x</button>
    </div>
    <div class="toastBody">${escapeHtml(body)}</div>
  `;
  $(".toastClose", el).addEventListener("click", () => el.remove());
  toasts.appendChild(el);
  setTimeout(() => { if (el.isConnected) el.remove(); }, 4200);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function setTheme(t){
  state.theme = t;
  document.documentElement.dataset.theme = (t === "blue") ? "blue" : "green";
  localStorage.setItem("theme", state.theme);
  addLog(`theme set → ${t}`);
}

function applyToolsToDOM(){
  const root = document.documentElement;
  root.dataset.transitions = state.transitions; // on/off
  root.dataset.fx = state.fx; // on/off
  root.dataset.focus = state.focus; // on/off
  root.dataset.tstyle = state.tstyle; // slide/fade/zoom/glitch
  root.dataset.perf = state.perf; // normal/fast/ultra
  root.style.setProperty("--tspeed", (state.tspeed/100).toFixed(2) + "s");
}

function saveTools(){
  localStorage.setItem("transitions", state.transitions);
  localStorage.setItem("fx", state.fx);
  localStorage.setItem("sounds", state.sounds);
  localStorage.setItem("focus", state.focus);
  localStorage.setItem("matrix", state.matrix);
  localStorage.setItem("tstyle", state.tstyle);
  localStorage.setItem("tspeed", String(state.tspeed));
  localStorage.setItem("perf", state.perf);
}

function clickSound(){
  if (state.sounds !== "on") return;
  // tiny click using WebAudio (no file needed)
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 880;
    g.gain.value = 0.04;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 35);
  }catch{}
}

function ensureMatrix(){
  let m = $(".matrix");
  if (!m){
    m = document.createElement("div");
    m.className = "matrix";
    document.body.appendChild(m);
  }
  m.classList.toggle("on", state.matrix === "on");
}

function portalTransitionThen(fn){
  if (!portal || state.transitions !== "on") return fn();
  portal.classList.add("on");
  setTimeout(() => fn(), 180);
  setTimeout(() => portal.classList.remove("on"), 520);
}

function setActive(panel){
  if (panel === state.active) return;

  const prev = state.active;
  state.active = panel;

  tabs.forEach(b => b.classList.toggle("isActive", b.dataset.panel === panel));
  panels.forEach(p => p.classList.toggle("isActive", p.dataset.panel === panel));

  if (panelTitle) panelTitle.textContent = titleCase(panel);
  runTypingFor(panel);

  addLog(`switched: ${prev} → ${panel}`);
}

function titleCase(s){
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// typing effect
let typeTimer = null;
const panelCmds = {
  home: "echo 'welcome back' && ./run --status",
  projects: "ls -la ./projects && ./deploy --preview",
  about: "cat ./about.txt | less",
  contact: "open mailto:you@example.com",
  links: "open ./links && ./open --socials",
};

function runTypingFor(panel){
  clearTimeout(typeTimer);
  const text = panelCmds[panel] || "echo 'hi'";
  if (!typed) return;
  typed.textContent = "";

  let i = 0;
  const speed = 18 + Math.random()*12;
  const tick = () => {
    typed.textContent = text.slice(0, i);
    i++;
    if (i <= text.length) typeTimer = setTimeout(tick, speed);
  };
  tick();
}

// fake ping
function updatePing(){
  if (!pingEl) return;
  const v = Math.floor(8 + Math.random()*52);
  pingEl.textContent = `${v}ms`;
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

// ===== Links panel rendering =====
function renderLinks(filter=""){
  const list = $("#linksList");
  const count = $("#linksCount");
  if (!list) return;

  const f = filter.trim().toLowerCase();
  const items = LINKS.filter(x =>
    !f || x.name.toLowerCase().includes(f) || x.url.toLowerCase().includes(f)
  );

  list.innerHTML = "";
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "linkItem";
    row.innerHTML = `
      <div class="linkLeft">
        <div class="linkName">${escapeHtml(item.name)}</div>
        <div class="linkUrl">${escapeHtml(item.url)}</div>
      </div>
      <div class="linkBtns">
        <button class="smBtn" data-open-link="${escapeHtml(item.url)}">Open</button>
        <button class="smBtn" data-copy-link="${escapeHtml(item.url)}">Copy</button>
      </div>
    `;
    list.appendChild(row);
  });

  if (count) count.textContent = `${items.length}/${LINKS.length}`;

  // wire buttons
  $$("[data-open-link]", list).forEach(btn => {
    btn.addEventListener("click", () => {
      clickSound();
      const url = btn.getAttribute("data-open-link");
      portalTransitionThen(() => window.open(url, "_blank", "noopener,noreferrer"));
      addLog(`open link → ${url}`);
    });
  });

  $$("[data-copy-link]", list).forEach(btn => {
    btn.addEventListener("click", async () => {
      clickSound();
      const url = btn.getAttribute("data-copy-link");
      try{
        await navigator.clipboard.writeText(url);
        toast("Copied", "Link copied.");
        addLog(`copied link`);
      }catch{
        toast("Copy failed", "Clipboard blocked.");
      }
    });
  });
}

// ===== Command palette =====
const CMD = [
  { k:"home", act: () => setActive("home") },
  { k:"projects", act: () => setActive("projects") },
  { k:"about", act: () => setActive("about") },
  { k:"contact", act: () => setActive("contact") },
  { k:"links", act: () => setActive("links") },
  { k:"theme", act: () => toggleTheme() },
  { k:"focus", act: () => toggleFocus() },
];

function openCmdk(){
  if (!cmdk) return;
  cmdk.classList.add("on");
  cmdk.setAttribute("aria-hidden", "false");
  cmdkInput.value = "";
  updateCmdkHints("");
  cmdkInput.focus();
}
function closeCmdk(){
  if (!cmdk) return;
  cmdk.classList.remove("on");
  cmdk.setAttribute("aria-hidden", "true");
}

function updateCmdkHints(q){
  if (!cmdkHints) return;
  const s = q.trim().toLowerCase();
  const hits = CMD.filter(x => !s || x.k.includes(s)).slice(0, 6);
  cmdkHints.innerHTML = hits.map(h => `• ${escapeHtml(h.k)}`).join("<br/>") || "• (no matches)";
}

function runCmd(q){
  const s = q.trim().toLowerCase();
  const found = CMD.find(x => x.k === s) || CMD.find(x => x.k.startsWith(s));
  if (found){
    clickSound();
    found.act();
    toast("Command", `Ran: ${found.k}`);
    addLog(`cmd: ${found.k}`);
  }else{
    toast("Command", "No match.");
  }
  closeCmdk();
}

// ===== tool toggles =====
function toggleTheme(){
  setTheme(state.theme === "blue" ? "green" : "blue");
  toast("Theme", `Switched to ${state.theme}`);
}

function toggleFocus(){
  state.focus = (state.focus === "on") ? "off" : "on";
  saveTools();
  applyToolsToDOM();
  toast("Focus mode", state.focus === "on" ? "On" : "Off");
  addLog(`focus → ${state.focus}`);
}

function wireToolsPanel(){
  const tTransitions = $("#toggleTransitions");
  const tFx = $("#toggleFx");
  const tSounds = $("#toggleSounds");
  const tFocus = $("#toggleFocus");
  const tMatrix = $("#toggleMatrix");
  const tStyle = $("#transitionStyle");
  const tSpeed = $("#transitionSpeed");
  const speedVal = $("#speedVal");
  const perfMode = $("#perfMode");

  if (tTransitions) tTransitions.checked = (state.transitions === "on");
  if (tFx) tFx.checked = (state.fx === "on");
  if (tSounds) tSounds.checked = (state.sounds === "on");
  if (tFocus) tFocus.checked = (state.focus === "on");
  if (tMatrix) tMatrix.checked = (state.matrix === "on");
  if (tStyle) tStyle.value = state.tstyle;
  if (tSpeed) tSpeed.value = String(state.tspeed);
  if (speedVal) speedVal.textContent = (state.tspeed/100).toFixed(2) + "s";
  if (perfMode) perfMode.value = state.perf;

  tTransitions?.addEventListener("change", () => {
    clickSound();
    state.transitions = tTransitions.checked ? "on" : "off";
    saveTools(); applyToolsToDOM();
    toast("Transitions", state.transitions === "on" ? "On" : "Off");
  });

  tFx?.addEventListener("change", () => {
    clickSound();
    state.fx = tFx.checked ? "on" : "off";
    saveTools(); applyToolsToDOM();
    toast("FX", state.fx === "on" ? "On" : "Off");
  });

  tSounds?.addEventListener("change", () => {
    state.sounds = tSounds.checked ? "on" : "off";
    saveTools();
    toast("Sounds", state.sounds === "on" ? "On" : "Off");
    clickSound();
  });

  tFocus?.addEventListener("change", () => {
    state.focus = tFocus.checked ? "on" : "off";
    saveTools(); applyToolsToDOM();
    toast("Focus mode", state.focus === "on" ? "On" : "Off");
    clickSound();
  });

  tMatrix?.addEventListener("change", () => {
    state.matrix = tMatrix.checked ? "on" : "off";
    saveTools();
    ensureMatrix();
    toast("Matrix", state.matrix === "on" ? "On" : "Off");
    clickSound();
  });

  tStyle?.addEventListener("change", () => {
    clickSound();
    state.tstyle = tStyle.value;
    saveTools(); applyToolsToDOM();
    toast("Transition style", state.tstyle);
    addLog(`tstyle → ${state.tstyle}`);
  });

  tSpeed?.addEventListener("input", () => {
    state.tspeed = Number(tSpeed.value);
    if (speedVal) speedVal.textContent = (state.tspeed/100).toFixed(2) + "s";
    saveTools(); applyToolsToDOM();
  });

  perfMode?.addEventListener("change", () => {
    clickSound();
    state.perf = perfMode.value;
    saveTools(); applyToolsToDOM();
    toast("Performance", state.perf);
    addLog(`perf → ${state.perf}`);
  });

  $("#testTransition")?.addEventListener("click", () => {
    clickSound();
    portalTransitionThen(() => toast("Transition", `Style: ${state.tstyle}, speed: ${(state.tspeed/100).toFixed(2)}s`));
  });

  $("#resetTools")?.addEventListener("click", () => {
    clickSound();
    Object.assign(state, {
      transitions:"on", fx:"on", sounds:"off", focus:"off", matrix:"off",
      tstyle:"slide", tspeed:35, perf:"normal",
    });
    saveTools();
    applyToolsToDOM();
    ensureMatrix();
    wireToolsPanel(); // refresh UI values
    toast("Reset", "Tools reset to defaults.");
    addLog("tools reset");
  });
}

// ===== existing button wiring (kept) =====
function wireExisting(){
  $("#themeBtn")?.addEventListener("click", () => toggleTheme());

  $("#checkBtn")?.addEventListener("click", async () => {
    clickSound();
    if (statusEl) statusEl.textContent = "RUNNING…";
    if (activityHint) activityHint.textContent = "checking…";
    addLog("run check initiated");
    await sleep(650);
    const ok = Math.random() > 0.15;
    if (statusEl) statusEl.textContent = ok ? "OK" : "WARN";
    if (activityHint) activityHint.textContent = ok ? "done ✅" : "needs attention ⚠️";
    toast(ok ? "Check complete" : "Warning", ok ? "All systems look good." : "One module returned WARN.");
    addLog(ok ? "check complete: OK" : "check complete: WARN");
  });

  $("#toastBtn")?.addEventListener("click", () => {
    clickSound();
    toast("Hey", "This is a clean toast notification 🙂");
  });

  $("#copyBtn")?.addEventListener("click", async () => {
    clickSound();
    const text = panelCmds[state.active] || "";
    try{
      await navigator.clipboard.writeText(text);
      toast("Copied", "Command copied to clipboard.");
      addLog("copied command to clipboard");
    }catch{
      toast("Copy failed", "Clipboard blocked by browser permissions.");
      addLog("copy failed (permissions)");
    }
  });

  $$("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      clickSound();
      const url = btn.getAttribute("data-open");
      portalTransitionThen(() => window.open(url, "_blank", "noopener,noreferrer"));
    });
  });

  $("#fakeDeploy")?.addEventListener("click", async () => {
    clickSound();
    toast("Deploy", "Starting simulated deploy…");
    addLog("deploy started");
    await sleep(700);
    toast("Deploy", "Build step…");
    await sleep(650);
    toast("Deploy", "Deploy complete ✅");
    addLog("deploy complete");
  });

  $("#clearBtn")?.addEventListener("click", () => {
    clickSound();
    $("#name").value = "";
    $("#msg").value = "";
    toast("Cleared", "Form cleared.");
  });

  $("#contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    clickSound();
    const name = $("#name").value.trim();
    toast("Sent", `Thanks ${name || "!"} — message queued (demo).`);
    addLog(`contact form submitted (${(name||"anon")})`);
    $("#msg").value = "";
  });
}

// ===== Links actions =====
function wireLinksActions(){
  $("#linkSearch")?.addEventListener("input", (e) => renderLinks(e.target.value));

  $("#openAllLinks")?.addEventListener("click", () => {
    clickSound();
    portalTransitionThen(() => {
      LINKS.forEach((l, i) => setTimeout(() => window.open(l.url, "_blank", "noopener,noreferrer"), i*120));
    });
    toast("Links", "Opening all…");
    addLog("open all links");
  });

  $("#copyAllLinks")?.addEventListener("click", async () => {
    clickSound();
    const text = LINKS.map(l => l.url).join("\n");
    try{
      await navigator.clipboard.writeText(text);
      toast("Copied", "All links copied.");
      addLog("copied all links");
    }catch{
      toast("Copy failed", "Clipboard blocked.");
    }
  });
}

// ===== navigation =====
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    clickSound();
    setActive(btn.dataset.panel);
  });
});

// keyboard shortcuts
window.addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName;
  const inField = ["INPUT","TEXTAREA","SELECT"].includes(tag);

  if (e.key === "/" && !inField){
    e.preventDefault();
    openCmdk();
    return;
  }
  if (e.key === "Escape"){
    closeCmdk();
  }
  if (inField) return;

  if (e.key === "1") setActive("home");
  if (e.key === "2") setActive("projects");
  if (e.key === "3") setActive("about");
  if (e.key === "4") setActive("contact");
  if (e.key === "5") setActive("links");
  if (e.key.toLowerCase() === "t") toggleTheme();
  if (e.key.toLowerCase() === "f") toggleFocus();
});

// command palette behavior
cmdkInput?.addEventListener("input", (e) => updateCmdkHints(e.target.value));
cmdkInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter"){
    runCmd(cmdkInput.value);
  }
});

// close cmdk by clicking background
cmdk?.addEventListener("click", (e) => {
  if (e.target === cmdk) closeCmdk();
});

// boot
setTheme(state.theme);
applyToolsToDOM();
ensureMatrix();
updatePing();
setInterval(updatePing, 1800);
runTypingFor(state.active);

renderLinks("");
wireExisting();
wireLinksActions();
wireToolsPanel();

addLog("boot: terminal UI ready");
addLog("hint: press 1-5 to navigate");
addLog("hint: press / for command palette");

// keep on-load active classes
tabs.forEach(b => b.classList.toggle("isActive", b.dataset.panel === state.active));
panels.forEach(p => p.classList.toggle("isActive", p.dataset.panel === state.active));
