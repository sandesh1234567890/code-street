#ifndef SENTINEL_CLIENT_HPP
#define SENTINEL_CLIENT_HPP

#include <string>
#include <vector>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <iostream>
#include <sstream>
#include <csignal>

namespace sentinel {

struct LogEntry {
    std::string level;
    std::string message;
    std::string stackTrace;
    std::string environment;
    std::string subModuleId;
    std::string timestamp;
};

class SentinelClient {
public:
    static SentinelClient& instance() {
        static SentinelClient inst;
        return inst;
    }

    void init(const std::string& apiKey, const std::string& backendUrl, 
              const std::string& environment = "production", const std::string& subModuleId = "") {
        std::lock_guard<std::mutex> lock(mutex_);
        if (initialized_) return;

        apiKey_ = apiKey;
        backendUrl_ = backendUrl;
        environment_ = environment;
        defaultSubModuleId_ = subModuleId;
        initialized_ = true;

        worker_ = std::thread(&SentinelClient::processQueue, this);
        setupSignalHandlers();
    }

    void log(const std::string& level, const std::string& message, const std::string& stackTrace = "") {
        if (!initialized_) return;

        LogEntry entry{level, message, stackTrace, environment_, defaultSubModuleId_, getCurrentTimestamp()};
        
        {
            std::lock_guard<std::mutex> lock(mutex_);
            queue_.push(entry);
        }
        cv_.notify_one();
    }

    ~SentinelClient() {
        stop_ = true;
        cv_.notify_all();
        if (worker_.joinable()) worker_.join();
    }

private:
    SentinelClient() : initialized_(false), stop_(false) {}

    void processQueue() {
        while (!stop_) {
            std::unique_lock<std::mutex> lock(mutex_);
            cv_.wait_for(lock, std::chrono::seconds(5), [this] { return !queue_.empty() || stop_; });

            while (!queue_.empty()) {
                LogEntry entry = queue_.front();
                queue_.pop();
                lock.unlock();
                
                sendToBackend(entry);
                
                lock.lock();
            }
        }
    }

    void sendToBackend(const LogEntry& entry) {
        // In a real implementation, use libcurl or similar for HTTP POST.
        // For the hackathon demo, we'll simulate the network call.
        std::cout << "[Sentinel C++ SDK] Ingesting: " << entry.level << " - " << entry.message << std::endl;
    }

    static void signalHandler(int signum) {
        std::stringstream ss;
        ss << "Critical signal received: " << signum;
        instance().log("FATAL", ss.str(), "Stack trace capture not implemented in C++ demo");
        
        // Ensure logs are flushed before exit
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
        exit(signum);
    }

    void setupSignalHandlers() {
        std::signal(SIGSEGV, signalHandler);
        std::signal(SIGABRT, signalHandler);
        std::signal(SIGFPE, signalHandler);
    }

    std::string getCurrentTimestamp() {
        auto now = std::chrono::system_clock::now();
        auto in_time_t = std::chrono::system_clock::to_time_t(now);
        std::stringstream ss;
        ss << std::put_time(std::gmtime(&in_time_t), "%Y-%m-%dT%H:%M:%SZ");
        return ss.str();
    }

    bool initialized_;
    bool stop_;
    std::string apiKey_;
    std::string backendUrl_;
    std::string environment_;
    std::string defaultSubModuleId_;
    std::queue<LogEntry> queue_;
    std::mutex mutex_;
    std::condition_variable cv_;
    std::thread worker_;
};

} // namespace sentinel

#endif // SENTINEL_CLIENT_HPP
