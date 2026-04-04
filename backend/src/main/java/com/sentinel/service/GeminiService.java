package com.sentinel.service;

import com.sentinel.model.Issue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final WebClient.Builder webClientBuilder;
    
    @Value("${gemini.api.key}")
    private String apiKey;

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public String analyzeIssue(Issue issue) {
        String prompt = String.format(
            "Analyze this software error and provide a concise root cause and a proposed fix.\n" +
            "Title: %s\n" +
            "Level: %s\n" +
            "Project: %s\n" +
            "Stack Trace: %s",
            issue.getTitle(), issue.getLevel(), issue.getProject().getName(), issue.getFingerprint()
        );

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
                ))
            );

            Map<String, Object> response = webClientBuilder.build()
                .post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                return (String) parts.get(0).get("text");
            }
            
            return "Unable to generate AI analysis at this time.";
        } catch (Exception e) {
            log.error("AI Analysis failed: {}", e.getMessage());
            return "AI Analysis failed: " + e.getMessage();
        }
    }
}
