// ============================================================
// PROJETO HORIZONTE v2.0 — APP.JS
// Motor de gestão financeira completo para Júlia Aragão
// ============================================================

// ---- ESTADO GLOBAL ----
let state = {
  // Cap 3: Livro Caixa
  caixa: [],

  // Cap 4: Salários e Extras
  salaryHistory: [],
  extras: [],
  config: {
    carol: 450.00,
    naturaExtra: 150.00
  },

  // Cap 5: Dívidas
  debtInitial: { Solange: 1743.98, Mila: 300.00, Vitinho: 250.00, Papis: 400.00, Chica: 350.00 },
  debtPayments: [],

  // Cap 7: Investimentos
  investments: [],

  // Cap 8: Intercâmbio
  exchangePlan: { destName:'', duration:12, rate:6.50, currency:'EUR' },
  exchangeCosts: {},
  exchangeInvestments: [],

  // Cap 9: Carreira
  careerNotes: '',

  // Cap 10: Natura
  naturaOrders: [],

  // Cap 13: Fluxo de compras
  purchases: [],

  // Cap 11: Victor
  victorExpenses: [],
  victorCofrinho: [],

  // Cap 12: Diário
  diary: {
    mood: [
      { id: 1, title: 'Praia em Malta', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=300&q=80' },
      { id: 2, title: 'Estudo e Foco', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80' },
      { id: 3, title: 'Independência', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=300&q=80' }
    ],
    gratitude: [
      { id: 1, date: 'Janeiro de 2026', text: 'Consegui pagar a fatura sem atrasos.' },
      { id: 2, date: 'Fevereiro de 2026', text: 'Boa comissão na Natura este mês.' }
    ],
    learnings: 'O Tesouro IPCA+ protege meu poder de compra contra a inflação nos próximos anos.',
    ideas: 'Criar pacotes de depilação + design de sobrancelha para formandas e noivas.'
  }
};

// Charts
let invChartPie=null, invChartBar=null, invChartLine=null, invChartHist=null, vicChart=null;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupSidebar();
  setupEventListeners();
  renderAll();
  lucide.createIcons();
});

// ============================================================
// SIDEBAR — Universal Drawer
// ============================================================
function setupSidebar() {
  const sidebar    = document.getElementById('sidebar');
  const overlay    = document.getElementById('sidebar-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const closeBtn   = document.getElementById('close-sidebar');

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

  // Close after selecting a chapter
  document.querySelectorAll('.chapter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-target'));
      closeSidebar();
    });
  });
}

// ============================================================
// TAB NAVIGATION
// ============================================================
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

// ============================================================
// FORMATTERS
// ============================================================
function fmt(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const [y,m,d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}
function genId() { return Date.now() + Math.floor(Math.random()*1000); }

// ============================================================
// LOCAL STORAGE
// ============================================================
const STORAGE_KEY = 'projeto_horizonte_v2';

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      // ensure nested objects
      state.diary = { ...state.diary, ...parsed.diary };
      state.config = { ...state.config, ...(parsed.config||{}) };
      state.debtInitial = { ...state.debtInitial, ...(parsed.debtInitial||{}) };
      state.exchangePlan = { ...state.exchangePlan, ...(parsed.exchangePlan||{}) };
    }
  } catch(e) {
    console.error('Erro ao carregar estado:', e);
  }
  // restore form values
  const el = (id) => document.getElementById(id);
  if (el('cfg-carol'))       el('cfg-carol').value       = state.config.carol;
  if (el('cfg-natura-extra')) el('cfg-natura-extra').value = state.config.naturaExtra;
  if (el('career-notes'))    el('career-notes').value    = state.careerNotes || '';
  if (el('learnings-textarea')) el('learnings-textarea').value = state.diary.learnings || '';
  if (el('ideas-textarea'))     el('ideas-textarea').value     = state.diary.ideas     || '';
}

// ============================================================
// SETUP EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if(el) el.addEventListener(ev, fn); };

  // Backup
  on('btn-export-backup', 'click', exportBackup);

  // Cap 3: Livro Caixa
  on('btn-add-caixa', 'click', addCaixa);

  // Cap 4: Salário + Extras
  on('btn-add-salary', 'click', addSalary);
  on('btn-add-extra', 'click', addExtra);
  on('btn-save-cfg-fixed', 'click', saveCfgFixed);

  // Cap 5: Dívidas
  on('btn-add-debt-pay', 'click', addDebtPayment);

  // Cap 6: Reserva slider
  on('reserve-monthly-slider', 'input', () => {
    const v = document.getElementById('reserve-monthly-slider').value;
    document.getElementById('reserve-slider-val').textContent = `R$ ${v}`;
    updateReserveCalc();
  });

  // Cap 7: Investimentos
  on('btn-add-inv', 'click', addInvestment);

  // Cap 8: Intercâmbio
  on('btn-calc-exchange', 'click', calcExchange);
  on('btn-add-exc-inv', 'click', addExchangeInv);

  // Cap 9: Carreira
  on('btn-save-career-notes', 'click', () => {
    state.careerNotes = document.getElementById('career-notes').value;
    saveState();
    showToast('Anotações de carreira salvas!');
  });

  // Cap 10: Natura
  on('btn-add-natura', 'click', addNaturaOrder);

  // Cap 13: Compras
  on('btn-add-purchase', 'click', addPurchase);

  // Cap 11: Victor
  on('btn-add-vic-exp', 'click', addVictorExpense);
  on('btn-add-vic-cof', 'click', addVictorCofrinho);

  // Cap 12: Diário
  on('btn-save-learnings', 'click', () => { state.diary.learnings = document.getElementById('learnings-textarea').value; saveState(); showToast('Aprendizados salvos!'); });
  on('btn-save-ideas',     'click', () => { state.diary.ideas     = document.getElementById('ideas-textarea').value;     saveState(); showToast('Ideias salvas!'); });
}

