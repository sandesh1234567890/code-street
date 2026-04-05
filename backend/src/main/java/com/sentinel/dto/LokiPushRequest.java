package com.sentinel.dto;

import java.util.List;
import java.util.Map;

public class LokiPushRequest {
    private List<Stream> streams;

    public LokiPushRequest() {}
    public LokiPushRequest(List<Stream> streams) { this.streams = streams; }

    public List<Stream> getStreams() { return streams; }
    public void setStreams(List<Stream> streams) { this.streams = streams; }

    public static class Stream {
        private Map<String, String> stream; // Labels
        private List<List<String>> values; // [timestamp-nanos, log-line]

        public Stream() {}
        public Stream(Map<String, String> stream, List<List<String>> values) {
            this.stream = stream;
            this.values = values;
        }

        public Map<String, String> getStream() { return stream; }
        public void setStream(Map<String, String> stream) { this.stream = stream; }
        public List<List<String>> getValues() { return values; }
        public void setValues(List<List<String>> values) { this.values = values; }

        public static StreamBuilder builder() { return new StreamBuilder(); }
    }

    public static class StreamBuilder {
        private Map<String, String> stream;
        private List<List<String>> values;

        public StreamBuilder stream(Map<String, String> stream) { this.stream = stream; return this; }
        public StreamBuilder values(List<List<String>> values) { this.values = values; return this; }

        public Stream build() {
            return new Stream(stream, values);
        }
    }

    public static LokiPushRequestBuilder builder() { return new LokiPushRequestBuilder(); }

    public static class LokiPushRequestBuilder {
        private List<Stream> streams;

        public LokiPushRequestBuilder streams(List<Stream> streams) { this.streams = streams; return this; }

        public LokiPushRequest build() {
            return new LokiPushRequest(streams);
        }
    }
}
