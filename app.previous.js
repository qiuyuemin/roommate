const state = { phase: "idle", auto: false, timer: 0, program: "Manual control", volume: "4.5" };
const $ = (id) => document.getElementById(id);
let interval;

function render() {
  const active = ["manual", "expression", "program"].includes(state.phase);
  const expression = state.phase === "expression";
  const program = state.phase === "program";
  $("header-label").textContent = active ? "Session in progress" : "Connected";
  $("screen-title").textContent = active ? "Pump Control" : "Pump Control";
  $("mode-kicker").textContent = active ? (program ? "PROGRAM RUNNING" : expression ? "AUTO SWITCHED" : "MANUAL CONTROL") : "READY TO PUMP";
  $("mode-name").textContent = active ? (program ? "Milk Boost" : expression ? "Expression" : "Stimulation") : "Start your session";
  $("session-message").textContent = active ? (program ? "Milk Boost is following your selected rhythm." : expression ? "Let-down detected. Switched to expression." : "Gentle stimulation is helping you begin.") : "Your pumps are ready when you are.";
  $("timer").hidden = !active;
  $("timer").textContent = `00:${String(state.timer).padStart(2, "0")}`;
  $("auto-row").hidden = !active;
  $("levels").hidden = !active;
  $("auto-status").textContent = state.auto ? "On" : "Off";
  $("auto-switch").classList.toggle("on", state.auto);
  $("auto-switch").setAttribute("aria-pressed", state.auto);
  $("demo-action").hidden = !(state.phase === "manual" && state.auto);
  $("program-name").textContent = state.program;
  $("program-detail").textContent = program ? "Stimulation → Expression · 20:00" : "Control suction independently.";
  $("primary-action").textContent = state.phase === "idle" ? "Start pumping" : "Stop pumping";
}

function openModal(html) { $("modal-layer").className = "modal-layer active"; $("modal-layer").innerHTML = html; }
function closeModal() { $("modal-layer").className = "modal-layer"; $("modal-layer").innerHTML = ""; }
function startTimer() { clearInterval(interval); interval = setInterval(() => { state.timer += 1; render(); }, 1000); }
function stopTimer() { clearInterval(interval); }

function fitCheck() {
  openModal(`<section class="dialog"><div class="fit-ring"></div><p class="eyebrow">FIT CHECK</p><h3>Checking your fit</h3><p>Hold still while Air 2 checks both pumps.</p><div class="progress"><i></i></div></section>`);
  setTimeout(() => {
    $("modal-layer").innerHTML = `<section class="dialog"><div class="fit-ring success">✓</div><p class="eyebrow">FIT CHECK COMPLETE</p><h3>Great fit</h3><p>Your pumps are ready. Gentle stimulation has started.</p></section>`;
  }, 3000);
  setTimeout(() => { closeModal(); state.phase = "manual"; startTimer(); render(); }, 4300);
}

function chooseProgram() {
  openModal(`<section class="sheet"><p class="eyebrow">PROGRAMS</p><h3>Choose a program</h3><button class="sheet-item" data-program="Manual control"><span><strong>Manual control</strong><span>Control suction independently</span></span><b>›</b></button><button class="sheet-item" data-program="Milk Boost"><span><strong>Milk Boost</strong><span>Stimulation → Expression · 20 min</span></span><b>›</b></button><button class="sheet-item" data-program="Power Pumping"><span><strong>Power Pumping</strong><span>Intensive interval session · 45 min</span></span><b>›</b></button></section>`);
  document.querySelectorAll("[data-program]").forEach((button) => button.onclick = () => { state.program = button.dataset.program; state.phase = state.program === "Milk Boost" ? "program" : "manual"; closeModal(); render(); });
}

function saveMilk() {
  openModal(`<section class="dialog"><p class="eyebrow">SESSION COMPLETE</p><h3>Save your milk amount</h3><p>Update the amount collected in this session.</p><div class="save-input"><input id="volume-input" type="number" min="0" step="0.1" value="${state.volume}" autofocus><span>oz</span></div><button class="primary-button" id="save-session">Save session</button><button class="secondary-button" id="cancel-save">Cancel</button></section>`);
  $("cancel-save").onclick = closeModal;
  $("save-session").onclick = () => { state.volume = $("volume-input").value || "0"; showResult(); };
}

function showResult() {
  stopTimer();
  $("modal-layer").className = "modal-layer active";
  $("modal-layer").innerHTML = `<section class="result"><div><div class="result-mark">✓</div><p class="eyebrow">SESSION SAVED</p><h3>Nice work today</h3><strong>${state.volume} oz</strong><p>Added to your Air 2 pumping record.</p><button class="primary-button" id="finish-demo">Back to control</button></div></section>`;
  $("finish-demo").onclick = reset;
}

function reset() { stopTimer(); Object.assign(state, { phase: "idle", auto: false, timer: 0, program: "Manual control", volume: "4.5" }); closeModal(); render(); }

$("primary-action").onclick = () => state.phase === "idle" ? fitCheck() : saveMilk();
$("auto-switch").onclick = () => { state.auto = !state.auto; render(); };
$("simulate-letdown").onclick = () => { state.phase = "expression"; render(); };
$("open-programs").onclick = chooseProgram;
$("restart-demo").onclick = reset;
$("back-button").onclick = () => { if (state.phase !== "idle") { state.phase = "manual"; render(); } };
$("modal-layer").onclick = (event) => { if (event.target === $("modal-layer")) closeModal(); };
render();
