// ============================================================
// PROJETO HORIZONTE v3.0 — APP.JS
// Motor de gestão financeira integrado para Júlia Aragão
// ============================================================

// ---- ESTADO GLOBAL ----
let state = {
  // Cap 3: Livro Caixa
  caixa: [],

  // Cap 4: Dívidas (Credores)
  creditors: [
    { id: 'solange', name: 'Titia Solange', initialVal: 1743.98, dueDay: 15, installment: 249.14 },
    { id: 'mila', name: 'Mila', initialVal: 300.00, dueDay: 10, installment: 55.00 },
    { id: 'vitinho', name: 'Vitinho', initialVal: 250.00, dueDay: 10, installment: 55.00 },
    { id: 'papis', name: 'Papis', initialVal: 400.00, dueDay: 10, installment: 55.00 },
    { id: 'chica', name: 'Madrinha Chica', initialVal: 350.00, dueDay: 10, installment: 55.00 }
  ],
  debtPayments: [],

  // Cap 5: Reserva & Investimentos
  investments: [],

  // Cap 6: Intercâmbio
  exchangePlan: {
    destName: 'Irlanda 🇮🇪',
    duration: 12,
    rate: 6.50,
    currency: 'EUR',
    monthlySavings: 500,
    monthlyYield: 20
  },
  exchangeCosts: {
    school: 25000,
    flight: 6000,
    visa: 1200,
    insurance: 2500,
    material: 800,
    selfcare: 1500,
    health: 2000,
    food: 12000,
    transport: 3000,
    leisure: 4000,
    initial: 10000
  },
  exchangeInvestments: [],

  // Cap 1 Meta Caixinhas
  caixinhas: [],
  caixinhaHistory: [],

  // Cap 7: Carreira
  careerNotes: '',

  // Cap 8: Revenda (CRM & Compras)
  revendaSales: [],
  purchases: [],

  // Cap 9: Espaço Victor
  victorExpenses: [],
  victorCofrinho: [],
  victorCofrinhoPlan: {
    goalName: 'Viagem Fim de Ano 🏝️',
    target: 3000
  },

  // Cap 10: Diário
  diary: {
    mood: [
      { id: 1, title: 'Praia em Malta', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=300&q=80' },
      { id: 2, title: 'Estudo e Foco', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80' },
      { id: 3, title: 'Independência', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=300&q=80' }
    ],
    gratitude: [
      { id: 1, date: 'Julho de 2026', text: 'Tudo pronto para as novas metas do Projeto Horizonte.' }
    ],
    learnings: 'Investimentos em renda fixa são ótimos para segurança, enquanto a revenda traz faturamento imediato.',
    ideas: 'Divulgar os combos de estética para amigas e clientes da revenda.'
  }
};

// Global variables for deletion dialog
let deleteCallback = null;

// Global Chart references
let invChartPie = null;
let invChartBar = null;
let invChartLine = null;
let invChartHist = null;
let vicChart = null;

// Quotes array for carrousel
let currentQuoteIdx = 0;
const quoteSlidesIds = ['slide-freud', 'slide-diligencia', 'slide-controle', 'slide-generosidade', 'slide-proposito'];

// Selected caixinha for deposits/withdrawals
let activeCaixinhaId = null;

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupSidebar();
  setupEventListeners();
  populateCaixaTypeDropdown();
  renderAll();
  lucide.createIcons();
});

// ============================================================
// SIDEBAR MENU DRAWER
// ============================================================
function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('close-sidebar');

  function openSidebar() {
    sidebar.classList.add('sidebar-open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('sidebar-open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  document.querySelectorAll('.chapter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-target'));
      closeSidebar();
    });
  });
}

function switchTab(pageId) {
  document.querySelectorAll('.book-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.chapter-btn').forEach(b => b.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  const btn = document.querySelector(`.chapter-btn[data-target="${pageId}"]`);
  if (btn) btn.classList.add('active');
  lucide.createIcons();
}

function switchDiaryTab(tabName, event) {
  document.querySelectorAll('.diary-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById(`diary-${tabName}`);
  if (sec) sec.style.display = 'block';
  if (event && event.target) event.target.classList.add('active');
}

function switchRevendaTab(tabName, event) {
  document.querySelectorAll('.revenda-section').forEach(s => s.style.display = 'none');
  const btns = event.target.parentNode.querySelectorAll('.tab-btn');
  btns.forEach(b => b.classList.remove('active'));
  const sec = document.getElementById(`revenda-${tabName}`);
  if (sec) sec.style.display = 'block';
  if (event && event.target) event.target.classList.add('active');
}

// ============================================================
// LOCAL STORAGE
// ============================================================
const STORAGE_KEY_V3 = 'projeto_horizonte_v3';

function saveState() {
  localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_V3);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      state.diary = { ...state.diary, ...parsed.diary };
      state.config = { ...state.config, ...parsed.config };
      state.exchangePlan = { ...state.exchangePlan, ...parsed.exchangePlan };
      state.exchangeCosts = { ...state.exchangeCosts, ...parsed.exchangeCosts };
      state.victorCofrinhoPlan = { ...state.victorCofrinhoPlan, ...parsed.victorCofrinhoPlan };
    }
  } catch (e) {
    console.error('Erro ao carregar LocalStorage:', e);
  }
  
  // Fill forms with saved configurations
  const el = (id) => document.getElementById(id);
  if (el('career-notes')) el('career-notes').value = state.careerNotes || '';
  if (el('learnings-textarea')) el('learnings-textarea').value = state.diary.learnings || '';
  if (el('ideas-textarea')) el('ideas-textarea').value = state.diary.ideas || '';

  // Revenda & Exchange setup
  if (el('exchange-dest-name')) el('exchange-dest-name').value = state.exchangePlan.destName;
  if (el('exchange-duration')) el('exchange-duration').value = state.exchangePlan.duration;
  if (el('exchange-rate')) el('exchange-rate').value = state.exchangePlan.rate;
  if (el('exchange-currency')) el('exchange-currency').value = state.exchangePlan.currency;
  if (el('exchange-monthly-savings')) el('exchange-monthly-savings').value = state.exchangePlan.monthlySavings;
  if (el('exchange-monthly-yield')) el('exchange-monthly-yield').value = state.exchangePlan.monthlyYield;

  // Set individual exchange cost fields
  Object.keys(state.exchangeCosts).forEach(k => {
    const costEl = el(`exc-${k}`);
    if (costEl) costEl.value = state.exchangeCosts[k];
  });

  // Set victor goal goalName/target
  if (el('vic-cof-goal')) el('vic-cof-goal').value = state.victorCofrinhoPlan.goalName;
  if (el('vic-cof-target')) el('vic-cof-target').value = state.victorCofrinhoPlan.target;
}

