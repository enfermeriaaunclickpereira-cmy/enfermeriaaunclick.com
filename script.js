// Función que carga el contenido de cada sección dentro del mismo documento
function loadContent(page) {
    let content = document.getElementById('content');

    switch (page) {
        case 'sobre_ti':
            content.innerHTML = `
                <h2>Sobre Ti</h2>
                <p>Aquí puedes agregar el contenido sobre ti...</p>
            `;
            break;
        case 'sobre_nosotros':
            content.innerHTML = `
                <h2>Sobre Nosotros</h2>
                <p>Contenido sobre nosotros...</p>
            `;
            break;
        case 'salidas':
            content.innerHTML = `
                <h2>Salidas</h2>
                <p>Información sobre las salidas...</p>
            `;
            break;
        case 'dedicatorias':
            content.innerHTML = `
                <h2>Dedicatorias</h2>
                <p>Aquí puedes agregar dedicatorias...</p>
            `;
            break;
        case 'otros':
            content.innerHTML = `
                <h2>Otros</h2>
                <p>Contenido adicional...</p>
            `;
            break;
        default:
            content.innerHTML = `
                <h2>Bienvenido</h2>
                <p>Selecciona una opción del menú.</p>
            `;
            break;
    }
}
