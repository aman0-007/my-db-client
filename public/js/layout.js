export function initResizers() {
    // Horizontal Resizer (Sidebar)
    const sidebar = document.getElementById('sidebar');
    const resizerH = document.getElementById('resizer-sidebar');
    let x, y, w, h;

    const rsPointerUpH = () => {
        document.removeEventListener('pointermove', rsPointerMoveH);
        document.removeEventListener('pointerup', rsPointerUpH);
        resizerH.classList.remove('is-resizing');
    };

    const rsPointerMoveH = (e) => {
        if (window.innerWidth <= 768) {
            // Mobile: Dragging up/down changes HEIGHT
            const dy = e.clientY - y;
            sidebar.style.height = `${h + dy}px`;
            sidebar.style.width = '100%'; 
            sidebar.style.flex = 'none';
        } else {
            // Desktop: Dragging left/right changes WIDTH
            const dx = e.clientX - x;
            sidebar.style.width = `${w + dx}px`;
            sidebar.style.height = '100%'; 
            sidebar.style.flex = 'none';
        }
    };

    // Upgraded from mousedown to pointerdown
    resizerH.addEventListener('pointerdown', (e) => {
        e.preventDefault(); // Crucial for mobile touch dragging
        x = e.clientX;
        y = e.clientY;
        w = sidebar.getBoundingClientRect().width;
        h = sidebar.getBoundingClientRect().height;
        resizerH.classList.add('is-resizing');
        document.addEventListener('pointermove', rsPointerMoveH);
        document.addEventListener('pointerup', rsPointerUpH);
    });

    // Vertical Resizer (Editor Pane)
    const editorPane = document.getElementById('editor-pane');
    const resizerV = document.getElementById('resizer-editor');
    let yV, hV;

    const rsPointerUpV = () => {
        document.removeEventListener('pointermove', rsPointerMoveV);
        document.removeEventListener('pointerup', rsPointerUpV);
        resizerV.classList.remove('is-resizing');
    };

    const rsPointerMoveV = (e) => {
        const dy = e.clientY - yV;
        editorPane.style.height = `${hV + dy}px`;
        editorPane.style.flex = 'none';
    };

    // Upgraded from mousedown to pointerdown
    resizerV.addEventListener('pointerdown', (e) => {
        e.preventDefault(); // Crucial for mobile touch dragging
        yV = e.clientY;
        hV = editorPane.getBoundingClientRect().height;
        resizerV.classList.add('is-resizing');
        document.addEventListener('pointermove', rsPointerMoveV);
        document.addEventListener('pointerup', rsPointerUpV);
    });
}