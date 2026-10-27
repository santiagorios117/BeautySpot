package com.beautyspot.repository;

import com.beautyspot.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByEmail(String email);
    Optional<Cliente> findByUsuario_Email(String email);
    boolean existsByEmail(String email);
}
