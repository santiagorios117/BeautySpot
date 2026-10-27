package com.beautyspot;

import com.beautyspot.model.Cita;
import com.beautyspot.model.Cliente;
import com.beautyspot.model.Servicio;
import com.beautyspot.model.Usuario;
import com.beautyspot.repository.CitaRepository;
import com.beautyspot.repository.ClienteRepository;
import com.beautyspot.repository.ServicioRepository;
import com.beautyspot.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@SpringBootApplication
public class BeautyspotApplication {

    public static void main(String[] args) {
        SpringApplication.run(BeautyspotApplication.class, args);
    }

    /**
     * Crea el usuario administrador por defecto la primera vez que arranca
     * la aplicacion, para que el sistema sea usable de inmediato.
     */
    @Bean
    CommandLineRunner initDatos(UsuarioRepository usuarioRepository,
                                 ClienteRepository clienteRepository,
                                 ServicioRepository servicioRepository,
                                 CitaRepository citaRepository,
                                 PasswordEncoder passwordEncoder) {
        return args -> {
            if (!usuarioRepository.existsByEmail("admin@beautyspot.com")) {
                Usuario admin = new Usuario("Santiago Rios", "admin@beautyspot.com",
                        passwordEncoder.encode("admin123"), "ADMIN");
                usuarioRepository.save(admin);
            }

            Cliente camila = null;
            if (!usuarioRepository.existsByEmail("camila.torres@mail.com")) {
                Usuario usuarioCliente = new Usuario("Camila Torres", "camila.torres@mail.com",
                        passwordEncoder.encode("cliente123"), "CLIENTE");
                usuarioRepository.save(usuarioCliente);
                camila = clienteRepository.save(new Cliente("Camila Torres", "3001234567",
                        "camila.torres@mail.com", usuarioCliente));
            }

            if (servicioRepository.count() == 0) {
                Servicio manicure = servicioRepository.save(new Servicio("Manicure clasica",
                        "Limado, cuticula y esmaltado tradicional", 45, new BigDecimal("35000.00")));
                servicioRepository.save(new Servicio("Facial hidratante",
                        "Limpieza profunda e hidratacion facial", 60, new BigDecimal("80000.00")));
                servicioRepository.save(new Servicio("Masaje relajante",
                        "Masaje corporal de relajacion de 50 minutos", 50, new BigDecimal("95000.00")));
                servicioRepository.save(new Servicio("Depilacion con cera",
                        "Depilacion de piernas completas", 40, new BigDecimal("60000.00")));

                if (camila != null) {
                    Cita cita = new Cita();
                    cita.setFecha(LocalDate.now().plusDays(3));
                    cita.setHora(LocalTime.of(10, 0));
                    cita.setCliente(camila);
                    cita.setServicio(manicure);
                    citaRepository.save(cita);
                }
            }
        };
    }
}