// ============================================================
// RENDER ALL
// ============================================================
function renderAll() {
  renderCaixaTable();
  renderCaixaSummary();
  renderSalaryHistory();
  updateSalaryKPIs();
  renderExtrasTable();
  renderDebtBalances();
  renderDebtHistory();
  updateReserveCalc();
  renderInvestments();
  renderInvestmentCharts();
  updateExchangeDisplay();
  renderExchangeHistory();
  renderNaturaTable();
  renderPurchasesTable();
  renderVictorHistory();
  renderVictorChart();
  renderVictorCofrinhoTotal();
  renderMoodboard();
  renderGratitude();
  updateCapaKPIs();
  lucide.createIcons();
}

// ============================================================
// TOAST
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
// CAP 3: LIVRO CAIXA
// ============================================================
function addCaixa() {
  const type = document.getElementById('caixa-type').value;
  const date = document.getElementById('caixa-date').value;
  const desc = document.getElementById('caixa-desc').value.trim();
  const val  = parseFloat(document.getElementById('caixa-val').value) || 0;

  if (!date || !desc || val <= 0) { showToast('Preencha todos os campos corretamente.'); return; }

  state.caixa.push({ id: genId(), type, date, desc, val });
  // clear
  document.getElementById('caixa-date').value = '';
  document.getElementById('caixa-desc').value = '';
  document.getElementById('caixa-val').value  = '';
  saveState();
  renderCaixaTable();
  renderCaixaSummary();
  updateCapaKPIs();
  showToast('Transação registrada!');
  lucide.createIcons();
}

function deleteCaixa(id) {
  state.caixa = state.caixa.filter(c => c.id !== id);
  saveState(); renderCaixaTable(); renderCaixaSummary(); updateCapaKPIs();
}

function renderCaixaTable() {
  const tbody = document.getElementById('caixa-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.caixa].sort((a,b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(c => {
    const isIn = c.type === 'receita';
    const badgeClass = `badge-${c.type}`;
    const typeLabel = c.type === 'receita' ? '🟢 Receita' : c.type === 'despesa' ? '🔴 Despesa' : '🔵 Cartão';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(c.date)}</td>
      <td><span class="badge-country ${badgeClass}">${typeLabel}</span></td>
      <td>${c.desc}</td>
      <td class="${isIn ? 'value-positive' : 'value-negative'}">${isIn ? '+' : '-'}${fmt(c.val)}</td>
      <td><button onclick="deleteCaixa(${c.id})" class="btn-outline" style="padding:0.15rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCaixaSummary() {
  const totalIn  = state.caixa.filter(c => c.type === 'receita').reduce((s,c) => s + c.val, 0);
  const totalOut = state.caixa.filter(c => c.type !== 'receita').reduce((s,c) => s + c.val, 0);
  const saldo    = totalIn - totalOut;

  const set = (id, val, cls) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = val; if (cls) el.className = cls; }
  };
  set('caixa-total-in',  fmt(totalIn));
  set('caixa-total-out', fmt(totalOut));
  const saldoEl = document.getElementById('caixa-saldo');
  if (saldoEl) {
    saldoEl.textContent = fmt(saldo);
    saldoEl.style.color = saldo >= 0 ? '#1b8a5a' : '#c0392b';
  }
}

// ============================================================
// CAP 4: SALÁRIO & EXTRAS
// ============================================================
function addSalary() {
  const month = document.getElementById('salary-month').value;
  const val   = parseFloat(document.getElementById('cfg-salary-add').value) || 0;
  if (!month || val <= 0) { showToast('Informe o mês e o valor do salário.'); return; }

  // update or add
  const idx = state.salaryHistory.findIndex(s => s.month === month);
  if (idx >= 0) {
    state.salaryHistory[idx].val = val;
  } else {
    state.salaryHistory.push({ month, val });
  }
  document.getElementById('cfg-salary-add').value = '';
  saveState(); renderSalaryHistory(); updateSalaryKPIs();
  showToast('Salário registrado!');
  lucide.createIcons();
}

function deleteSalary(month) {
  state.salaryHistory = state.salaryHistory.filter(s => s.month !== month);
  saveState(); renderSalaryHistory(); updateSalaryKPIs();
}

