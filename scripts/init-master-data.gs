/**
 * 初期マスタデータ作成スクリプト
 * Categories（カテゴリ）と Accounts（資産口座）に初期データを追加
 */

// UUID 生成関数（簡易版）
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function initializeMasterData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date().toISOString();
  const userEmail = Session.getActiveUser().getEmail();
  
  // ===== 1. Categories（親カテゴリ）を追加 =====
  const categoriesSheet = spreadsheet.getSheetByName('Categories');
  
  const parentCategories = [
    { name: '食費', icon: '🍽️' },
    { name: '交通', icon: '🚗' },
    { name: '衣服', icon: '👕' },
    { name: '娯楽', icon: '🎮' },
    { name: '生活', icon: '🏠' },
    { name: '医療', icon: '🏥' },
    { name: '給料', icon: '💰' },
    { name: 'その他', icon: '📌' }
  ];
  
  const categoryData = [];
  const categoryMap = {}; // 後で子カテゴリ用に ID を保存
  
  parentCategories.forEach((cat, index) => {
    const id = generateUUID();
    categoryMap[cat.name] = id;
    categoryData.push([
      id,
      cat.name,
      null, // parent_id (親なし)
      cat.icon,
      index + 1, // sort_order
      now,
      now,
      null // deleted_at
    ]);
  });
  
  categoriesSheet.getRange(2, 1, categoryData.length, 8).setValues(categoryData);
  Logger.log(`✅ 親カテゴリ ${parentCategories.length} 個を追加`);
  
  // ===== 2. 子カテゴリを追加 =====
  const childCategories = [
    { parent: '食費', name: 'スーパー' },
    { parent: '食費', name: 'コンビニ' },
    { parent: '食費', name: '外食' },
    { parent: '交通', name: '電車' },
    { parent: '交通', name: 'ガソリン' },
    { parent: '交通', name: 'タクシー' },
    { parent: '衣服', name: '服' },
    { parent: '衣服', name: '靴' },
    { parent: '娯楽', name: 'ゲーム' },
    { parent: '娯楽', name: '映画' },
    { parent: '生活', name: '家賃' },
    { parent: '生活', name: '光熱費' },
    { parent: '生活', name: 'インターネット' },
    { parent: '医療', name: '病院' },
    { parent: '医療', name: '薬' }
  ];
  
  const childData = [];
  childCategories.forEach((cat, index) => {
    childData.push([
      generateUUID(),
      cat.name,
      categoryMap[cat.parent], // parent_id
      null, // icon
      index + 1, // sort_order
      now,
      now,
      null // deleted_at
    ]);
  });
  
  const nextRow = 1 + categoryData.length + 1;
  categoriesSheet.getRange(nextRow, 1, childData.length, 8).setValues(childData);
  Logger.log(`✅ 子カテゴリ ${childCategories.length} 個を追加`);
  
  // ===== 3. Accounts（資産口座）を追加 =====
  const accountsSheet = spreadsheet.getSheetByName('Accounts');
  
  const accounts = [
    { name: 'メイン銀行', type: 'bank', initial_balance: 0 },
    { name: '貯蓄銀行', type: 'bank', initial_balance: 0 },
    { name: '証券口座', type: 'securities', initial_balance: 0 },
    { name: '現金', type: 'cash', initial_balance: 0 }
  ];
  
  const accountData = [];
  accounts.forEach(acc => {
    accountData.push([
      generateUUID(),
      acc.name,
      acc.type,
      acc.initial_balance,
      now,
      now,
      null // deleted_at
    ]);
  });
  
  accountsSheet.getRange(2, 1, accountData.length, 7).setValues(accountData);
  Logger.log(`✅ 資産口座 ${accounts.length} 個を追加`);
  
  // ===== 4. Settings（システム設定）を追加 =====
  const settingsSheet = spreadsheet.getSheetByName('Settings');
  
  const settings = [
    { key: 'app_version', value: '1.0.0', type: 'string' },
    { key: 'last_data_migration', value: JSON.stringify({ date: new Date().toISOString().split('T')[0], records: 0 }), type: 'json' },
    { key: 'currency', value: 'JPY', type: 'string' }
  ];
  
  const settingsData = [];
  settings.forEach(setting => {
    settingsData.push([
      setting.key,
      setting.value,
      setting.type,
      now
    ]);
  });
  
  settingsSheet.getRange(2, 1, settingsData.length, 4).setValues(settingsData);
  Logger.log(`✅ システム設定 ${settings.length} 個を追加`);
  
  Logger.log('🎉 初期マスタデータ作成完了！');
}

// スクリプトを実行
initializeMasterData();
