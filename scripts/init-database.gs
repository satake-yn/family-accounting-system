/**
 * スプレッドシート初期化スクリプト
 * 9つのシートを作成し、ヘッダー行を追加
 */

function initializeDatabase() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // シート定義（シート名 と ヘッダー行）
  const sheets = [
    {
      name: 'Transactions',
      headers: ['id', 'type', 'date', 'amount', 'category_id', 'subcategory_id', 'store_id', 'tags', 'memo', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by']
    },
    {
      name: 'Categories',
      headers: ['id', 'name', 'parent_id', 'icon', 'sort_order', 'created_at', 'updated_at', 'deleted_at']
    },
    {
      name: 'Tags',
      headers: ['id', 'name', 'color', 'created_at', 'updated_at', 'deleted_at']
    },
    {
      name: 'Stores',
      headers: ['id', 'name', 'category_id', 'created_at', 'updated_at', 'deleted_at', 'last_used_at']
    },
    {
      name: 'RecurringRules',
      headers: ['id', 'name', 'type', 'amount', 'category_id', 'day_of_month', 'is_active', 'last_executed_at', 'created_at', 'updated_at', 'deleted_at']
    },
    {
      name: 'Accounts',
      headers: ['id', 'name', 'type', 'initial_balance', 'created_at', 'updated_at', 'deleted_at']
    },
    {
      name: 'AssetSnapshots',
      headers: ['id', 'account_id', 'snapshot_date', 'balance', 'created_at', 'updated_at', 'deleted_at']
    },
    {
      name: 'Settings',
      headers: ['key', 'value', 'type', 'updated_at']
    },
    {
      name: 'Logs',
      headers: ['id', 'type', 'level', 'message', 'details', 'created_at']
    }
  ];
  
  // 各シートを作成
  sheets.forEach(sheetDef => {
    let sheet = spreadsheet.getSheetByName(sheetDef.name);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetDef.name);
      Logger.log(`シート作成: ${sheetDef.name}`);
    }
    
    // ヘッダー行を追加
    sheet.getRange(1, 1, 1, sheetDef.headers.length).setValues([sheetDef.headers]);
    Logger.log(`ヘッダー追加: ${sheetDef.name} - ${sheetDef.headers.join(', ')}`);
  });
  
  Logger.log('✅ データベース初期化完了！');
}

// スクリプトを実行
initializeDatabase();
