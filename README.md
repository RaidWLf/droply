## Droply

Droply is a cloud-based file manager built with Next.js that enables authenticated users to upload, organize, star, and manage files and folders through a sleek, Tailwind-powered interface. It uses Clerk for secure user authentication and session handling, Drizzle ORM with a Neon serverless Postgres backend for metadata persistence, and ImageKit for optimized file storage, on-the-fly transformations, and fast CDN delivery. The UI leverages HeroUI components alongside Tailwind CSS for rapid styling and responsiveness. Droply is deployed on Vercel, providing zero-config CI/CD and global edge caching.

## Live Demo

Explore the live application at: **https://droply-delta.vercel.app**

## Table of Contents

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Usage](#usage)
-   [Folder Structure](#folder-structure)
-   [API Endpoints](#api-endpoints)
-   [Database Schema](#database-schema)
-   [Environment Variables](#environment-variables)
-   [Deployment](#deployment)

## Features

-   **User Authentication**: Sign up, sign in, and protected routes via Clerk.
-   **File Upload**: Drag-and-drop or browse files (≤5 MB) with progress bars and notifications.
-   **Folder Management**: Create nested folders and navigate via breadcrumbs.
-   **File Actions**: Star/unstar, soft-delete (Trash), restore, permanently delete, download, and preview.
-   **Tab Navigation**: Switch between All Files, Starred, and Trash with real-time counts.
-   **Image Optimization**: Automatic resizing and CDN delivery through ImageKit.
-   **Responsive UI**: Built with HeroUI and Tailwind CSS.

## Tech Stack

-   **Next.js** (App Router, TypeScript support)
-   **TypeScript** for type safety and developer experience
-   **React** (via Next.js) for UI components
-   **HeroUI** React component library
-   **Tailwind CSS** utility-first styling
-   **Clerk** for authentication and user management
-   **Drizzle ORM** lightweight TypeScript ORM
-   **NeonDB** serverless Postgres platform
-   **PostgreSQL** relational database
-   **ImageKit** for media storage & optimization
-   **Vercel** for deployment and hosting
-   **dotenv** for environment variable management

## Prerequisites

-   **Node.js** v14 or higher installed ([Download Node.js](https://nodejs.org/en/download?utm_source=chatgpt.com))
-   **npm** (comes with Node.js) or **Yarn**
-   **Git** for version control ([Documentation - Git](https://git-scm.com/doc?utm_source=chatgpt.com))
-   **PostgreSQL** database (unless using NeonDB) ([Documentation - PostgreSQL](https://www.postgresql.org/docs/?utm_source=chatgpt.com))

## Installation

1. **Clone the repo**
    ```bash
    git clone https://github.com/RaidWLf/droply.git
    cd droply
    ```
2. **Install dependencies**
    ```bash
    npm install
    ```
3. **Set up environment variables**
    ```bash
    cp .env.example .env.local
    ```
4. **Run database migrations**
    ```bash
    npx drizzle-kit migrate dev
    ```
5. **Start development server**
    ```bash
    npm run dev
    ```

## Configuration

Populate `.env.local` with the following variables:

```env
DATABASE_URL=postgresql://user:password@host:port/db
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_PUBLIC_KEY=your_public_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Usage

1. **Sign Up / Sign In** via Clerk’s prebuilt forms. ([Clerk Next.js SDK](https://clerk.com/docs/references/nextjs/overview?utm_source=chatgpt.com))
2. **Upload Files**: Drag or select files to upload; watch the progress bar. ([Next.js image and video upload - ImageKit](https://imagekit.io/blog/nextjs-image-and-video-upload/?utm_source=chatgpt.com))
3. **Manage Files**: Star, trash, restore, delete, preview, and download with intuitive controls.
4. **Navigate Folders** using breadcrumbs and collapsible folder views.

## Folder Structure

```
/
├── app/                  # Next.js App Router pages & components
├── lib/
│   └── db/               # Drizzle ORM schema & client
├── components/           # Reusable React components
├── config/               # Font and global configs
├── public/               # Static assets
├── prisma/               # (If used) Prisma config
├── scripts/              # Migration or seed scripts
├── .env.example
└── README.md
```

## API Endpoints

-   **POST** `/api/files/upload` – upload a file to ImageKit & db
-   **PATCH** `/api/files/[id]/star` – toggle starred flag
-   **PATCH** `/api/files/[id]/trash` – soft-delete or restore
-   **DELETE** `/api/files/[id]/delete` – permanent delete
-   **POST** `/api/folders/create` – new folder creation

## Database Schema

The `files` table (via `lib/db/schema.ts`) includes:

-   `id` (UUID)
-   `name`, `path`, `size`, `mimeType`
-   `isFolder`, `isStarred`, `isTrash` (booleans)
-   Timestamps (`createdAt`, `updatedAt`)

## Environment Variables

See [Configuration](#configuration). Ensure secrets are never committed to source control.

## Deployment

1. **Push to GitHub**; connect the repo in Vercel’s dashboard.
2. **Set Environment Variables** in Vercel’s Settings.
3. **Automatic Deploys** on each commit to `main` produce preview and production URLs.
4. **Manual CLI Deploy** (optional):
    ```bash
    npx vercel deploy --prod
    ```
