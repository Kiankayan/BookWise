# BookWise

A full-stack library management system built with React, TypeScript, Node.js, Express, Prisma, PostgreSQL, and Cloudinary.

BookWise is a library management application that allows users to manage library items, organize categories, upload cover images, and handle borrowing and returns through a clean web interface.

**Live Demo:** [BookWise](https://bookwise-books.vercel.app)

## Features

- Create, view, edit, and delete library items.
- Organize library items into categories.
- Borrow and return items.
- Track borrowing and due dates.
- Upload cover images using Cloudinary.
- Validate data on both the frontend and backend.
- Store library data in a PostgreSQL database.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, CSS, Axios
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Validation:** Zod
- **Image Uploads:** Cloudinary
- **Deployment:** Vercel (frontend and database), Render (backend)

## Project Structure

```text
BookWise/
├── frontend/
├── backend/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A PostgreSQL database
- A Cloudinary account for image uploads

### Installation

Clone the repository:

```bash
git clone https://github.com/Kiankayan/BookWise.git
cd BookWise
```

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Install the backend dependencies:

```bash
cd ../backend
npm install
```

### Environment Variables

Configure the required environment variables in the backend and frontend before running the application locally.

- **Backend:** Database connection and Cloudinary configuration.
- **Frontend:** `VITE_API_URL`, pointing to the backend API.

Use the example environment file in the frontend as a reference. Never commit secret environment variables to GitHub.

### Running Locally

Start the backend using the scripts defined in `backend/package.json`.

Start the frontend from the `frontend` directory:

```bash
npm run dev
```

Make sure the frontend's `VITE_API_URL` points to the running backend.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Vercel PostgreSQL
- **Image Storage:** Cloudinary

## Project Status

BookWise is deployed as a full-stack portfolio project. The live application has been tested for library item management, image uploads, and data persistence.

## License

This project is available as a portfolio project. No separate license has been specified.
