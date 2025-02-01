function loadContent(page) {
    // Ocultar el video cuando se hace clic en los botones
    document.getElementById('video-container').style.display = 'none';

    // Cargar el contenido de la página seleccionada
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
        })
        .catch(error => {
            console.error('Error al cargar la página:', error);
        });
}