function loadContent(page) {
    // Ocultar el video cuando se hace clic en los botones (solo si no estamos en la página inicial)
    if (page !== 'index.html') {
        document.getElementById('video-container').style.display = 'none';
    }

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

// Mostrar el video al cargar la página por primera vez
window.onload = function() {
    document.getElementById('video-container').style.display = 'block';
};
