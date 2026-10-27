# Requerimientos funcionales — BeautySpot

| ID     | Descripción                                                                                  | Endpoint(s) que lo implementan                         |
|--------|-----------------------------------------------------------------------------------------------|----------------------------------------------------------|
| RF-01  | El sistema debe permitir a un cliente registrarse creando una cuenta con nombre, correo y contraseña. | `POST /api/auth/registro`                           |
| RF-02  | El sistema debe permitir a un usuario (cliente o administrador) autenticarse mediante correo y contraseña. | `GET /api/auth/me` (HTTP Basic)                     |
| RF-03  | El sistema debe permitir al cliente consultar el catálogo de servicios disponibles (nombre, descripción, duración y precio). | `GET /api/servicios`                               |
| RF-04  | El sistema debe permitir al cliente agendar una cita seleccionando un servicio, una fecha y una hora. | `POST /api/citas`                                   |
| RF-05  | El sistema debe permitir al cliente consultar el historial y el estado de sus citas.         | `GET /api/citas/mis-citas`                               |
| RF-06  | El sistema debe permitir al cliente cancelar una cita que se encuentre en estado pendiente o confirmada. | `PATCH /api/citas/{id}/cancelar`                    |
| RF-07  | El sistema debe permitir al administrador crear, editar, consultar y eliminar servicios (CRUD). | `GET/POST/PUT/DELETE /api/servicios/{id}`               |
| RF-08  | El sistema debe permitir al administrador consultar y actualizar el estado de todas las citas agendadas. | `GET /api/citas`, `PATCH /api/citas/{id}/estado`    |
| RF-09  | El sistema debe permitir al administrador gestionar clientes y usuarios del sistema (CRUD).  | `GET/POST/PUT/DELETE /api/clientes/{id}`, `/api/usuarios/{id}` |

## Requerimientos no funcionales

| ID      | Categoría        | Descripción                                                                 |
|---------|-------------------|-------------------------------------------------------------------------------|
| RNF-01  | Usabilidad        | La interfaz debe ser sencilla e intuitiva, sin necesidad de capacitación previa. |
| RNF-02  | Seguridad         | Las contraseñas se almacenan cifradas (BCrypt) y el acceso a los endpoints se valida con autenticación HTTP Basic y autorización por rol. |
| RNF-03  | Disponibilidad    | La aplicación corre como un único artefacto desplegable (JAR) apto para un servidor en la nube. |
| RNF-04  | Portabilidad      | El frontend funciona en los navegadores modernos (Chrome, Edge) sin dependencias externas de frameworks. |
| RNF-05  | Rendimiento       | Las respuestas de los endpoints REST responden en menos de 2 segundos bajo uso normal. |
| RNF-06  | Mantenibilidad    | El backend sigue una arquitectura en capas (`controller` → `service` → `repository`) para facilitar su mantenimiento. |

## Trazabilidad con las historias de usuario (Sprint 1)

Esta implementación retoma el dominio y las historias de usuario definidas
en el Sprint 1 (`Sprint1_BeautySpot_SantiagoRios.docx`): HU-01 a HU-06
(rol Cliente) y HU-07, HU-08 (rol Administrador), ahora materializadas como
un backend Spring Boot funcional y un frontend JavaScript que los consume.
