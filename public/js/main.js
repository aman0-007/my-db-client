import { getDbName, getTables, getColumns, runQuery } from './api.js';
import { renderSidebar, renderTable, setEditorValue, getEditorValue, initEditor, setButtonLoading } from './ui.js';
import { initResizers } from './layout.js';

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    // Initialize the UI layout engine
    initResizers();

    const runBtn = document.getElementById('run-btn');
    runBtn.addEventListener('click', handleRunQuery);

    const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    initEditor(handleRunQuery);

    mobileToggleBtn.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.contains('is-collapsed');
        
        sidebar.classList.add('smooth-transition');

        if (!isCollapsed) {
            const headerHeight = document.querySelector('.sidebar-header').offsetHeight;
            const dbInfoHeight = document.querySelector('.sidebar-connection-info').offsetHeight;
            const targetHeight = headerHeight + dbInfoHeight;

            sidebar.dataset.openHeight = sidebar.getBoundingClientRect().height + 'px';

            sidebar.classList.add('is-collapsed');
            sidebar.style.height = targetHeight + 'px';
        } else {
            sidebar.classList.remove('is-collapsed');
            sidebar.style.height = sidebar.dataset.openHeight || '25vh';
        }

        setTimeout(() => {
            sidebar.classList.remove('smooth-transition');
        }, 300);
    });

    try {
        const dbName = await getDbName();
        document.getElementById('active-db-name').textContent = dbName;
    } catch (error) {
        document.getElementById('active-db-name').textContent = 'Disconnected';
    }

    try {
        const tables = await getTables();
        renderSidebar(tables, handleTableClick);
    } catch (error) {
        document.getElementById('table-list').innerHTML = '<li class="error-msg">Failed to load schema</li>';
    }
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

async function handleTableClick(tableName, container, header, event) {

    const clickedExpand = event.target.closest('.chevron') || event.target.closest('.handle');

    if (!clickedExpand) {
        const query = `SELECT * FROM ${tableName} LIMIT 100;`;
        setEditorValue(query);
        handleRunQuery(); // Run in background
        return; 
    }

    if (!container || !header) return; 

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