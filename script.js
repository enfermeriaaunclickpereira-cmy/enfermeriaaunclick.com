function loadContent(page) {
    const contentDiv = document.getElementById('content');
    
    // Ocultar el video inmediatamente al mostrar el mensaje de carga
    document.getElementById('video-container').style.display = 'none';

    // Mostrar mensaje de carga
    contentDiv.innerHTML = "<p>Cargando...</p>";  // Mensaje de carga visible
    
    // Establecer el tiempo de espera para el mensaje de carga (en milisegundos)
    const loadingTime = 2000;  // 2 segundos de carga

    // Cargar el contenido de la página seleccionada después de 2 segundos
    setTimeout(() => {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                contentDiv.innerHTML = data;  // Cargar el contenido de la página
            })
            .catch(error => {
                console.error('Error al cargar la página:', error);
                contentDiv.innerHTML = "<p>Hubo un error al cargar el contenido. Inténtalo de nuevo.</p>";  // Error en carga
            });
    }, loadingTime);  // Retrasar la carga por 2 segundos
}
