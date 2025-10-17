const api = {
  base: "", // rutas relativas (mismo dominio)
  async post(path, body) {
    const res = await fetch(`${this.base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.mensaje || "Error");
    return data;
  }
};

// ----- Modales -----
const modalLogin = document.getElementById("modalLogin");
const modalRegister = document.getElementById("modalRegister");
const openLogin = () => modalLogin.setAttribute("aria-hidden", "false");
const openRegister = () => modalRegister.setAttribute("aria-hidden", "false");
const closeAll = () => {
  modalLogin.setAttribute("aria-hidden", "true");
  modalRegister.setAttribute("aria-hidden", "true");
};

document.getElementById("btnOpenLogin")?.addEventListener("click", openLogin);
document.getElementById("btnOpenRegister")?.addEventListener("click", openRegister);
document.getElementById("ctaLogin")?.addEventListener("click", openLogin);
document.getElementById("ctaRegister")?.addEventListener("click", openRegister);

document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeAll));
window.addEventListener("keydown", e => e.key === "Escape" && closeAll());

// Cambios entre formularios
document.getElementById("fromLoginToRegister")?.addEventListener("click", (e) => {
  e.preventDefault(); closeAll(); openRegister();
});
document.getElementById("fromRegisterToLogin")?.addEventListener("click", (e) => {
  e.preventDefault(); closeAll(); openLogin();
});

// ----- Registro -----
const formRegister = document.getElementById("formRegister");
const registerToast = document.getElementById("registerToast");
formRegister?.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerToast.className = "toast"; registerToast.textContent = "";
  const fd = new FormData(formRegister);
  const payload = {
    nombre: fd.get("nombre")?.trim(),
    email: fd.get("email")?.trim(),
    password: fd.get("password"),
    rol: fd.get("rol")
  };
  try {
    const { usuario } = await api.post("/api/auth/register", payload);
    registerToast.className = "toast ok";
    registerToast.textContent = "Cuenta creada. ¡Bienvenido!";
    // Guardamos sesión demo:
    localStorage.setItem("eaac_user", JSON.stringify(usuario));
    setTimeout(() => {
      closeAll();
      redirectByRole(usuario.rol);
    }, 700);
  } catch (err) {
    registerToast.className = "toast err";
    registerToast.textContent = err.message;
  }
});

// ----- Login -----
const formLogin = document.getElementById("formLogin");
const loginToast = document.getElementById("loginToast");
formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginToast.className = "toast"; loginToast.textContent = "";
  const fd = new FormData(formLogin);
  const payload = {
    email: fd.get("email")?.trim(),
    password: fd.get("password")
  };
  try {
    const { usuario } = await api.post("/api/auth/login", payload);
    loginToast.className = "toast ok";
    loginToast.textContent = "Acceso correcto.";
    localStorage.setItem("eaac_user", JSON.stringify(usuario));
    setTimeout(() => {
      closeAll();
      redirectByRole(usuario.rol);
    }, 500);
  } catch (err) {
    loginToast.className = "toast err";
    loginToast.textContent = err.message;
  }
});

function redirectByRole(rol){
  if (rol === "enfermero") window.location.href = "/enfermero.html";
  else window.location.href = "/paciente.html";
}
// Mostrar chat
function toggleChat() {
  const chat = document.getElementById("chatBox");
  chat.classList.toggle("hidden");
}

// Formulario de videollamada
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formVideollamada");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const enfermero = document.getElementById("enfermero").value;
      const hora = document.getElementById("hora").value;
      const confirmacion = document.getElementById("confirmacion");
      confirmacion.textContent = `✅ Videollamada programada con ${enfermero} a las ${hora}.`;
      confirmacion.classList.remove("hidden");
      form.reset();
    });
  }
});
