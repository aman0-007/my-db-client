import { getTables, runQuery, getColumns } from './api.js';
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

async function handleTableClick(tableName, container, header) {
    const isExpanded = container.style.display === 'block';
    const chevron = header.querySelector('.chevron');

    // If it's already open, close it
    if (isExpanded) {
        container.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
        return;
    }

    // If it's closed but already has data, just open it (prevent re-fetching)
    if (container.children.length > 0) {
        container.style.display = 'block';
        chevron.style.transform = 'rotate(90deg)';
        return;
    }

    // Otherwise, it's the first time clicking. Show a loading state and fetch.
    container.innerHTML = '<li class="loading-cols">Loading columns...</li>';
    container.style.display = 'block';
    chevron.style.transform = 'rotate(90deg)';

    try {
        const columns = await getColumns(tableName);
        container.innerHTML = ''; // Clear loading message
        
        columns.forEach(col => {
            const li = document.createElement('li');
            li.className = 'column-item';
            
            // Format data types for cleaner UI (e.g., "character varying" -> "varchar")
            const shortType = col.data_type === 'character varying' ? 'varchar' : col.data_type;
            
            li.innerHTML = `
                <span class="col-name">${col.column_name}</span> 
                <span class="col-type">${shortType}</span>
            `;
            container.appendChild(li);
        });
    } catch (error) {
        container.innerHTML = '<li class="error-msg">Failed to load columns</li>';
    }
}