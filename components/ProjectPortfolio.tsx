
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CodeIcon, PlusIcon, GlobeIcon, TrashIcon } from './Icons';
import { Project } from '../types';

interface ProjectPortfolioProps {
    onBack: () => void;
}

const ProjectPortfolio: React.FC<ProjectPortfolioProps> = ({ onBack }) => {
    const [projects, setProjects] = useState<Project[]>(() => {
        const stored = localStorage.getItem('mwijay_projects');
        return stored ? JSON.parse(stored) : [];
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newProject, setNewProject] = useState<Partial<Project>>({});
    const [draggedProject, setDraggedProject] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('mwijay_projects', JSON.stringify(projects));
    }, [projects]);

    const handleAdd = () => {
        if (newProject.name && newProject.description) {
            const project: Project = {
                id: Date.now().toString(),
                name: newProject.name,
                description: newProject.description,
                techStack: newProject.techStack || [],
                status: 'To Do',
                ...newProject as Project
            };
            setProjects([project, ...projects]);
            setIsAdding(false);
            setNewProject({});
        }
    };

    const handleDelete = (id: string) => {
        setProjects(projects.filter(p => p.id !== id));
    };

    // Drag and Drop Logic
    const onDragStart = (e: React.DragEvent, id: string) => {
        setDraggedProject(id);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent, status: 'To Do' | 'In Progress' | 'Completed') => {
        if (draggedProject) {
            setProjects(prev => prev.map(p => 
                p.id === draggedProject ? { ...p, status } : p
            ));
            setDraggedProject(null);
        }
    };

    const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, project.id)}
            className="bg-card p-3 rounded-xl border border-white/5 group mb-2 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-isabelline">{project.name}</h4>
                <button onClick={() => handleDelete(project.id)} className="text-dun hover:text-red-400 opacity-0 group-hover:opacity-100">
                    <TrashIcon className="w-3 h-3"/>
                </button>
            </div>
            <p className="text-xs text-dun mt-1 mb-2 line-clamp-2">{project.description}</p>
            <div className="flex flex-wrap gap-1">
                {project.techStack.map(tech => (
                    <span key={tech} className="text-[9px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">{tech}</span>
                ))}
            </div>
            {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent mt-2 hover:underline">
                    <GlobeIcon className="w-3 h-3"/> Repo
                </a>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
            <header className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">Project Kanban</h2>
                <button onClick={() => setIsAdding(true)} className="p-2 rounded-full hover:bg-white/10">
                    <PlusIcon className="w-6 h-6" />
                </button>
            </header>

            {isAdding && (
                <div className="bg-card p-4 rounded-2xl mb-6 border border-accent/20 animate-slide-in-from-bottom">
                    <h3 className="font-bold text-accent mb-3">New Project</h3>
                    <div className="space-y-3">
                        <input className="w-full bg-bg-primary p-2 rounded text-sm focus:ring-amber focus:border-accent" placeholder="Project Name" value={newProject.name || ''} onChange={e => setNewProject({...newProject, name: e.target.value})} />
                        <textarea className="w-full bg-bg-primary p-2 rounded text-sm focus:ring-amber focus:border-accent resize-none" placeholder="Description..." rows={2} value={newProject.description || ''} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                        <input className="w-full bg-bg-primary p-2 rounded text-sm focus:ring-amber focus:border-accent" placeholder="Tech Stack (comma separated)" onChange={e => setNewProject({...newProject, techStack: e.target.value.split(',').map(s => s.trim())})} />
                        <div className="flex gap-2">
                            <button onClick={handleAdd} className="flex-1 bg-accent text-cafe py-2 rounded font-bold text-sm">Save</button>
                            <button onClick={() => setIsAdding(false)} className="flex-1 bg-bg-primary py-2 rounded text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-grow overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-4 h-full min-w-[800px] md:min-w-full">
                    {/* TO DO Column */}
                    <div 
                        onDragOver={onDragOver} 
                        onDrop={(e) => onDrop(e, 'To Do')}
                        className="flex-1 bg-black/20 rounded-2xl p-3 flex flex-col min-w-[250px]"
                    >
                        <h3 className="text-xs font-bold text-dun uppercase mb-3 px-1 flex justify-between">To Do <span className="bg-white/10 px-2 rounded-full">{projects.filter(p => p.status === 'To Do').length}</span></h3>
                        <div className="flex-grow overflow-y-auto no-scrollbar pr-1">
                            {projects.filter(p => p.status === 'To Do').map(p => <ProjectCard key={p.id} project={p} />)}
                        </div>
                    </div>

                    {/* IN PROGRESS Column */}
                    <div 
                        onDragOver={onDragOver} 
                        onDrop={(e) => onDrop(e, 'In Progress')}
                        className="flex-1 bg-black/20 rounded-2xl p-3 flex flex-col min-w-[250px]"
                    >
                        <h3 className="text-xs font-bold text-blue-400 uppercase mb-3 px-1 flex justify-between">In Progress <span className="bg-blue-500/20 px-2 rounded-full">{projects.filter(p => p.status === 'In Progress').length}</span></h3>
                        <div className="flex-grow overflow-y-auto no-scrollbar pr-1">
                            {projects.filter(p => p.status === 'In Progress').map(p => <ProjectCard key={p.id} project={p} />)}
                        </div>
                    </div>

                    {/* COMPLETED Column */}
                    <div 
                        onDragOver={onDragOver} 
                        onDrop={(e) => onDrop(e, 'Completed')}
                        className="flex-1 bg-black/20 rounded-2xl p-3 flex flex-col min-w-[250px]"
                    >
                        <h3 className="text-xs font-bold text-green-400 uppercase mb-3 px-1 flex justify-between">Done <span className="bg-green-500/20 px-2 rounded-full">{projects.filter(p => p.status === 'Completed').length}</span></h3>
                        <div className="flex-grow overflow-y-auto no-scrollbar pr-1">
                            {projects.filter(p => p.status === 'Completed').map(p => <ProjectCard key={p.id} project={p} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectPortfolio;
