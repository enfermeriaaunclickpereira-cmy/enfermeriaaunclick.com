function loadContent(page) {
    const contentDiv = document.getElementById('content');
    
    // Mostrar mensaje de carga
    contentDiv.innerHTML = "<p>🌙🌙 𝑻𝒆 𝒒𝒖𝒊𝒆𝒓𝒐 𝒅𝒆 𝒂𝒒𝒖𝒊 𝒂 𝒍𝒂 𝒍𝒖𝒏𝒂 𝒆𝒏 𝒑𝒂𝒔𝒐𝒔 𝒅𝒆 𝒕𝒐𝒓𝒕𝒖𝒈𝒂... 🐢🐢 </p>";  

    // Tiempo fijo para mostrar el mensaje de carga (4 segundos)
    const loadingTime = 4000;  // 4 segundos de carga

    // Asegurarse de que el mensaje se mantenga visible durante los 4 segundos
    setTimeout(() => {
        // Cargar el contenido de la página seleccionada después de 4 segundos
        fetch(page)
            .then(response => response.text())
            .then(data => {
                contentDiv.innerHTML = data;  // Cargar el contenido de la página
            })
            .catch(error => {
                console.error('Error al cargar la página:', error);
                contentDiv.innerHTML = "<p>Hubo un error al cargar el contenido. Inténtalo de nuevo.</p>";  // Error en carga
            });
    }, loadingTime);  // Esperar 4 segundos antes de cargar el contenido

}
