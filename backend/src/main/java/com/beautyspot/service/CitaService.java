package com.beautyspot.service;

import com.beautyspot.exception.RecursoNoEncontradoException;
import com.beautyspot.model.Cita;
import com.beautyspot.model.Cliente;
import com.beautyspot.model.Servicio;
import com.beautyspot.repository.CitaRepository;
import com.beautyspot.repository.ClienteRepository;
import com.beautyspot.repository.ServicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final ClienteRepository clienteRepository;
    private final ServicioRepository servicioRepository;

    public CitaService(CitaRepository citaRepository,
                        ClienteRepository clienteRepository,
                        ServicioRepository servicioRepository) {
        this.citaRepository = citaRepository;
        this.clienteRepository = clienteRepository;
        this.servicioRepository = servicioRepository;
    }

    public List<Cita> listar() {
        return citaRepository.findAll();
    }

    /** RF-05: historial de citas de un cliente autenticado por su email */
    public List<Cita> listarPorEmailUsuario(String email) {
        return citaRepository.findByCliente_Usuario_Email(email);
    }

    public Cita obtener(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada con id " + id));
    }

    /** RF-04: agendar una cita validando que el cliente y el servicio existan */
    @Transactional
    public Cita crear(Cita cita) {
        Cliente cliente = clienteRepository.findById(cita.getCliente().getIdCliente())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado"));
        Servicio servicio = servicioRepository.findById(cita.getServicio().getIdServicio())
                .orElseThrow(() -> new RecursoNoEncontradoException("Servicio no encontrado"));

        cita.setCliente(cliente);
        cita.setServicio(servicio);
        if (cita.getEstado() == null || cita.getEstado().isBlank()) {
            cita.setEstado(Cita.PENDIENTE);
        }
        return citaRepository.save(cita);
    }

    @Transactional
    public Cita actualizarEstado(Long id, String estado) {
        Cita cita = obtener(id);
        cita.setEstado(estado);
        return citaRepository.save(cita);
    }

    @Transactional
    public Cita actualizar(Long id, Cita datos) {
        Cita existente = obtener(id);
        existente.setFecha(datos.getFecha());
        existente.setHora(datos.getHora());
        if (datos.getEstado() != null) {
            existente.setEstado(datos.getEstado());
        }
        if (datos.getServicio() != null && datos.getServicio().getIdServicio() != null) {
            Servicio servicio = servicioRepository.findById(datos.getServicio().getIdServicio())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Servicio no encontrado"));
            existente.setServicio(servicio);
        }
        return citaRepository.save(existente);
    }

    /** RF-06: cancelar cita (cambia estado en lugar de borrar el registro) */
    @Transactional
    public Cita cancelar(Long id) {
        return actualizarEstado(id, Cita.CANCELADA);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!citaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Cita no encontrada con id " + id);
        }
        citaRepository.deleteById(id);
    }
}
