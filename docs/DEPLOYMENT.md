# Deployment Guide

This repository is ready for a Vercel frontend deployment with a separate backend service.

## What goes where

- `frontend/` is the Next.js app and should be deployed to Vercel.
- `backend/` is an Express API and should be deployed to a Node host such as Render, Railway, Fly.io, or a small VPS.
- The frontend talks to the backend through `NEXT_PUBLIC_API_URL`.

## Vercel setup

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Use the default Next.js build settings, or keep the explicit config in `frontend/vercel.json`.
4. Add the environment variable `NEXT_PUBLIC_API_URL` with the public backend URL.
5. Deploy.

## Required environment variables

### Frontend on Vercel

- `NEXT_PUBLIC_API_URL` = public URL of the deployed backend

### Backend on your Node host

- `GEMINI_API_KEY` = your Gemini API key
- `CLIENT_ORIGIN` = your deployed Vercel URL
- `PORT` = optional on most hosts; the host usually provides it automatically

## Local development

Use the example files already in the repo:

- [frontend/.env.local.example](../frontend/.env.local.example)
- [frontend/.env.production.example](../frontend/.env.production.example)
- [backend/.env.example](../backend/.env.example)

## Notes

- Vercel is a good fit for the frontend only in this project.
- The Express backend should not be deployed to Vercel as-is without converting it to serverless functions.
- No application code changes are required for the current Vercel frontend deployment path.
