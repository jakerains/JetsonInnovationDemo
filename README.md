# Jetson AI Chat Application

A modern, responsive AI chat interface powered by NVIDIA Jetson technology. This application provides a sleek, interactive chat experience with real-time message streaming and elegant UI animations.

<p align="center">
  <img src="/public/screenshot.png" alt="Jetson AI Chat Interface" width="600"/>
</p>
<p align="center">Jetson AI Chat Interface with real-time message streaming</p>

## Features

- Real-time message streaming with animated text display
- Elegant glassmorphic UI design with NVIDIA-themed styling
- Responsive layout that works on both desktop and mobile devices
- Font size adjustment controls
- Chat history management with clear chat functionality
- Beautiful hover and focus effects with aurora-style glowing
- Markdown support in chat messages
- Dark mode optimized interface

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Custom components with shadcn/ui integration
- **Animations**: Framer Motion
- **Markdown**: React Markdown
- **Backend Integration**: Ollama API with streaming support

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the Ollama server (ensure you have Ollama installed with the jetsonv2 model)

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3333](http://localhost:3333)

## Environment Setup

Ensure you have the following prerequisites:
- Node.js 18+ installed
- Ollama installed with the jakerains/jetsonv2 model
- The Ollama server running on port 11434

## Project Structure

- `/app` - Next.js app router files
- `/components` - React components including the main chat interface
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/styles` - Global CSS and Tailwind configurations

## API Integration

The application communicates with a local Ollama instance running on port 11434. The chat API endpoint handles:
- Message streaming
- Error handling
- Server-sent events
- Proper message formatting

## Customization

The application supports various customization options through:
- Tailwind CSS configuration
- Global CSS variables
- Theme customization via components.json
- Custom animations and transitions

## Development

To contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NVIDIA Jetson for the AI technology
- Vercel for Next.js and deployment platform
- Tailwind CSS for the styling system
- shadcn/ui for UI components inspiration
```