function renderSalaryHistory() {
  const tbody = document.getElementById('salary-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.salaryHistory].sort((a,b) => a.month < b.month ? 1 : -1);
  sorted.forEach(s => {
    const tr = document.createElement('tr');
    const [y,m] = s.month.split('-');
    const label = `${m}/${y}`;
    tr.innerHTML = `<td>${label}</td><td class="value-positive">${fmt(s.val)}</td>
      <td><button onclick="deleteSalary('${s.month}')" class="btn-outline" style="padding:0.15rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;">Excluir</button></td>`;
    tbody.appendChild(tr);
  });
}

function updateSalaryKPIs() {
  const vals = state.salaryHistory.map(s => s.val);
  const avg = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  const proj13 = avg; // full 13th = avg salary (paid in 2 halves in Nov and Dec)
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = fmt(v); };
  set('avg-salary-val', avg);
  set('proj-13-val', proj13);
}

function saveCfgFixed() {
  state.config.carol       = parseFloat(document.getElementById('cfg-carol').value) || 0;
  state.config.naturaExtra = parseFloat(document.getElementById('cfg-natura-extra').value) || 0;
  saveState(); showToast('Receitas fixas salvas!');
}

function addExtra() {
  const who  = document.getElementById('extra-who').value.trim();
  const val  = parseFloat(document.getElementById('extra-val').value) || 0;
  const date = document.getElementById('extra-date').value;
  if (!who || !date || val <= 0) { showToast('Preencha todos os campos do extra.'); return; }
  state.extras.push({ id: genId(), who, val, date });
  document.getElementById('extra-who').value  = '';
  document.getElementById('extra-val').value  = '';
  document.getElementById('extra-date').value = '';
  saveState(); renderExtrasTable(); showToast('Extra registrado!'); lucide.createIcons();
}

function deleteExtra(id) {
  state.extras = state.extras.filter(e => e.id !== id);
  saveState(); renderExtrasTable();
}

function renderExtrasTable() {
  const tbody = document.getElementById('extras-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.extras].sort((a,b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(e.date)}</td><td><strong>${e.who}</strong></td><td class="value-positive">${fmt(e.val)}</td>
      <td><button onclick="deleteExtra(${e.id})" class="btn-outline" style="padding:0.15rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;">Excluir</button></td>`;
    tbody.appendChild(tr);
  });
}

// ============================================================
// CAP 5: DÍVIDAS
// ============================================================
function getDebtBalances() {
  const bal = { ...state.debtInitial };
  state.debtPayments.forEach(p => {
    if (bal[p.who] !== undefined) {
      bal[p.who] = Math.max(0, bal[p.who] - p.val);
    }
  });
  return bal;
}

function addDebtPayment() {
  const who  = document.getElementById('debt-pay-who').value;
  const val  = parseFloat(document.getElementById('debt-pay-val').value) || 0;
  const date = document.getElementById('debt-pay-date').value;
  if (!who || !date || val <= 0) { showToast('Preencha todos os campos do pagamento.'); return; }

  state.debtPayments.push({ id: genId(), who, val, date });
  document.getElementById('debt-pay-val').value  = '';
  document.getElementById('debt-pay-date').value = '';
  saveState(); renderDebtBalances(); renderDebtHistory(); updateCapaKPIs();
  showToast(`Pagamento de ${fmt(val)} para ${who} registrado!`);
  lucide.createIcons();
}

function deleteDebtPayment(id) {
  state.debtPayments = state.debtPayments.filter(p => p.id !== id);
  saveState(); renderDebtBalances(); renderDebtHistory(); updateCapaKPIs();
}

function renderDebtBalances() {
  const list = document.getElementById('debt-balances-list');
  if (!list) return;
  const bal = getDebtBalances();
  const names = { Solange:'Titia Solange', Mila:'Mila', Vitinho:'Vitinho', Papis:'Papis', Chica:'Madrinha Chica' };
  list.innerHTML = Object.entries(bal).map(([k,v]) => {
    const initial = state.debtInitial[k] || 0;
    const pct = initial > 0 ? Math.round((1 - v/initial)*100) : 100;
    const color = v <= 0 ? '#1b8a5a' : '#c0392b';
    return `<li style="margin-bottom:0.8rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
        <strong>${names[k]}</strong>
        <span style="color:${color};font-weight:700;">${v <= 0 ? '✅ Quitada!' : fmt(v)}</span>
      </div>
      <div style="background:var(--color-border);border-radius:20px;height:6px;">
        <div style="background:${v<=0?'#1b8a5a':'var(--color-accent)'};border-radius:20px;height:6px;width:${pct}%;transition:width 0.5s;"></div>
      </div>
      <small style="color:var(--color-text-muted);">${pct}% pago</small>
    </li>`;
  }).join('');
}

function renderDebtHistory() {
  const tbody = document.getElementById('debt-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.debtPayments].sort((a,b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(p.date)}</td><td><strong>${p.who}</strong></td><td class="value-positive">${fmt(p.val)}</td>
      <td><button onclick="deleteDebtPayment(${p.id})" class="btn-outline" style="padding:0.15rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;">Excluir</button></td>`;
    tbody.appendChild(tr);
  });
}