// ============================================================
// FORMATTERS & UTILS
// ============================================================
function fmt(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}
function genId() { return Date.now() + Math.floor(Math.random() * 1000); }

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(msg) {
  let toast = document.getElementById('toast-notify');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notify';
    toast.style.cssText = `
      position:fixed;bottom:1.5rem;right:1.5rem;
      background:var(--color-primary-dark);color:#fff;
      padding:0.75rem 1.5rem;border-radius:8px;
      border-left:4px solid var(--color-accent);
      font-size:0.875rem;font-weight:500;z-index:9999;
      box-shadow:0 4px 12px rgba(0,0,0,0.2);
      transition:all 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2500);
}

// ============================================================
// 2-FACTOR DELETE CONFIRMATION SYSTEM
// ============================================================
function confirmDelete(callback) {
  deleteCallback = callback;
  document.getElementById('confirm-modal').classList.add('active');
}

function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.remove('active');
  deleteCallback = null;
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };

  // Deletion Modal
  on('btn-confirm-delete-yes', 'click', () => {
    if (deleteCallback) {
      deleteCallback();
      showToast('Registro excluído com sucesso.');
    }
    closeConfirmModal();
  });
  on('btn-confirm-delete-no', 'click', closeConfirmModal);

  // Backup Export
  on('btn-export-backup', 'click', exportBackup);

  // Cap 3: Livro Caixa
  on('btn-add-caixa', 'click', addCaixa);
  on('summary-month-filter', 'change', renderCaixaSummary);
  on('btn-clear-summary-filter', 'click', () => {
    document.getElementById('summary-month-filter').value = '';
    renderCaixaSummary();
  });
  
  // Table search filters
  on('filter-caixa-date', 'input', renderCaixaTable);
  on('filter-caixa-type', 'change', renderCaixaTable);
  on('filter-caixa-desc', 'input', renderCaixaTable);
  on('filter-caixa-val', 'input', renderCaixaTable);

  // Cap 4: Dívidas
  on('btn-add-creditor', 'click', addOrEditCreditor);
  on('btn-add-debt-pay', 'click', addDebtPayment);

  // Cap 5: Reserva & Investimentos
  on('btn-add-inv', 'click', addInvestment);
  on('filter-inv-asset', 'change', renderInvestments);
  on('filter-inv-type', 'change', renderInvestments);
  on('filter-inv-date', 'input', renderInvestments);

  // Cap 6: Intercâmbio
  on('btn-save-exchange-dest', 'click', saveExchangeDest);
  on('btn-calc-exchange-costs', 'click', calcExchangeCosts);
  on('btn-add-exc-inv', 'click', addExchangeInv);

  // Cap 7: Carreira
  on('btn-save-career-notes', 'click', () => {
    state.careerNotes = document.getElementById('career-notes').value;
    saveState();
    showToast('Plano de carreira salvo!');
  });

  // Cap 8: Revenda Sales
  on('btn-add-revenda-sale', 'click', addRevendaSale);
  on('btn-add-purchase', 'click', addPurchase);

  // Cap 9: Espaço Victor
  on('btn-add-vic-exp', 'click', addVictorExpense);
  on('btn-add-vic-cof', 'click', addVictorCofrinho);

  // Cap 10: Diário
  on('btn-save-learnings', 'click', () => {
    state.diary.learnings = document.getElementById('learnings-textarea').value;
    saveState();
    showToast('Aprendizados salvos!');
  });
  on('btn-save-ideas', 'click', () => {
    state.diary.ideas = document.getElementById('ideas-textarea').value;
    saveState();
    showToast('Ideias salvas!');
  });
}

// ============================================================
// RENDERING MAIN CONTROL
// ============================================================
function renderAll() {
  updateCapaKPIs();
  renderUpcomingDebts();
  renderCaixinhas();
  renderCaixaTable();
  renderCaixaSummary();
  renderCreditorDropdown();
  renderDebtBalances();
  renderDebtHistory();
  renderInvestments();
  renderInvestmentCharts();
  updateExchangeDisplay();
  renderExchangeHistory();
  renderRevendaSummary();
  renderRevendaSalesTable();
  renderPurchasesTable();
  renderVictorHistory();
  renderVictorChart();
  renderVictorCofrinhoTotal();
  renderMoodboard();
  renderGratitude();
}

// ============================================================
// CAP 1: QUOTES CARROUSEL
// ============================================================
function showQuote(idx) {
  quoteSlidesIds.forEach((id, i) => {
    const slide = document.getElementById(id);
    if (slide) {
      if (i === idx) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    }
  });
}

window.nextQuote = function() {
  currentQuoteIdx = (currentQuoteIdx + 1) % quoteSlidesIds.length;
  showQuote(currentQuoteIdx);
};

window.prevQuote = function() {
  currentQuoteIdx = (currentQuoteIdx - 1 + quoteSlidesIds.length) % quoteSlidesIds.length;
  showQuote(currentQuoteIdx);
};

// ============================================================
// CAP 1: DYNAMIC CAIXINHAS (METAS PERSONALIZADAS)
// ============================================================
window.openCaixinhaModal = function() {
  document.getElementById('caixinha-modal').classList.add('active');
};

window.closeCaixinhaModal = function() {
  document.getElementById('caixinha-modal').classList.remove('active');
};

window.saveCaixinha = function() {
  const name = document.getElementById('caixinha-name').value.trim();
  const target = parseFloat(document.getElementById('caixinha-target').value) || 0;
  const current = parseFloat(document.getElementById('caixinha-current').value) || 0;
  const loc = document.getElementById('caixinha-loc').value.trim() || 'CDB';

  if (!name || target <= 0) {
    showToast('Insira o nome da caixinha e a meta alvo.');
    return;
  }

  const id = genId();
  state.caixinhas.push({ id, name, target, loc });
  if (current > 0) {
    state.caixinhaHistory.push({
      id: genId(),
      caixinhaId: id,
      type: 'deposito',
      val: current,
      date: new Date().toISOString().substring(0, 10)
    });
  }

  // Clear & Save
  document.getElementById('caixinha-name').value = '';
  document.getElementById('caixinha-target').value = '';
  document.getElementById('caixinha-current').value = '0';
  document.getElementById('caixinha-loc').value = '';
  closeCaixinhaModal();
  saveState();
  renderCaixinhas();
  updateCapaKPIs();
  showToast(`Caixinha "${name}" criada!`);
};

window.deleteCaixinha = function(id) {
  confirmDelete(() => {
    state.caixinhas = state.caixinhas.filter(c => c.id !== id);
    state.caixinhaHistory = state.caixinhaHistory.filter(h => h.caixinhaId !== id);
    saveState();
    renderCaixinhas();
    updateCapaKPIs();
  });
};

window.openCaixinhaActionModal = function(id, typeName) {
  activeCaixinhaId = id;
  const c = state.caixinhas.find(x => x.id === id);
  document.getElementById('caixinha-action-title').textContent = `${typeName === 'deposito' ? 'Depositar na' : 'Sacar da'} Caixinha: ${c.name}`;
  document.getElementById('caixinha-action-type').value = typeName;
  document.getElementById('caixinha-action-val').value = '';
  document.getElementById('caixinha-action-date').value = new Date().toISOString().substring(0, 10);
  document.getElementById('caixinha-action-modal').classList.add('active');
};

window.closeCaixinhaActionModal = function() {
  document.getElementById('caixinha-action-modal').classList.remove('active');
};

window.submitCaixinhaAction = function() {
  const type = document.getElementById('caixinha-action-type').value;
  const val = parseFloat(document.getElementById('caixinha-action-val').value) || 0;
  const date = document.getElementById('caixinha-action-date').value;

  if (val <= 0 || !date) {
    showToast('Insira um valor e data válidos.');
    return;
  }

  const c = state.caixinhas.find(x => x.id === activeCaixinhaId);
  const currentBal = getCaixinhaBalance(activeCaixinhaId);

  if (type === 'saque' && val > currentBal) {
    showToast('Saldo insuficiente na caixinha para esta retirada.');
    return;
  }

  state.caixinhaHistory.push({
    id: genId(),
    caixinhaId: activeCaixinhaId,
    type,
    val,
    date
  });

  closeCaixinhaActionModal();
  saveState();
  renderCaixinhas();
  updateCapaKPIs();
  showToast(`Movimentação registrada com sucesso.`);
};

function getCaixinhaBalance(id) {
  return state.caixinhaHistory
    .filter(h => h.caixinhaId === id)
    .reduce((total, h) => {
      if (h.type === 'deposito') return total + h.val;
      if (h.type === 'saque') return total - h.val;
      return total;
    }, 0);
}

function renderCaixinhas() {
  const container = document.getElementById('caixinhas-container');
  if (!container) return;
  container.innerHTML = '';

  if (state.caixinhas.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--color-text-muted); text-align:center; padding:1rem;">Nenhuma caixinha de meta criada.</p>`;
    return;
  }

  state.caixinhas.forEach(c => {
    const bal = getCaixinhaBalance(c.id);
    const target = c.target || 1;
    const pct = Math.min(100, Math.round((bal / target) * 100));
    const missing = Math.max(0, target - bal);

    const div = document.createElement('div');
    div.className = 'caixinha-card';
    div.innerHTML = `
      <div class="caixinha-header">
        <span class="caixinha-title">${c.name}</span>
        <span class="caixinha-loc">${c.loc}</span>
      </div>
      <div style="font-size:0.9rem; font-weight:700; color:var(--color-primary-dark); margin:0.1rem 0;">
        ${fmt(bal)} <span style="font-size:0.75rem; font-weight:400; color:var(--color-text-muted);">de ${fmt(target)}</span>
      </div>
      <div class="caixinha-progress-wrapper">
        <div class="caixinha-progress-bar" style="width: ${pct}%;"></div>
      </div>
      <div class="caixinha-footer">
        <span>Falta: ${fmt(missing)}</span>
        <span class="caixinha-percentage">${pct}%</span>
      </div>
      <div class="caixinha-actions">
        <button onclick="openCaixinhaActionModal(${c.id}, 'deposito')" title="Depositar"><i data-lucide="plus-circle" style="width:16px; height:16px; color:#1b8a5a;"></i></button>
        <button onclick="openCaixinhaActionModal(${c.id}, 'saque')" title="Sacar"><i data-lucide="minus-circle" style="width:16px; height:16px; color:#c0392b;"></i></button>
        <button onclick="deleteCaixinha(${c.id})" title="Excluir"><i data-lucide="trash-2" style="width:16px; height:16px; color:var(--color-text-muted);"></i></button>
      </div>
    `;
    container.appendChild(div);
  });
  lucide.createIcons();
}

