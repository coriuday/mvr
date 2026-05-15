# =============================================================================
# Backend Dockerfile — Multi-stage Rust build
# Stage 1: chef (dependency caching)
# Stage 2: planner (generate recipe)
# Stage 3: builder (compile source)
# Stage 4: runtime (minimal distroless image)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Install cargo-chef for layer caching
# ---------------------------------------------------------------------------
FROM rust:1.95-slim AS chef
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*
RUN cargo install cargo-chef
WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: Generate recipe for dependency layer
# ---------------------------------------------------------------------------
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ---------------------------------------------------------------------------
# Stage 3: Build dependencies first (cached unless Cargo.toml changes)
# ---------------------------------------------------------------------------
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Build the actual application
COPY . .
RUN cargo build --release --bin mvr-backend

# ---------------------------------------------------------------------------
# Stage 4: Minimal runtime image
# ---------------------------------------------------------------------------
FROM debian:bookworm-slim AS runtime

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r mvr && useradd -r -g mvr mvr

WORKDIR /app

# Copy binary
COPY --from=builder /app/target/release/mvr-backend ./mvr-backend
# Copy migrations
COPY --from=builder /app/migrations ./migrations

# Set ownership
RUN chown -R mvr:mvr /app

USER mvr

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["./mvr-backend"]
