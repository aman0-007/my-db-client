export function renderSidebar(tables, onTableClick) {
    const tableList = document.getElementById('table-list');
    tableList.innerHTML = '';

    if (!tables || tables.length === 0) {
        tableList.innerHTML = '<li class="loading">No tables found</li>';
        return;
    }

    tables.forEach(tableName => {
        const li = document.createElement('li');
        li.className = 'schema-item';
        
        // The clickable header
        const header = document.createElement('div');
        header.className = 'schema-header';
        header.innerHTML = `
            <span class="handle">≡</span>
            <span class="chevron">▶</span> 
            <span>${tableName}</span>
        `;
        
        // The container for the columns (hidden by default)
        const columnsContainer = document.createElement('ul');
        columnsContainer.className = 'column-list';
        columnsContainer.style.display = 'none';

        // Bind the click event
        header.addEventListener('click', (event) => {
            onTableClick(tableName, columnsContainer, header, event);
        });

        li.appendChild(header);
        li.appendChild(columnsContainer);
        tableList.appendChild(li);
    });
}

export function renderTable(data) {
    const table = document.getElementById('results-table');
    table.innerHTML = ''; 

    if (data.error) {
        table.innerHTML = `<tr><td class="error-msg">Error: ${data.error}</td></tr>`;
        return;
    }

    if (!data.results || data.results.length === 0) {
        table.innerHTML = '<tr><td class="info-msg">Query executed successfully. 0 rows returned.</td></tr>';
        return;
    }

    const columns = Object.keys(data.results[0]);

    // Build Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Build Body
    const tbody = document.createElement('tbody');
    data.results.forEach(rowData => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            const val = rowData[col];
            if (val === null) {
                td.textContent = 'NULL';
                td.className = 'null-value';
            } else {
                td.textContent = val;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
}

let cmInstance = null;

export function initEditor(onRunKey) {
    const textarea = document.getElementById('sql-input');
    
    // Initialize CodeMirror 5
    cmInstance = CodeMirror.fromTextArea(textarea, {
        mode: 'text/x-sql',
        theme: 'darcula', // Matches our dark IDE aesthetic
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        extraKeys: {
            // Bind our keyboard shortcuts directly inside CodeMirror
            "Ctrl-Enter": onRunKey,
            "Cmd-Enter": onRunKey
        }
    });
}

export function setEditorValue(value) {
    if (cmInstance) {
        cmInstance.setValue(value);
    }
}

export function getEditorValue() {
    if (cmInstance) {
        return cmInstance.getValue().trim(); 
    }
    return '';
}

export function setButtonLoading(isLoading) {
    const btn = document.getElementById('run-btn');
    
    if (isLoading) {
        btn.classList.add('is-loading');
        // Swap to a spinning line-loader SVG
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
            Running...
        `;
    } else {
        btn.classList.remove('is-loading');
        // Revert back to the play polygon SVG
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Run
        `;
    }
}