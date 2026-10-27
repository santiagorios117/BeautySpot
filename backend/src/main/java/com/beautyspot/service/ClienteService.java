package com.beautyspot.service;

import com.beautyspot.exception.RecursoNoEncontradoException;
import com.beautyspot.model.Cliente;
import com.beautyspot.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    public Cliente obtener(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id " + id));
    }

    public Cliente obtenerPorEmailDeUsuario(String email) {
        return clienteRepository.findByUsuario_Email(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe un cliente asociado al usuario " + email));
    }

    @Transactional
    public Cliente crear(Cliente cliente) {
        if (clienteRepository.existsByEmail(cliente.getEmail())) {
            throw new IllegalArgumentException("Ya existe un cliente con ese email");
        }
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente actualizar(Long id, Cliente datos) {
        Cliente existente = obtener(id);
        existente.setNombre(datos.getNombre());
        existente.setTelefono(datos.getTelefono());
        existente.setEmail(datos.getEmail());
        return clienteRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Cliente no encontrado con id " + id);
        }
        clienteRepository.deleteById(id);
    }
}
