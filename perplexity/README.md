Nexus AI — AI-Powered Chatbot Platform
A feature-rich AI assistant that combines conversational AI, document-based question answering, image generation, real-time communication, and productivity tools in one web application.

Live Demo: https://backend-04q0.onrender.com/
<!-- Replace the placeholders below with your own repository links and screenshots. -->
<!-- ![Nexus AI Screenshot](docs/screenshots/home.png) -->

Overview
Nexus AI is a full-stack AI chatbot platform built with the MERN stack. It brings AI conversations, image understanding, document-based Q&A, content generation, and chat organization together in one application.

The project focuses on combining AI integrations with maintainable frontend and backend architecture, real-time features, and a customizable user experience.
Key Features
AI Chat and Personalization
- AI-powered conversations using the Google Gemini API.
- Custom instructions to tailor responses to a user's needs.
- Ask questions about images and receive AI-generated explanations.
- Like, dislike, copy, and regenerate responses.
PDF Q&A and Document Retrieval
- Ask questions based on PDF content using a vector database and retrieval-based workflows.
- Designed for document-grounded answers using Retrieval-Augmented Generation (RAG).
- Explore and integrate AI application workflows with LangChain and LangGraph.
AI Content Generation
- Generate images using Pollinations AI.
- Generate PowerPoint presentations with AI assistance.
- Export conversations as PDF or Markdown files.
Chat Management and Sharing
- Organize conversations into folders.
- Share conversations through dedicated read-only links.
- Use keyboard shortcuts for faster interaction.
Real-Time Communication
- Live chat functionality powered by Socket.IO.
User Experience
- Progressive Web App (PWA) capabilities.
- 5+ theme customization options.
- Responsive, customizable chat experience.
Security and Monitoring
- Helmet middleware for HTTP security headers in the Express.js backend.
- Sentry integration for error monitoring and debugging.
Tech Stack
Area	Technologies
Frontend	React.js, Redux
Frontend Architecture	Feature-based architecture
Backend	Node.js, Express.js
Backend Architecture	MVC (Model–View–Controller)
Database	MongoDB
AI Chat	Google Gemini API
AI Workflows	LangChain, LangGraph
Image Generation	Pollinations AI
Document Q&A	Vector database, RAG
Real-Time Communication	Socket.IO
Monitoring	Sentry
Security	Helmet
App Experience	Progressive Web App (PWA)
Export Formats	PDF, Markdown


Update this table if your implementation uses additional libraries or a specific vector database provider.

Architecture
                         ┌─────────────────────────┐
                         │       React Client      │
                         │   Feature-based modules │
                         │       Redux state       │
                         └────────────┬────────────┘
                                      │ HTTP / Socket.IO
                                      ▼
                         ┌─────────────────────────┐
                         │     Node.js + Express   │
                         │       MVC structure     │
                         │  Helmet / Sentry        │
                         └───────┬─────────┬───────┘
                                 │         │
                       ┌─────────▼───┐  ┌──▼────────────────┐
                       │   MongoDB   │  │ AI integrations   │
                       │ App data    │  │ Gemini / LangChain│
                       └─────────────┘  │ / LangGraph       │
                                        └────────┬──────────┘
                                                 │
                                      ┌──────────▼──────────┐
                                      │ Vector DB / RAG and │
                                      │ external AI services│
                                      └─────────────────────┘
This is a high-level conceptual overview. Adapt it to match the exact request flow and providers used in your implementation.
Getting Started
Prerequisites
Install or prepare the following before running the project:
- Node.js (use the version specified by your project, if present)
- npm
- MongoDB connection string
- API credentials for the services you have enabled, such as Gemini
- Any configured vector database credentials
1. Clone the repository
git clone (https://github.com/SAHU-SANDEEP-18/BACKEND/tree/main/perplexity)
cd <YOUR_PROJECT_FOLDER>
2. Install dependencies
Use the commands that match your repository structure. For a project with separate frontend and backend folders:
cd backend
npm install

cd ../frontend
npm install
If your folders are named client and server, use those names instead. If your project uses a monorepo or a different structure, adjust these commands accordingly.
3. Configure environment variables
Create a .env file in the relevant backend/frontend directories. Use the variable names expected by your codebase.

Example backend .env template:
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
SENTRY_DSN=your_sentry_dsn
Add vector database credentials and any other API keys required by your implementation.

Important: The names above are examples. Check your configuration files and replace them with the exact variable names your code uses. Never commit real API keys, passwords, database credentials, or private tokens to GitHub.

For frontend environment variables, use the prefix required by your build tool (for example, VITE_ for Vite). Never expose secret server-side API keys in frontend variables.
4. Run the application
Start the backend:
npm run dev
Start the frontend in a separate terminal:
npm run dev
Run these commands from the appropriate folders. The actual scripts may differ; check each package.json for the supported commands.
Security Notes
- Keep .env files out of version control.
- Configure CORS to allow only the origins your application needs.
- Validate and authorize access to shared read-only chat links.
- Apply rate limits and input validation to public endpoints where appropriate.
- Ensure file uploads have size/type limits and are handled safely.
- Do not expose API credentials in client-side code.
- Review Sentry data settings to avoid sending secrets or sensitive user content.
Future Improvements
Potential areas for further development include:
- Automated tests for core API routes and frontend features.
- More detailed observability and structured logging.
- Stronger rate limiting and abuse prevention for AI endpoints.
- Improved document-processing status and source citations.
- Accessibility and mobile experience improvements.
- CI/CD automation and deployment checks.
Project Links
- Live Demo: https://backend-04q0.onrender.com/
- GitHub Repository: Add your repository URL here.
- Screenshots / Demo Video: Add links here.
About the Project
Nexus AI is a hands-on full-stack project exploring the intersection of MERN development and AI-powered applications. It demonstrates work across frontend state management, backend architecture, AI service integration, document retrieval, real-time communication, and user experience.

If you are a recruiter or developer interested in the project, feel free to explore the demo and connect with me on LinkedIn.
Keywords
AI Chatbot, AI Assistant, MERN Stack, React, Redux, Node.js, Express.js, MongoDB, Gemini API, LangChain, LangGraph, Retrieval-Augmented Generation, RAG, Vector Database, Socket.IO, AI Image Generation, PDF Question Answering, PowerPoint Generation, MVC Architecture, Feature-Based Architecture, PWA, Sentry, Helmet.