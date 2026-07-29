export async function getTables() {
    const response = await fetch('/api/tables');
    if (!response.ok) throw new Error('Network error');
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

export async function getColumns(tableName) {
    const response = await fetch(`/api/columns/${tableName}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch columns for ${tableName}`);
    }
    return await response.json();
}