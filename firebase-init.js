// ============================================================
// FIREBASE INIT — Projeto Horizonte
// SDK Compat (compatível com script tag clássico, sem bundler)
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCbnZfb3l8xQN9SZxAu6-FS_3G3rmGG2Ho",
  authDomain: "horizonte-a21f3.firebaseapp.com",
  projectId: "horizonte-a21f3",
  storageBucket: "horizonte-a21f3.firebasestorage.app",
  messagingSenderId: "1072598742846",
  appId: "1:1072598742846:web:cdc90d110e4decff1dde6f"
};

// Inicializa o app (evita duplicatas se carregado mais de uma vez)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Expõe instâncias globais para uso em app.js
window.db   = firebase.firestore();
window.auth = firebase.auth();

// Habilita persistência offline (mantém dados no IndexedDB localmente)
window.db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firestore] Persistência offline não disponível (múltiplas abas abertas).');
    } else if (err.code === 'unimplemented') {
      console.warn('[Firestore] Persistência offline não suportada neste browser.');
    }
  });

console.log('[Firebase] Inicializado com sucesso. Projeto:', firebaseConfig.projectId);
