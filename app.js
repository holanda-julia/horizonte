// PROJETO HORIZONTE - CORE JS ENGINE
// Desenvolvido para Júlia Aragão

// Global state variables
let state = {
  config: {
    salary: 1600.90,
    carol: 450.00,
    naturaExtra: 150.00,
    fixedExpensesBeforeOct26: 450.00,
    fixedExpensesAfterOct26: 350.00,
    sporadicExpenses: 200.00
  },
  debts: {
    mila: 300.00,
    vitinho: 250.00,
    papis: 400.00,
    chica: 350.00,
    installment: 55.00 // R$ 50 to R$ 60
  },
  naturaOrders: [
    { id: 1, client: "Mariana Silva", product: "Perfume Kaiak", price: 149.90, date: "2026-06-15", status: "Entregue" },
    { id: 2, client: "Carlos Souza", product: "Creme TodoDia", price: 59.90, date: "2026-06-20", status: "Entregue" },
    { id: 3, client: "Ana Santos", product: "Desodorante Humor", price: 39.90, date: "2026-07-01", status: "Pendente" }
  ],
  victorGoals: [
    { id: 1, text: "Viagem de Fim de Ano (Praia)", completed: false },
    { id: 2, text: "Jantar Especial de Comemoração", completed: true }
  ],
  victorNotes: "Planejar a viagem com calma para dezembro de 2027.",
  careerNotes: "Gostaria de começar atendendo clientes de estética aos finais de semana para testar aceitação e aumentar a renda extra.",
  diary: {
    mood: [
      { id: 1, title: "Praia em Malta", url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=300&q=80" },
      { id: 2, title: "Estudo e Foco", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80" },
      { id: 3, title: "Independência Financeira", url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=300&q=80" }
    ],
    gratitude: [
      { id: 1, date: "Janeiro de 2026", text: "Consegui pagar a fatura menor sem atrasos." },
      { id: 2, date: "Fevereiro de 2026", text: "Fiz uma ótima comissão na Natura este mês." }
    ],
    learnings: "O Tesouro IPCA+ é excelente para o intercâmbio porque protege meu poder de compra contra a inflação nos próximos anos.",
    ideas: "Criar pacotes promocionais de depilação + design de sobrancelha para formandas e noivas."
  }
};

// Available exchange destinations details
const destinations = {
  Malta: { name: "Malta", flag: "🇲🇹", cost: 60000, duration: "6 meses", language: "Inglês", ease: "Fácil (Schengen)", desc: "Destino ensolarado na Europa, excelente custo-benefício para inglês." },
  Ireland: { name: "Irlanda", flag: "🇮🇪", cost: 75000, duration: "8 meses", language: "Inglês", ease: "Médio (Permite trabalhar)", desc: "Possibilidade de trabalhar meio período enquanto estuda." },
  CapeVerde: { name: "Cabo Verde", flag: "🇨🇻", cost: 35000, duration: "3 meses", language: "Português/Crioulo", ease: "Muito Fácil", desc: "Opção econômica e culturalmente rica na África." },
  SouthAfrica: { name: "África do Sul", flag: "🇿🇦", cost: 48000, duration: "6 meses", language: "Inglês", ease: "Fácil", desc: "Custo de vida muito baixo e cenários de tirar o fôlego." },
  Italy: { name: "Itália", flag: "🇮🇹", cost: 72000, duration: "6 meses", language: "Italiano", ease: "Médio", desc: "Imersão cultural e histórica no coração da Europa." },
  France: { name: "França", flag: "🇫🇷", cost: 85000, duration: "6 meses", language: "Francês", ease: "Médio", desc: "Estudos de alto padrão e vivência no idioma mais charmoso." }
};

// Charts variables
let cashflowChart = null;
let portfolioChart = null;

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  setupEventListeners();
  calculateAndRender();
  lucide.createIcons();
});

// Setup event listeners for tabs and buttons
function setupEventListeners() {
  // Sidebar navigation
  document.querySelectorAll(".chapter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetPage = btn.getAttribute("data-target");
      switchTab(targetPage);
    });
  });

  // Budget settings
  document.getElementById("btn-save-cfg").addEventListener("click", () => {
    state.config.salary = parseFloat(document.getElementById("cfg-salary").value) || 0;
    state.config.carol = parseFloat(document.getElementById("cfg-carol").value) || 0;
    state.config.naturaExtra = parseFloat(document.getElementById("cfg-natura-extra").value) || 0;
    state.config.fixedExpensesAfterOct26 = parseFloat(document.getElementById("cfg-fixed-expenses").value) || 0;
    state.config.sporadicExpenses = parseFloat(document.getElementById("cfg-sporadic-expenses").value) || 0;
    
    saveToLocalStorage();
    calculateAndRender();
    alert("Parâmetros do orçamento atualizados com sucesso!");
  });

  // Debts settings
  document.getElementById("btn-save-debts").addEventListener("click", () => {
    state.debts.mila = parseFloat(document.getElementById("debt-mila").value) || 0;
    state.debts.vitinho = parseFloat(document.getElementById("debt-vitinho").value) || 0;
    state.debts.papis = parseFloat(document.getElementById("debt-papis").value) || 0;
    state.debts.chica = parseFloat(document.getElementById("debt-chica").value) || 0;
    state.debts.installment = parseFloat(document.getElementById("debt-monthly-installment").value) || 55;

    saveToLocalStorage();
    calculateAndRender();
    alert("Configuração de dívidas atualizada!");
  });

  // slider for emergency fund
  const slider = document.getElementById("reserve-monthly-slider");
  if(slider) {
    slider.addEventListener("input", (e) => {
      document.getElementById("reserve-slider-val").textContent = `R$ ${e.target.value}`;
      updateReserveCalculations();
    });
  }

  // exchange selection
  const countrySelect = document.getElementById("intercambio-country-select");
  if(countrySelect) {
    countrySelect.addEventListener("change", updateExchangeSimulation);
  }
  const monthlySavingsInput = document.getElementById("intercambio-monthly-savings");
  if(monthlySavingsInput) {
    monthlySavingsInput.addEventListener("input", updateExchangeSimulation);
  }

  // career notes
  document.getElementById("btn-save-career-notes").addEventListener("click", () => {
    state.careerNotes = document.getElementById("career-notes").value;
    saveToLocalStorage();
    alert("Anotações de carreira salvas!");
  });

  // Shared Victor metier
  document.getElementById("btn-add-victor-goal").addEventListener("click", () => {
    const text = document.getElementById("victor-goal-input").value.trim();
    if(text) {
      state.victorGoals.push({ id: Date.now(), text, completed: false });
      document.getElementById("victor-goal-input").value = "";
      saveToLocalStorage();
      renderVictorGoals();
    }
  });

  document.getElementById("btn-save-victor-notes").addEventListener("click", () => {
    state.victorNotes = document.getElementById("victor-shared-notes").value;
    saveToLocalStorage();
    alert("Recados do Espaço Victor salvos!");
  });

  // Learnings/Ideas save
  document.getElementById("btn-save-learnings").addEventListener("click", () => {
    state.diary.learnings = document.getElementById("learnings-textarea").value;
    saveToLocalStorage();
    alert("Aprendizados salvos!");
  });
  document.getElementById("btn-save-ideas").addEventListener("click", () => {
    state.diary.ideas = document.getElementById("ideas-textarea").value;
    saveToLocalStorage();
    alert("Ideias salvas!");
  });

  // Backup Export
  document.getElementById("btn-export-backup").addEventListener("click", exportBackupData);
}

