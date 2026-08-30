# ═══════════════════════════════════════════════════════════════════════════
# DOCKERFILE - Containerized Test Execution
# ═══════════════════════════════════════════════════════════════════════════
#
# WHAT: Docker container for running Playwright tests.
# WHY: Consistent environment across local, CI, and production.
# IF NOT USED: "Works on my machine" issues, environment drift.
# INTERVIEW TIP: "Containers ensure identical test execution everywhere"
# ═══════════════════════════════════════════════════════════════════════════

# Use official Playwright image with all browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

# Set working directory
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p auth logs reports test-results test-data

# Set environment variables
ENV CI=true
ENV NODE_ENV=test

# Default command - run all tests
CMD ["npx", "playwright", "test"]

# ═══════════════════════════════════════════════════════════════════════════
# USAGE INSTRUCTIONS
# ═══════════════════════════════════════════════════════════════════════════
#
# Build the image:
#   docker build -t playwright-tests .
#
# Run all tests:
#   docker run --rm playwright-tests
#
# Run smoke tests:
#   docker run --rm playwright-tests npx playwright test --grep @smoke
#
# Run with custom command:
#   docker run --rm playwright-tests npx playwright test --project=chromium
#
# Mount volume for reports:
#   docker run --rm -v $(pwd)/reports:/app/reports playwright-tests
#
# Interactive shell:
#   docker run --rm -it playwright-tests /bin/bash
#
# ═══════════════════════════════════════════════════════════════════════════
