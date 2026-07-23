/**
 * utils/validation.gs
 * バリデーション関数
 */

function validateTransaction(data) {
  const errors = [];
  
  // type チェック
  if (!data.type) {
    errors.push({ field: 'type', message: 'type は必須です' });
  } else if (!['expense', 'income'].includes(data.type)) {
    errors.push({ field: 'type', message: 'type は "expense" または "income" である必要があります' });
  }
  
  // date チェック
  if (!data.date) {
    errors.push({ field: 'date', message: 'date は必須です' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push({ field: 'date', message: 'date は YYYY-MM-DD 形式である必要があります' });
  }
  
  // amount チェック
  if (!data.amount) {
    errors.push({ field: 'amount', message: 'amount は必須です' });
  } else if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push({ field: 'amount', message: 'amount は 0 より大きい数値である必要があります' });
  }
  
  // category_id チェック
  if (!data.category_id) {
    errors.push({ field: 'category_id', message: 'category_id は必須です' });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function validateCategory(data) {
  const errors = [];
  
  // name チェック
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'name は必須です' });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function validateTag(data) {
  const errors = [];
  
  // name チェック
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'name は必須です' });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function validateStore(data) {
  const errors = [];
  
  // name チェック
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'name は必須です' });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function validateAccount(data) {
  const errors = [];
  
  // name チェック
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'name は必須です' });
  }
  
  // type チェック
  if (!data.type) {
    errors.push({ field: 'type', message: 'type は必須です' });
  } else if (!['bank', 'cash', 'securities'].includes(data.type)) {
    errors.push({ field: 'type', message: 'type は "bank", "cash", "securities" のいずれかである必要があります' });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}
