/**
 * app.js
 * Lógica de interfaz (routing de vistas, formularios y tablas) para el
 * frontend genérico de BeautySpot. JavaScript puro, sin frameworks.
 */

// ---------------------------------------------------------------------
// Estado y utilidades generales
// ---------------------------------------------------------------------

let cacheServicios = [];
let cacheClientes = [];

function toast(mensaje, esError = false) {
  const el = document.getElementById("toast");
  el.textContent = mensaje;
  el.classList.toggle("error", esError);
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 3500);
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(valor);
}

function mostrarVista(nombre) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(`view-${nombre}`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === nombre));

  if (nombre === "servicios") cargarServicios();
  if (nombre === "clientes") cargarClientes();
  if (nombre === "citas") cargarCitas();
  if (nombre === "usuarios") cargarUsuarios();
}

// ---------------------------------------------------------------------
// Sesión: login / registro / logout
// ---------------------------------------------------------------------

function actualizarUISegunSesion() {
  const autenticado = Auth.autenticado();
  document.getElementById("nav").classList.toggle("hidden", !autenticado);
  document.getElementById("sessionBox").classList.toggle("hidden", !autenticado);
  document.getElementById("view-auth").classList.toggle("hidden", autenticado);

  document.querySelectorAll(".admin-only").forEach(el => {
    el.classList.toggle("hidden", !Auth.esAdmin());
  });

  if (autenticado) {
    const u = Auth.usuario();
    document.getElementById("sessionUser").textContent = `${u.nombre} (${u.rol})`;
    document.getElementById("citasTitulo").textContent = Auth.esAdmin() ? "Todas las citas" : "Mis citas";
    mostrarVista("servicios");
  }
}

document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";

  // Guardamos temporalmente las credenciales para que /auth/me las use
  Auth.guardar(email, password, { nombre: "", rol: "" });

  try {
    const usuario = await Api.me();
    Auth.guardar(email, password, usuario);
    actualizarUISegunSesion();
    toast(`Bienvenido, ${usuario.nombre}`);
  } catch (err) {
    Auth.limpiar();
    errorEl.textContent = "Credenciales inválidas";
  }
});

document.getElementById("formRegistro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    nombre: document.getElementById("regNombre").value.trim(),
    email: document.getElementById("regEmail").value.trim(),
    telefono: document.getElementById("regTelefono").value.trim(),
    password: document.getElementById("regPassword").value
  };
  const msgEl = document.getElementById("registroMsg");
  try {
    await Api.registro(payload);
    msgEl.textContent = "Cuenta creada. Ya puedes iniciar sesión.";
    e.target.reset();
  } catch (err) {
    msgEl.style.color = "#c0392b";
    msgEl.textContent = err.message;
  }
});

document.getElementById("btnLogout").addEventListener("click", () => {
  Auth.limpiar();
  actualizarUISegunSesion();
});

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => mostrarVista(btn.dataset.view));
});

// ---------------------------------------------------------------------
// Modal genérico (reutilizado por las 4 entidades)
// ---------------------------------------------------------------------

function abrirModal(titulo, camposHtml, onSubmit) {
  document.getElementById("modalTitulo").textContent = titulo;
  const form = document.getElementById("modalForm");
  form.innerHTML = camposHtml + `
    <div class="modal-actions">
      <button type="button" class="btn btn-ghost-dark" id="modalCancelar">Cancelar</button>
      <button type="submit" class="btn btn-primary">Guardar</button>
    </div>`;
  document.getElementById("modalOverlay").classList.remove("hidden");

  document.getElementById("modalCancelar").onclick = cerrarModal;
  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(new FormData(form));
      cerrarModal();
    } catch (err) {
      toast(err.message, true);
    }
  };
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
}

// ---------------------------------------------------------------------
// SERVICIOS (RF-03, RF-07)
// ---------------------------------------------------------------------