// ============================================================
// CAP 1: UPCOMING DEBTS CALENDAR & URGENCY
// ============================================================
function renderUpcomingDebts() {
  const container = document.getElementById('upcoming-debts-list');
  if (!container) return;
  container.innerHTML = '';

  const activeCreditors = state.creditors.filter(c => {
    const totalPaid = state.debtPayments.filter(p => p.who === c.name).reduce((sum, p) => sum + p.val, 0);
    return (c.initialVal - totalPaid) > 0;
  });

  if (activeCreditors.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--color-text-muted); text-align:center; padding:1rem;">Tudo quitado! Nenhuma dívida a vencer.</p>`;
    return;
  }

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthName = today.toLocaleDateString('pt-BR', { month: 'long' });

  // Sort by due day ascending
  activeCreditors.sort((a, b) => a.dueDay - b.dueDay);

  activeCreditors.forEach(c => {
    // Check if paid this month already
    const paidThisMonth = state.debtPayments.some(p => {
      if (p.who !== c.name) return false;
      const pDate = new Date(p.date);
      return pDate.getMonth() === today.getMonth() && pDate.getFullYear() === today.getFullYear();
    });

    let urgencyClass = 'urgency-green';
    let statusText = `Agendado para dia ${c.dueDay}`;

    if (paidThisMonth) {
      urgencyClass = 'urgency-green';
      statusText = `Pago em ${currentMonthName}! ✅`;
    } else {
      if (c.dueDay < currentDay) {
        urgencyClass = 'urgency-red';
        statusText = `🔴 Vencido em ${c.dueDay}/${today.getMonth() + 1}`;
      } else if (c.dueDay - currentDay <= 7) {
        urgencyClass = 'urgency-red';
        statusText = `🔴 Urgente! Vence dia ${c.dueDay}`;
      } else if (c.dueDay - currentDay <= 15) {
        urgencyClass = 'urgency-yellow';
        statusText = `🟡 Atenção! Vence dia ${c.dueDay}`;
      }
    }

    const totalPaid = state.debtPayments.filter(p => p.who === c.name).reduce((sum, p) => sum + p.val, 0);
    const balance = c.initialVal - totalPaid;
    const installmentVal = Math.min(balance, c.installment);

    const div = document.createElement('div');
    div.className = `upcoming-debt-card ${urgencyClass}`;
    div.innerHTML = `
      <div class="debt-info">
        <span class="debt-creditor">${c.name}</span>
        <span class="debt-due-desc">${statusText} (Restam ${fmt(balance)})</span>
      </div>
      <span class="debt-amount">${fmt(installmentVal)}</span>
    `;
    container.appendChild(div);
  });
}

// ============================================================
// CAP 3: LIVRO CAIXA INTEGRADO (com toggle e dropdowns dinâmicos)
// ============================================================
const CAIXA_TYPES = [
  '13°', 'Camila', 'Carol', 'Cartão Nubank', 'Cartão PicPay',
  'Cartão Santander', 'Espécie', 'Extras', 'Mamãe', 'Madrinha Chica',
  'Outros', 'Papai', 'Pix', 'Salário', 'Titia Solange'
];

function populateCaixaTypeDropdown() {
  const select = document.getElementById('caixa-type-select');
  if (!select) return;
  select.innerHTML = '';
  
  CAIXA_TYPES.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });
  checkOtherType();
}

window.toggleCaixaTypeSelect = function() {
  // Can filter categories based on Receipt / Expense in future,
  // but as requested, we keep the ordered list and toggle choice.
  checkOtherType();
};

window.checkOtherType = function() {
  const select = document.getElementById('caixa-type-select');
  const wrap = document.getElementById('caixa-other-type-wrap');
  if (select && wrap) {
    if (select.value === 'Outros') {
      wrap.style.display = 'block';
    } else {
      wrap.style.display = 'none';
    }
  }
};

function addCaixa() {
  const flowRadios = document.getElementsByName('caixa-flow');
  let flow = 'receita';
  for (let r of flowRadios) { if (r.checked) flow = r.value; }

  const selectType = document.getElementById('caixa-type-select').value;
  let type = selectType;
  if (selectType === 'Outros') {
    const otherVal = document.getElementById('caixa-other-type-val').value.trim();
    if (!otherVal) {
      showToast('Por favor, especifique a categoria do campo "Outros".');
      return;
    }
    type = otherVal;
  }

  const date = document.getElementById('caixa-date').value;
  const desc = document.getElementById('caixa-desc').value.trim();
  const val = parseFloat(document.getElementById('caixa-val').value) || 0;

  if (!date || val <= 0) {
    showToast('Informe uma data e valor válidos.');
    return;
  }

  state.caixa.push({
    id: genId(),
    flow,
    type,
    date,
    desc: desc || type,
    val
  });

  // Reset forms
  document.getElementById('caixa-desc').value = '';
  document.getElementById('caixa-val').value = '';
  document.getElementById('caixa-other-type-val').value = '';
  document.getElementById('caixa-type-select').value = 'Salário';
  checkOtherType();

  saveState();
  renderCaixaTable();
  renderCaixaSummary();
  updateCapaKPIs();
  showToast('Movimentação do Caixa registrada!');
}

window.deleteCaixaRow = function(id) {
  confirmDelete(() => {
    state.caixa = state.caixa.filter(c => c.id !== id);
    saveState();
    renderCaixaTable();
    renderCaixaSummary();
    updateCapaKPIs();
  });
};