// ============================================================
// CAP 6: RESERVA EMERGENCIAL
// ============================================================
function updateReserveCalc() {
  const slider = document.getElementById('reserve-monthly-slider');
  if (!slider) return;
  const monthly = parseFloat(slider.value) || 150;
  const target  = 6000;
  const rate    = 0.105 / 12; // 10.5% a.a.
  let bal = 0, months = 0;
  while (bal < target && months < 120) { bal = (bal + monthly) * (1 + rate); months++; }
  const el = document.getElementById('reserve-months-required');
  if (el) el.textContent = `${months} meses`;

  const base = new Date(2026, 6, 1);
  base.setMonth(base.getMonth() + months);
  const tgt = document.getElementById('reserve-target-date');
  if (tgt) tgt.textContent = base.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

  // Update reserve current (sum of deposits in investment tagged as Reserva)
  const reserveInvested = state.investments
    .filter(i => i.location.toLowerCase().includes('reserva') || i.location.toLowerCase().includes('selic') || i.location.toLowerCase().includes('cdb'))
    .reduce((s,i) => {
      if (i.type === 'aporte' || i.type === 'rendimento') return s + i.val;
      if (i.type === 'saque') return s - i.val;
      return s;
    }, 0);
  const reserveVal = Math.max(0, Math.min(target, reserveInvested));
  const setEl = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = fmt(v); };
  setEl('reserve-current-value', reserveVal);
  setEl('reserve-progress-value', reserveVal);
}

// ============================================================
// CAP 7: INVESTIMENTOS
// ============================================================
function addInvestment() {
  const type     = document.getElementById('inv-type').value;
  const location = document.getElementById('inv-location').value.trim();
  const val      = parseFloat(document.getElementById('inv-val').value) || 0;
  const date     = document.getElementById('inv-date').value;
  if (!location || !date || val <= 0) { showToast('Preencha todos os campos do investimento.'); return; }

  state.investments.push({ id: genId(), type, location, val, date });
  document.getElementById('inv-location').value = '';
  document.getElementById('inv-val').value      = '';
  document.getElementById('inv-date').value     = '';
  saveState(); renderInvestments(); renderInvestmentCharts(); updateCapaKPIs();
  showToast(`Investimento (${type}) registrado!`); lucide.createIcons();
}

function deleteInvestment(id) {
  state.investments = state.investments.filter(i => i.id !== id);
  saveState(); renderInvestments(); renderInvestmentCharts(); updateCapaKPIs();
}

