# Next.js Migration Setup Script for Windows

$projectPath = "c:\Users\jsamp\Desktop\AI Fitness App\fitness-ai-assistant"
Set-Location $projectPath

# Create directory structure
New-Item -ItemType Directory -Path "src\app" -Force | Out-Null
New-Item -ItemType Directory -Path "public" -Force | Out-Null

# Move assets to public folder
if (Test-Path "src\assets") {
    Get-ChildItem -Path "src\assets" | Move-Item -Destination "public\" -Force
    Remove-Item -Path "src\assets" -Force
}

# Create src/app/page.jsx
@'
'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center" className={styles.center}>
        <div className={styles.hero}>
          <Image src="/hero.png" className={styles.base} width={170} height={179} alt="" priority />
          <Image src="/react.svg" className={styles.framework} alt="React logo" />
          <Image src="/vite.svg" className={styles.vite} alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/app/page.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className={styles.counter}
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className={styles.ticks}></div>

      <section id="next-steps" className={styles.nextSteps}>
        <div id="docs">
          <svg className={styles.icon} role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">
                <Image width={24} height={24} className={styles.logo} src="/vite.svg" alt="" />
                Explore Next.js
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                <Image width={24} height={24} className={styles.buttonIcon} src="/react.svg" alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className={styles.icon} role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Next.js community</p>
          <ul>
            <li>
              <a href="https://github.com/vercel/next.js" target="_blank" rel="noopener noreferrer">
                <svg
                  className={styles.buttonIcon}
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://discord.gg/bUG7V3W" target="_blank" rel="noopener noreferrer">
                <svg
                  className={styles.buttonIcon}
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vercel" target="_blank" rel="noopener noreferrer">
                <svg
                  className={styles.buttonIcon}
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vercel.com" target="_blank" rel="noopener noreferrer">
                <svg
                  className={styles.buttonIcon}
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className={styles.ticks}></div>
      <section id="spacer" className={styles.spacer}></section>
    </>
  )
}
'@ | Set-Content -Path "src\app\page.jsx" -Encoding UTF8

# Create src/app/layout.jsx
@'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Fitness AI Assistant",
  description: "Your intelligent fitness companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
'@ | Set-Content -Path "src\app\layout.jsx" -Encoding UTF8

# Create src/app/page.module.css
@'
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.hero {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;
}

.base {
  width: 100%;
  height: 100%;
}

.framework,
.vite {
  position: absolute;
}

.framework {
  bottom: 0;
  right: 0;
  width: 120px;
  height: 120px;
}

.vite {
  top: -10px;
  left: -10px;
  width: 100px;
  height: 100px;
}

.counter {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  color: #fff;
}

.counter:hover {
  border-color: #646cff;
}

.counter:focus,
.counter:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.ticks {
  height: 2px;
  background: linear-gradient(to right, #fff, #ddd, #fff);
  margin: 4rem 0;
}

.nextSteps {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nextSteps > div {
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.icon {
  width: 40px;
  height: 40px;
  margin-bottom: 1rem;
  display: block;
}

.nextSteps h2 {
  margin-bottom: 0.5rem;
}

.nextSteps p {
  margin-bottom: 1.5rem;
  color: #666;
}

.nextSteps ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nextSteps li {
  margin-bottom: 0.8rem;
}

.nextSteps a {
  color: #0066cc;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.25s;
}

.nextSteps a:hover {
  color: #0052a3;
}

.logo,
.buttonIcon {
  width: 24px;
  height: 24px;
  display: inline-block;
}

.spacer {
  height: 40vh;
}

@media (max-width: 768px) {
  .nextSteps {
    grid-template-columns: 1fr;
    padding: 2rem 1rem;
  }

  h1 {
    font-size: 2em;
  }
}
'@ | Set-Content -Path "src\app\page.module.css" -Encoding UTF8

# Create src/app/globals.css
@'
:root {
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }

  a:hover {
    color: #747bff;
  }

  button {
    background-color: #f9f9f9;
  }
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  background-color: rgba(27, 31, 35, 0.05);
  padding: 2px 6px;
  margin: 0 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

@media (prefers-color-scheme: light) {
  code {
    background-color: rgba(27, 31, 35, 0.1);
  }
}
'@ | Set-Content -Path "src\app\globals.css" -Encoding UTF8

# Remove old Vite files
Remove-Item -Path "vite.config.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "index.html" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "eslint.config.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\main.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\App.jsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\App.css" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\index.css" -Force -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "Installing dependencies..."
npm install

Write-Host ""
Write-Host "✓ Next.js setup complete!"
Write-Host "✓ To start development server: npm run dev"
