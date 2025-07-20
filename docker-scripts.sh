#!/bin/bash

# 🐳 Docker Management Scripts for Superheroes App
# Make this file executable with: chmod +x docker-scripts.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function for colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    cat << EOF
🦸 Superheroes App - Docker Management Script

USAGE:
    ./docker-scripts.sh [COMMAND]

COMMANDS:
    dev-start       Start development environment with hot reload
    dev-stop        Stop development environment
    dev-logs        Show development logs

    prod-build      Build production Docker image
    prod-start      Start production environment
    prod-stop       Stop production environment
    prod-logs       Show production logs

    clean           Clean up Docker images and containers
    clean-all       Clean everything (images, containers, volumes)
    
    test            Run tests in Docker container
    build-test      Build and test the application
    
    help            Show this help message

EXAMPLES:
    ./docker-scripts.sh dev-start     # Start development with hot reload
    ./docker-scripts.sh prod-build    # Build production image
    ./docker-scripts.sh clean         # Clean up Docker resources

EOF
}

# Development commands
dev_start() {
    print_status "Starting development environment..."
    docker compose --profile dev up --build -d
    print_success "Development server started at http://localhost:4200"
    print_status "Use 'docker-scripts.sh dev-logs' to see logs"
}

dev_stop() {
    print_status "Stopping development environment..."
    docker compose --profile dev down
    print_success "Development environment stopped"
}

dev_logs() {
    print_status "Showing development logs (Ctrl+C to exit)..."
    docker compose --profile dev logs -f superheroes-dev
}

# Production commands
prod_build() {
    print_status "Building production Docker image..."
    docker build -t superheroes-app:latest .
    print_success "Production image built successfully"
    
    # Show image size
    size=$(docker images superheroes-app:latest --format "table {{.Size}}")
    print_status "Image size: $size"
}

prod_start() {
    print_status "Starting production environment..."
    docker compose --profile prod up -d
    
    # Wait for health check
    print_status "Waiting for application to be healthy..."
    timeout=60
    counter=0
    while [ $counter -lt $timeout ]; do
        if curl -f http://localhost/health > /dev/null 2>&1; then
            print_success "Production server started at http://localhost"
            return 0
        fi
        sleep 2
        counter=$((counter + 2))
        echo -n "."
    done
    print_error "Application failed to start within $timeout seconds"
    return 1
}

prod_stop() {
    print_status "Stopping production environment..."
    docker compose --profile prod down
    print_success "Production environment stopped"
}

prod_logs() {
    print_status "Showing production logs (Ctrl+C to exit)..."
    docker compose --profile prod logs -f superheroes-app
}

# Cleanup commands
clean() {
    print_status "Cleaning up unused Docker resources..."
    docker system prune -f
    print_success "Cleanup completed"
}

clean_all() {
    print_warning "This will remove ALL Docker resources for this project!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping all containers..."
        docker compose --profile dev --profile prod down -v
        
        print_status "Removing images..."
        docker rmi superheroes-app:latest 2>/dev/null || true
        
        print_status "Cleaning system..."
        docker system prune -af --volumes
        
        print_success "Complete cleanup finished"
    else
        print_status "Cleanup cancelled"
    fi
}

# Testing commands
test_docker() {
    print_status "Running tests in Docker container..."
    docker run --rm -v "$(pwd)":/app -w /app node:20-alpine sh -c "
        # Install Chrome and dependencies
        apk add --no-cache chromium &&
        export CHROME_BIN=/usr/bin/chromium-browser &&
        export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true &&
        export CI=true &&
        
        # Install dependencies and run tests
        npm ci &&
        npm test
    "
}

build_test() {
    print_status "Building and testing application..."
    
    # Build development image
    docker build -f Dockerfile.dev -t superheroes-app:dev .
    
    # Run tests
    docker run --rm superheroes-app:dev npm test -- --watch=false --browsers=ChromeHeadless
    
    # Build production image
    prod_build
    
    print_success "Build and test completed successfully"
}

# Main script logic
case "${1:-help}" in
    dev-start)
        dev_start
        ;;
    dev-stop)
        dev_stop
        ;;
    dev-logs)
        dev_logs
        ;;
    prod-build)
        prod_build
        ;;
    prod-start)
        prod_start
        ;;
    prod-stop)
        prod_stop
        ;;
    prod-logs)
        prod_logs
        ;;
    clean)
        clean
        ;;
    clean-all)
        clean_all
        ;;
    test)
        test_docker
        ;;
    build-test)
        build_test
        ;;
    help|*)
        show_help
        ;;
esac 