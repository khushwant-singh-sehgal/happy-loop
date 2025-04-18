#!/bin/bash

# Happy Loop Start Script
# This script helps to run the Happy Loop application

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}      Starting Happy Loop App        ${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Function to check if installation is needed
check_deps() {
    echo "Checking dependencies..."
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    else
        echo "Dependencies already installed."
    fi
}

# Start the application
start_app() {
    echo -e "${GREEN}Starting the development server...${NC}"
    npm run dev
}

# Build for production if needed
build_app() {
    echo "Building the application for production..."
    npm run build
    npm run start
}

# Parse command line arguments
case "$1" in
    build)
        check_deps
        build_app
        ;;
    *)
        check_deps
        start_app
        ;;
esac

# Script end
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}      Happy Loop is running!         ${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Access the application at: ${GREEN}http://localhost:3000${NC}" 