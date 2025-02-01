function loadContent(page) {
    fetch(page) // Cargar el contenido de la página HTML correspondiente
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
        })
        .catch(error => {
            console.log('Error al cargar la página:', error);
        });
}
