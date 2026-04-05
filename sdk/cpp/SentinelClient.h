/**
 * Sentinel Analytics - Professional C++ SDK (Header-Only)
 * 
 * Satisfies Requirement #3: "Mandatory SDKs: Java and C++"
 * Uses libcurl for cross-platform network communication.
 */

#ifndef SENTINEL_CLIENT_H
#define SENTINEL_CLIENT_H

#include <string>
#include <vector>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <iostream>
#include <curl/curl.h>

namespace sentinel {

struct LogEntry {
    std::string level;
    std::string message;
    std::string environment;
    std::string timestamp;
};

class SentinelClient {
public:
    static SentinelClient& getInstance() {
        static SentinelClient instance;
        return instance;
    }

    void initialize(const std::string& apiKey, const std::string& backendUrl, const std::string& env) {
        m_apiKey = apiKey;
        m_backendUrl = backendUrl;
        if (m_backendUrl.back() != '/') m_backendUrl += "/";
        m_env = env;
        
        if (!m_workerThread.joinable()) {
            m_workerThread = std::thread(&SentinelClient::workerLoop, this);
        }
    }

    void logInfo(const std::string& msg) { pushLog("INFO", msg); }
    void logWarn(const std::string& msg) { pushLog("WARN", msg); }
    void logError(const std::string& msg) { pushLog("ERROR", msg); }
    void logFatal(const std::string& msg) { pushLog("FATAL", msg); }

    ~SentinelClient() {
        m_shutdown = true;
        m_cv.notify_all();
        if (m_workerThread.joinable()) m_workerThread.join();
    }

private:
    SentinelClient() : m_shutdown(false) { curl_global_init(CURL_GLOBAL_ALL); }

    void pushLog(const std::string& level, const std::string& msg) {
        std::lock_guard<std::mutex> lock(m_mutex);
        m_queue.push({level, msg, m_env, ""}); // Timestamp handled by backend or added here
        m_cv.notify_one();
    }

    void workerLoop() {
        while (!m_shutdown) {
            std::vector<LogEntry> batch;
            {
                std::unique_lock<std::mutex> lock(m_mutex);
                m_cv.wait_for(lock, std::chrono::seconds(5), [this] { return !m_queue.empty() || m_shutdown; });
                
                while (!m_queue.empty() && batch.size() < 50) {
                    batch.push_back(m_queue.front());
                    m_queue.pop();
                }
            }

            if (!batch.empty()) flushBatch(batch);
        }
    }

    void flushBatch(const std::vector<LogEntry>& batch) {
        CURL* curl = curl_easy_init();
        if (!curl) return;

        std::string json = "{\"logs\":[";
        for (size_t i = 0; i < batch.size(); ++i) {
            json += "{\"level\":\"" + batch[i].level + "\",\"message\":\"" + batch[i].message + "\",\"environment\":\"" + batch[i].environment + "\"}";
            if (i < batch.size() - 1) json += ",";
        }
        json += "]}";

        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        std::string apiKeyHeader = "X-API-KEY: " + m_apiKey;
        headers = curl_slist_append(headers, apiKeyHeader.c_str());

        std::string url = m_backendUrl + "api/ingest/batch";
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json.c_str());

        CURLcode res = curl_easy_perform(curl);
        if (res != CURLE_OK) std::cerr << "Sentinel Push Failed: " << curl_easy_strerror(res) << std::endl;

        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);
    }

    std::string m_apiKey;
    std::string m_backendUrl;
    std::string m_env;
    std::queue<LogEntry> m_queue;
    std::mutex m_mutex;
    std::condition_variable m_cv;
    std::thread m_workerThread;
    bool m_shutdown;
};

} // namespace sentinel

#endif
