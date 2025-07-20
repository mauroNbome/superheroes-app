#!/bin/bash

# 🔧 WSL2 Hot Reload Fix Script for Angular Apps
# This script helps diagnose and fix hot reload issues in WSL2 environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}================================="
    echo -e "🔧 WSL2 Hot Reload Diagnostics"
    echo -e "=================================${NC}\n"
}

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

print_solution() {
    echo -e "${CYAN}[SOLUTION]${NC} $1"
}

# Check if running in WSL2
check_wsl_environment() {
    print_status "Checking WSL environment..."
    
    if grep -qi microsoft /proc/version; then
        if grep -qi wsl2 /proc/version; then
            print_success "Running in WSL2"
            return 0
        else
            print_warning "Running in WSL1 - consider upgrading to WSL2"
            return 1
        fi
    else
        print_error "Not running in WSL"
        return 1
    fi
}

# Check current directory location
check_directory_location() {
    print_status "Checking project directory location..."
    
    current_dir=$(pwd)
    
    if [[ $current_dir == /mnt/* ]]; then
        print_error "Project is on Windows filesystem ($current_dir)"
        print_solution "Move project to WSL2 native filesystem for better performance"
        echo -e "${YELLOW}Recommended locations:${NC}"
        echo "  - ~/projects/$(basename $current_dir)"
        echo "  - /home/\$USER/projects/$(basename $current_dir)"
        return 1
    else
        print_success "Project is on WSL2 native filesystem ($current_dir)"
        return 0
    fi
}

# Check Docker integration
check_docker_integration() {
    print_status "Checking Docker integration..."
    
    if command -v docker &> /dev/null; then
        if docker ps &> /dev/null; then
            print_success "Docker is accessible from WSL2"
            return 0
        else
            print_error "Docker daemon not accessible"
            print_solution "Enable WSL2 integration in Docker Desktop settings"
            return 1
        fi
    else
        print_error "Docker not found"
        print_solution "Install Docker or enable WSL2 integration"
        return 1
    fi
}

# Check Angular configuration
check_angular_config() {
    print_status "Checking Angular configuration..."
    
    if [[ -f "angular.json" ]]; then
        print_success "Angular project detected"
        
        # Check for serve configuration
        if grep -q '"serve"' angular.json; then
            print_success "Angular serve configuration found"
        else
            print_warning "No serve configuration found in angular.json"
        fi
        
        return 0
    else
        print_error "No angular.json found - not an Angular project?"
        return 1
    fi
}

# Check package.json scripts
check_package_scripts() {
    print_status "Checking package.json scripts..."
    
    if [[ -f "package.json" ]]; then
        if grep -q '"start".*--poll' package.json; then
            print_success "Start script includes polling (good for WSL2)"
        else
            print_warning "Start script doesn't include polling"
            print_solution "Update start script to include --poll flag"
        fi
        
        if grep -q '"start".*--host' package.json; then
            print_success "Start script includes host binding"
        else
            print_warning "Start script doesn't bind to all interfaces"
            print_solution "Add --host 0.0.0.0 to start script"
        fi
        
        return 0
    else
        print_error "No package.json found"
        return 1
    fi
}

# Copy project to WSL2 filesystem
copy_project_to_wsl2() {
    print_status "Copying project to WSL2 filesystem..."
    
    current_dir=$(pwd)
    project_name=$(basename $current_dir)
    target_dir="$HOME/projects/$project_name"
    
    if [[ $current_dir == /mnt/* ]]; then
        print_status "Creating target directory: $target_dir"
        mkdir -p "$HOME/projects"
        
        print_status "Copying project files..."
        cp -r "$current_dir" "$target_dir"
        
        print_success "Project copied to: $target_dir"
        print_solution "Navigate to the new location:"
        echo -e "${CYAN}  cd $target_dir${NC}"
        echo -e "${CYAN}  code .${NC}"
        
        return 0
    else
        print_success "Project already on WSL2 filesystem"
        return 0
    fi
}

# Fix hot reload configuration
fix_hot_reload_config() {
    print_status "Applying hot reload fixes..."
    
    # Update package.json if needed
    if [[ -f "package.json" ]] && ! grep -q '"start".*--poll' package.json; then
        print_status "Updating package.json start script..."
        # This is a simplified fix - in practice you might want to use jq
        sed -i 's/"start": "ng serve"/"start": "ng serve --host 0.0.0.0 --port 4200 --poll 1000"/' package.json
        print_success "Updated package.json start script"
    fi
    
    # Check if angular.json needs updates
    if [[ -f "angular.json" ]]; then
        print_success "Angular configuration looks good"
    fi
    
    return 0
}

# Show recommended development workflow
show_development_workflow() {
    echo -e "\n${CYAN}🚀 Recommended Development Workflow:${NC}\n"
    
    echo -e "${YELLOW}1. Ensure project is on WSL2 filesystem:${NC}"
    echo -e "   ${CYAN}pwd${NC} # Should NOT start with /mnt/"
    
    echo -e "\n${YELLOW}2. Start development environment:${NC}"
    echo -e "   ${CYAN}./docker-scripts.sh dev-start${NC}"
    
    echo -e "\n${YELLOW}3. Check logs if needed:${NC}"
    echo -e "   ${CYAN}./docker-scripts.sh dev-logs${NC}"
    
    echo -e "\n${YELLOW}4. Alternative direct start:${NC}"
    echo -e "   ${CYAN}npm run start:wsl2${NC}"
    
    echo -e "\n${YELLOW}5. Stop development:${NC}"
    echo -e "   ${CYAN}./docker-scripts.sh dev-stop${NC}"
    
    echo -e "\n${GREEN}💡 Tips:${NC}"
    echo -e "   • Use ${CYAN}start:wsl2${NC} script for optimized WSL2 performance"
    echo -e "   • Polling is enabled to detect file changes in WSL2"
    echo -e "   • Project should be in WSL2 filesystem (not /mnt/c/...)"
    echo -e "   • Docker Desktop WSL2 integration should be enabled"
}

# Main diagnostic function
run_diagnostics() {
    print_header
    
    local issues=0
    
    check_wsl_environment || ((issues++))
    echo
    
    check_directory_location || ((issues++))
    echo
    
    check_docker_integration || ((issues++))
    echo
    
    check_angular_config || ((issues++))
    echo
    
    check_package_scripts || ((issues++))
    echo
    
    if [[ $issues -eq 0 ]]; then
        print_success "All checks passed! 🎉"
        show_development_workflow
    else
        print_warning "Found $issues issue(s) that may affect hot reload"
        echo -e "\n${CYAN}Run with --fix to apply automatic fixes${NC}"
    fi
}

# Show help
show_help() {
    cat << EOF
🔧 WSL2 Hot Reload Fix Script

USAGE:
    ./wsl2-setup.sh [COMMAND]

COMMANDS:
    check       Run diagnostics (default)
    fix         Apply automatic fixes
    copy        Copy project to WSL2 filesystem
    workflow    Show recommended development workflow
    help        Show this help

EXAMPLES:
    ./wsl2-setup.sh                # Run diagnostics
    ./wsl2-setup.sh fix            # Apply fixes
    ./wsl2-setup.sh copy           # Copy from Windows to WSL2 filesystem

EOF
}

# Main script logic
case "${1:-check}" in
    check)
        run_diagnostics
        ;;
    fix)
        run_diagnostics
        echo
        fix_hot_reload_config
        ;;
    copy)
        copy_project_to_wsl2
        ;;
    workflow)
        show_development_workflow
        ;;
    help|*)
        show_help
        ;;
esac 