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
addLog("hint: press 1-4 to navigate");
