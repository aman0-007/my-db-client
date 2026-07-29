import { getTables, runQuery } from './api.js';
import { renderSidebar, renderTable, setEditorValue, getEditorValue, initEditor, setButtonLoading } from './ui.js';
import { initResizers } from './layout.js';

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    // Initialize the UI layout engine
    initResizers();

    const runBtn = document.getElementById('run-btn');
    runBtn.addEventListener('click', handleRunQuery);

    initEditor(handleRunQuery);

    try {
        const tables = await getTables();
        renderSidebar(tables, handleTableClick);
    } catch (error) {
        document.getElementById('table-list').innerHTML = '<li class="error-msg">Failed to load schema</li>';
    }
}

async function handleTableClick(tableName) {
    const query = `SELECT * FROM ${tableName} LIMIT 100;`;
    setEditorValue(query);
    await handleRunQuery();
}

async function handleRunQuery() {
    const sql = getEditorValue();
    if (!sql) return;

    setButtonLoading(true);

    renderTable({ results: null, error: null }); 
    document.getElementById('results-table').innerHTML = '<tr><td style="padding:16px; color:var(--text-secondary);">Executing query...</td></tr>';

    try {
        const data = await runQuery(sql);
        renderTable(data);
    } catch (error) {
        renderTable({ error: "Database connection failed." });
    } finally {
        setButtonLoading(false); 
    }
}