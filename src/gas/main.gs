/**
 * main.gs
 * エントリーポイント - HTTP リクエストハンドラー
 */

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const endpoint = payload.endpoint;
    const method = payload.method || 'POST';
    
    Logger.log(`[${method}] ${endpoint}`);
    
    // ルーティング
    switch (endpoint) {
      case '/transactions':
        return handleTransactionsRequest(payload, method);
      case '/categories':
        return handleCategoriesRequest(payload, method);
      case '/tags':
        return handleTagsRequest(payload, method);
      case '/stores':
        return handleStoresRequest(payload, method);
      case '/recurring-rules':
        return handleRecurringRulesRequest(payload, method);
      case '/accounts':
        return handleAccountsRequest(payload, method);
      case '/asset-snapshots':
        return handleAssetSnapshotsRequest(payload, method);
      case '/analytics/summary':
        return handleAnalyticsSummary(payload);
      case '/analytics/by-category':
        return handleAnalyticsByCategory(payload);
      case '/data/export':
        return handleDataExport(payload);
      default:
        return errorResponse(404, 'NOT_FOUND', 'エンドポイントが見つかりません');
    }
  } catch (error) {
    Logger.log(`[ERROR] ${error.message}`);
    return errorResponse(500, 'INTERNAL_ERROR', error.message);
  }
}

function doGet(e) {
  try {
    const endpoint = e.parameter.endpoint;
    const method = 'GET';
    
    Logger.log(`[${method}] ${endpoint}`);
    
    // ルーティング
    switch (endpoint) {
      case '/transactions':
        return handleTransactionsRequest(e.parameter, method);
      case '/categories':
        return handleCategoriesRequest(e.parameter, method);
      case '/tags':
        return handleTagsRequest(e.parameter, method);
      case '/stores':
        return handleStoresRequest(e.parameter, method);
      case '/accounts':
        return handleAccountsRequest(e.parameter, method);
      case '/asset-snapshots':
        return handleAssetSnapshotsRequest(e.parameter, method);
      default:
        return errorResponse(404, 'NOT_FOUND', 'エンドポイントが見つかりません');
    }
  } catch (error) {
    Logger.log(`[ERROR] ${error.message}`);
    return errorResponse(500, 'INTERNAL_ERROR', error.message);
  }
}

/**
 * ハンドラー関数（スタブ）
 */

function handleTransactionsRequest(payload, method) {
  switch (method) {
    case 'POST':
      return createTransaction(payload);
    case 'GET':
      return getTransactions(payload);
    default:
      return errorResponse(405, 'METHOD_NOT_ALLOWED', 'サポートされていないメソッド');
  }
}

function handleCategoriesRequest(payload, method) {
  switch (method) {
    case 'GET':
      return getCategories(payload);
    default:
      return errorResponse(405, 'METHOD_NOT_ALLOWED', 'サポートされていないメソッド');
  }
}

function handleTagsRequest(payload, method) {
  switch (method) {
    case 'GET':
      return getTags(payload);
    default:
      return errorResponse(405, 'METHOD_NOT_ALLOWED', 'サポートされていないメソッド');
  }
}

function handleStoresRequest(payload, method) {
  switch (method) {
    case 'GET':
      return getStores(payload);
    default:
      return errorResponse(405, 'METHOD_NOT_ALLOWED', 'サポートされていないメソッド');
  }
}

function handleRecurringRulesRequest(payload, method) {
  switch (method) {
    case 'GET':
      return getRecurringRules(payload);
    default:
      return errorResponse(405, 'METHOD_NOT_ALLOWED', 'サポートされていないメソッド');
  }
}

function handleAccountsRequest(payload, method) {
  switch (method) {
    case 'GET':
      return getAccounts(payload);
    default:
      return errorResponse(405, 'METHOD_NOT_ALLOWED', 'サポートされていないメソッド');
  }
}

function handleAssetSnapshotsRequest(payload, method) {
  switch (method) {
    case 'GET':
      return getAssetSnapshots(payload);
    default:
      return errorResponse(405, 'METHOD_NOT_ALLOWED', 'サポートされていないメソッド');
  }
}

function handleAnalyticsSummary(payload) {
  return successResponse(200, { message: 'Analytics Summary - Not implemented yet' });
}

function handleAnalyticsByCategory(payload) {
  return successResponse(200, { message: 'Analytics by Category - Not implemented yet' });
}

function handleDataExport(payload) {
  return successResponse(200, { message: 'Data Export - Not implemented yet' });
}

/**
 * ダミー実装（後で実装予定）
 */

function createTransaction(payload) {
  return errorResponse(501, 'NOT_IMPLEMENTED', 'まだ実装されていません');
}

function getTransactions(payload) {
  return successResponse(200, []);
}

function getCategories(payload) {
  const db = new Database();
  const categories = db.getRecords('Categories', { deleted_at: null });
  return successResponse(200, categories);
}

function getTags(payload) {
  return successResponse(200, []);
}

function getStores(payload) {
  return successResponse(200, []);
}

function getRecurringRules(payload) {
  return successResponse(200, []);
}

function getAccounts(payload) {
  const db = new Database();
  const accounts = db.getRecords('Accounts', { deleted_at: null });
  return successResponse(200, accounts);
}

function getAssetSnapshots(payload) {
  return successResponse(200, []);
}

/**
 * レスポンス生成ユーティリティ
 */

function successResponse(statusCode, data) {
  const output = ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function errorResponse(statusCode, code, message) {
  const output = ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: {
      code: code,
      message: message
    },
    meta: {
      timestamp: new Date().toISOString(),
      request_id: 'req_' + Date.now()
    }
  }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
