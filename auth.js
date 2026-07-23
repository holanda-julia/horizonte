// ============================================================
// AUTH.JS — Projeto Horizonte
// Lógica de autenticação da tela de login
// ============================================================

// ---- Redirecionamento se já estiver logado ----
auth.onAuthStateChanged((user) => {
  if (user) {
    // Usuária já autenticada — vai direto pro app
    window.location.href = 'index.html';
  }
});

// ---- Troca de aba (Entrar / Cadastrar) ----
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`form-${tab}`).classList.add('active');
  clearErrors();
}

// ---- Utilitários ----
function clearErrors() {
  document.querySelectorAll('.auth-error, .auth-success').forEach(el => {
    el.classList.remove('visible');
    el.textContent = '';
  });
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) { el.textContent = message; el.classList.add('visible'); }
}

function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) { el.textContent = message; el.classList.add('visible'); }
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

function disableAllButtons(disable) {
  document.querySelectorAll('.btn-google, .btn-primary').forEach(b => b.disabled = disable);
}

// ---- Tradução de erros Firebase (pt-BR) ----
function translateAuthError(code) {
  const errors = {
    'auth/user-not-found':          'Nenhuma conta encontrada com este e-mail.',
    'auth/wrong-password':          'Senha incorreta. Tente novamente.',
    'auth/invalid-credential':      'E-mail ou senha inválidos.',
    'auth/invalid-email':           'E-mail inválido. Verifique o formato.',
    'auth/email-already-in-use':    'Este e-mail já está cadastrado. Tente entrar.',
    'auth/weak-password':           'A senha deve ter pelo menos 6 caracteres.',
    'auth/too-many-requests':       'Muitas tentativas. Aguarde alguns minutos.',
    'auth/network-request-failed':  'Falha de conexão. Verifique sua internet.',
    'auth/popup-closed-by-user':    'Login cancelado. O popup foi fechado.',
    'auth/popup-blocked':           'Popup bloqueado pelo navegador. Permita popups para este site.',
    'auth/account-exists-with-different-credential':
                                    'Já existe uma conta com este e-mail usando outro método de login.',
  };
  return errors[code] || `Erro ao autenticar (${code}). Tente novamente.`;
}

// ============================================================
// GOOGLE SIGN-IN
// ============================================================
async function signInWithGoogle() {
  clearErrors();
  disableAllButtons(true);

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    await auth.signInWithPopup(provider);
    // onAuthStateChanged vai detectar o login e redirecionar
  } catch (err) {
    console.error('[Auth/Google]', err);
    const msg = translateAuthError(err.code);
    // Mostra o erro no form ativo
    const activeForm = document.querySelector('.auth-form.active');
    const errorId = activeForm?.id === 'form-login' ? 'login-error' : 'register-error';
    showError(errorId, msg);
    disableAllButtons(false);
  }
}

// ============================================================
// EMAIL + SENHA — LOGIN
// ============================================================
async function signInWithEmail() {
  clearErrors();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showError('login-error', 'Preencha o e-mail e a senha.');
    return;
  }

  setLoading('btn-login', true);

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // onAuthStateChanged vai detectar e redirecionar
  } catch (err) {
    console.error('[Auth/Email Login]', err);
    showError('login-error', translateAuthError(err.code));
    setLoading('btn-login', false);
  }
}

// ============================================================
// EMAIL + SENHA — CADASTRO
// ============================================================
async function registerWithEmail() {
  clearErrors();
  const name     = document.getElementById('register-name').value.trim();
  const email    = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  if (!name) {
    showError('register-error', 'Informe seu nome.');
    return;
  }
  if (!email) {
    showError('register-error', 'Informe seu e-mail.');
    return;
  }
  if (!password || password.length < 6) {
    showError('register-error', 'A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  setLoading('btn-register', true);

  try {
    const credential = await auth.createUserWithEmailAndPassword(email, password);
    // Atualiza o displayName do usuário
    await credential.user.updateProfile({ displayName: name });
    // onAuthStateChanged vai detectar e redirecionar
  } catch (err) {
    console.error('[Auth/Register]', err);
    showError('register-error', translateAuthError(err.code));
    setLoading('btn-register', false);
  }
}

// ============================================================
// PASSWORD VISIBILITY TOGGLE
// ============================================================
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  // Troca o ícone
  btn.innerHTML = isHidden
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>
       </svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
         <circle cx="12" cy="12" r="3"/>
       </svg>`;
}

// ---- Enter key listeners ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') signInWithEmail();
  });
  document.getElementById('register-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') registerWithEmail();
  });
  document.getElementById('login-email')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-password')?.focus();
  });
  document.getElementById('register-email')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('register-password')?.focus();
  });
});