function renderInvestments() {
  const tbody = document.getElementById('inv-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.investments].sort((a,b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(i => {
    const badgeClass = `badge-${i.type}`;
    const typeLabel  = i.type === 'aporte' ? '📥 Aporte' : i.type === 'rendimento' ? '📈 Rendimento' : '📤 Saque';
    const isOut = i.type === 'saque';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(i.date)}</td><td><span class="badge-country ${badgeClass}">${typeLabel}</span></td><td>${i.location}</td>
      <td class="${isOut ? 'value-negative' : 'value-positive'}">${isOut ? '-' : '+'}${fmt(i.val)}</td>
      <td><button onclick="deleteInvestment(${i.id})" class="btn-outline" style="padding:0.15rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;">Excluir</button></td>`;
    tbody.appendChild(tr);
  });

  // Summary KPIs
  const totalAportes    = state.investments.filter(i=>i.type==='aporte').reduce((s,i)=>s+i.val,0);
  const totalRendimentos= state.investments.filter(i=>i.type==='rendimento').reduce((s,i)=>s+i.val,0);
  const totalSaques     = state.investments.filter(i=>i.type==='saque').reduce((s,i)=>s+i.val,0);
  const saldo           = totalAportes + totalRendimentos - totalSaques;

  const setEl = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = fmt(v); };
  setEl('inv-total-aportes',    totalAportes);
  setEl('inv-total-rendimentos',totalRendimentos);
  setEl('inv-total-saques',     totalSaques);
  setEl('inv-saldo-atual',      saldo);
}

function renderInvestmentCharts() {
  // Helper destroy
  const destroy = (c) => { if(c) { try { c.destroy(); } catch(e){} } };

  // ---- 1. PIE: Rendimentos por local ----
  const pieCtx = document.getElementById('invChartPie');
  if (pieCtx) {
    destroy(invChartPie);
    const rendMap = {};
    state.investments.filter(i=>i.type==='rendimento').forEach(i=>{
      rendMap[i.location] = (rendMap[i.location]||0) + i.val;
    });
    const labels = Object.keys(rendMap).length ? Object.keys(rendMap) : ['Sem dados'];
    const data   = Object.keys(rendMap).length ? Object.values(rendMap) : [1];
    invChartPie = new Chart(pieCtx, {
      type:'doughnut',
      data:{ labels, datasets:[{data, backgroundColor:['#0f4c3a','#c29d66','#186851','#eaf3f0','#2ecc71','#e67e22'], borderWidth:0 }]},
      options:{ responsive:true, maintainAspectRatio:true, plugins:{ legend:{ position:'bottom', labels:{font:{size:11}} } } }
    });
  }

  // ---- 2. BAR: Aportes por local ----
  const barCtx = document.getElementById('invChartBar');
  if (barCtx) {
    destroy(invChartBar);
    const aportMap = {};
    state.investments.filter(i=>i.type==='aporte').forEach(i=>{
      aportMap[i.location] = (aportMap[i.location]||0) + i.val;
    });
    const labels = Object.keys(aportMap).length ? Object.keys(aportMap) : ['Sem dados'];
    const data   = Object.keys(aportMap).length ? Object.values(aportMap) : [0];
    invChartBar = new Chart(barCtx, {
      type:'bar',
      data:{ labels, datasets:[{ label:'Aportado (R$)', data, backgroundColor:'rgba(15,76,58,0.75)', borderRadius:6 }]},
      options:{ responsive:true, maintainAspectRatio:true, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true, ticks:{callback:v=>`R$ ${v.toLocaleString('pt-BR')}`}} } }
    });
  }

  // ---- 3. LINE: Aportes mensais ----
  const lineCtx = document.getElementById('invChartLine');
  if (lineCtx) {
    destroy(invChartLine);
    const monthMap = {};
    state.investments.filter(i=>i.type==='aporte').forEach(i=>{
      const m = i.date ? i.date.substring(0,7) : 'N/A';
      monthMap[m] = (monthMap[m]||0) + i.val;
    });
    const sorted = Object.entries(monthMap).sort((a,b) => a[0]<b[0]?-1:1);
    const labels = sorted.map(([k]) => { const [y,m]=k.split('-'); return `${m}/${y}`; });
    const data   = sorted.map(([,v]) => v);
    invChartLine = new Chart(lineCtx, {
      type:'line',
      data:{ labels: labels.length ? labels : ['—'], datasets:[{ label:'Aportes (R$)', data: data.length ? data : [0], borderColor:'#c29d66', backgroundColor:'rgba(194,157,102,0.12)', tension:0.4, fill:true, pointBackgroundColor:'#c29d66', pointRadius:5 }]},
      options:{ responsive:true, maintainAspectRatio:true, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true} } }
    });
  }

  // ---- 4. HIST (Bar): Aportes vs Rendimentos vs Saques por mês ----
  const histCtx = document.getElementById('invChartHist');
  if (histCtx) {
    destroy(invChartHist);
    const monthKeys = new Set();
    state.investments.forEach(i => { if(i.date) monthKeys.add(i.date.substring(0,7)); });
    const allMonths = [...monthKeys].sort();
    const labels  = allMonths.map(m => { const [y,mm]=m.split('-'); return `${mm}/${y}`; });
    const aportes = allMonths.map(m => state.investments.filter(i=>i.type==='aporte' && i.date&&i.date.startsWith(m)).reduce((s,i)=>s+i.val,0));
    const rendimentos = allMonths.map(m => state.investments.filter(i=>i.type==='rendimento' && i.date&&i.date.startsWith(m)).reduce((s,i)=>s+i.val,0));
    const saques  = allMonths.map(m => state.investments.filter(i=>i.type==='saque' && i.date&&i.date.startsWith(m)).reduce((s,i)=>s+i.val,0));
    invChartHist = new Chart(histCtx, {
      type:'bar',
      data:{ labels: labels.length ? labels : ['Sem dados'],
        datasets:[
          { label:'Aportes', data:aportes.length?aportes:[0], backgroundColor:'rgba(15,76,58,0.75)', borderRadius:4 },
          { label:'Rendimentos', data:rendimentos.length?rendimentos:[0], backgroundColor:'rgba(194,157,102,0.75)', borderRadius:4 },
          { label:'Saques', data:saques.length?saques:[0], backgroundColor:'rgba(192,57,43,0.65)', borderRadius:4 }
        ]},
      options:{ responsive:true, maintainAspectRatio:true, plugins:{legend:{position:'bottom'}}, scales:{ x:{stacked:false}, y:{beginAtZero:true} } }
    });
  }
}

// ============================================================
// CAP 8: INTERCÂMBIO
// ============================================================
function calcExchange() {
  state.exchangePlan.destName  = document.getElementById('exchange-dest-name').value.trim();
  state.exchangePlan.duration  = parseInt(document.getElementById('exchange-duration').value) || 12;
  state.exchangePlan.rate      = parseFloat(document.getElementById('exchange-rate').value) || 6.50;
  state.exchangePlan.currency  = document.getElementById('exchange-currency').value.trim() || 'EUR';

  const dur = state.exchangePlan.duration;
  const rate = state.exchangePlan.rate;
  const cur  = state.exchangePlan.currency;

  // Fixed costs
  const fixed = ['exc-school','exc-flight','exc-visa','exc-insurance','exc-initial','exc-material'].reduce((s,id) => {
    return s + (parseFloat(document.getElementById(id).value)||0);
  }, 0);

  // Monthly costs × duration
  const monthly = ['exc-health','exc-food','exc-transport','exc-leisure'].reduce((s,id) => {
    return s + (parseFloat(document.getElementById(id).value)||0);
  }, 0);
  const monthlyTotal = monthly * dur;

  const total = fixed + monthlyTotal;
  const totalForeign = rate > 0 ? (total / rate).toFixed(2) : 0;

  state.exchangeCosts = { fixed, monthlyTotal, total };
  saveState();
  updateExchangeDisplay();
  showToast('Custo calculado com sucesso!');
}

function updateExchangeDisplay() {
  const total = state.exchangeCosts.total || 0;
  const fixed = state.exchangeCosts.fixed || 0;
  const monthlyTotal = state.exchangeCosts.monthlyTotal || 0;
  const rate  = state.exchangePlan.rate || 6.50;
  const cur   = state.exchangePlan.currency || 'EUR';
  const totalForeign = rate > 0 ? (total/rate).toFixed(2) : 0;

  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  set('exchange-total-cost', fmt(total));
  set('exchange-foreign-desc', `Em moeda local: ${cur} ${parseFloat(totalForeign).toLocaleString('pt-BR', {minimumFractionDigits:2})}`);
  set('exc-fixed-total', fmt(fixed));
  set('exc-monthly-total', fmt(monthlyTotal));

  // Caixinha progress
  const acc = state.exchangeInvestments.reduce((s,i) => {
    if (i.type==='aporte' || i.type==='rendimento') return s + i.val;
    if (i.type==='saque') return s - i.val;
    return s;
  }, 0);
  set('exc-acc-total', fmt(acc));
  const pct = total > 0 ? Math.min(100, Math.round((acc/total)*100)) : 0;
  const bar = document.getElementById('exc-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
  set('exc-progress-pct', `${pct}% da meta`);
}

function addExchangeInv() {
  const type = document.getElementById('exc-inv-type').value;
  const val  = parseFloat(document.getElementById('exc-inv-val').value) || 0;
  const date = document.getElementById('exc-inv-date').value;
  if (!date || val <= 0) { showToast('Informe valor e data.'); return; }
  state.exchangeInvestments.push({ id: genId(), type, val, date });
  document.getElementById('exc-inv-val').value  = '';
  document.getElementById('exc-inv-date').value = '';
  saveState(); updateExchangeDisplay(); renderExchangeHistory();
  showToast('Adicionado à caixinha!'); lucide.createIcons();
}

function deleteExchangeInv(id) {
  state.exchangeInvestments = state.exchangeInvestments.filter(i => i.id !== id);
  saveState(); updateExchangeDisplay(); renderExchangeHistory();
}

function renderExchangeHistory() {
  const tbody = document.getElementById('exc-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const sorted = [...state.exchangeInvestments].sort((a,b)=>new Date(b.date)-new Date(a.date));
  sorted.forEach(i => {
    const typeLabel  = i.type==='aporte'?'📥 Aporte':i.type==='rendimento'?'📈 Rendimento':'📤 Saque';
    const isOut = i.type === 'saque';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(i.date)}</td><td>${typeLabel}</td>
      <td class="${isOut?'value-negative':'value-positive'}">${isOut?'-':'+'}${fmt(i.val)}</td>
      <td><button onclick="deleteExchangeInv(${i.id})" class="btn-outline" style="padding:0.15rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;">Excluir</button></td>`;
    tbody.appendChild(tr);
  });
}

