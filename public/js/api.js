export async function connectToDb(config) {
    const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Connection failed');
    return data;
}

export async function disconnectFromDb() {
    await fetch('/api/disconnect', { method: 'POST' });
}

export async function getDbName() {
    const response = await fetch('/api/db-name');
    if (!response.ok) throw new Error('Failed to fetch DB name');
    const data = await response.json();
    return data.dbName;
}

export async function getTables() {
    const response = await fetch('/api/tables');
    if (!response.ok) throw new Error('Network error');
    return await response.json();
}

export async function getColumns(tableName) {
    const response = await fetch(`/api/columns/${tableName}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch columns for ${tableName}`);
    }
    return await response.json();
}

export async function runQuery(sql) {
    const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
    });
    return await response.json();
}
