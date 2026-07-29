export function initResizers() {
    // Horizontal Resizer (Sidebar)
    const sidebar = document.getElementById('sidebar');
    const resizerH = document.getElementById('resizer-sidebar');

    let x, w;
    const rsMouseupH = () => {
        document.removeEventListener('mousemove', rsMousemoveH);
        document.removeEventListener('mouseup', rsMouseupH);
        resizerH.classList.remove('is-resizing');
    };
    const rsMousemoveH = (e) => {
        const dx = e.clientX - x;
        sidebar.style.width = `${w + dx}px`;
    };
    resizerH.addEventListener('mousedown', (e) => {
        x = e.clientX;
        w = sidebar.getBoundingClientRect().width;
        resizerH.classList.add('is-resizing');
        document.addEventListener('mousemove', rsMousemoveH);
        document.addEventListener('mouseup', rsMouseupH);
    });

    // Vertical Resizer (Editor Pane)
    const editorPane = document.getElementById('editor-pane');
    const resizerV = document.getElementById('resizer-editor');

    let y, h;
    const rsMouseupV = () => {
        document.removeEventListener('mousemove', rsMousemoveV);
        document.removeEventListener('mouseup', rsMouseupV);
        resizerV.classList.remove('is-resizing');
    };
    const rsMousemoveV = (e) => {
        const dy = e.clientY - y;
        editorPane.style.height = `${h + dy}px`;
        editorPane.style.flex = 'none'; // Overrides flex: 1 if set
    };
    resizerV.addEventListener('mousedown', (e) => {
        y = e.clientY;
        h = editorPane.getBoundingClientRect().height;
        resizerV.classList.add('is-resizing');
        document.addEventListener('mousemove', rsMousemoveV);
        document.addEventListener('mouseup', rsMouseupV);
    });
}