package com.beautyspot.controller;

import com.beautyspot.dto.RegistroRequest;
import com.beautyspot.model.Usuario;
import com.beautyspot.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de autenticacion basica (RF-01 y RF-02).
 * El login real ocurre via HTTP Basic en cada request; /api/auth/me
 * sirve para que el frontend valide credenciales una sola vez tras el login.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registro(@Valid @RequestBody RegistroRequest request) {
        Usuario usuario = usuarioService.registrarCliente(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @GetMapping("/me")
    public ResponseEntity<Usuario> me(Authentication authentication) {
        Usuario usuario = usuarioService.obtenerPorEmail(authentication.getName());
        return ResponseEntity.ok(usuario);
    }
}