// Switch chapter active views
function switchTab(pageId) {
  document.querySelectorAll(".book-page").forEach(page => page.classList.remove("active"));
  document.querySelectorAll(".chapter-btn").forEach(btn => btn.classList.remove("active"));
  
  const targetPage = document.getElementById(pageId);
  if(targetPage) targetPage.classList.add("active");
  
  const targetBtn = document.querySelector(`.chapter-btn[data-target="${pageId}"]`);
  if(targetBtn) targetBtn.classList.add("active");
}

// Switch inner tabs in Chapter 12
function switchDiaryTab(tabName) {
  document.querySelectorAll(".diary-section").forEach(sec => sec.style.display = "none");
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  
  document.getElementById(`diary-${tabName}`).style.display = "block";
  
  // set tab active styles
  event.target.classList.add("active");
}

// Format numbers as currency R$
function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

// LocalStorage helpers
function saveToLocalStorage() {
  localStorage.setItem("projeto_horizonte_state", JSON.stringify(state));
}

function loadFromLocalStorage() {
  const local = localStorage.getItem("projeto_horizonte_state");
  if(local) {
    try {
      state = JSON.parse(local);
      
      // Update form values with loaded state
      document.getElementById("cfg-salary").value = state.config.salary;
      document.getElementById("cfg-carol").value = state.config.carol;
      document.getElementById("cfg-natura-extra").value = state.config.naturaExtra;
      document.getElementById("cfg-fixed-expenses").value = state.config.fixedExpensesAfterOct26;
      document.getElementById("cfg-sporadic-expenses").value = state.config.sporadicExpenses;

      document.getElementById("debt-mila").value = state.debts.mila;
      document.getElementById("debt-vitinho").value = state.debts.vitinho;
      document.getElementById("debt-papis").value = state.debts.papis;
      document.getElementById("debt-chica").value = state.debts.chica;
      document.getElementById("debt-monthly-installment").value = state.debts.installment;
      
      document.getElementById("career-notes").value = state.careerNotes || "";
      document.getElementById("victor-shared-notes").value = state.victorNotes || "";
      document.getElementById("learnings-textarea").value = state.diary.learnings || "";
      document.getElementById("ideas-textarea").value = state.diary.ideas || "";
    } catch(e) {
      console.error("Error loading local storage state", e);
    }
  }
}

