function loadContent(page) {
    const contentDiv = document.getElementById('content');
    
    // Ocultar el video inmediatamente al mostrar el mensaje de carga
    document.getElementById('video-container').style.display = 'none';

    // Mostrar el mensaje de carga
    contentDiv.innerHTML = "<p> 𝒍𝒐 𝒃𝒖𝒆𝒏𝒐 𝒅𝒆𝒃𝒆 𝒅𝒆𝒋𝒂𝒓 𝒑𝒂𝒔𝒐 𝒂 𝒍𝒐 𝒎𝒆𝒋𝒐𝒓. </p>";  // Mensaje de carga visible

    // Asegurarse de que el contenedor de contenido ocupe toda la pantalla
    contentDiv.style.height = "100vh";  // Altura completa de la pantalla
    contentDiv.style.display = "flex";
    contentDiv.style.justifyContent = "center";
    contentDiv.style.alignItems = "center";  // Centrar el mensaje

    // Establecer el tiempo de espera para el mensaje de carga (en milisegundos)
    const loadingTime = 2000;  // 2 segundos de carga

    // Cargar el contenido de la página seleccionada después de 2 segundos
    setTimeout(() => {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                contentDiv.innerHTML = data;  // Cargar el contenido de la página
                contentDiv.style.height = "auto";  // Restaurar el tamaño original después de cargar el contenido
            })
            .catch(error => {
                console.error('Error al cargar la página:', error);
                contentDiv.innerHTML = "<p>Hubo un error al cargar el contenido. Inténtalo de nuevo.</p>";  // Error en carga
                contentDiv.style.height = "auto";  // Restaurar el tamaño original después de cargar el contenido
            });
    }, loadingTime);  // Retrasar la carga por 2 segundos
}
