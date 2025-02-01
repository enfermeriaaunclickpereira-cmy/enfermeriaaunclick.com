function loadContent(content) {
    // Aquí cambiamos el contenido de la página según el botón que se haga clic
    const contentContainer = document.getElementById("content"); // Asegúrate de tener un contenedor con id="content"
    switch(content) {
        case "sobre_ti":
            contentContainer.innerHTML = "<h2>Sobre Ti</h2><p>Este es el contenido de la pestaña 'Sobre Ti'.</p>";
            break;
        case "sobre_nosotros":
            contentContainer.innerHTML = "<h2>Sobre Nosotros</h2><p>Este es el contenido de la pestaña 'Sobre Nosotros'.</p>";
            break;
        case "salidas":
            contentContainer.innerHTML = "<h2>Salidas</h2><p>Este es el contenido de la pestaña 'Salidas'.</p>";
            break;
        case "dedicatorias":
            contentContainer.innerHTML = "<h2>Dedicatorias</h2><p>Este es el contenido de la pestaña 'Dedicatorias'.</p>";
            break;
        case "otros":
            contentContainer.innerHTML = "<h2>Otros</h2><p>Este es el contenido de la pestaña 'Otros'.</p>";
            break;
        default:
            contentContainer.innerHTML = "<h2>Bienvenido</h2><p>Selecciona una opción del menú.</p>";
            break;
    }
}