// Main financial simulation engine (Jan 2026 to Dec 2030)
let timeline = [];
function simulateCashflow() {
  timeline = [];
  const startYear = 2026;
  const endYear = 2030;
  
  // Dívidas control
  let currentMila = state.debts.mila;
  let currentVitinho = state.debts.vitinho;
  let currentPapis = state.debts.papis;
  let currentChica = state.debts.chica;
  const installment = state.debts.installment;

  let accumulatedBalance = 0; // starts at 0, assumes red balance is cleared or we calculate real accumulation

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  for (let year = startYear; year <= endYear; year++) {
    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const monthStr = `${monthNames[monthIdx]}/${year}`;
      
      // Determine if date is before/after Oct 2026 for fixed expenses
      const isAfterOct26 = (year > 2026) || (year === 2026 && monthIdx >= 9); // Oct is 9 (0-indexed)
      const fixedExp = isAfterOct26 ? state.config.fixedExpensesAfterOct26 : state.config.fixedExpensesBeforeOct26;
      
      // Sporadic expenses
      const sporadicExp = state.config.sporadicExpenses;

      // Titia Solange debt: 7 installments from Jul/26 to Jan/27
      let solangePay = 0;
      const isSolangePeriod = (year === 2026 && monthIdx >= 6) || (year === 2027 && monthIdx === 0);
      if (isSolangePeriod) {
        solangePay = 249.14;
      }

      // Other debts payment: starts Sept/2026
      let milaPay = 0;
      let vitinhoPay = 0;
      let papisPay = 0;
      let chicaPay = 0;

      const isDebtsActive = (year > 2026) || (year === 2026 && monthIdx >= 8); // September is 8 (0-indexed)
      
      if (isDebtsActive) {
        if (currentMila > 0) {
          milaPay = Math.min(installment, currentMila);
          currentMila -= milaPay;
        }
        if (currentVitinho > 0) {
          vitinhoPay = Math.min(installment, currentVitinho);
          currentVitinho -= vitinhoPay;
        }
        if (currentPapis > 0) {
          papisPay = Math.min(installment, currentPapis);
          currentPapis -= papisPay;
        }
        if (currentChica > 0) {
          chicaPay = Math.min(installment, currentChica);
          currentChica -= chicaPay;
        }
      }

      const totalOthersPay = milaPay + vitinhoPay + papisPay + chicaPay;

      // Revenues
      const salary = state.config.salary;
      const carol = state.config.carol;
      
      // 13th salary: Nov (50%) & Dec (50%)
      let thirteenth = 0;
      if (monthIdx === 10 || monthIdx === 11) {
        thirteenth = 1600.90 / 2; // R$ 800,45
      }

      // Extra / Natura
      const naturaExtra = state.config.naturaExtra;

      const totalRevenue = salary + carol + thirteenth + naturaExtra;
      const totalExpenses = fixedExp + sporadicExp + solangePay + totalOthersPay;
      
      const netMonthly = totalRevenue - totalExpenses;
      accumulatedBalance += netMonthly;

      timeline.push({
        monthStr,
        year,
        monthIdx,
        revenue: totalRevenue,
        salary,
        carol,
        thirteenth,
        naturaExtra,
        fixedExp,
        sporadicExp,
        solangePay,
        othersPay: totalOthersPay,
        milaPay,
        vitinhoPay,
        papisPay,
        chicaPay,
        netMonthly,
        accumulatedBalance
      });
    }
  }
}

