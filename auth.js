// ※ ここに「ウェブアプリとしてデプロイ」した際の正しいGASのURLを設定してください
const GAS_APP_URL = 'https://script.google.com/macros/s/AKfycbxK7v_C2QmCFzcsuqx816z1XjiOaXYcPb4nj4sf1UN-A1MtK1qE5Dl7bX2QFBBOJdfkEg/exec';
const TOKEN_KEY = 'kakeibo_session_token';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    // 2回目以降：トークンが存在する場合は即座にiframeを起動し、postMessageで送信
    bootGasApp(token);
  } else {
    // 初回：ログイン画面を表示
    setupLoginEvents();
  }
});

function setupLoginEvents() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-input').value.trim();
    const passcode = document.getElementById('passcode-input').value.trim();
    const errorMsg = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');

    errorMsg.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = '認証中...';

    try {
      const emailHash = await sha256(email);
      const passcodeHash = await sha256(passcode);

      // GAS側へ認証を依頼するため、iframeを一時的に作って通信するか、
      // あるいはJSONP/fetch等でCode.gs.authenticate()を呼ぶ必要があるが、
      // 本構成ではGASの関数を安全に呼び出すために google.script.run が使えない環境（GitHub Pages単体）のため、
      // GAS側へメッセージングやAPI経由で投げる、あるいはGASのエンドポイントにdoPostで認証リクエストを送る形になる。
      // ※要件のフロー「Code.gs.authenticate()」をGitHub Pagesから実行するため、
      //   GASをAPIエンドポイント（doPost）として呼び出すか、あるいはiframe経由でハンドリングさせる。
      //   ここでは標準的なfetchによるGAS doPost経由でのauthenticate実行を実装する。
      
      const res = await fetch(GAS_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'authenticate', emailHash, passcodeHash })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        bootGasApp(data.token);
      } else {
        errorMsg.textContent = data.message || '認証に失敗しました。メールアドレスまたはパスコードが誤っています。';
        loginBtn.disabled = false;
        loginBtn.textContent = 'ログイン';
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = '通信エラーが発生しました。時間をおいて再度お試しください。';
      loginBtn.disabled = false;
      loginBtn.textContent = 'ログイン';
    }
  });
}

async function sha256(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function bootGasApp(token) {
  document.getElementById('login-container').style.display = 'none';
  const iframe = document.getElementById('gasiframe');
  iframe.style.display = 'block';

  // URLパラメータは一切含めないクリーンなURLを指定
  iframe.src = GAS_APP_URL;

  iframe.onload = () => {
    // 読み込み完了後にpostMessageでトークンを送信（origin固定）
    iframe.contentWindow.postMessage({
      type: 'AUTH',
      token: token
    }, 'https://script.google.com');
  };

  // ログアウトやセッション失効メッセージをGASから受け取るリスナー
  window.addEventListener(message, (event) => {
    if (event.origin !== 'https://script.google.com') return;
    if (event.data && event.data.type === 'LOGOUT') {
      handleLogoutLocally();
    }
  });
}

function handleLogoutLocally() {
  localStorage.removeItem(TOKEN_KEY);
  document.getElementById('gasiframe').style.display = 'none';
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('login-form').reset();
  document.getElementById('login-btn').disabled = false;
  document.getElementById('login-btn').textContent = 'ログイン';
}