async function cargarServicios() {
  try {
    cacheServicios = await Api.listarServicios();
    const tbody = document.getElementById("tablaServicios");
    tbody.innerHTML = cacheServicios.map(s => `
      <tr>
        <td>${s.nombre}</td>
        <td>${s.descripcion ?? ""}</td>
        <td>${s.duracionMin} min</td>
        <td>${formatoMoneda(s.precio)}</td>
        <td class="admin-only ${Auth.esAdmin() ? "" : "hidden"}">
          <button class="btn btn-secondary btn-small" onclick="editarServicio(${s.idServicio})">Editar</button>
          <button class="btn btn-danger btn-small" onclick="borrarServicio(${s.idServicio})">Eliminar</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    toast(err.message, true);
  }
}

function formularioServicio(s = {}) {
  return `
    <label>Nombre <input name="nombre" required value="${s.nombre ?? ""}"></label>
    <label>Descripción <input name="descripcion" value="${s.descripcion ?? ""}"></label>
    <label>Duración (minutos) <input name="duracionMin" type="number" min="1" required value="${s.duracionMin ?? ""}"></label>
    <label>Precio (COP) <input name="precio" type="number" min="0" step="1000" required value="${s.precio ?? ""}"></label>
  `;
}

document.getElementById("btnNuevoServicio").addEventListener("click", () => {
  abrirModal("Nuevo servicio", formularioServicio(), async (fd) => {
    await Api.crearServicio({
      nombre: fd.get("nombre"),
      descripcion: fd.get("descripcion"),
      duracionMin: Number(fd.get("duracionMin")),
      precio: Number(fd.get("precio"))
    });
    toast("Servicio creado");
    cargarServicios();
  });
});

function editarServicio(id) {
  const s = cacheServicios.find(x => x.idServicio === id);
  abrirModal("Editar servicio", formularioServicio(s), async (fd) => {
    await Api.actualizarServicio(id, {
      nombre: fd.get("nombre"),
      descripcion: fd.get("descripcion"),
      duracionMin: Number(fd.get("duracionMin")),
      precio: Number(fd.get("precio"))
    });
    toast("Servicio actualizado");
    cargarServicios();
  });
}

async function borrarServicio(id) {
  if (!confirm("¿Eliminar este servicio?")) return;
  try {
    await Api.eliminarServicio(id);
    toast("Servicio eliminado");
    cargarServicios();
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------------------------------------------------------------
// CLIENTES (administración)
// ---------------------------------------------------------------------

async function cargarClientes() {
  try {
    cacheClientes = await Api.listarClientes();
    const tbody = document.getElementById("tablaClientes");
    tbody.innerHTML = cacheClientes.map(c => `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.telefono ?? ""}</td>
        <td>${c.email}</td>
        <td>
          <button class="btn btn-secondary btn-small" onclick="editarCliente(${c.idCliente})">Editar</button>
          <button class="btn btn-danger btn-small" onclick="borrarCliente(${c.idCliente})">Eliminar</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    toast(err.message, true);
  }
}

function formularioCliente(c = {}) {
  return `
    <label>Nombre <input name="nombre" required value="${c.nombre ?? ""}"></label>
    <label>Teléfono <input name="telefono" value="${c.telefono ?? ""}"></label>
    <label>Email <input name="email" type="email" required value="${c.email ?? ""}"></label>
  `;
}

document.getElementById("btnNuevoCliente").addEventListener("click", () => {
  abrirModal("Nuevo cliente", formularioCliente(), async (fd) => {
    await Api.crearCliente({
      nombre: fd.get("nombre"),
      telefono: fd.get("telefono"),
      email: fd.get("email")
    });
    toast("Cliente creado");
    cargarClientes();
  });
});

function editarCliente(id) {
  const c = cacheClientes.find(x => x.idCliente === id);
  abrirModal("Editar cliente", formularioCliente(c), async (fd) => {
    await Api.actualizarCliente(id, {
      nombre: fd.get("nombre"),
      telefono: fd.get("telefono"),
      email: fd.get("email")
    });
    toast("Cliente actualizado");
    cargarClientes();
  });
}

