package com.beautyspot.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

/**
 * Punto de entrada para peticiones no autenticadas al API.
 *
 * Por defecto, Spring Security con httpBasic() responde 401 con el header
 * "WWW-Authenticate: Basic", y eso hace que el NAVEGADOR muestre su propio
 * cuadro de login nativo (el popup gris "Por favor, inicia sesión"),
 * tapando el formulario de login que construimos en index.html.
 *
 * Aqui respondemos 401 en JSON y SIN ese header, para que el navegador
 * nunca dispare su popup: el error simplemente llega al fetch() del
 * frontend y nuestro formulario lo muestra en pantalla.
 */
public class NoPopupBasicAuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"status\":401,\"mensaje\":\"Credenciales inválidas o sesión no iniciada\"}");
    }
}
