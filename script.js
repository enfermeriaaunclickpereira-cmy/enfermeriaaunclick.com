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

// Mostrar el video solo en la página principal
window.onload = function() {
    // Solo mostrar el video en la página principal
    if (window.location.pathname === "/index.html" || window.location.pathname === "/") {
        document.getElementById('video-container').style.display = 'block';
    } else {
        document.getElementById('video-container').style.display = 'none';
    }
};
