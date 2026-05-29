const { applySavedTheme, toggleTheme, showState, exportCsv } = window.DemoShared;

let store = null;
let productionChart = null;
let volumeChart = null;
let activePeriod = "7d";
let activeLang = "pt-BR";
const STATE_IDS = ["state-loading", "state-empty", "state-error"];
const I18N = {
  "pt-BR": { dark: "Tema escuro", light: "Tema claro", export: "Exportar CSV", reload: "Atualizar" },
  "en-US": { dark: "Dark theme", light: "Light theme", export: "Export CSV", reload: "Refresh" }
};
const FALLBACK_DATA = {
  periods: {
    "7d": {
      kpis: {
        ordersToday: { value: 128, sub: "+12% em relação a ontem", type: "up" },
        pending: { value: 14, sub: "7 críticas aguardando ação", type: "warn" },
        tma: { value: "5,2", sub: "Tempo médio de atendimento", type: "neutral" },
        service24h: { value: 243, sub: "SLA dentro da meta", type: "up" }
      },
      productionLabels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      productionSeries: [22, 30, 45, 38, 50, 48, 55],
      volumeLabels: ["Atendimento", "Financeiro", "Comercial"],
      volumeSeries: [120, 80, 95],
      activities: [
        { date: "29/05/2026 14:22", operation: "Atualização de cadastro", status: "Concluído" },
        { date: "29/05/2026 13:11", operation: "Agendamento", status: "Pendente" },
        { date: "29/05/2026 11:48", operation: "Geração de relatório", status: "Concluído" }
      ]
    }
  }
};

function setKpi(id, kpi) {
  document.getElementById(id).textContent = kpi.value;
  const sub = document.getElementById(`${id}-sub`);
  sub.textContent = kpi.sub;
  sub.className = "kpi-sub";
  if (kpi.type === "up") sub.classList.add("kpi-up");
  if (kpi.type === "warn") sub.classList.add("kpi-warn");
}

function renderTable(activities) {
  const tbody = document.getElementById("activities-body");
  tbody.innerHTML = "";
  for (const item of activities) {
    const statusClass = item.status === "Concluído" ? "ok" : "pendente";
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.date}</td><td>${item.operation}</td><td><span class="status ${statusClass}">${item.status}</span></td>`;
    tbody.appendChild(row);
  }
}

function renderCharts(periodData) {
  const lineCtx = document.getElementById("graficoLinha");
  const barCtx = document.getElementById("graficoBarras");
  if (productionChart) productionChart.destroy();
  if (volumeChart) volumeChart.destroy();

  productionChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: periodData.productionLabels,
      datasets: [{
        data: periodData.productionSeries,
        borderWidth: 2.5,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,.15)",
        fill: true,
        tension: 0.3
      }]
    },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  volumeChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: periodData.volumeLabels,
      datasets: [{
        data: periodData.volumeSeries,
        borderWidth: 1,
        backgroundColor: ["#2563eb", "#16a34a", "#9333ea"]
      }]
    },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

function renderPeriod(period) {
  const periodData = store?.periods?.[period] || store?.periods?.["7d"];
  if (!periodData) {
    showState("state-empty", STATE_IDS);
    return;
  }
  showState(null, STATE_IDS);
  setKpi("kpi-orders", periodData.kpis.ordersToday);
  setKpi("kpi-pending", periodData.kpis.pending);
  setKpi("kpi-tma", periodData.kpis.tma);
  setKpi("kpi-service", periodData.kpis.service24h);
  renderTable(periodData.activities);
  renderCharts(periodData);
  document.querySelectorAll(".period-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.period === period));
  activePeriod = period;
}

async function loadData() {
  showState("state-loading", STATE_IDS);
  try {
    if (window.location.protocol === "file:") {
      store = FALLBACK_DATA;
      renderPeriod("7d");
      return;
    }
    const res = await fetch("./data/operational-data.json");
    if (!res.ok) throw new Error("Falha ao carregar JSON");
    store = await res.json();
    renderPeriod(activePeriod);
  } catch (e) {
    console.warn("Usando fallback local por falha no fetch:", e);
    store = FALLBACK_DATA;
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
    const activities = store?.periods?.[activePeriod]?.activities || store?.periods?.["7d"]?.activities || [];
    exportCsv("atividades-operacionais.csv", ["Data", "Operacao", "Status"], activities.map((a) => [a.date, a.operation, a.status]));
  });
  document.getElementById("lang-select").addEventListener("change", (e) => {
    activeLang = e.target.value;
    const t = I18N[activeLang] || I18N["pt-BR"];
    document.getElementById("theme-toggle").textContent = (document.documentElement.getAttribute("data-theme") === "dark") ? t.light : t.dark;
    document.getElementById("reload-data").textContent = t.reload;
    document.getElementById("export-csv").textContent = t.export;
  });
  document.querySelectorAll(".period-btn").forEach((btn) => btn.addEventListener("click", () => renderPeriod(btn.dataset.period)));
}

function initThemeLabel() {
  const mode = applySavedTheme();
  const t = I18N[activeLang] || I18N["pt-BR"];
  document.getElementById("theme-toggle").textContent = mode === "dark" ? t.light : t.dark;
  document.getElementById("reload-data").textContent = t.reload;
  document.getElementById("export-csv").textContent = t.export;
}

initThemeLabel();
initEvents();
loadData();
