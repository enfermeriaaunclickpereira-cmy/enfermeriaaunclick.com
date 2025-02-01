function openTab(tabId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Mostrar la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');
    
    // Reproducir música cuando se selecciona la pestaña "Hola"
    let music = document.getElementById("music");
    if (tabId === "tab1") {
        music.play();
    }
}
