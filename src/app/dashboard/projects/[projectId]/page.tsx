<header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
  <div className="px-6 py-4 flex justify-between items-center">
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {project.name}
      </h1>
      <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
    </div>
    <div className="flex gap-3 items-center">
      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export as PNG
      </button>
      <CreateDependencyForm projectId={project.id} services={project.services as any} />
      <CreateServiceForm projectId={project.id} />
      <SignOutButton />
    </div>
  </div>
</header>