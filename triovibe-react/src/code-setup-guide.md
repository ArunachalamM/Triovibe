# TrioVibe React - Setup Guide

This guide will help you set up and run the TrioVibe React application on your local machine.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 18 or higher is recommended (LTS).
    *   To check your version, run: `node -v`
    *   Download from: [nodejs.org](https://nodejs.org/)
*   **npm** (Node Package Manager): Usually comes installed with Node.js.
    *   To check your version, run: `npm -v`

## 2. Installation Setup

### Step 1: Navigate to Project Folder
Open your terminal (Command Prompt, PowerShell, or Terminal) and move into the project directory:

```bash
cd triovibe-react
```

### Step 2: Install Dependencies
This command downloads all the necessary libraries (React, Vite, Router, etc.) required to run the project.

```bash
npm install
```

## 3. Running the Application

### Development Mode (Recommended)
This starts the local server. Any changes you make to the code will instantly update in the browser.

```bash
npm run dev
```

*   Look for the "Local" URL in the terminal output (`http://localhost:8000/`).
*   Open that link in your web browser.

### Production Build
To create an optimized version of the app for deployment (live website):

```bash
npm run build
```
This generates a `dist` folder containing the static files.

To preview this build locally:
```bash
npm run preview
```

## 4. Key Libraries Used
*   **Vite**: Next Generation Frontend Tooling (Build tool).
*   **React**: UI Library.
*   **React Router**: For navigation between pages.
*   **Lucide React**: For icons.
