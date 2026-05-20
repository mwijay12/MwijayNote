import React, { useState } from 'react';
import { CustomTemplate } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, XIcon, FileTextIcon } from './Icons';

interface TemplateManagerScreenProps {
  templates: CustomTemplate[];
  onSave: (template: CustomTemplate) => void;
  onDelete: (id: string) => void;
  onAdd: (template: Omit<CustomTemplate, 'id'>) => void;
  onBack: () => void;
}

const TemplateEditorModal: React.FC<{
    template?: CustomTemplate;
    onSave: (template: Omit<CustomTemplate, 'id'> | CustomTemplate) => void;
    onClose: () => void;
}> = ({ template, onSave, onClose }) => {
    const [name, setName] = useState(template?.name || '');
    const [content, setContent] = useState(template?.content || '');

    const handleSave = () => {
        if (name.trim() && content.trim()) {
            onSave({ ...template, name, content });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-card w-full max-w-lg p-6 rounded-2xl animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{template ? 'Edit Template' : 'New Template'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Template Name" className="w-full bg-bg-primary p-2 rounded-md focus:ring-amber focus:border-accent" />
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Template Content (you can use HTML)" rows={8} className="w-full bg-bg-primary p-2 rounded-md resize-none focus:ring-amber focus:border-accent" />
                </div>
                <button onClick={handleSave} disabled={!name.trim() || !content.trim()} className="w-full mt-4 py-3 bg-accent text-cafe rounded-full font-semibold disabled:opacity-50">Save Template</button>
            </div>
        </div>
    );
};


const TemplateManagerScreen: React.FC<TemplateManagerScreenProps> = ({ templates, onSave, onDelete, onAdd, onBack }) => {
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null | 'new'>(null);

  const handleSaveTemplate = (template: Omit<CustomTemplate, 'id'> | CustomTemplate) => {
    if ('id' in template && template.id) {
        onSave(template as CustomTemplate);
    } else {
        onAdd(template);
    }
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
      {editingTemplate && <TemplateEditorModal template={editingTemplate === 'new' ? undefined : editingTemplate} onClose={() => setEditingTemplate(null)} onSave={handleSaveTemplate} />}
      <header className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif mx-auto">My Templates</h2>
        <button onClick={() => setEditingTemplate('new')} className="p-2 rounded-full hover:bg-white/10">
          <PlusIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-grow overflow-y-auto space-y-3 pb-4">
        {templates.length === 0 ? (
          <div className="text-center text-dun py-20">
            <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
            <h3 className="font-semibold text-lg text-isabelline">No Custom Templates</h3>
            <p>Create your own templates for frequent journal types.</p>
          </div>
        ) : (
          templates.map(template => (
            <div key={template.id} className="bg-card p-4 rounded-2xl group">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-isabelline">{template.name}</h3>
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setEditingTemplate(template)} className="text-xs font-semibold text-accent hover:text-accent/80">Edit</button>
                         <button onClick={() => onDelete(template.id)} className="text-dun hover:text-red-400">
                             <TrashIcon className="w-4 h-4"/>
                         </button>
                    </div>
                </div>
                <p className="text-xs text-dun mt-1 truncate">{template.content.replace(/<[^>]+>/g, '')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TemplateManagerScreen;
