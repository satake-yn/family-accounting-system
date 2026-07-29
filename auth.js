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
    setupLoginEvent();
  }
});

window.addEventListener('message', (event) => {

  if (event.data && event.data.type === 'LOGOUT') {

    localStorage.removeItem(TOKEN_KEY);

    const iframe = document.getElementById('gasiframe');
    iframe.style.display = 'none';

    const login = document.getElementById('login-container');
    login.style.display = 'flex';

    document.getElementById('login-form').reset();

    document.getElementById('login-btn').disabled = false;
    document.getElementById('login-btn').textContent = 'ログイン';
  }

});

function setupLoginEvent() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email-input');
  const passcodeInput = document.getElementById('passcode-input');
  const loginBtn = document.getElementById('login-btn');
  const errorMsg = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMsg.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = '認証中...';

    try {
      const email = emailInput.value.trim();
      const passcode = passcodeInput.value;

      const emailHash = await sha256(email);
      const passcodeHash = await sha256(passcode);

      const res = await fetch(GAS_APP_URL, {
        method: 'POST',
        headers: {
          // GASへJSONを送る
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'authenticate',
          emailHash,
          passcodeHash
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);

        console.log('認証成功');
        console.log('bootGasApp開始');

        bootGasApp(data.token);

        console.log('bootGasApp終了');
      } else {
        errorMsg.textContent =
          data.message ||
          '認証に失敗しました。メールアドレスまたはパスコードが誤っています。';

        loginBtn.disabled = false;
        loginBtn.textContent = 'ログイン';
      }
    } catch (err) {
      console.error(err);

      errorMsg.textContent =
        '通信エラーが発生しました。時間をおいて再度お試しください。';

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

  iframe.src =
    GAS_APP_URL + '?token=' + encodeURIComponent(token);
}
function handleLogoutLocally() {
  localStorage.removeItem(TOKEN_KEY);
  document.getElementById('gasiframe').style.display = 'none';
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('login-form').reset();
  document.getElementById('login-btn').disabled = false;
  document.getElementById('login-btn').textContent = 'ログイン';
}
