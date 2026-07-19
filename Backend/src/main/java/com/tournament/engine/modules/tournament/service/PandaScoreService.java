package com.tournament.engine.modules.tournament.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class PandaScoreService {

    @Value("${pandascore.api-key}")
    private String apiKey;

    @Value("${pandascore.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Get upcoming Valorant matches from PandaScore API
     */
    public List<Map<String, Object>> getUpcomingValorantMatches(int page, int perPage) {
        return fetchMatches("/valorant/matches/upcoming", page, perPage);
    }

    /**
     * Get currently running Valorant matches
     */
    public List<Map<String, Object>> getRunningValorantMatches(int page, int perPage) {
        return fetchMatches("/valorant/matches/running", page, perPage);
    }

    /**
     * Get past Valorant matches
     */
    public List<Map<String, Object>> getPastValorantMatches(int page, int perPage) {
        return fetchMatches("/valorant/matches/past", page, perPage);
    }

    /**
     * Get all Valorant matches (with optional filter)
     */
    public List<Map<String, Object>> getAllValorantMatches(int page, int perPage) {
        return fetchMatches("/valorant/matches", page, perPage);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchMatches(String endpoint, int page, int perPage) {
        try {
            String url = baseUrl + endpoint + "?page=" + page + "&per_page=" + perPage + "&token=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, List.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (List<Map<String, Object>>) response.getBody();
            }

            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Lỗi khi gọi PandaScore API: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
