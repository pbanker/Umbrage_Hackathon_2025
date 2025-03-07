# AI Sales Presentation Generator POC

A pitch deck generation system that leverages AI to build customized PowerPoint presentations from a curated slide repository. This tool revolutionizes sales presentation creation by automatically selecting and adapting relevant slides based on specific user requirements.

## Problem Statement
Sales teams face two major challenges when creating pitch decks: writing compelling content from scratch and navigating extensive slide libraries to find appropriate templates. Our solution addresses both issues by:
1. Intelligently generating presentation outlines tailored to specific sales contexts
2. Automatically selecting the most relevant template slides from your repository
3. Adapting selected slides while maintaining brand consistency and professional quality

This streamlines what was previously a time-consuming, manual process into an efficient, AI-powered workflow.

## Features

- **Smart Slide Repository**
  - Import and manage multiple template slide libraries
  - Automated slide extraction and metadata/embeddings generation
  - ~~Support for Microsoft 365 integration via Graph API~~ - *to be implemented in future version*
  - ~~Automated repository syncing via webhooks~~ - *to be implemented in future version*

- **AI-Powered Generation**
  - Intelligent outline generation based on user requirements
  - Vector-based semantic search for intelligent slide-matching
  - Content adaptation while preserving slide layouts

- **Metadata Management**
  - Rich metadata tagging system
  - Visual slide repository browser
  - Metadata editing interface
  - Content mapping schemas for text content placement

## Technical Implementation

### Overview
- Frontend: React with TypeScript
- Backend: FastAPI (Python)
- Database: PostgreSQL with pgvector extension
- AI: OpenAI Structured Outputs and Embeddings API

### AI Models
- OpenAI gpt-4o-2024-08-06
- OpenAI gpt-3.5-turbo
- OpenAI text-embedding-ada-002

### Key Dependencies
- Python 3.8+
- python-pptx
- OpenAI API
- pgvector
- SQLAlchemy
- FastAPI

### App Flow
![Screenshot 2025-03-04 at 5 58 17 PM](https://github.com/user-attachments/assets/d8f8c4c6-c56a-40cb-a338-1aff1ace48b1)


## Installation

1. Clone the repository
```bash
git clone https://github.com/pbanker/umbrage_hackathon_2025.git
cd umbrage_hackathon_2025
```
2. Create a `.env` file in the root directory and add your OpenAI API key + other environment variables from the `.env.example` file

3. Run the backend
```bash
docker compose up -d --build
```
4. Run the frontend
```bash
cd frontend
npm install
npm run dev
```
5. Open the frontend in your browser
```bash
http://localhost:5173/
```

## Usage Guide

1. **Repository Setup**
   - Upload template PowerPoint files via the UI -- *NOTE: Make sure your pptx file does not have sections*
   - System automatically processes slides and generates metadata
   - Optionally edit metadata for better matching

2. **Generate Presentations**
   - Fill in the presentation requirements form
   - System generates an outline and matches appropriate slides
   - Download the generated presentation

## Rough Demo (output needs to be improved)

https://github.com/user-attachments/assets/0c15c214-9f00-40c0-a2f5-e985add9b5fd


## Future Improvements

- Better prompts for more consistent, pertinent content output
- Slide component registry for categorizing slide content. Will allow for accurate creation/modification of complex content such as charts, tables, timelines, etc
- Slide component parsing for breaking down and mapping slide content to component types
- Better/automated metadata generation via Computer Vision Models
- Outline/presentation preview
- In-app slide editing with additional AI assistance
- Proper UI layout (admin view, user view, etc.)
- Authentication and user management
- API/webhook integration for automatic repository integration/sync
- Integrate other data sources for gathering deal specifics (i.e. video call transcripts, documents, websites/publications as context)

## Known Limitations

- Currently only supports text content swapping
- Cannot modify slide layout or mutate slide content positioning/dimensions
- Cannot use more than one slide template per presentation
- Repository 'sync' requires manually uploading slide repositories - *API/webhook integration to be implemented in future version*
- Slide image capture for thumbnails does not produce accurate results
- Larger slide repositories with sections tend to output corrupt .pptx files
