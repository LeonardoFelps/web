const { applySavedTheme, toggleTheme, currencyBRL, showState, exportCsv } = window.DemoShared;

const PERIODS = ["7d", "30d", "90d"];
let dataStore = null;
let revenueChart = null;
let statusChart = null;
let activePeriod = "7d";
let activeLang = "pt-BR";

const STATE_IDS = ["state-loading", "state-empty", "state-error"];
const I18N = {
  "pt-BR": { title: "Visão Executiva", reload: "Atualizar", export: "Exportar CSV", dark: "Tema escuro", light: "Tema claro" },
  "en-US": { title: "Executive Overview", reload: "Refresh", export: "Export CSV", dark: "Dark theme", light: "Light theme" }
};
const FALLBACK_DATA = {
  periods: {
    "7d": {
      metrics: {
        activeClients: { value: 1245, deltaText: "+6,2% no período", deltaType: "up" },
        revenue: { value: 32500, deltaText: "+18,0%", deltaType: "up" },
        closedOrders: { value: 384, deltaText: "meta: 420", deltaType: "neutral" },
        avgTicket: { value: 248, deltaText: "-2,1%", deltaType: "down" }
      },
      revenueLabels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      revenueSeries: [12000, 15000, 14000, 18000, 22000, 25000, 26800],
      statusBase: { active: 75, inactive: 25 },
      channels: [
        { name: "Indicação", leads: 124, conversion: "38%", revenue: "R$ 9.820" },
        { name: "Google", leads: 96, conversion: "29%", revenue: "R$ 7.120" },
        { name: "Instagram", leads: 87, conversion: "22%", revenue: "R$ 5.340" }
      ]
    }
  }
};

function setMetric(id, metric, formatter = (v) => v) {
  document.getElementById(id).textContent = formatter(metric.value);
  const sub = document.getElementById(`${id}-sub`);
  sub.textContent = metric.deltaText;
  sub.className = "small";
  if (metric.deltaType === "up") sub.classList.add("text-success");
  if (metric.deltaType === "down") sub.classList.add("text-danger");
  if (metric.deltaType === "neutral") sub.classList.add("text-muted");
}

function renderChannels(channels) {
  const tbody = document.getElementById("channels-body");
  tbody.innerHTML = "";
  for (const ch of channels) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${ch.name}</td><td>${ch.leads}</td><td>${ch.conversion}</td><td>${ch.revenue}</td>`;
    tbody.appendChild(row);
  }
}

function applyLanguage() {
  const t = I18N[activeLang] || I18N["pt-BR"];
  document.getElementById("title-main").textContent = t.title;
  document.getElementById("reload-data").textContent = t.reload;
  document.getElementById("export-csv").textContent = t.export;
  const isDark = (document.documentElement.getAttribute("data-theme") || "light") === "dark";
  document.getElementById("theme-toggle").textContent = isDark ? t.light : t.dark;
}

function renderCharts(periodData) {
  const revenueCtx = document.getElementById("graficoVendas");
  const statusCtx = document.getElementById("graficoUsuarios");

  if (revenueChart) revenueChart.destroy();
  if (statusChart) statusChart.destroy();

  revenueChart = new Chart(revenueCtx, {
    type: "line",
    data: {
      labels: periodData.revenueLabels,
      datasets: [{
        data: periodData.revenueSeries,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,.16)",
        tension: 0.35,
        pointRadius: 3,
        fill: true
      }]
    },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  statusChart = new Chart(statusCtx, {
    type: "doughnut",
    data: {
      labels: ["Ativos", "Inativos"],
      datasets: [{ data: [periodData.statusBase.active, periodData.statusBase.inactive], backgroundColor: ["#22c55e", "#e5e7eb"] }]
    },
    options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
  });
}

function renderPeriod(period) {
  const periodData = dataStore?.periods?.[period] || dataStore?.periods?.["7d"];
  if (!periodData) {
    showState("state-empty", STATE_IDS);
    return;
  }
  showState(null, STATE_IDS);
  setMetric("metric-clients", periodData.metrics.activeClients, (v) => new Intl.NumberFormat("pt-BR").format(v));
  setMetric("metric-revenue", periodData.metrics.revenue, currencyBRL);
  setMetric("metric-orders", periodData.metrics.closedOrders, (v) => new Intl.NumberFormat("pt-BR").format(v));
  setMetric("metric-ticket", periodData.metrics.avgTicket, currencyBRL);
  renderChannels(periodData.channels);
  renderCharts(periodData);
  document.querySelectorAll(".period-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.period === period));
  activePeriod = period;
}

async function loadData() {
  showState("state-loading", STATE_IDS);
  try {
    if (window.location.protocol === "file:") {
      dataStore = FALLBACK_DATA;
      renderPeriod("7d");
      return;
    }
    const res = await fetch("./data/executive-data.json");
    if (!res.ok) throw new Error("Falha ao carregar JSON");
    dataStore = await res.json();
    renderPeriod(activePeriod);
  } catch (err) {
    console.warn("Usando fallback local por falha no fetch:", err);
    dataStore = FALLBACK_DATA;
    renderPeriod("7d");
  }
}

function initEvents() {
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const mode = toggleTheme();
    const t = I18N[activeLang] || I18N["pt-BR"];
    document.getElementById("theme-toggle").textContent = mode === "dark" ? t.light : t.dark;
  });
  document.getElementById("reload-data").addEventListener("click", loadData);
  document.getElementById("export-csv").addEventListener("click", () => {
    const channels = dataStore?.periods?.[activePeriod]?.channels || dataStore?.periods?.["7d"]?.channels || [];
    exportCsv("canais-aquisicao.csv", ["Canal", "Leads", "Conversao", "Receita"], channels.map((c) => [c.name, c.leads, c.conversion, c.revenue]));
  });
  document.getElementById("lang-select").addEventListener("change", (e) => {
    activeLang = e.target.value;
    applyLanguage();
  });
  document.querySelectorAll(".period-btn").forEach((btn) => {
    btn.addEventListener("click", () => renderPeriod(btn.dataset.period));
  });
}

function initThemeLabel() {
  const mode = applySavedTheme();
  const t = I18N[activeLang] || I18N["pt-BR"];
  document.getElementById("theme-toggle").textContent = mode === "dark" ? t.light : t.dark;
}

initThemeLabel();
applyLanguage();
initEvents();
loadData();
