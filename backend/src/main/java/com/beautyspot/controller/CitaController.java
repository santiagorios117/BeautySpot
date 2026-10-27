package com.beautyspot.controller;

import com.beautyspot.model.Cita;
import com.beautyspot.service.CitaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** RF-04, RF-05, RF-06 (cliente) y RF-08 (administrador). */
@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    /** RF-08: el administrador ve todas las citas */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Cita> listar() {
        return citaService.listar();
    }

    /** RF-05: el cliente autenticado ve su propio historial de citas */
    @GetMapping("/mis-citas")
    public List<Cita> misCitas(Authentication authentication) {
        return citaService.listarPorEmailUsuario(authentication.getName());
    }

    @GetMapping("/{id}")
    public Cita obtener(@PathVariable Long id) {
        return citaService.obtener(id);
    }

    /** RF-04: agendar cita (cliente autenticado o administrador) */
    @PostMapping
    public ResponseEntity<Cita> crear(@Valid @RequestBody Cita cita) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.crear(cita));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Cita actualizar(@PathVariable Long id, @RequestBody Cita cita) {
        return citaService.actualizar(id, cita);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public Cita actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return citaService.actualizarEstado(id, body.get("estado"));
    }

    /** RF-06: el cliente cancela su propia cita */
    @PatchMapping("/{id}/cancelar")
    public Cita cancelar(@PathVariable Long id) {
        return citaService.cancelar(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        citaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
