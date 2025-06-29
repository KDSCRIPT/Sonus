Sonus 🎧✨

AI-powered, immersive audiobook creation with granular voice control, powered by Murf AI.
Transform your stories into lifelike audio, one sentence at a time.

---

## 🚀 Overview

**Sonus** is an innovative platform for creating immersive audiobooks with AI. Upload your manuscript, optimize your content, and generate professional-grade audio with sentence-level voice customization. Sonus leverages Murf AI, Facebook Bart, and Gemini Flash 2.0 to recommend the best voice settings—while you stay in control.

---

## ✨ Features

- **📄 Multi-format Upload:** Supports `.txt`, `.pdf`, and `.docx`.
- **🧠 AI Content Optimization:** Facebook Bart suggests improved/summarized content.
- **💸 Cost Transparency:** See character usage, cost incurred, and savings instantly.
- **🎭 Character Recognition:** Gemini Flash 2.0 identifies characters and assigns voices.
- **🎚️ Granular Voice Control:** Per-sentence Murf AI voice, pitch, rate, and style recommendations.
- **🔁 Real-time Preview:** Instantly stream audio for each block using Murf's streaming API.
- **✏️ Block Editing:** Update text, delete blocks, and override voice settings.
- **🎵 Unified Export:** Combine all blocks into a single MP3 via Murf's generation API.
- **🗂️ File Management:** Preview, download, delete, and update files easily.
- **🔒 Secure Auth:** User authentication and authorization powered by Clerk.

---

## 🛠️ Tech Stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Frontend   | [Next.js](https://nextjs.org/)                               |
| Backend    | [Flask](https://flask.palletsprojects.com/)                  |
| AI Models  | Facebook Bart, Gemini Flash 2.0                              |
| TTS Engine | [Murf AI](https://murf.ai/)                                  |
| Storage    | [Supabase Buckets](https://supabase.com/)                    |
| Auth       | [Clerk](https://clerk.com/)                                  |
| Deployment | [Vercel](https://vercel.com/), [Render](https://render.com/) |

---

## 🏗️ Workflow

1. **Upload** your document (`.txt`, `.pdf`, `.docx`).
2. **Choose** between original or AI-optimized content (with cost analysis).
3. **Analyze:** Gemini Flash 2.0 identifies characters and recommends Murf AI voice settings per sentence.
4. **Review & Edit:**
   - Preview each sentence/block with real-time AI voice.
   - Edit text, override voice, pitch, rate, or style.
5. **Export:** Combine all blocks into a single MP3.
6. **Manage:** Preview, download, delete, and update your files.

---

## 🧩 API Reference

> Full documentation & examples in our [Postman Collection](https://sonus2-2808.postman.co/workspace/Sonus-Workspace~5dbfcc5e-bc17-4c74-81cb-b54453d3bbdf/request/31843057-cd348f2d-827d-4f87-89d3-b8103fff924f?action=share&source=copy-link&creator=31843057).

### 🎙️ Example: Voice Recommendation Response

```json
{
  "config": {
    "voiceId": "en-UK-aiden",
    "pitch": -10,
    "rate": -10,
    "style": "Narration",
    "sampleRate": 44100,
    "channelType": "MONO",
    "format": "MP3",
    "text": "On the edge of a quiet village nestled between silver hills..."
  },
  "analysis": {
    "primary_emotion": "Nostalgia",
    "preferred_accent": "UK",
    "preferred_age": "middle_aged",
    "preferred_gender": "male"
  },
  "reasoning": {
    "pitch_rationale": "Pitch set to -10 based on emotional intensity...",
    "rate_rationale": "Rate set to -10 based on urgency level...",
    "style_rationale": "Selected 'Narration' based on Nostalgia emotion...",
    "voice_choice": "A middle-aged UK male voice conveys warmth and experience."
  }
}
```

---

## 🏁 Getting Started

1. **Clone the repo**

git clone https://github.com/your-org/sonus.git
cd sonus

2. **Install dependencies**

- Frontend: `cd frontend && npm install`
- Backend: `cd backend && pip install -r requirements.txt`

3. **Set up environment variables**

- Supabase, Clerk, and Murf AI API keys.

4. **Deploy**

- Frontend: [Vercel](https://vercel.com/)
- Backend: [Render](https://render.com/)

5. **Import API collection**

- Use the provided [Postman Collection](./Murf.postman_collection.json) for API testing.

---

## 📂 File Structure

```

sonus/
├── frontend/ # Next.js app
├── backend/ # Flask API
├── Murf.postman_collection.json
└── README.md

```

---

## 🌐 Useful Links

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=vercel)](https://sonusmurf.vercel.app/)
[![API Docs](https://img.shields.io/badge/Postman-API_Collection-orange?style=for-the-badge&logo=postman)](https://sonus2-2808.postman.co/...)

---

## 🤝 Contributing

We welcome contributions! Please open issues, submit PRs, or suggest features.

---

![MIT License](https://img.shields.io/badge/license-MIT-green.svg)
![Built with Murf AI](https://img.shields.io/badge/Voice-MurfAI-blue)
