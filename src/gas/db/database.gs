/**
 * database.gs
 * DB抽象化層 - Spreadsheet との連携
 */

class Database {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  /**
   * 指定したテーブル（シート）を取得
   */
  getTable(name) {
    const sheet = this.spreadsheet.getSheetByName(name);
    if (!sheet) {
      throw new Error(`Sheet not found: ${name}`);
    }
    return new Table(sheet);
  }
  
  /**
   * レコード作成
   */
  createRecord(tableName, data) {
    const table = this.getTable(tableName);
    return table.insert(data);
  }
  
  /**
   * レコード取得（複数）
   */
  getRecords(tableName, query = {}) {
    const table = this.getTable(tableName);
    return table.find(query);
  }
  
  /**
   * レコード取得（単一）
   */
  getRecord(tableName, id) {
    const table = this.getTable(tableName);
    const records = table.find({ id: id });
    return records.length > 0 ? records[0] : null;
  }
  
  /**
   * レコード更新
   */
  updateRecord(tableName, id, data) {
    const table = this.getTable(tableName);
    return table.update(id, data);
  }
  
  /**
   * レコード削除（論理削除）
   */
  deleteRecord(tableName, id) {
    const table = this.getTable(tableName);
    return table.delete(id);
  }
}

/**
 * Table クラス
 * 個別シートの操作を担当
 */
class Table {
  constructor(sheet) {
    this.sheet = sheet;
    this.headers = this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn()).getValues()[0];
    this.data = this.sheet.getRange(2, 1, Math.max(this.sheet.getLastRow() - 1, 0), this.sheet.getLastColumn()).getValues();
  }
  
  /**
   * ヘッダーインデックスを取得
   */
  getColumnIndex(fieldName) {
    return this.headers.indexOf(fieldName);
  }
  
  /**
   * レコードを追加
   */
  insert(data) {
    const row = [];
    this.headers.forEach(header => {
      row.push(data[header] || '');
    });
    this.sheet.appendRow(row);
    return data;
  }
  
  /**
   * レコードを検索
   */
  find(query = {}) {
    const results = [];
    
    this.data.forEach((row) => {
      let match = true;
      
      for (const [key, value] of Object.entries(query)) {
        const colIndex = this.getColumnIndex(key);
        if (colIndex === -1) continue;
        
        // deleted_at が null のみを抽出する場合
        if (key === 'deleted_at' && value === null) {
          if (row[colIndex] !== '') match = false;
        } else {
          if (row[colIndex] !== value) match = false;
        }
      }
      
      if (match) {
        const record = {};
        this.headers.forEach((header, index) => {
          record[header] = row[index];
        });
        results.push(record);
      }
    });
    
    return results;
  }
  
  /**
   * レコードを更新
   */
  update(id, data) {
    const idColIndex = this.getColumnIndex('id');
    
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i][idColIndex] === id) {
        const rowIndex = i + 2; // ヘッダー + 1
        
        this.headers.forEach((header, colIndex) => {
          if (data[header] !== undefined) {
            this.sheet.getRange(rowIndex, colIndex + 1).setValue(data[header]);
          }
        });
        
        return data;
      }
    }
    
    throw new Error(`Record not found: ${id}`);
  }
  
  /**
   * レコードを削除（論理削除：deleted_at に timestamp を設定）
   */
  delete(id) {
    const deletedAtColIndex = this.getColumnIndex('deleted_at');
    const idColIndex = this.getColumnIndex('id');
    
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i][idColIndex] === id) {
        const rowIndex = i + 2;
        this.sheet.getRange(rowIndex, deletedAtColIndex + 1).setValue(new Date().toISOString());
        return { id: id, deleted_at: new Date().toISOString() };
      }
    }
    
    throw new Error(`Record not found: ${id}`);
  }
}
