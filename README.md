# Dependency Mapper

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://dependency-mapper-git-main-vikrantgarg01s-projects.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

**Visualize your microservice architecture and understand your blast radius.** A modern, interactive dependency mapping tool that helps you map, visualize, and analyze microservice dependencies in real-time.

##  Features

- 🎯 **Interactive Visual Mapping** - Drag-and-drop interface to create and organize your services
- 💥 **Blast Radius Analysis** - Instantly see what breaks when any service goes down
-  **Beautiful UI** - Modern glass-morphism design with dark mode support
- 📊 **Real-time Statistics** - Track total services, dependencies, and hard/soft connections
- 🔐 **Secure Authentication** - Powered by Clerk with Google OAuth support
- 💾 **Persistent Storage** - MySQL database with Prisma ORM
-  **Export as PNG** - Save and share your architecture diagrams
- 🎪 **Status Simulation** - Test failure scenarios without affecting production
-  **Dark Mode** - Easy on the eyes, day or night

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Flow** - Interactive node-based graphs
- **next-themes** - Dark mode implementation

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma** - Type-safe ORM
- **MySQL (TiDB Cloud)** - Serverless database

### Authentication & Deployment
- **Clerk** - User authentication & management
- **Vercel** - Hosting & CI/CD

##  Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Clerk](https://clerk.com) account (free)
- A [TiDB Cloud](https://tidb.cloud) or MySQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VikrantGarg01/dependency-mapper.git
   cd dependency-mapper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication Keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   
   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
   
   # Database Connection
   DATABASE_URL="mysql://user:password@host:port/database?sslaccept=strict"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📖 How to Use

1. **Create a Project** - Click "+ New Project" to start mapping your architecture
2. **Add Services** - Use the "+ Add Service" button to create microservices
3. **Create Dependencies** - Click "+ Add Dependency" to connect services
   - **Hard Dependencies** (Sync) - Critical connections that will break if the target fails
   - **Soft Dependencies** (Async) - Non-critical connections (queues, events)
4. **Analyze Blast Radius** - Click on any service to see what downstream services would be affected
5. **Simulate Failures** - Use the status indicators (🟢🟡) to test failure scenarios
6. **Export** - Download your diagram as a PNG image

##  Key Concepts

### Blast Radius
The blast radius shows all downstream services that would be affected if a particular service fails. This helps you:
- Identify single points of failure
- Plan for redundancy
- Understand system resilience
- Prioritize monitoring and alerts

### Dependency Types
- **Hard (Sync)**: Synchronous dependencies (API calls, direct database queries). If the target service goes down, the source service **will fail**.
- **Soft (Async)**: Asynchronous dependencies (message queues, event streams). If the target goes down, the source can **continue operating** (possibly with degraded functionality).

##  Project Structure

```
dependency-mapper/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── dashboard/         # Dashboard & project pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable React components
│   │   ├── DependencyGraph.tsx
│   │   ├── CreateServiceForm.tsx
│   │   ├── CreateDependencyForm.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ExportButton.tsx
│   ├── lib/
│   │   └── prisma.ts          # Prisma client instance
│   └── actions.ts             # Server actions
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS config
└── package.json
```

## 🌐 Live Demo

Visit our live demo: **[Dependency Mapper](https://dependency-mapper-git-main-vikrantgarg01s-projects.vercel.app)**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨💻 Author

**Vikrant Garg**
- GitHub: [@VikrantGarg01](https://github.com/VikrantGarg01)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Clerk](https://clerk.com/) - Authentication made easy
- [React Flow](https://reactflow.dev/) - Node-based graph library
- [Prisma](https://prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Rapid UI development

---

<div align="center">

**Made with ❤️ by Vikrant Garg**

[⭐ Star this repo](https://github.com/VikrantGarg01/dependency-mapper) if you find it useful!

</div>