function renderCaixaTable() {
  const tbody = document.getElementById('caixa-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Get table column filters
  const fDate = document.getElementById('filter-caixa-date').value.trim().toLowerCase();
  const fType = document.getElementById('filter-caixa-type').value;
  const fDesc = document.getElementById('filter-caixa-desc').value.trim().toLowerCase();
  const fVal  = parseFloat(document.getElementById('filter-caixa-val').value) || 0;

  let filtered = [...state.caixa];

  if (fDate) {
    filtered = filtered.filter(c => c.date && c.date.toLowerCase().includes(fDate));
  }
  if (fType) {
    filtered = filtered.filter(c => c.flow === fType);
  }
  if (fDesc) {
    filtered = filtered.filter(c => (c.type && c.type.toLowerCase().includes(fDesc)) || (c.desc && c.desc.toLowerCase().includes(fDesc)));
  }
  if (fVal > 0) {
    filtered = filtered.filter(c => c.val >= fVal);
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  filtered.forEach(c => {
    const tr = document.createElement('tr');
    const isReceita = c.flow === 'receita';
    const badgeClass = isReceita ? 'badge-receita' : 'badge-despesa';
    tr.innerHTML = `
      <td>${fmtDate(c.date)}</td>
      <td><span class="badge-country ${badgeClass}">${isReceita ? '🟢 Entrada' : '🔴 Saída'}</span></td>
      <td><strong>${c.type}</strong></td>
      <td>${c.desc}</td>
      <td class="${isReceita ? 'value-positive' : 'value-negative'}">${isReceita ? '+' : '-'}${fmt(c.val)}</td>
      <td><button onclick="deleteCaixaRow(${c.id})" class="btn-outline" style="padding:0.15rem 0.5rem; font-size:0.75rem; color:#c0392b; border-color:#c0392b;">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCaixaSummary() {
  const monthFilter = document.getElementById('summary-month-filter').value; // yyyy-mm
  let transactions = [...state.caixa];

  if (monthFilter) {
    transactions = transactions.filter(c => c.date && c.date.startsWith(monthFilter));
  }

  const totalIn = transactions.filter(c => c.flow === 'receita').reduce((sum, c) => sum + c.val, 0);
  const totalOut = transactions.filter(c => c.flow === 'despesa').reduce((sum, c) => sum + c.val, 0);
  const saldo = totalIn - totalOut;

  document.getElementById('caixa-total-in').textContent = fmt(totalIn);
  document.getElementById('caixa-total-out').textContent = fmt(totalOut);
  
  const saldoEl = document.getElementById('caixa-saldo');
  if (saldoEl) {
    saldoEl.textContent = fmt(saldo);
    saldoEl.style.color = saldo >= 0 ? '#1b8a5a' : '#c0392b';
  }

  // Calculate 13th Proj
  const currentYear = new Date().getFullYear();
  const salaryTrans = state.caixa.filter(c => {
    if (c.flow !== 'receita') return false;
    const year = new Date(c.date).getFullYear();
    return year === currentYear && (c.type.toLowerCase().includes('salário') || c.type.toLowerCase().includes('salario'));
  });

  const salaryVals = salaryTrans.map(c => c.val);
  const avgSalary = salaryVals.length ? salaryVals.reduce((a, b) => a + b, 0) / salaryVals.length : 0;
  
  document.getElementById('caixa-salary-avg').textContent = fmt(avgSalary);
  document.getElementById('caixa-13th-proj').textContent = fmt(avgSalary);
}

// ============================================================
// CAP 4: ELIMINANDO DÍVIDAS
// ============================================================
function renderCreditorDropdown() {
  const select = document.getElementById('debt-pay-who');
  if (!select) return;
  select.innerHTML = '';
  state.creditors.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

function addOrEditCreditor() {
  const name = document.getElementById('creditor-name').value.trim();
  const initial = parseFloat(document.getElementById('creditor-initial-val').value) || 0;
  const dueDay = parseInt(document.getElementById('creditor-due-day').value) || 10;

  if (!name || initial <= 0) {
    showToast('Insira o nome do credor e o valor inicial.');
    return;
  }

  const existingIdx = state.creditors.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
  if (existingIdx >= 0) {
    state.creditors[existingIdx].initialVal = initial;
    state.creditors[existingIdx].dueDay = dueDay;
    showToast(`Credor "${name}" atualizado.`);
  } else {
    state.creditors.push({
      id: genId().toString(),
      name,
      initialVal: initial,
      dueDay,
      installment: Math.round(initial / 10 * 100) / 100 || 50 // default installment
    });
    showToast(`Credor "${name}" adicionado.`);
  }

  document.getElementById('creditor-name').value = '';
  document.getElementById('creditor-initial-val').value = '';
  document.getElementById('creditor-due-day').value = '10';

  saveState();
  renderCreditorDropdown();
  renderDebtBalances();
  updateCapaKPIs();
  renderUpcomingDebts();
}

window.removeCreditor = function(name) {
  confirmDelete(() => {
    state.creditors = state.creditors.filter(c => c.name !== name);
    state.debtPayments = state.debtPayments.filter(p => p.who !== name);
    saveState();
    renderCreditorDropdown();
    renderDebtBalances();
    renderDebtHistory();
    updateCapaKPIs();
    renderUpcomingDebts();
  });
};

function addDebtPayment() {
  const who = document.getElementById('debt-pay-who').value;
  const val = parseFloat(document.getElementById('debt-pay-val').value) || 0;
  const date = document.getElementById('debt-pay-date').value;

  if (!who || val <= 0 || !date) {
    showToast('Informe o valor e a data do pagamento.');
    return;
  }

  state.debtPayments.push({
    id: genId(),
    who,
    val,
    date
  });

  document.getElementById('debt-pay-val').value = '';

  saveState();
  renderDebtBalances();
  renderDebtHistory();
  updateCapaKPIs();
  renderUpcomingDebts();
  showToast(`Pagamento de ${fmt(val)} para ${who} registrado.`);
}

window.deleteDebtPaymentRow = function(id) {
  confirmDelete(() => {
    state.debtPayments = state.debtPayments.filter(p => p.id !== id);
    saveState();
    renderDebtBalances();
    renderDebtHistory();
    updateCapaKPIs();
    renderUpcomingDebts();
  });
};

function renderDebtBalances() {
  const container = document.getElementById('debt-balances-list');
  if (!container) return;
  container.innerHTML = '';

  state.creditors.forEach(c => {
    const payments = state.debtPayments.filter(p => p.who === c.name).reduce((sum, p) => sum + p.val, 0);
    const initial = c.initialVal;
    const balance = Math.max(0, initial - payments);
    const pct = initial > 0 ? Math.min(100, Math.round((payments / initial) * 100)) : 100;
    const color = balance <= 0 ? '#1b8a5a' : '#c0392b';

    const div = document.createElement('div');
    div.style.cssText = 'background:var(--color-bg); padding:0.9rem; border-radius:var(--radius-sm); border:1px solid var(--color-border); position:relative;';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
        <div>
          <strong style="color:var(--color-primary-dark); font-size:0.9rem;">${c.name}</strong>
          <span style="font-size:0.75rem; color:var(--color-text-muted); display:block;">Inicial: ${fmt(initial)} | Vence dia ${c.dueDay}</span>
        </div>
        <div style="text-align:right;">
          <span style="color:${color}; font-weight:700; font-size:0.95rem;">${balance <= 0 ? 'Quitada! 🎉' : fmt(balance)}</span>
          <button onclick="removeCreditor('${c.name}')" class="btn-outline" style="padding:2px 6px; font-size:0.7rem; border-color:#c0392b; color:#c0392b; display:block; margin-left:auto; margin-top:2px;" title="Excluir Credor">Remover</button>
        </div>
      </div>
      <div style="background:var(--color-border); border-radius:10px; height:6px; overflow:hidden;">
        <div style="background:${balance <= 0 ? '#1b8a5a' : 'var(--color-accent)'}; height:100%; width:${pct}%; transition:width 0.5s;"></div>
      </div>
      <div style="text-align:right; font-size:0.75rem; color:var(--color-text-muted); margin-top:0.2rem;">${pct}% Pago</div>
    `;
    container.appendChild(div);
  });
}

function renderDebtHistory() {
  const tbody = document.getElementById('debt-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.debtPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(p.date)}</td>
      <td><strong>${p.who}</strong></td>
      <td class="value-positive">${fmt(p.val)}</td>
      <td><button onclick="deleteDebtPaymentRow(${p.id})" class="btn-outline" style="padding:0.15rem 0.5rem; font-size:0.75rem; color:#c0392b; border-color:#c0392b;">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// CAP 5: RESERVA & INVESTIMENTOS
// ============================================================
function addInvestment() {
  const type = document.getElementById('inv-type').value;
  const assetType = document.getElementById('inv-asset-type').value;
  const location = document.getElementById('inv-location').value.trim();
  const val = parseFloat(document.getElementById('inv-val').value) || 0;
  const date = document.getElementById('inv-date').value;

  if (!location || val <= 0 || !date) {
    showToast('Preencha todas as informações da movimentação.');
    return;
  }

  state.investments.push({
    id: genId(),
    type,
    assetType,
    location,
    val,
    date
  });

  document.getElementById('inv-location').value = '';
  document.getElementById('inv-val').value = '';

  saveState();
  renderInvestments();
  renderInvestmentCharts();
  updateCapaKPIs();
  showToast(`Movimentação em "${assetType}" registrada.`);
}

window.deleteInvestmentRow = function(id) {
  confirmDelete(() => {
    state.investments = state.investments.filter(i => i.id !== id);
    saveState();
    renderInvestments();
    renderInvestmentCharts();
    updateCapaKPIs();
  });
};

function renderInvestments() {
  const tbody = document.getElementById('inv-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const fAsset = document.getElementById('filter-inv-asset').value;
  const fType = document.getElementById('filter-inv-type').value;
  const fDate = document.getElementById('filter-inv-date').value.trim();

  let filtered = [...state.investments];

  if (fAsset) filtered = filtered.filter(i => i.assetType === fAsset);
  if (fType) filtered = filtered.filter(i => i.type === fType);
  if (fDate) filtered = filtered.filter(i => i.date && i.date.includes(fDate));

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  filtered.forEach(i => {
    const isSaque = i.type === 'saque';
    const isRend = i.type === 'rendimento';
    let badgeClass = 'badge-aporte';
    let typeLabel = '📥 Aporte';

    if (isRend) {
      badgeClass = 'badge-rendimento';
      typeLabel = '📈 Rendimento';
    } else if (isSaque) {
      badgeClass = 'badge-saque';
      typeLabel = '📤 Saque';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(i.date)}</td>
      <td><span class="badge-country ${badgeClass}">${typeLabel}</span></td>
      <td><strong>${i.assetType}</strong></td>
      <td>${i.location}</td>
      <td class="${isSaque ? 'value-negative' : 'value-positive'}">${isSaque ? '-' : '+'}${fmt(i.val)}</td>
      <td><button onclick="deleteInvestmentRow(${i.id})" class="btn-outline" style="padding:0.15rem 0.5rem; font-size:0.75rem; color:#c0392b; border-color:#c0392b;">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Calculate and render Asset balances summary
  const summaryContainer = document.getElementById('assets-summary-cards');
  if (summaryContainer) {
    summaryContainer.innerHTML = '';
    const assetTypes = ['SELIC', 'CDB', 'Tesouro IPCA+', 'LCI/LCA', 'FII', 'ETF', 'Poupança', 'Outro'];
    
    assetTypes.forEach(asset => {
      let balance = 0;
      state.investments.filter(i => i.assetType === asset).forEach(i => {
        if (i.type === 'aporte' || i.type === 'rendimento') balance += i.val;
        else if (i.type === 'saque') balance -= i.val;
      });

      if (balance !== 0 || asset === 'SELIC' || asset === 'CDB') {
        const card = document.createElement('div');
        card.className = 'asset-card';
        card.innerHTML = `
          <span class="asset-card-title">${asset}</span>
          <span class="asset-card-balance" style="color: ${balance >= 0 ? 'var(--color-primary-dark)' : '#c0392b'};">${fmt(balance)}</span>
        `;
        summaryContainer.appendChild(card);
      }
    });
  }
}

function renderInvestmentCharts() {
  const destroy = (chart) => { if (chart) { try { chart.destroy(); } catch (e) {} } };

  // ---- 1. PIE: Rendimentos por ativo ----
  const pieCtx = document.getElementById('invChartPie');
  if (pieCtx) {
    destroy(invChartPie);
    const map = {};
    state.investments.filter(i => i.type === 'rendimento').forEach(i => {
      map[i.assetType] = (map[i.assetType] || 0) + i.val;
    });
    const labels = Object.keys(map).length ? Object.keys(map) : ['Sem dados'];
    const data = Object.keys(map).length ? Object.values(map) : [1];
    invChartPie = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data, backgroundColor: ['#0f4c3a', '#c29d66', '#186851', '#34495e', '#2980b9', '#8e44ad', '#27ae60', '#f39c12'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });
  }

  // ---- 2. BAR: Aportes por ativo ----
  const barCtx = document.getElementById('invChartBar');
  if (barCtx) {
    destroy(invChartBar);
    const map = {};
    state.investments.filter(i => i.type === 'aporte').forEach(i => {
      map[i.assetType] = (map[i.assetType] || 0) + i.val;
    });
    const labels = Object.keys(map).length ? Object.keys(map) : ['Sem dados'];
    const data = Object.keys(map).length ? Object.values(map) : [0];
    invChartBar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Aportes (R$)', data, backgroundColor: 'rgba(15,76,58,0.75)', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  // ---- 3. LINE: Aportes mensais ----
  const lineCtx = document.getElementById('invChartLine');
  if (lineCtx) {
    destroy(invChartLine);
    const map = {};
    state.investments.filter(i => i.type === 'aporte').forEach(i => {
      const month = i.date ? i.date.substring(0, 7) : 'Sem data';
      map[month] = (map[month] || 0) + i.val;
    });
    const sorted = Object.entries(map).sort((a, b) => a[0] < b[0] ? -1 : 1);
    const labels = sorted.map(([k]) => { const [y, m] = k.split('-'); return `${m}/${y}`; });
    const data = sorted.map(([, v]) => v);
    invChartLine = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['Sem dados'],
        datasets: [{ label: 'Aportado', data: data.length ? data : [0], borderColor: '#c29d66', backgroundColor: 'rgba(194,157,102,0.12)', fill: true, tension: 0.4, pointRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  // ---- 4. HISTOGRAMA (Misto) ----
  const histCtx = document.getElementById('invChartHist');
  if (histCtx) {
    destroy(invChartHist);
    const months = [...new Set(state.investments.filter(i => i.date).map(i => i.date.substring(0, 7)))].sort();
    const labels = months.map(m => { const [y, mm] = m.split('-'); return `${mm}/${y}`; });
    const aportes = months.map(m => state.investments.filter(i => i.type === 'aporte' && i.date && i.date.startsWith(m)).reduce((s, i) => s + i.val, 0));
    const rends = months.map(m => state.investments.filter(i => i.type === 'rendimento' && i.date && i.date.startsWith(m)).reduce((s, i) => s + i.val, 0));
    const saques = months.map(m => state.investments.filter(i => i.type === 'saque' && i.date && i.date.startsWith(m)).reduce((s, i) => s + i.val, 0));

    invChartHist = new Chart(histCtx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Sem dados'],
        datasets: [
          { label: 'Aportes', data: aportes.length ? aportes : [0], backgroundColor: 'rgba(15,76,58,0.7)', borderRadius: 4 },
          { label: 'Rendimentos', data: rends.length ? rends : [0], backgroundColor: 'rgba(194,157,102,0.7)', borderRadius: 4 },
          { label: 'Saques', data: saques.length ? saques : [0], backgroundColor: 'rgba(192,57,43,0.65)', borderRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
  }
}

// ============================================================
// CAP 6: PROJETO INTERCÂMBIO
// ============================================================
function saveExchangeDest() {
  state.exchangePlan.destName = document.getElementById('exchange-dest-name').value.trim();
  state.exchangePlan.duration = parseInt(document.getElementById('exchange-duration').value) || 12;
  state.exchangePlan.rate = parseFloat(document.getElementById('exchange-rate').value) || 6.50;
  state.exchangePlan.currency = document.getElementById('exchange-currency').value.trim() || 'EUR';
  state.exchangePlan.monthlySavings = parseFloat(document.getElementById('exchange-monthly-savings').value) || 500;
  state.exchangePlan.monthlyYield = parseFloat(document.getElementById('exchange-monthly-yield').value) || 20;

  saveState();
  updateExchangeDisplay();
  showToast('Meta do intercâmbio salva.');
}

function calcExchangeCosts() {
  // Read all costs
  const keys = ['school', 'flight', 'visa', 'insurance', 'material', 'selfcare', 'health', 'food', 'transport', 'leisure', 'initial'];
  keys.forEach(k => {
    state.exchangeCosts[k] = parseFloat(document.getElementById(`exc-${k}`).value) || 0;
  });

  // Calculate totals
  // Fixed costs pre-trip
  const fixed = state.exchangeCosts.school + state.exchangeCosts.flight + state.exchangeCosts.visa + state.exchangeCosts.insurance + state.exchangeCosts.initial + state.exchangeCosts.material;
  // Survival costs monthly
  const monthly = state.exchangeCosts.selfcare + state.exchangeCosts.health + state.exchangeCosts.food + state.exchangeCosts.transport + state.exchangeCosts.leisure;
  const duration = state.exchangePlan.duration || 12;
  const monthlyTotal = monthly * duration;
  const total = fixed + monthlyTotal;

  state.exchangeCosts.fixed = fixed;
  state.exchangeCosts.monthlyTotal = monthlyTotal;
  state.exchangeCosts.total = total;

  saveState();
  updateExchangeDisplay();
  showToast('Custo total recalculado.');
}

function updateExchangeDisplay() {
  const total = state.exchangeCosts.total || 0;
  const rate = state.exchangePlan.rate || 6.50;
  const cur = state.exchangePlan.currency || 'EUR';
  const totalForeign = rate > 0 ? (total / rate).toFixed(2) : 0;

  document.getElementById('exchange-total-cost').textContent = fmt(total);
  document.getElementById('exchange-foreign-desc').textContent = `Em moeda local: ${cur} ${parseFloat(totalForeign).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  const fixLbl = document.getElementById('exc-fixed-total-lbl');
  if (fixLbl) fixLbl.textContent = fmt(state.exchangeCosts.fixed || 0);
  const monLbl = document.getElementById('exc-monthly-total-lbl');
  if (monLbl) monLbl.textContent = fmt(state.exchangeCosts.monthlyTotal || 0);

  // Fundo acumulado
  const acc = state.exchangeInvestments.reduce((sum, i) => {
    if (i.type === 'aporte' || i.type === 'rendimento') return sum + i.val;
    else if (i.type === 'saque') return sum - i.val;
    return sum;
  }, 0);

  document.getElementById('exc-acc-total-val').textContent = fmt(acc);
  
  const pct = total > 0 ? Math.min(100, Math.round((acc / total) * 100)) : 0;
  const bar = document.getElementById('exc-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
  
  const remaining = Math.max(0, total - acc);
  document.getElementById('exc-progress-pct-lbl').textContent = `${pct}% da meta (Restam ${fmt(remaining)})`;

  // Estimate months
  const monthlySavings = state.exchangePlan.monthlySavings || 500;
  const monthlyYield = state.exchangePlan.monthlyYield || 0;
  const totalMonthlyGrowth = monthlySavings + monthlyYield;
  
  let monthsToGoal = '...';
  if (totalMonthlyGrowth > 0 && remaining > 0) {
    monthsToGoal = Math.ceil(remaining / totalMonthlyGrowth);
  } else if (remaining === 0) {
    monthsToGoal = '0';
  }
  document.getElementById('exc-time-to-goal').textContent = `${monthsToGoal} meses`;
  
  // Update capa indicator too
  const cap1Progress = document.getElementById('exchange-progress-value');
  if (cap1Progress) {
    cap1Progress.textContent = `${pct}%`;
  }
}

function addExchangeInv() {
  const type = document.getElementById('exc-inv-type').value;
  const val = parseFloat(document.getElementById('exc-inv-val').value) || 0;
  const date = document.getElementById('exc-inv-date').value;

  if (val <= 0 || !date) {
    showToast('Informe o valor e a data do aporte na caixinha.');
    return;
  }

  state.exchangeInvestments.push({ id: genId(), type, val, date });
  document.getElementById('exc-inv-val').value = '';

  saveState();
  updateExchangeDisplay();
  renderExchangeHistory();
  showToast('Movimentação da caixinha registrada.');
  lucide.createIcons();
}

window.deleteExchangeInvRow = function(id) {
  confirmDelete(() => {
    state.exchangeInvestments = state.exchangeInvestments.filter(i => i.id !== id);
    saveState();
    updateExchangeDisplay();
    renderExchangeHistory();
  });
};

function renderExchangeHistory() {
  const tbody = document.getElementById('exc-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.exchangeInvestments].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(i => {
    const isSaque = i.type === 'saque';
    const typeLabel = i.type === 'aporte' ? '📥 Aporte' : i.type === 'rendimento' ? '📈 Rendimento' : '📤 Saque';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(i.date)}</td>
      <td><span class="badge-country ${isSaque ? 'badge-saque' : i.type === 'rendimento' ? 'badge-rendimento' : 'badge-aporte'}">${typeLabel}</span></td>
      <td class="${isSaque ? 'value-negative' : 'value-positive'}">${isSaque ? '-' : '+'}${fmt(i.val)}</td>
      <td><button onclick="deleteExchangeInvRow(${i.id})" class="btn-outline" style="padding:0.15rem 0.5rem; font-size:0.75rem; color:#c0392b; border-color:#c0392b;">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// CAP 8: REVENDA (CRM & COMPRAS INTEGRADO)
// ============================================================
function addRevendaSale() {
  const client = document.getElementById('rev-client').value.trim();
  const product = document.getElementById('rev-product').value.trim();
  const cost = parseFloat(document.getElementById('rev-cost').value) || 0;
  const price = parseFloat(document.getElementById('rev-price').value) || 0;
  const date = document.getElementById('rev-date').value;

  if (!client || !product || price <= 0 || !date) {
    showToast('Informe todos os dados obrigatórios da venda.');
    return;
  }

  const saleId = genId();
  const profit = price - cost;

  // Add sale to revenda
  state.revendaSales.push({
    id: saleId,
    client,
    product,
    cost,
    price,
    date
  });

  // AUTOMATICALLY log profit as EXTRA in Livro Caixa
  state.caixa.push({
    id: genId(),
    flow: 'receita',
    type: 'Extras',
    date,
    desc: `Lucro Revenda: ${product} (${client})`,
    val: profit,
    linkedRevendaSaleId: saleId // link for synced deletion
  });

  // Reset fields
  document.getElementById('rev-client').value = '';
  document.getElementById('rev-product').value = '';
  document.getElementById('rev-cost').value = '';
  document.getElementById('rev-price').value = '';

  saveState();
  renderRevendaSummary();
  renderRevendaSalesTable();
  renderCaixaTable();
  renderCaixaSummary();
  updateCapaKPIs();
  showToast(`Venda registrada! Lucro de ${fmt(profit)} integrado ao Caixa.`);
}

window.deleteRevendaSaleRow = function(id) {
  confirmDelete(() => {
    // Also remove the linked caixa entry
    state.caixa = state.caixa.filter(c => c.linkedRevendaSaleId !== id);
    state.revendaSales = state.revendaSales.filter(s => s.id !== id);
    
    saveState();
    renderRevendaSummary();
    renderRevendaSalesTable();
    renderCaixaTable();
    renderCaixaSummary();
    updateCapaKPIs();
  });
};

function renderRevendaSalesTable() {
  const tbody = document.getElementById('revenda-sales-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const sorted = [...state.revendaSales].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(s => {
    const profit = s.price - s.cost;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(s.date)}</td>
      <td><strong>${s.client}</strong></td>
      <td>${s.product}</td>
      <td class="value-negative">${fmt(s.cost)}</td>
      <td class="value-positive">${fmt(s.price)}</td>
      <td style="font-weight:700;" class="${profit >= 0 ? 'value-positive' : 'value-negative'}">${fmt(profit)}</td>
      <td><button onclick="deleteRevendaSaleRow(${s.id})" class="btn-outline" style="padding:0.15rem 0.5rem; font-size:0.75rem; color:#c0392b; border-color:#c0392b;">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function addPurchase() {
  const date = document.getElementById('pur-date').value;
  const supplier = document.getElementById('pur-supplier').value.trim();
  const subsupplier = document.getElementById('pur-subsupplier').value.trim();
  const product = document.getElementById('pur-product').value.trim();
  const qty = parseInt(document.getElementById('pur-qty').value) || 1;
  const price = parseFloat(document.getElementById('pur-price').value) || 0;

  if (!date || !supplier || !product || price <= 0) {
    showToast('Informe todos os dados da compra.');
    return;
  }

  // Compras de Revenda: as despesas vão pro fluxo de compras (não entram no caixa como despesa de caixa pessoal, a menos que o usuário queira pagar com o caixa pessoal)
  // Como o usuário solicitou integrar compras e vendas de revenda juntas, registramos e somamos.
  state.purchases.push({
    id: genId(),
    date,
    supplier,
    subsupplier,
    product,
    qty,
    price
  });

  document.getElementById('pur-supplier').value = '';
  document.getElementById('pur-subsupplier').value = '';
  document.getElementById('pur-product').value = '';
  document.getElementById('pur-price').value = '';
  document.getElementById('pur-qty').value = '1';

  saveState();
  renderPurchasesTable();
  renderRevendaSummary();
  showToast('Mercadoria adicionada ao estoque.');
}

window.deletePurchaseRow = function(id) {
  confirmDelete(() => {
    state.purchases = state.purchases.filter(p => p.id !== id);
    saveState();
    renderPurchasesTable();
    renderRevendaSummary();
  });
};

function renderPurchasesTable() {
  const tbody = document.getElementById('purchase-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.purchases].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(p.date)}</td>
      <td><strong>${p.supplier}</strong></td>
      <td>${p.subsupplier || '—'}</td>
      <td>${p.product}</td>
      <td>${p.qty}</td>
      <td class="value-negative">${fmt(p.price)}</td>
      <td><button onclick="deletePurchaseRow(${p.id})" class="btn-outline" style="padding:0.15rem 0.5rem; font-size:0.75rem; color:#c0392b; border-color:#c0392b;">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRevendaSummary() {
  const totalSales = state.revendaSales.reduce((sum, s) => sum + s.price, 0);
  const totalPurchases = state.purchases.reduce((sum, p) => sum + p.price, 0);
  const totalSalesCost = state.revendaSales.reduce((sum, s) => sum + s.cost, 0);
  const netProfit = totalSales - totalSalesCost;

  document.getElementById('revenda-sales-total').textContent = fmt(totalSales);
  document.getElementById('revenda-purchases-total').textContent = fmt(totalPurchases);
  document.getElementById('revenda-profit-total').textContent = fmt(netProfit);
}

// ============================================================
// CAP 9: ESPAÇO VICTOR
// ============================================================
function addVictorExpense() {
  const desc = document.getElementById('vic-desc').value.trim();
  const cat = document.getElementById('vic-cat').value;
  const val = parseFloat(document.getElementById('vic-val').value) || 0;
  const method = document.getElementById('vic-method').value;
  const date = document.getElementById('vic-date').value;

  if (!desc || val <= 0 || !date) {
    showToast('Informe todos os dados do gasto do casal.');
    return;
  }

  state.victorExpenses.push({
    id: genId(),
    desc,
    cat,
    val,
    method,
    date
  });

  document.getElementById('vic-desc').value = '';
  document.getElementById('vic-val').value = '';

  saveState();
  renderVictorHistory();
  renderVictorChart();
  showToast('Gasto registrado!');
  lucide.createIcons();
}

function addVictorCofrinho() {
  const type = document.getElementById('vic-cof-type').value;
  const loc = document.getElementById('vic-cof-loc').value.trim() || 'Nubank';
  const val = parseFloat(document.getElementById('vic-cof-val').value) || 0;
  const date = document.getElementById('vic-cof-date').value;

  // Update cofrinho goal focus & target as well
  state.victorCofrinhoPlan.goalName = document.getElementById('vic-cof-goal').value.trim() || 'Viagem Fim de Ano 🏝️';
  state.victorCofrinhoPlan.target = parseFloat(document.getElementById('vic-cof-target').value) || 3000;

  if (val <= 0 || !date) {
    showToast('Informe o valor e data do cofrinho.');
    return;
  }

  state.victorCofrinho.push({
    id: genId(),
    type,
    loc,
    val,
    date
  });

  document.getElementById('vic-cof-val').value = '';

  saveState();
  renderVictorHistory();
  renderVictorCofrinhoTotal();
  updateCapaKPIs();
  showToast('Movimentação do cofrinho adicionada!');
  lucide.createIcons();
}

window.deleteVictorExpenseRow = function(id) {
  confirmDelete(() => {
    state.victorExpenses = state.victorExpenses.filter(e => e.id !== id);
    saveState();
    renderVictorHistory();
    renderVictorChart();
  });
};

window.deleteVictorCofrinhoRow = function(id) {
  confirmDelete(() => {
    state.victorCofrinho = state.victorCofrinho.filter(c => c.id !== id);
    saveState();
    renderVictorHistory();
    renderVictorCofrinhoTotal();
    updateCapaKPIs();
  });
};

function renderVictorCofrinhoTotal() {
  const total = state.victorCofrinho.reduce((sum, c) => {
    if (c.type === 'deposito' || c.type === 'rendimento') return sum + c.val;
    else if (c.type === 'saque') return sum - c.val;
    return sum;
  }, 0);

  document.getElementById('vic-cof-total').textContent = fmt(total);
  
  // Render cap1 KPI
  const cap1Val = document.getElementById('vic-cof-cap1-value');
  if (cap1Val) cap1Val.textContent = fmt(total);

  // Render progress bar and details
  const target = state.victorCofrinhoPlan.target || 3000;
  const pct = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0;
  
  const bar = document.getElementById('vic-cof-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
  
  const lbl = document.getElementById('vic-cof-progress-pct');
  if (lbl) lbl.textContent = `${pct}% da meta de ${fmt(target)} (${state.victorCofrinhoPlan.goalName})`;

  const missing = Math.max(0, target - total);
  document.getElementById('vic-cof-missing-val').textContent = fmt(missing);
}

function renderVictorHistory() {
  const tbody = document.getElementById('vic-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const expRows = state.victorExpenses.map(e => ({
    id: e.id,
    date: e.date,
    tipo: '💳 Gasto Casal',
    desc: e.desc,
    cat: e.cat,
    method: e.method,
    val: e.val,
    isOut: true,
    action: `deleteVictorExpenseRow(${e.id})`
  }));

  const cofRows = state.victorCofrinho.map(c => {
    const isSaque = c.type === 'saque';
    const typeLabel = c.type === 'deposito' ? '💰 Guardar' : c.type === 'rendimento' ? '📈 Rendimento' : '📤 Retirar';
    return {
      id: c.id,
      date: c.date,
      tipo: typeLabel,
      desc: c.loc,
      cat: 'Cofrinho Meta',
      method: '—',
      val: c.val,
      isOut: isSaque,
      action: `deleteVictorCofrinhoRow(${c.id})`
    };
  });

  const all = [...expRows, ...cofRows].sort((a, b) => new Date(b.date) - new Date(a.date));

  all.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(r.date)}</td>
      <td><strong>${r.tipo}</strong></td>
      <td>${r.desc}</td>
      <td><span class="badge-country">${r.cat}</span></td>
      <td>${r.method}</td>
      <td class="${r.isOut ? 'value-negative' : 'value-positive'}">${r.isOut ? '-' : '+'}${fmt(r.val)}</td>
      <td><button onclick="${r.action}" class="btn-outline" style="padding:0.15rem 0.5rem; font-size:0.75rem; color:#c0392b; border-color:#c0392b;">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderVictorChart() {
  const ctx = document.getElementById('vicExpensesChart');
  if (!ctx) return;
  if (vicChart) { try { vicChart.destroy(); } catch (e) {} }

  const map = {};
  state.victorExpenses.forEach(e => { map[e.cat] = (map[e.cat] || 0) + e.val; });

  const labels = Object.keys(map);
  const data = Object.values(map);
  const colors = ['#0f4c3a', '#c29d66', '#186851', '#e67e22', '#2980b9', '#8e44ad', '#7f8c8d'];

  vicChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['Sem dados'],
      datasets: [{ data: data.length ? data : [0], backgroundColor: colors.slice(0, labels.length || 1), borderRadius: 6 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ============================================================
// CAP 10: DIÁRIO DO FUTURO
// ============================================================
function renderMoodboard() {
  const grid = document.getElementById('moodboard-grid');
  if (!grid) return;
  grid.innerHTML = '';
  state.diary.mood.forEach(item => {
    const div = document.createElement('div');
    div.className = 'mood-item';
    div.innerHTML = `
      <img src="${item.url}" class="mood-img" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=300'">
      <div class="mood-caption">${item.title}</div>
      <button onclick="deleteMoodItem(${item.id})" style="position:absolute; top:0.5rem; right:0.5rem; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:24px; height:24px; font-size:0.9rem; cursor:pointer; line-height:1;">&times;</button>
    `;
    grid.appendChild(div);
  });
}

window.deleteMoodItem = function(id) {
  confirmDelete(() => {
    state.diary.mood = state.diary.mood.filter(m => m.id !== id);
    saveState();
    renderMoodboard();
  });
};

window.openMoodModal = () => document.getElementById('mood-modal').classList.add('active');
window.closeMoodModal = () => document.getElementById('mood-modal').classList.remove('active');

window.saveMoodItem = function() {
  const title = document.getElementById('mood-input-title').value.trim();
  let url = document.getElementById('mood-input-url').value.trim();
  if (!title) { showToast('Informe o título.'); return; }
  if (!url) url = 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=300';
  
  state.diary.mood.push({ id: genId(), title, url });
  
  document.getElementById('mood-input-title').value = '';
  document.getElementById('mood-input-url').value = '';
  closeMoodModal();
  saveState();
  renderMoodboard();
  showToast('Imagem de inspiração salva.');
};

function renderGratitude() {
  const list = document.getElementById('gratitude-list');
  if (!list) return;
  list.innerHTML = '';
  state.diary.gratitude.forEach(item => {
    const el = document.createElement('div');
    el.className = 'journal-entry';
    el.innerHTML = `
      <div class="journal-date">${item.date}</div>
      <div class="journal-text">${item.text}</div>
      <button onclick="deleteGratitudeItem(${item.id})" class="btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem; color:#c0392b; border-color:#c0392b; margin-top:0.5rem;">Excluir</button>
    `;
    list.appendChild(el);
  });
}

window.deleteGratitudeItem = function(id) {
  confirmDelete(() => {
    state.diary.gratitude = state.diary.gratitude.filter(g => g.id !== id);
    saveState();
    renderGratitude();
  });
};

window.openGratitudeModal = () => document.getElementById('gratitude-modal').classList.add('active');
window.closeGratitudeModal = () => document.getElementById('gratitude-modal').classList.remove('active');

window.saveGratitudeItem = function() {
  const date = document.getElementById('gratitude-input-date').value.trim();
  const text = document.getElementById('gratitude-input-text').value.trim();
  if (!date || !text) { showToast('Informe data e lembrança.'); return; }
  
  state.diary.gratitude.push({ id: genId(), date, text });
  
  document.getElementById('gratitude-input-date').value = '';
  document.getElementById('gratitude-input-text').value = '';
  closeGratitudeModal();
  saveState();
  renderGratitude();
  showToast('Gratidão registrada.');
};

// ============================================================
// DASHBOARD CAP 1 KPI REATIVO
// ============================================================
function updateCapaKPIs() {
  // 1. Saldo Acumulado (Entradas - Saídas do Livro Caixa)
  const totalIn = state.caixa.filter(c => c.flow === 'receita').reduce((sum, c) => sum + c.val, 0);
  const totalOut = state.caixa.filter(c => c.flow === 'despesa').reduce((sum, c) => sum + c.val, 0);
  const saldo = totalIn - totalOut;
  const statusEl = document.getElementById('general-status-value');
  if (statusEl) {
    statusEl.textContent = fmt(saldo);
    statusEl.className = `kpi-value ${saldo >= 0 ? 'value-positive' : 'value-negative'}`;
  }

  // 2. Dívidas Restantes (Soma de todos os saldos devedores)
  const bal = getDebtBalances();
  const totalDebts = Object.values(bal).reduce((sum, val) => sum + val, 0);
  const debtsEl = document.getElementById('debts-total-value');
  if (debtsEl) debtsEl.textContent = fmt(totalDebts);

  // 3. Reserva Emergencial (Soma de SELIC + CDB nos Investimentos)
  const reserveInvested = state.investments
    .filter(i => i.assetType === 'SELIC' || i.assetType === 'CDB')
    .reduce((sum, i) => {
      if (i.type === 'aporte' || i.type === 'rendimento') return sum + i.val;
      else if (i.type === 'saque') return sum - i.val;
      return sum;
    }, 0);
  const reserveVal = Math.max(0, reserveInvested);
  const resEl = document.getElementById('reserve-progress-value');
  if (resEl) resEl.textContent = fmt(reserveVal);

  // 4. Dízimo (10% sobre todas as Entradas/Receitas)
  const tithVal = totalIn * 0.10;
  const tithEl = document.getElementById('tith-total-value');
  if (tithEl) tithEl.textContent = fmt(tithVal);
}

// ============================================================
// BACKUP FILE EXPORT
// ============================================================
function exportBackup() {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Horizonte_Backup_v3_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exportado com sucesso!');
}
