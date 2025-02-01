function loadContent(file) {
    // Utilizamos fetch para cargar el archivo HTML cuando se hace clic en un botón
    fetch(file)
        .then(response => response.text())  // Convertir la respuesta en texto
        .then(data => {
            // Cargar el contenido en el área específica
            document.getElementById("content-area").innerHTML = data;
        })
        .catch(error => {
            console.error('Error al cargar el contenido:', error);
        });
}