// Calculate, update UI elements, charts
function calculateAndRender() {
  simulateCashflow();

  // Update KPIs
  const currentAccumulated = timeline[timeline.length - 1].accumulatedBalance;
  const statusKpi = document.getElementById("general-status-value");
  statusKpi.textContent = formatCurrency(currentAccumulated);
  if(currentAccumulated < 0) {
    statusKpi.className = "kpi-value value-negative";
  } else {
    statusKpi.className = "kpi-value value-positive";
  }

  const remainingDebts = calculateRemainingDebts();
  document.getElementById("debts-total-value").textContent = formatCurrency(remainingDebts);
  
  // Calculate Emergency Fund progress
  const reserveProgressVal = Math.max(0, Math.min(6000, currentAccumulated));
  document.getElementById("reserve-progress-value").textContent = formatCurrency(reserveProgressVal);
  document.getElementById("reserve-current-value").textContent = formatCurrency(reserveProgressVal);

  // Render Table
  renderCashflowTable();
  
  // Render Debts chapter details
  renderDebtsTimeline();

  // Render Destinations
  renderDestinations();

  // Update Reserve Calculations
  updateReserveCalculations();

  // Update Exchange Simulation page
  updateExchangeSimulation();

  // Render Natura Chapter
  renderNaturaOrders();

  // Render Victor Goals
  renderVictorGoals();

  // Render Diary
  renderMoodboard();
  renderGratitude();

  // Render Charts
  renderCharts();
}

function calculateRemainingDebts() {
  return state.debts.mila + state.debts.vitinho + state.debts.papis + state.debts.chica + (7 * 249.14);
}

function renderCashflowTable() {
  const tbody = document.getElementById("cashflow-table-body");
  tbody.innerHTML = "";

  timeline.forEach(m => {
    const tr = document.createElement("tr");

    // highlight if negative
    const netClass = m.netMonthly >= 0 ? "value-positive" : "value-negative";
    const accClass = m.accumulatedBalance >= 0 ? "value-positive" : "value-negative";

    tr.innerHTML = `
      <td><strong>${m.monthStr}</strong></td>
      <td>${formatCurrency(m.salary)}</td>
      <td>${formatCurrency(m.carol)}</td>
      <td>${m.thirteenth > 0 ? formatCurrency(m.thirteenth) : "-"}</td>
      <td>${formatCurrency(m.naturaExtra)}</td>
      <td>${formatCurrency(m.fixedExp)}</td>
      <td>${formatCurrency(m.sporadicExp)}</td>
      <td>${m.othersPay > 0 ? formatCurrency(m.othersPay) : "-"}</td>
      <td>${m.solangePay > 0 ? formatCurrency(m.solangePay) : "-"}</td>
      <td class="${netClass}">${formatCurrency(m.netMonthly)}</td>
      <td class="${accClass}">${formatCurrency(m.accumulatedBalance)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDebtsTimeline() {
  const div = document.getElementById("debts-timeline-results");
  const tbody = document.getElementById("debts-table-body");
  tbody.innerHTML = "";

  // find when they finish
  let solangeDone = null;
  let milaDone = null;
  let vitinhoDone = null;
  let papisDone = null;
  let chicaDone = null;

  let runningMila = state.debts.mila;
  let runningVitinho = state.debts.vitinho;
  let runningPapis = state.debts.papis;
  let runningChica = state.debts.chica;

  timeline.forEach(m => {
    // Fill debts table
    if(m.solangePay > 0 || m.othersPay > 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${m.monthStr}</strong></td>
        <td>${m.solangePay > 0 ? formatCurrency(m.solangePay) : "-"}</td>
        <td>${m.milaPay > 0 ? formatCurrency(m.milaPay) : "-"}</td>
        <td>${m.vitinhoPay > 0 ? formatCurrency(m.vitinhoPay) : "-"}</td>
        <td>${m.papisPay > 0 ? formatCurrency(m.papisPay) : "-"}</td>
        <td>${m.chicaPay > 0 ? formatCurrency(m.chicaPay) : "-"}</td>
        <td><strong>${formatCurrency(m.solangePay + m.othersPay)}</strong></td>
      `;
      tbody.appendChild(tr);
    }

    // Keep track of completion dates
    if (m.solangePay > 0 && m.monthStr === "Jan/2027") solangeDone = m.monthStr; // last one
    
    runningMila -= m.milaPay;
    if (runningMila <= 0 && !milaDone && m.milaPay > 0) milaDone = m.monthStr;

    runningVitinho -= m.vitinhoPay;
    if (runningVitinho <= 0 && !vitinhoDone && m.vitinhoPay > 0) vitinhoDone = m.monthStr;

    runningPapis -= m.papisPay;
    if (runningPapis <= 0 && !papisDone && m.papisPay > 0) papisDone = m.monthStr;

    runningChica -= m.chicaPay;
    if (runningChica <= 0 && !chicaDone && m.chicaPay > 0) chicaDone = m.monthStr;
  });

  // Calculate final date when all debts are cleared
  let datesArray = [
    { name: "Titia Solange", date: "Jan/2027" },
    { name: "Mila", date: milaDone || "Quitada" },
    { name: "Vitinho", date: vitinhoDone || "Quitada" },
    { name: "Papis", date: papisDone || "Quitada" },
    { name: "Madrinha Chica", date: chicaDone || "Quitada" }
  ];

  let summaryHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem;">`;
  datesArray.forEach(item => {
    summaryHtml += `
      <div style="background: var(--color-bg); padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
        <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; text-transform: uppercase;">${item.name}</span>
        <strong style="color: var(--color-primary); font-size: 0.95rem;">${item.date}</strong>
      </div>
    `;
  });
  summaryHtml += `</div>`;
  div.innerHTML = summaryHtml;
}

