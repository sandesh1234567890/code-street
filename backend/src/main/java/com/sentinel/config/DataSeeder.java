package com.sentinel.config;

import com.sentinel.model.Project;
import com.sentinel.model.User;
import com.sentinel.repository.ProjectRepository;
import com.sentinel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, 
                      ProjectRepository projectRepository, 
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Admin User (Using Setters for absolute reliability during demo)
        if (userRepository.findByEmail("admin@sentinel.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@sentinel.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println(">>> SEEDER: Admin User Created");
        }

        // 2. Seed Demo Project
        if (projectRepository.findByApiKey("sentinel-demo-key-2026").isEmpty()) {
            Project demo = new Project();
            demo.setName("Sentinel Demo Platform");
            demo.setApiKey("sentinel-demo-key-2026");
            projectRepository.save(demo);
            System.out.println(">>> SEEDER: Sentinel Demo Project Created (sentinel-demo-key-2026)");
        }
    }
}