// ============================================================
// CAP 10: NATURA
// ============================================================
function addNaturaOrder() {
  const client  = document.getElementById('nat-client').value.trim();
  const product = document.getElementById('nat-product').value.trim();
  const cost    = parseFloat(document.getElementById('nat-cost').value) || 0;
  const price   = parseFloat(document.getElementById('nat-price').value) || 0;
  const date    = document.getElementById('nat-date').value;
  if (!client || !product || !date || price <= 0) { showToast('Preencha todos os campos da venda.'); return; }
  state.naturaOrders.push({ id: genId(), client, product, cost, price, date });
  ['nat-client','nat-product','nat-cost','nat-price','nat-date'].forEach(id => document.getElementById(id).value = '');
  saveState(); renderNaturaTable(); showToast('Venda registrada!'); lucide.createIcons();
}

function deleteNaturaOrder(id) {
  state.naturaOrders = state.naturaOrders.filter(o => o.id !== id);
  saveState(); renderNaturaTable();
}

function renderNaturaTable() {
  const tbody = document.getElementById('natura-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  let totalSales = 0, totalCost = 0, totalProfit = 0;
  const sorted = [...state.naturaOrders].sort((a,b)=>new Date(b.date)-new Date(a.date));
  sorted.forEach(o => {
    const profit = o.price - o.cost;
    totalSales += o.price; totalCost += o.cost; totalProfit += profit;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(o.date)}</td><td><strong>${o.client}</strong></td><td>${o.product}</td>
      <td class="value-negative">${fmt(o.cost)}</td><td class="value-positive">${fmt(o.price)}</td>
      <td class="${profit>=0?'value-positive':'value-negative'}" style="font-weight:700;">${fmt(profit)}</td>
      <td><button onclick="deleteNaturaOrder(${o.id})" class="btn-outline" style="padding:0.15rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;">Excluir</button></td>`;
    tbody.appendChild(tr);
  });
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = fmt(v); };
  set('natura-sales-total', totalSales);
  set('natura-cost-total',  totalCost);
  set('natura-total-profit', totalProfit);
}

// ============================================================
// CAP 13: FLUXO DE COMPRAS
// ============================================================
function addPurchase() {
  const date        = document.getElementById('pur-date').value;
  const supplier    = document.getElementById('pur-supplier').value.trim();
  const subsupplier = document.getElementById('pur-subsupplier').value.trim();
  const product     = document.getElementById('pur-product').value.trim();
  const qty         = parseInt(document.getElementById('pur-qty').value) || 1;
  const price       = parseFloat(document.getElementById('pur-price').value) || 0;
  if (!date || !supplier || !product || price <= 0) { showToast('Preencha os campos obrigatórios da compra.'); return; }
  state.purchases.push({ id: genId(), date, supplier, subsupplier, product, qty, price });
  ['pur-date','pur-supplier','pur-subsupplier','pur-product','pur-price'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pur-qty').value = 1;
  saveState(); renderPurchasesTable(); showToast('Compra registrada!'); lucide.createIcons();
}

function deletePurchase(id) {
  state.purchases = state.purchases.filter(p => p.id !== id);
  saveState(); renderPurchasesTable();
}

function renderPurchasesTable() {
  const tbody = document.getElementById('purchase-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  let total = 0;
  const sorted = [...state.purchases].sort((a,b)=>new Date(b.date)-new Date(a.date));
  sorted.forEach(p => {
    total += p.price;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(p.date)}</td><td><strong>${p.supplier}</strong></td><td>${p.subsupplier||'—'}</td>
      <td>${p.product}</td><td>${p.qty}</td><td class="value-negative">${fmt(p.price)}</td>
      <td><button onclick="deletePurchase(${p.id})" class="btn-outline" style="padding:0.15rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;">Excluir</button></td>`;
    tbody.appendChild(tr);
  });
  const el = document.getElementById('purchase-total');
  if (el) el.textContent = fmt(total);
}