// Emergency fund calculations
function updateReserveCalculations() {
  const sliderVal = parseFloat(document.getElementById("reserve-monthly-slider").value);
  const annualInterest = parseFloat(document.getElementById("reserve-interest-rate").value) / 100;
  const monthlyInterest = annualInterest / 12;
  const target = 6000;
  
  let currentVal = 0;
  let months = 0;
  while(currentVal < target && months < 120) {
    currentVal = (currentVal + sliderVal) * (1 + monthlyInterest);
    months++;
  }
  
  document.getElementById("reserve-months-required").textContent = `${months} meses`;
  
  // Estimate target date based on current month (July 2026)
  const baseDate = new Date(2026, 6, 1); // July 2026
  baseDate.setMonth(baseDate.getMonth() + months);
  const targetDateStr = baseDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  document.getElementById("reserve-target-date").textContent = targetDateStr;
}

// Render the 6 destinations cards
function renderDestinations() {
  const grid = document.getElementById("destinations-grid");
  grid.innerHTML = "";
  
  Object.values(destinations).forEach(d => {
    const card = document.createElement("div");
    card.className = "luxury-card";
    card.innerHTML = `
      <div class="card-title">
        <span>${d.flag} ${d.name}</span>
        <span class="badge-country">${d.language}</span>
      </div>
      <div class="kpi-value" style="font-size: 1.6rem; color: var(--color-primary-light);">${formatCurrency(d.cost)}</div>
      <p class="kpi-label">Custo Médio Total</p>
      <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--color-text-main);">
        <p><strong>Duração:</strong> ${d.duration}</p>
        <p><strong>Visto:</strong> ${d.ease}</p>
        <p style="margin-top: 0.5rem; color: var(--color-text-muted); font-style: italic;">${d.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Update exchange simulator inputs
function updateExchangeSimulation() {
  const selectedCountry = document.getElementById("intercambio-country-select").value;
  const monthlySavings = parseFloat(document.getElementById("intercambio-monthly-savings").value) || 0;
  
  let targetCost = 60000;
  switch (selectedCountry) {
    case "Malta": targetCost = destinations.Malta.cost; break;
    case "Ireland": targetCost = destinations.Ireland.cost; break;
    case "CapeVerde": targetCost = destinations.CapeVerde.cost; break;
    case "SouthAfrica": targetCost = destinations.SouthAfrica.cost; break;
    case "Italy": targetCost = destinations.Italy.cost; break;
    case "France": targetCost = destinations.France.cost; break;
  }
  
  document.getElementById("sim-target-value").textContent = formatCurrency(targetCost);
  
  if (monthlySavings <= 0) {
    document.getElementById("sim-months-needed").textContent = "Aporte inválido";
    document.getElementById("sim-trip-date").textContent = "-";
    return;
  }
  
  // Assume a 6% annual return (conservative IPCA+ target)
  const annualReturn = 0.06;
  const monthlyReturn = annualReturn / 12;
  
  let balance = 0;
  let months = 0;
  while (balance < targetCost && months < 240) {
    balance = (balance + monthlySavings) * (1 + monthlyReturn);
    months++;
  }
  
  document.getElementById("sim-months-needed").textContent = `${months} meses`;
  
  // Calculate date
  const tripDate = new Date(2026, 6, 1); // Jul 28
  tripDate.setMonth(tripDate.getMonth() + months);
  document.getElementById("sim-trip-date").textContent = tripDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// Natura chapter list render
function renderNaturaOrders() {
  const tbody = document.getElementById("natura-orders-tbody");
  tbody.innerHTML = "";

  let totalSales = 0;
  state.naturaOrders.forEach(o => {
    totalSales += o.price;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${o.client}</strong></td>
      <td>${o.product}</td>
      <td>${formatCurrency(o.price)}</td>
      <td>${o.date}</td>
      <td><span class="badge-country">${o.status}</span></td>
      <td>
        <button onclick="deleteNaturaOrder(${o.id})" class="btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: #c0392b; border-color: #c0392b;">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("natura-sales-total").textContent = formatCurrency(totalSales);
  
  // Natura 30% standard commission profit
  const commission = totalSales * 0.30;
  document.getElementById("natura-profit-total").textContent = formatCurrency(commission);
  document.getElementById("natura-orders-count").textContent = state.naturaOrders.length;
}

// Modal open/close actions
function openNaturaOrderModal() {
  document.getElementById("natura-modal").classList.add("active");
}
function closeNaturaOrderModal() {
  document.getElementById("natura-modal").classList.remove("active");
}

function saveNaturaOrder() {
  const client = document.getElementById("natura-input-client").value.trim();
  const product = document.getElementById("natura-input-product").value.trim();
  const price = parseFloat(document.getElementById("natura-input-price").value) || 0;
  const date = document.getElementById("natura-input-date").value;
  
  if (client && product && price > 0 && date) {
    state.naturaOrders.push({
      id: Date.now(),
      client,
      product,
      price,
      date,
      status: "Pendente"
    });
    
    // clear inputs
    document.getElementById("natura-input-client").value = "";
    document.getElementById("natura-input-product").value = "";
    document.getElementById("natura-input-price").value = "";
    document.getElementById("natura-input-date").value = "";
    
    closeNaturaOrderModal();
    saveToLocalStorage();
    calculateAndRender();
  }
}

function deleteNaturaOrder(id) {
  state.naturaOrders = state.naturaOrders.filter(o => o.id !== id);
  saveToLocalStorage();
  calculateAndRender();
}

// Victor Goals
function renderVictorGoals() {
  const list = document.getElementById("victor-goals-list");
  list.innerHTML = "";
  
  state.victorGoals.forEach(g => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.padding = "0.6rem 0";
    li.style.borderBottom = "1px solid var(--color-border)";
    
    const checkStyle = g.completed ? "text-decoration: line-through; color: var(--color-text-muted);" : "";
    
    li.innerHTML = `
      <span style="${checkStyle}">${g.text}</span>
      <div>
        <button onclick="toggleVictorGoal(${g.id})" class="btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">
          ${g.completed ? "Reabrir" : "Concluir"}
        </button>
        <button onclick="deleteVictorGoal(${g.id})" class="btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.75rem; color: #c0392b; border-color: #c0392b;">
          Excluir
        </button>
      </div>
    `;
    list.appendChild(li);
  });
}

function toggleVictorGoal(id) {
  const goal = state.victorGoals.find(g => g.id === id);
  if(goal) goal.completed = !goal.completed;
  saveToLocalStorage();
  renderVictorGoals();
}

function deleteVictorGoal(id) {
  state.victorGoals = state.victorGoals.filter(g => g.id !== id);
  saveToLocalStorage();
  renderVictorGoals();
}

// Diary: Mood board & Gratitude
function renderMoodboard() {
  const grid = document.getElementById("moodboard-grid");
  grid.innerHTML = "";
  
  state.diary.mood.forEach(item => {
    const el = document.createElement("div");
    el.className = "mood-item";
    el.innerHTML = `
      <img src="${item.url}" class="mood-img" alt="${item.title}">
      <div class="mood-caption">${item.title}</div>
      <button onclick="deleteMoodItem(${item.id})" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.5); color: #fff; border:none; border-radius: 50%; width: 22px; height: 22px; font-size: 0.8rem; cursor:pointer;">&times;</button>
    `;
    grid.appendChild(el);
  });
}

function openMoodModal() {
  document.getElementById("mood-modal").classList.add("active");
}
function closeMoodModal() {
  document.getElementById("mood-modal").classList.remove("active");
}

function saveMoodItem() {
  const title = document.getElementById("mood-input-title").value.trim();
  let url = document.getElementById("mood-input-url").value.trim();
  if(!url) {
    url = "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=300&q=80"; // fallback
  }
  
  if (title) {
    state.diary.mood.push({ id: Date.now(), title, url });
    document.getElementById("mood-input-title").value = "";
    document.getElementById("mood-input-url").value = "";
    closeMoodModal();
    saveToLocalStorage();
    renderMoodboard();
  }
}

function deleteMoodItem(id) {
  state.diary.mood = state.diary.mood.filter(m => m.id !== id);
  saveToLocalStorage();
  renderMoodboard();
}

function renderGratitude() {
  const list = document.getElementById("gratitude-list");
  list.innerHTML = "";
  
  state.diary.gratitude.forEach(item => {
    const el = document.createElement("div");
    el.className = "journal-entry";
    el.innerHTML = `
      <div class="journal-date">${item.date}</div>
      <div class="journal-text">${item.text}</div>
      <button onclick="deleteGratitudeItem(${item.id})" class="btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: #c0392b; border-color: #c0392b; margin-top: 0.5rem;">Excluir</button>
    `;
    list.appendChild(el);
  });
}

function openGratitudeModal() {
  document.getElementById("gratitude-modal").classList.add("active");
}
function closeGratitudeModal() {
  document.getElementById("gratitude-modal").classList.remove("active");
}

function saveGratitudeItem() {
  const date = document.getElementById("gratitude-input-date").value.trim();
  const text = document.getElementById("gratitude-input-text").value.trim();
  
  if(date && text) {
    state.diary.gratitude.push({ id: Date.now(), date, text });
    document.getElementById("gratitude-input-date").value = "";
    document.getElementById("gratitude-input-text").value = "";
    closeGratitudeModal();
    saveToLocalStorage();
    renderGratitude();
  }
}

function deleteGratitudeItem(id) {
  state.diary.gratitude = state.diary.gratitude.filter(g => g.id !== id);
  saveToLocalStorage();
  renderGratitude();
}

// Chart.js render engine
function renderCharts() {
  // Chart 1: Cashflow Projections
  const labels = timeline.map(m => m.monthStr);
  const data = timeline.map(m => m.accumulatedBalance);

  if (cashflowChart) {
    cashflowChart.destroy();
  }

  const ctx1 = document.getElementById("cashflowChart").getContext("2d");
  cashflowChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Saldo Acumulado (R$)',
        data: data,
        borderColor: '#0f4c3a',
        backgroundColor: 'rgba(15, 76, 58, 0.05)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          grid: {
            color: '#e5e7eb'
          },
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // Chart 2: Portfolio Allocations (Chapter 7)
  if (portfolioChart) {
    portfolioChart.destroy();
  }

  const ctx2 = document.getElementById("portfolioChart").getContext("2d");
  portfolioChart = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Renda Fixa', 'ETFs Globais', 'Fundos Imobiliários', 'Caixa'],
      datasets: [{
        data: [60, 20, 10, 10],
        backgroundColor: ['#0f4c3a', '#c29d66', '#2d8a6b', '#eaf3f0'],
        borderColor: ['#fff', '#fff', '#fff', '#fff'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              family: 'Inter',
              size: 11
            },
            color: '#2c3e35'
          }
        }
      }
    }
  });
}

// CSV Export
function exportCashflowCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Mês/Ano;Receitas;Carol;13º Salário;Natura/Extra;Gastos Fixos;Gastos Esporádicos;Dívidas;Solange;Saldo Líquido;Saldo Acumulado\r\n";
  
  timeline.forEach(m => {
    const row = [
      m.monthStr,
      m.salary.toFixed(2),
      m.carol.toFixed(2),
      m.thirteenth.toFixed(2),
      m.naturaExtra.toFixed(2),
      m.fixedExp.toFixed(2),
      m.sporadicExp.toFixed(2),
      m.othersPay.toFixed(2),
      m.solangePay.toFixed(2),
      m.netMonthly.toFixed(2),
      m.accumulatedBalance.toFixed(2)
    ].join(";");
    csvContent += row + "\r\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "fluxo_de_caixa_julia_aragao.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Backup State download
function exportBackupData() {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "projeto_horizonte_backup.json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Excel Export using SheetJS
function exportExcel() {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Fluxo de Caixa
  const fluxoData = [
    ["PROJETO HORIZONTE — FLUXO DE CAIXA DETALHADO"],
    ["Planejamento financeiro de Júlia Aragão de Janeiro/2026 a Dezembro/2030 (Valores em R$)"],
    [],
    ["Mês/Ano", "Salário Líquido", "Recebimento Carol", "13º Salário", "Natura/Extra", "Gastos Fixos", "Gastos Esporádicos", "Dívidas Pessoas", "Parcelas Solange", "Saldo Líquido Mês", "Saldo Acumulado"]
  ];
  
  timeline.forEach(m => {
    fluxoData.push([
      m.monthStr,
      m.salary,
      m.carol,
      m.thirteenth,
      m.naturaExtra,
      m.fixedExp,
      m.sporadicExp,
      m.othersPay,
      m.solangePay,
      m.netMonthly,
      m.accumulatedBalance
    ]);
  });
  
  const ws1 = XLSX.utils.aoa_to_sheet(fluxoData);
  // Auto col widths
  const ws1Cols = [
    {wch: 10}, {wch: 15}, {wch: 18}, {wch: 15}, {wch: 15},
    {wch: 15}, {wch: 18}, {wch: 15}, {wch: 16}, {wch: 18}, {wch: 18}
  ];
  ws1['!cols'] = ws1Cols;
  XLSX.utils.book_append_sheet(wb, ws1, "Fluxo de Caixa");
  
  // Sheet 2: Plano de Dívidas
  const dividasData = [
    ["CONTROLE E CRONOGRAMA DE AMORTIZAÇÃO DE DÍVIDAS"],
    ["Acompanhamento de parcelas acordadas com familiares e conhecidos"],
    [],
    ["Credor", "Valor Inicial (R$)", "Parcela Mensal (R$)", "Data Início", "Meses Estimados", "Data Quitação"],
    ["Titia Solange", 1743.98, 249.14, "Julho/2026", 7, "Janeiro/2027"],
    ["Mila", state.debts.mila, state.debts.installment, "Setembro/2026", Math.ceil(state.debts.mila / state.debts.installment), "Fevereiro/2027"],
    ["Vitinho", state.debts.vitinho, state.debts.installment, "Setembro/2026", Math.ceil(state.debts.vitinho / state.debts.installment), "Janeiro/2027"],
    ["Papis", state.debts.papis, state.debts.installment, "Setembro/2026", Math.ceil(state.debts.papis / state.debts.installment), "Abril/2027"],
    ["Madrinha Chica", state.debts.chica, state.debts.installment, "Setembro/2026", Math.ceil(state.debts.chica / state.debts.installment), "Março/2027"]
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(dividasData);
  ws2['!cols'] = [{wch: 18}, {wch: 18}, {wch: 18}, {wch: 15}, {wch: 15}, {wch: 15}];
  XLSX.utils.book_append_sheet(wb, ws2, "Plano de Dívidas");
  
  // Sheet 3: Metas e Investimentos
  const metasData = [
    ["PLANEJAMENTO DE RESERVA E INTERCÂMBIO"],
    [],
    ["1. RESERVA EMERGENCIAL DE SEGURANÇA"],
    ["Meta Total", "Prazo Desejado", "Aporte Mensal", "Onde Investir"],
    [6000.00, "12 a 18 meses", 150.00, "Tesouro Selic ou CDB Liquidez Diária 100% CDI"],
    [],
    ["2. PROJETO INTERCÂMBIO (PRAZO DE 3 A 5 ANOS)"],
    ["Destino", "Custo Médio Est. (R$)", "Duração", "Idioma Principal", "Exigência de Visto"],
    ["Malta 🇲🇹", 60000.00, "6 meses", "Inglês", "Fácil (Turista Schengen)"],
    ["Irlanda 🇮🇪", 75000.00, "8 meses", "Inglês", "Médio (Estudante com permissão de trabalho)"],
    ["Cabo Verde 🇨🇻", 35000.00, "3 meses", "Português", "Muito Fácil"],
    ["África do Sul 🇿🇦", 48000.00, "6 meses", "Inglês", "Fácil"],
    ["Itália 🇮🇹", 72000.00, "6 meses", "Italiano", "Médio"],
    ["França 🇫🇷", 85000.00, "6 meses", "Francês", "Médio"]
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(metasData);
  ws3['!cols'] = [{wch: 18}, {wch: 22}, {wch: 15}, {wch: 18}, {wch: 25}];
  XLSX.utils.book_append_sheet(wb, ws3, "Metas e Investimentos");
  
  // Sheet 4: Renda Extra Natura
  const naturaData = [
    ["GERENCIAMENTO DE VENDAS NATURA"],
    [],
    ["Data", "Cliente", "Produto Vendido", "Valor da Venda (R$)", "Comissão Esperada (30%)", "Status Entrega"]
  ];
  state.naturaOrders.forEach(o => {
    naturaData.push([
      o.date,
      o.client,
      o.product,
      o.price,
      o.price * 0.30,
      o.status
    ]);
  });
  const ws4 = XLSX.utils.aoa_to_sheet(naturaData);
  ws4['!cols'] = [{wch: 15}, {wch: 18}, {wch: 20}, {wch: 18}, {wch: 22}, {wch: 15}];
  XLSX.utils.book_append_sheet(wb, ws4, "Renda Extra Natura");
  
  // Write and Save
  XLSX.writeFile(wb, "Projeto_Horizonte.xlsx");
}
