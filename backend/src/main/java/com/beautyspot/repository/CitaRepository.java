package com.beautyspot.repository;

import com.beautyspot.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByCliente_IdCliente(Long idCliente);
    List<Cita> findByCliente_Usuario_Email(String email);
}
