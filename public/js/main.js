import { getDbName, getTables, getColumns, runQuery, connectToDb, disconnectFromDb } from './api.js';
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

    // --- NEW: Connection Modal & Disconnect Setup ---
    document.getElementById('disconnect-btn').addEventListener('click', handleDisconnect);
    setupConnectionModal();

    // Check localStorage for auto-login
    const savedConfig = localStorage.getItem('pg_client_config');
    if (savedConfig) {
        try {
            await executeConnection(JSON.parse(savedConfig), false);
        } catch (e) {
            document.getElementById('connection-overlay').style.display = 'flex';
        }
    } else {
        // No saved config, show the login modal
        document.getElementById('connection-overlay').style.display = 'flex';
    }
}

// --- NEW: Handle Modal Tabs and Submit Button ---
function setupConnectionModal() {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.conn-form');

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.target).classList.add('active');
        });
    });

    // Connect button logic
    document.getElementById('connect-submit-btn').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent form submission reloading the page
        
        const isUri = document.getElementById('form-uri').classList.contains('active');
        const config = isUri ? 
            { connectionString: document.getElementById('conn-uri').value } :
            {
                host: document.getElementById('conn-host').value,
                port: document.getElementById('conn-port').value,
                user: document.getElementById('conn-user').value,
                password: document.getElementById('conn-pass').value,
                database: document.getElementById('conn-db').value,
            };
        
        await executeConnection(config, true);
    });
}

// --- NEW: Handle Connection Logic ---
async function executeConnection(config, saveToStorage) {
    const btn = document.getElementById('connect-submit-btn');
    const errorDiv = document.getElementById('conn-error');
    
    btn.textContent = 'Connecting...';
    btn.style.opacity = '0.7';
    btn.disabled = true;
    errorDiv.style.display = 'none';

    try {
        await connectToDb(config);
        
        if (saveToStorage) {
            localStorage.setItem('pg_client_config', JSON.stringify(config));
        }

        // Hide modal and show disconnect button
        document.getElementById('connection-overlay').style.display = 'none';
        document.getElementById('disconnect-btn').style.display = 'block';
        
        // Load UI Data now that we are connected
        const dbName = await getDbName();
        document.getElementById('active-db-name').textContent = dbName;
        
        const tables = await getTables();
        renderSidebar(tables, handleTableClick);
        
    } catch (error) {
        errorDiv.textContent = error.message || "Failed to connect";
        errorDiv.style.display = 'block';
        localStorage.removeItem('pg_client_config'); // Clear bad saved credentials
        document.getElementById('connection-overlay').style.display = 'flex';
        document.getElementById('active-db-name').textContent = 'Disconnected';
    } finally {
        btn.textContent = 'Connect';
        btn.style.opacity = '1';
        btn.disabled = false;
    }
}

// --- NEW: Handle Disconnect Logic ---
async function handleDisconnect() {
    localStorage.removeItem('pg_client_config');
    
    try {
        await disconnectFromDb();
    } catch(e) {
        console.error("Error disconnecting cleanly", e);
    }
    
    // Reset UI
    document.getElementById('connection-overlay').style.display = 'flex';
    document.getElementById('disconnect-btn').style.display = 'none';
    document.getElementById('active-db-name').textContent = 'Disconnected';
    document.getElementById('table-list').innerHTML = '';
    document.getElementById('results-table').innerHTML = '';
    document.getElementById('results-status').style.display = 'none';
    
    // Clear forms
    document.querySelectorAll('.conn-form input').forEach(input => input.value = '');
}

// --- Existing Functions Below ---

async function handleRunQuery() {
    const sql = getEditorValue();
    if (!sql) return;

    setButtonLoading(true);

    const table = document.getElementById('results-table');
    const statusDiv = document.getElementById('results-status');
    
    table.innerHTML = ''; 
    statusDiv.style.display = 'block';
    statusDiv.className = 'results-status'; 
    statusDiv.textContent = 'Executing query...';

    const startTime = performance.now();

    try {
        const data = await runQuery(sql);
        
        const endTime = performance.now();
        const durationMs = Math.round(endTime - startTime);

        renderTable(data, durationMs);
    } catch (error) {
        renderTable({ error: error.message || "Database connection failed." });
    } finally {
        setButtonLoading(false); 
    }
}

async function handleTableClick(tableName, container, header, event) {
    const clickedExpand = event.target.closest('.chevron') || event.target.closest('.handle');

    if (!clickedExpand) {
        const query = `SELECT * FROM ${tableName} LIMIT 100;`;
        setEditorValue(query);
        handleRunQuery(); 
        return; 
    }

    if (!container || !header) return; 

    const isExpanded = container.style.display === 'block';
    const chevron = header.querySelector('.chevron');

    if (isExpanded) {
        container.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
        return;
    }

    if (container.children.length > 0) {
        container.style.display = 'block';
        chevron.style.transform = 'rotate(90deg)';
        return;
    }

    container.innerHTML = '<li class="loading-cols">Loading columns...</li>';
    container.style.display = 'block';
    chevron.style.transform = 'rotate(90deg)';

    try {
        const columns = await getColumns(tableName);
        container.innerHTML = ''; 
        
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