// ============================================================
// CAP 11: ESPAÇO VICTOR
// ============================================================
function addVictorExpense() {
  const desc   = document.getElementById('vic-desc').value.trim();
  const cat    = document.getElementById('vic-cat').value;
  const val    = parseFloat(document.getElementById('vic-val').value) || 0;
  const method = document.getElementById('vic-method').value;
  const date   = document.getElementById('vic-date').value;
  if (!desc || !date || val <= 0) { showToast('Preencha todos os campos da despesa.'); return; }
  state.victorExpenses.push({ id: genId(), desc, cat, val, method, date });
  ['vic-desc','vic-val','vic-date'].forEach(id => document.getElementById(id).value = '');
  saveState(); renderVictorHistory(); renderVictorChart(); showToast('Despesa adicionada!'); lucide.createIcons();
}

function addVictorCofrinho() {
  const type = document.getElementById('vic-cof-type').value;
  const loc  = document.getElementById('vic-cof-loc').value.trim();
  const val  = parseFloat(document.getElementById('vic-cof-val').value) || 0;
  const date = document.getElementById('vic-cof-date').value;
  if (!date || val <= 0) { showToast('Informe valor e data.'); return; }
  state.victorCofrinho.push({ id: genId(), type, loc, val, date });
  ['vic-cof-loc','vic-cof-val','vic-cof-date'].forEach(id => document.getElementById(id).value = '');
  saveState(); renderVictorHistory(); renderVictorCofrinhoTotal(); showToast('Cofrinho atualizado!'); lucide.createIcons();
}

function deleteVictorItem(id, source) {
  if (source === 'exp') state.victorExpenses  = state.victorExpenses.filter(e => e.id !== id);
  if (source === 'cof') state.victorCofrinho  = state.victorCofrinho.filter(c => c.id !== id);
  saveState(); renderVictorHistory(); renderVictorChart(); renderVictorCofrinhoTotal();
}

function renderVictorCofrinhoTotal() {
  const total = state.victorCofrinho.reduce((s,c) => {
    if (c.type==='deposito' || c.type==='rendimento') return s + c.val;
    if (c.type==='saque') return s - c.val;
    return s;
  }, 0);
  const el = document.getElementById('vic-cof-total');
  if (el) { el.textContent = fmt(total); el.style.color = total >= 0 ? 'var(--color-accent)' : '#c0392b'; }
}

