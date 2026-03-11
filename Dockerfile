FROM node:20-bookworm

# Install required tools including Zig
RUN apt-get update && apt-get install -y \
    curl \
    xz-utils \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Zig (0.13.0)
ENV ZIG_VERSION=0.13.0
RUN curl -O https://ziglang.org/download/${ZIG_VERSION}/zig-linux-x86_64-${ZIG_VERSION}.tar.xz && \
    tar -xf zig-linux-x86_64-${ZIG_VERSION}.tar.xz && \
    mv zig-linux-x86_64-${ZIG_VERSION} /usr/local/zig && \
    rm zig-linux-x86_64-${ZIG_VERSION}.tar.xz

ENV PATH="/usr/local/zig:${PATH}"

# Setup working directory
WORKDIR /app

# Ensure correct permissions for development (Avoid root issues with bind mounts)
RUN chown -R node:node /app

# Expose Vite dev server port
EXPOSE 5173

# Switch to non-root user for security and file permission handling
USER node

# We don't define a CMD here because docker-compose will handle the startup (npm run dev)
CMD ["bash"]
