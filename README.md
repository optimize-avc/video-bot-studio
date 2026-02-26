# Video Bot Studio

AI-powered video creation and editing chatbot built with **Next.js** and **n8n** workflow automation.

Talk to the bot in natural language to create scripts, generate visuals, add voiceovers, render videos, and edit them - all through a sleek dark-themed chat interface.

## Features

- **Chat Interface** - Dark themed, session-based chat UI
- **Script Generation** - AI writes scene-by-scene video scripts via GPT-4o
- **Visual Generation** - DALL-E 3 creates images for each scene
- **Voiceover** - ElevenLabs text-to-speech for narration
- **Video Rendering** - Creatomate API assembles final videos
- **Video Editing** - Trim, add subtitles, watermarks, transitions
- **Session Memory** - Conversation context persists across messages
- **Media Preview** - Videos, images, and audio render inline in chat

## Architecture

```
Next.js App (localhost:3000)  <-->  n8n (cloud or local)
     |                                    |
  Chat UI                          AI Agent (GPT-4o)
  Session mgmt                          |
  Media preview            +------------+------------+
                           |      |      |      |      |
                        Script  Visual  Voice  Render  Edit
                        Gen     Gen     Gen    Video   Video
```

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/optimize-avc/video-bot-studio.git
cd video-bot-studio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and add your n8n webhook URL:

```
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://optimize26.app.n8n.cloud/webhook/YOUR-ID/chat
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## n8n Backend Setup

The app connects to 6 n8n workflows:

| Workflow | Purpose |
|---|---|
| Video Bot - Main Agent | Chat trigger + AI agent orchestrator |
| Video Bot - Script Generation | GPT-4o script writing |
| Video Bot - Visual Generation | DALL-E 3 image creation |
| Video Bot - Voiceover Generation | ElevenLabs TTS |
| Video Bot - Video Rendering | Creatomate video assembly |
| Video Bot - Video Editing | Creatomate video editing |

### Required API Keys (in n8n)

- **OpenAI** - GPT-4o + DALL-E 3
- **ElevenLabs** - Text-to-speech
- **Creatomate** - Video rendering

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **n8n** - Backend workflow automation
- **GPT-4o** - AI agent brain
- **DALL-E 3** - Image generation
- **ElevenLabs** - Voice synthesis
- **Creatomate** - Video rendering

## License

MIT
