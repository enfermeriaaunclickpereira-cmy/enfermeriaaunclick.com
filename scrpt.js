function openTab(tabId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Mostrar la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');

    // Control de la música: solo suena en la pestaña 1
    let music = document.getElementById("music");
    if (tabId === "tab1") {
        music.play();
    } else {
        music.pause();
    }
}