async function borrarCliente(id) {
  if (!confirm("¿Eliminar este cliente?")) return;
  try {
    await Api.eliminarCliente(id);
    toast("Cliente eliminado");
    cargarClientes();
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------------------------------------------------------------
// CITAS (RF-04, RF-05, RF-06, RF-08)
// ---------------------------------------------------------------------

async function cargarCitas() {
  try {
    const citas = Auth.esAdmin() ? await Api.listarCitas() : await Api.misCitas();
    const tbody = document.getElementById("tablaCitas");
    tbody.innerHTML = citas.map(c => `
      <tr>
        <td>${c.fecha}</td>
        <td>${c.hora}</td>
        <td>${c.cliente?.nombre ?? ""}</td>
        <td>${c.servicio?.nombre ?? ""}</td>
        <td><span class="badge badge-${c.estado}">${c.estado}</span></td>
        <td>
          ${c.estado !== "CANCELADA" ? `<button class="btn btn-danger btn-small" onclick="cancelarCita(${c.idCita})">Cancelar</button>` : ""}
          ${Auth.esAdmin() ? `<button class="btn btn-secondary btn-small" onclick="confirmarCita(${c.idCita})">Confirmar</button>` : ""}
        </td>
      </tr>`).join("");
  } catch (err) {
    toast(err.message, true);
  }
}

async function cancelarCita(id) {
  if (!confirm("¿Cancelar esta cita?")) return;
  try {
    await Api.cancelarCita(id);
    toast("Cita cancelada");
    cargarCitas();
  } catch (err) {
    toast(err.message, true);
  }
}

async function confirmarCita(id) {
  try {
    await Api.cambiarEstadoCita(id, "CONFIRMADA");
    toast("Cita confirmada");
    cargarCitas();
  } catch (err) {
    toast(err.message, true);
  }
}

document.getElementById("btnNuevaCita").addEventListener("click", async () => {
  try {
    const servicios = cacheServicios.length ? cacheServicios : await Api.listarServicios();
    let clienteField;

    if (Auth.esAdmin()) {
      const clientes = cacheClientes.length ? cacheClientes : await Api.listarClientes();
      clienteField = `
        <label>Cliente
          <select name="idCliente" required>
            ${clientes.map(c => `<option value="${c.idCliente}">${c.nombre}</option>`).join("")}
          </select>
        </label>`;
    }

    abrirModal("Agendar cita", `
      ${clienteField ?? ""}
      <label>Servicio
        <select name="idServicio" required>
          ${servicios.map(s => `<option value="${s.idServicio}">${s.nombre}</option>`).join("")}
        </select>
      </label>
      <label>Fecha <input name="fecha" type="date" required></label>
      <label>Hora <input name="hora" type="time" required></label>
    `, async (fd) => {
      let idCliente = fd.get("idCliente");
      if (!idCliente) {
        const miPerfil = await Api.miPerfilCliente();
        idCliente = miPerfil.idCliente;
      }
      await Api.crearCita({
        fecha: fd.get("fecha"),
        hora: fd.get("hora"),
        cliente: { idCliente: Number(idCliente) },
        servicio: { idServicio: Number(fd.get("idServicio")) }
      });
      toast("Cita agendada");
      cargarCitas();
    });
  } catch (err) {
    toast(err.message, true);
  }
});

// ---------------------------------------------------------------------
// USUARIOS (administración)
// ---------------------------------------------------------------------

async function cargarUsuarios() {
  try {
    const usuarios = await Api.listarUsuarios();
    const tbody = document.getElementById("tablaUsuarios");
    tbody.innerHTML = usuarios.map(u => `
      <tr>
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td>${u.rol}</td>
        <td>
          <button class="btn btn-danger btn-small" onclick="borrarUsuario(${u.idUsuario})">Eliminar</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    toast(err.message, true);
  }
}

document.getElementById("btnNuevoUsuario").addEventListener("click", () => {
  abrirModal("Nuevo usuario", `
    <label>Nombre <input name="nombre" required></label>
    <label>Email <input name="email" type="email" required></label>
    <label>Contraseña <input name="password" type="password" required></label>
    <label>Rol
      <select name="rol">
        <option value="CLIENTE">CLIENTE</option>
        <option value="ADMIN">ADMIN</option>
      </select>
    </label>
  `, async (fd) => {
    await Api.crearUsuario({
      nombre: fd.get("nombre"),
      email: fd.get("email"),
      password: fd.get("password"),
      rol: fd.get("rol")
    });
    toast("Usuario creado");
    cargarUsuarios();
  });
});

async function borrarUsuario(id) {
  if (!confirm("¿Eliminar este usuario?")) return;
  try {
    await Api.eliminarUsuario(id);
    toast("Usuario eliminado");
    cargarUsuarios();
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------

actualizarUISegunSesion();
