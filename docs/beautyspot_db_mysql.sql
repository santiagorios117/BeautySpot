-- ============================================================
-- BeautySpot - Sistema de Gestion de Citas y Servicios
-- Script de creacion de base de datos e insercion de registros
-- Motor: MySQL 8.x
-- (La aplicacion por defecto corre con H2 embebida y crea este
--  mismo esquema automaticamente; este script es para quien
--  quiera desplegar contra un servidor MySQL real, como pide el
--  objetivo de "administrar un servidor en la nube".)
-- ============================================================

CREATE DATABASE IF NOT EXISTS beautyspot_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE beautyspot_db;

-- ------------------------------------------------------------
-- Tabla: usuario
-- Credenciales de acceso (administrador o cliente)
-- ------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario  BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    rol         VARCHAR(20)  NOT NULL DEFAULT 'CLIENTE'  -- 'ADMIN' o 'CLIENTE'
);

-- ------------------------------------------------------------
-- Tabla: cliente
-- Datos de perfil del cliente, ligados opcionalmente a un usuario
-- ------------------------------------------------------------
CREATE TABLE cliente (
    id_cliente  BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    telefono    VARCHAR(20),
    email       VARCHAR(100) NOT NULL UNIQUE,
    id_usuario  BIGINT,
    CONSTRAINT fk_cliente_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Tabla: servicio
-- Catalogo de servicios ofrecidos por el spa/salon
-- ------------------------------------------------------------
CREATE TABLE servicio (
    id_servicio   BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   VARCHAR(255),
    duracion_min  INT NOT NULL,
    precio        DECIMAL(10,2) NOT NULL
);

-- ------------------------------------------------------------
-- Tabla: cita
-- Citas agendadas por los clientes para un servicio especifico
-- ------------------------------------------------------------
CREATE TABLE cita (
    id_cita      BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha        DATE NOT NULL,
    hora         TIME NOT NULL,
    estado       VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA
    id_cliente   BIGINT NOT NULL,
    id_servicio  BIGINT NOT NULL,
    CONSTRAINT fk_cita_cliente
        FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        ON DELETE CASCADE,
    CONSTRAINT fk_cita_servicio
        FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio)
        ON DELETE CASCADE
);

-- ============================================================
-- Datos de prueba (los mismos que inserta la aplicacion al
-- arrancar por primera vez contra la base H2 embebida)
-- ============================================================

INSERT INTO usuario (nombre, email, password, rol) VALUES
('Santiago Rios', 'admin@beautyspot.com', '{bcrypt-hash}', 'ADMIN'),
('Camila Torres', 'camila.torres@mail.com', '{bcrypt-hash}', 'CLIENTE');

INSERT INTO cliente (nombre, telefono, email, id_usuario) VALUES
('Camila Torres', '3001234567', 'camila.torres@mail.com', 2);

INSERT INTO servicio (nombre, descripcion, duracion_min, precio) VALUES
('Manicure clasica', 'Limado, cuticula y esmaltado tradicional', 45, 35000.00),
('Facial hidratante', 'Limpieza profunda e hidratacion facial', 60, 80000.00),
('Masaje relajante', 'Masaje corporal de relajacion de 50 minutos', 50, 95000.00),
('Depilacion con cera', 'Depilacion de piernas completas', 40, 60000.00);

INSERT INTO cita (fecha, hora, estado, id_cliente, id_servicio) VALUES
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', 'PENDIENTE', 1, 1);

-- Nota: las contrasenas reales se guardan cifradas con BCrypt
-- (nunca en texto plano). Las credenciales de prueba son:
--   admin@beautyspot.com / admin123
--   camila.torres@mail.com / cliente123
