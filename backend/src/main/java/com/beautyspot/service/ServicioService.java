package com.beautyspot.service;

import com.beautyspot.exception.RecursoNoEncontradoException;
import com.beautyspot.model.Servicio;
import com.beautyspot.repository.ServicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public ServicioService(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    public List<Servicio> listar() {
        return servicioRepository.findAll();
    }

    public Servicio obtener(Long id) {
        return servicioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Servicio no encontrado con id " + id));
    }

    @Transactional
    public Servicio crear(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    @Transactional
    public Servicio actualizar(Long id, Servicio datos) {
        Servicio existente = obtener(id);
        existente.setNombre(datos.getNombre());
        existente.setDescripcion(datos.getDescripcion());
        existente.setDuracionMin(datos.getDuracionMin());
        existente.setPrecio(datos.getPrecio());
        return servicioRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!servicioRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Servicio no encontrado con id " + id);
        }
        servicioRepository.deleteById(id);
    }
}
