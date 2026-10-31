(() => {
  const status = document.getElementById('sync-status');
  const signIn = document.getElementById('google-sign-in');
  const signOut = document.getElementById('google-sign-out');
  const account = document.getElementById('sync-account');
  const accountName = document.getElementById('sync-account-name');
  const dialog = document.getElementById('sync-dialog');
  const label = document.getElementById('sync-button-label');
  const ownerKey = 'my-english-state-owner';
  let auth, db, sdk, stopWatching, saving = false, pendingState, saveTimer;
  let rejectedAccount = false;
  let ready = false;

  function setStatus(message, error = false) {
    status.textContent = message;
    status.classList.toggle('error', error);
  }
  document.getElementById('sync-button').addEventListener('click', () => dialog.showModal());

  const config = window.MY_ENGLISH_FIREBASE_CONFIG;
  if (!config) {
    setStatus('Bulut eşitlemesini açmak için Firebase projesinin kurulumu gerekiyor. Şu anki ilerlemen bu cihazda kayıtlı.');
    signIn.disabled = true;
    signIn.title = 'Firebase kurulumu tamamlanınca kullanılabilir';
    window.MyEnglishSync = { saveState() {} };
    return;
  }

  async function initialize() {
    try {
      const version = '13.1.0';
      const [appSdk, authSdk, dbSdk] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`)
      ]);
      sdk = { ...authSdk, ...dbSdk };
      const app = appSdk.initializeApp(config);
      auth = authSdk.getAuth(app);
      db = dbSdk.getFirestore(app);
      ready = true;
      try { await authSdk.getRedirectResult(auth); } catch (error) { setStatus(readableError(error), true); }
      authSdk.onAuthStateChanged(auth, user => user ? signedIn(user) : signedOut());
    } catch (error) {
      setStatus(`Firebase bağlantısı kurulamadı: ${readableError(error)}`, true);
    }
  }

  function readableError(error) {
    if (error?.code === 'auth/unauthorized-domain') return 'Bu web adresi Firebase girişinde izinli değil. Firebase ayarlarında alan adı eklenmeli.';
    if (error?.code === 'permission-denied') return 'Bulut veritabanı güvenlik kurallarını kontrol etmek gerekiyor.';
    return error?.message || 'Bağlantı hatası.';
  }

  function mergeProgress(local, remote) {
    const merged = { ...remote, ...local };
    merged.learned = [...new Set([...(remote.learned || []), ...(local.learned || [])])].sort((a, b) => a - b);
    merged.completed = Object.fromEntries([...new Set([...Object.keys(remote.completed || {}), ...Object.keys(local.completed || {})])].map(key => [key, Boolean(remote.completed?.[key] || local.completed?.[key])]));
    merged.reviews = { ...(remote.reviews || {}) };
    for (const [key, value] of Object.entries(local.reviews || {})) {
      const previous = merged.reviews[key];
      if (!previous || (value.stage || 0) > (previous.stage || 0)) merged.reviews[key] = value;
      else if ((value.stage || 0) === (previous.stage || 0)) merged.reviews[key] = { ...previous, ...value, due: Math.min(previous.due || Infinity, value.due || Infinity) };
    }
    merged.grammarCorrect = { ...(remote.grammarCorrect || {}) };
    for (const [key, value] of Object.entries(local.grammarCorrect || {})) merged.grammarCorrect[key] = Math.max(value || 0, merged.grammarCorrect[key] || 0);
    for (const key of ['minutes', 'streak', 'dailyMinutes', 'weekMinutes']) merged[key] = Math.max(Number(remote[key] || 0), Number(local[key] || 0));
    if (local.lastStudy && (!remote.lastStudy || local.lastStudy > remote.lastStudy)) merged.lastStudy = local.lastStudy;
    return merged;
  }

  async function signedIn(user) {
    if (stopWatching) stopWatching();
    if (config.ownerUid && user.uid !== config.ownerUid) {
      rejectedAccount = true;
      await sdk.signOut(auth);
      return;
    }
    signIn.hidden = true;
    account.hidden = false;
    accountName.textContent = user.displayName || user.email || 'Google hesabı';
    label.textContent = 'Eşitleniyor';
    setStatus('Hesap bağlandı. İlerlemen güvenli biçimde eşitleniyor…');
    const { doc, getDoc, onSnapshot, serverTimestamp, setDoc } = sdk;
    const ref = doc(db, 'users', user.uid);
    const localOwner = localStorage.getItem(ownerKey);
    const localState = window.MyEnglishAppState.getState();
    const snapshot = await getDoc(ref);
    if (localOwner && localOwner !== user.uid) {
      if (snapshot.exists()) window.MyEnglishAppState.applyState(snapshot.data().state || {});
      else window.MyEnglishAppState.applyState({});
    } else if (snapshot.exists()) {
      const merged = mergeProgress(localState, snapshot.data().state || {});
      window.MyEnglishAppState.applyState(merged);
      await setDoc(ref, { state: merged, updatedAt: serverTimestamp() });
    } else {
      await setDoc(ref, { state: localState, updatedAt: serverTimestamp() });
    }
    localStorage.setItem(ownerKey, user.uid);
    stopWatching = onSnapshot(ref, remote => {
      if (!remote.exists() || saving) return;
      const state = remote.data().state;
      if (state) {
        const current = window.MyEnglishAppState.getState();
        const merged = mergeProgress(current, state);
        if (JSON.stringify(current) !== JSON.stringify(merged)) window.MyEnglishAppState.applyState(merged);
        if (JSON.stringify(state) !== JSON.stringify(merged)) window.MyEnglishSync.saveState(merged);
      }
      label.textContent = 'Eşitlendi';
      setStatus('İlerlemen bu cihazla diğer cihazların arasında eşitleniyor.');
    }, error => setStatus(readableError(error), true));
  }

  function signedOut() {
    if (stopWatching) stopWatching();
    stopWatching = null;
    signIn.hidden = false;
    account.hidden = true;
    label.textContent = 'Eşitle';
    setStatus(rejectedAccount ? 'Bu Google hesabı için eşitleme izni yok.' : 'Giriş yapınca eşitleme burada etkinleşir.', rejectedAccount);
    rejectedAccount = false;
  }

  window.MyEnglishSync = {
    saveState(state) {
      if (!ready || !auth.currentUser || localStorage.getItem(ownerKey) !== auth.currentUser.uid) return;
      pendingState = state;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        if (!pendingState) return;
        saving = true;
        label.textContent = 'Kaydediliyor';
        try {
          await sdk.setDoc(sdk.doc(db, 'users', auth.currentUser.uid), { state: pendingState, updatedAt: sdk.serverTimestamp() });
          label.textContent = 'Eşitlendi';
          setStatus('İlerlemen bu cihazla diğer cihazların arasında eşitleniyor.');
        } catch (error) { setStatus(readableError(error), true); }
        finally { pendingState = null; saving = false; }
      }, 700);
    }
  };

  signIn.addEventListener('click', async () => {
    if (!ready) return;
    try {
      const provider = new sdk.GoogleAuthProvider();
      const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isAppleMobile || window.matchMedia('(display-mode: standalone)').matches) await sdk.signInWithRedirect(auth, provider);
      else await sdk.signInWithPopup(auth, provider);
    } catch (error) { setStatus(readableError(error), true); }
  });
  signOut.addEventListener('click', async () => {
    if (saveTimer) clearTimeout(saveTimer);
    if (pendingState && auth.currentUser) {
      try { await sdk.setDoc(sdk.doc(db, 'users', auth.currentUser.uid), { state: pendingState, updatedAt: sdk.serverTimestamp() }); } catch {}
    }
    try { await sdk.signOut(auth); } catch (error) { setStatus(readableError(error), true); }
  });
  initialize();
})();