function renderVictorHistory() {
  const tbody = document.getElementById('vic-history-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const expRows = state.victorExpenses.map(e => ({
    date: e.date, tipo: '💳 Despesa Casal', desc: e.desc, cat: e.cat, method: e.method, val: e.val, isOut: true, id: e.id, src:'exp'
  }));
  const cofRows = state.victorCofrinho.map(c => ({
    date: c.date,
    tipo: c.type==='deposito'?'💰 Cofrinho':c.type==='rendimento'?'📈 Rendimento':'📤 Saque',
    desc: c.loc || '—', cat: '—', method: '—', val: c.val, isOut: c.type==='saque', id: c.id, src:'cof'
  }));

  const all = [...expRows, ...cofRows].sort((a,b) => new Date(b.date) - new Date(a.date));
  all.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(r.date)}</td><td>${r.tipo}</td><td>${r.desc}</td><td>${r.cat}</td><td>${r.method}</td>
      <td class="${r.isOut?'value-negative':'value-positive'}">${r.isOut?'-':'+'}${fmt(r.val)}</td>`;
    tbody.appendChild(tr);
  });
}

function renderVictorChart() {
  const ctx = document.getElementById('vicExpensesChart');
  if (!ctx) return;
  if (vicChart) { try { vicChart.destroy(); } catch(e){} }

  const catMap = {};
  state.victorExpenses.forEach(e => { catMap[e.cat] = (catMap[e.cat]||0) + e.val; });
  const labels = Object.keys(catMap);
  const data   = Object.values(catMap);
  const colors = ['#0f4c3a','#c29d66','#186851','#e67e22','#2980b9','#8e44ad','#95a5a6'];

  vicChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['Sem dados'],
      datasets: [{ data: data.length ? data : [0], backgroundColor: colors.slice(0, labels.length || 1), borderRadius: 6 }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero:true, ticks: { callback: v => `R$ ${v}` } } }
    }
  });
}

// ============================================================
// CAP 12: DIÁRIO
// ============================================================
function renderMoodboard() {
  const grid = document.getElementById('moodboard-grid');
  if (!grid) return;
  grid.innerHTML = '';
  state.diary.mood.forEach(item => {
    const el = document.createElement('div');
    el.className = 'mood-item';
    el.innerHTML = `
      <img src="${item.url}" class="mood-img" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=300'">
      <div class="mood-caption">${item.title}</div>
      <button onclick="deleteMoodItem(${item.id})" style="position:absolute;top:0.5rem;right:0.5rem;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:24px;height:24px;font-size:0.9rem;cursor:pointer;line-height:1;">&times;</button>
    `;
    grid.appendChild(el);
  });
}

function openMoodModal()    { document.getElementById('mood-modal').classList.add('active'); }
function closeMoodModal()   { document.getElementById('mood-modal').classList.remove('active'); }
function saveMoodItem() {
  const title = document.getElementById('mood-input-title').value.trim();
  let url     = document.getElementById('mood-input-url').value.trim();
  if (!title) { showToast('Informe um título.'); return; }
  if (!url) url = 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=300';
  state.diary.mood.push({ id: genId(), title, url });
  document.getElementById('mood-input-title').value = '';
  document.getElementById('mood-input-url').value   = '';
  closeMoodModal(); saveState(); renderMoodboard(); showToast('Imagem adicionada!');
}
function deleteMoodItem(id) {
  state.diary.mood = state.diary.mood.filter(m => m.id !== id);
  saveState(); renderMoodboard();
}

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
      <button onclick="deleteGratitudeItem(${item.id})" class="btn-outline" style="padding:0.2rem 0.5rem;font-size:0.75rem;color:#c0392b;border-color:#c0392b;margin-top:0.5rem;">Excluir</button>
    `;
    list.appendChild(el);
  });
}

function openGratitudeModal()  { document.getElementById('gratitude-modal').classList.add('active'); }
function closeGratitudeModal() { document.getElementById('gratitude-modal').classList.remove('active'); }
function saveGratitudeItem() {
  const date = document.getElementById('gratitude-input-date').value.trim();
  const text = document.getElementById('gratitude-input-text').value.trim();
  if (!date || !text) { showToast('Preencha data e texto.'); return; }
  state.diary.gratitude.push({ id: genId(), date, text });
  document.getElementById('gratitude-input-date').value = '';
  document.getElementById('gratitude-input-text').value = '';
  closeGratitudeModal(); saveState(); renderGratitude(); showToast('Lembrança salva!');
}
function deleteGratitudeItem(id) {
  state.diary.gratitude = state.diary.gratitude.filter(g => g.id !== id);
  saveState(); renderGratitude();
}

// ============================================================
// CAPA — KPIs Resumo
// ============================================================
function updateCapaKPIs() {
  // Saldo geral = entradas - saídas do livro caixa
  const totalIn  = state.caixa.filter(c => c.type === 'receita').reduce((s,c) => s+c.val, 0);
  const totalOut = state.caixa.filter(c => c.type !== 'receita').reduce((s,c) => s+c.val, 0);
  const saldo    = totalIn - totalOut;

  const el = document.getElementById('general-status-value');
  if (el) {
    el.textContent = fmt(saldo);
    el.className = `kpi-value ${saldo >= 0 ? 'value-positive' : 'value-negative'}`;
  }

  // Dívidas restantes
  const bal = getDebtBalances();
  const totalDebts = Object.values(bal).reduce((s,v) => s+v, 0);
  const dEl = document.getElementById('debts-total-value');
  if (dEl) dEl.textContent = fmt(totalDebts);

  // Reserva
  updateReserveCalc();
}

// ============================================================
// BACKUP EXPORT
// ============================================================
function exportBackup() {
  const json     = JSON.stringify(state, null, 2);
  const blob     = new Blob([json], { type: 'application/json' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = `Horizonte_Backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exportado com sucesso!');
}
