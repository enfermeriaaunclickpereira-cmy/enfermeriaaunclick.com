function loadContent(file) {
    fetch(file)
        .then(response => response.text())  // Convertir la respuesta en texto
        .then(data => {
            document.getElementById("content-area").innerHTML = data; // Mostrar contenido en el área
        })
        .catch(error => {
            console.error('Error al cargar el contenido:', error); // Mostrar errores en la consola
        });
}
