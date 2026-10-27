/**
 * api.js
 * Cliente HTTP genérico en JavaScript puro (sin frameworks) para consumir
 * la API REST de BeautySpot construida en Spring Boot.
 *
 * La autenticación usa HTTP Basic: las credenciales se codifican en Base64
 * y se guardan en sessionStorage tras un login válido, y se reenvían en el
 * header Authorization en cada petición siguiente.
 */

const API_BASE = "/api";

const Auth = {
  KEY: "beautyspot_credentials",
  KEY_USER: "beautyspot_usuario",

  guardar(email, password, usuario) {
    sessionStorage.setItem(this.KEY, btoa(`${email}:${password}`));
    sessionStorage.setItem(this.KEY_USER, JSON.stringify(usuario));
  },

  limpiar() {
    sessionStorage.removeItem(this.KEY);
    sessionStorage.removeItem(this.KEY_USER);
  },

  header() {
    const cred = sessionStorage.getItem(this.KEY);
    return cred ? { Authorization: `Basic ${cred}` } : {};
  },

  usuario() {
    const raw = sessionStorage.getItem(this.KEY_USER);
    return raw ? JSON.parse(raw) : null;
  },

  autenticado() {
    return !!sessionStorage.getItem(this.KEY);
  },

  esAdmin() {
    const u = this.usuario();
    return !!u && u.rol === "ADMIN";
  }
};

/**
 * Llama a un endpoint de la API y devuelve el JSON de respuesta.
 * Lanza un Error con el mensaje devuelto por el backend si la respuesta no es OK.
 */
async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json", ...Auth.header() };

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = text; }
  }

  if (!res.ok) {
    const mensaje = (data && (data.mensaje || data.message)) || `Error ${res.status}`;
    throw new Error(mensaje);
  }

  return data;
}

const Api = {
  // --- Auth ---
  registro: (payload) => apiFetch("/auth/registro", { method: "POST", body: payload }),
  me: () => apiFetch("/auth/me"),

  // --- Servicios ---
  listarServicios: () => apiFetch("/servicios"),
  crearServicio: (s) => apiFetch("/servicios", { method: "POST", body: s }),
  actualizarServicio: (id, s) => apiFetch(`/servicios/${id}`, { method: "PUT", body: s }),
  eliminarServicio: (id) => apiFetch(`/servicios/${id}`, { method: "DELETE" }),

  // --- Clientes ---
  listarClientes: () => apiFetch("/clientes"),
  miPerfilCliente: () => apiFetch("/clientes/mi-perfil"),
  crearCliente: (c) => apiFetch("/clientes", { method: "POST", body: c }),
  actualizarCliente: (id, c) => apiFetch(`/clientes/${id}`, { method: "PUT", body: c }),
  eliminarCliente: (id) => apiFetch(`/clientes/${id}`, { method: "DELETE" }),

  // --- Citas ---
  listarCitas: () => apiFetch("/citas"),
  misCitas: () => apiFetch("/citas/mis-citas"),
  crearCita: (c) => apiFetch("/citas", { method: "POST", body: c }),
  cambiarEstadoCita: (id, estado) => apiFetch(`/citas/${id}/estado`, { method: "PATCH", body: { estado } }),
  cancelarCita: (id) => apiFetch(`/citas/${id}/cancelar`, { method: "PATCH" }),
  eliminarCita: (id) => apiFetch(`/citas/${id}`, { method: "DELETE" }),

  // --- Usuarios ---
  listarUsuarios: () => apiFetch("/usuarios"),
  crearUsuario: (u) => apiFetch("/usuarios", { method: "POST", body: u }),
  actualizarUsuario: (id, u) => apiFetch(`/usuarios/${id}`, { method: "PUT", body: u }),
  eliminarUsuario: (id) => apiFetch(`/usuarios/${id}`, { method: "DELETE" })
};
