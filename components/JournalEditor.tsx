
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JournalEntry, JournalTopic, FileData, CustomTemplate, JournalType } from '../types';
import { ArrowLeftIcon, SparklesIcon, BoldIcon, ItalicIcon, Heading1Icon, ListIcon, CodeIcon, ScanIcon, PaperclipIcon, MicIcon, StopIcon, XIcon, MoodIcon, TagIcon, ClockIcon, BookIcon, UserIcon, TypeIcon, LinkIcon, PaletteIcon, WandIcon, EyeIcon, EyeOffIcon, CheckIcon, UndoIcon, RedoIcon, ChevronUpIcon, CameraIcon, SunIcon, MoonIcon, ListOrderedIcon, StrikethroughIcon, UnderlineIcon, QuoteIcon, ChevronDownIcon, MoveIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon } from './Icons';

import { generateJournalContentFromTitle, suggestTitles, scanImageToText, beautifyJournalContent, identifyComponent } from '../services/geminiService';
import { cloudinaryService } from '../services/cloudinaryService';
import { compressImage } from '../utils/imageUtils';
import { patterns } from '../data/patterns';
import { motion } from 'motion/react';
import { 
    Toolbar, 
    ToolbarButton, 
    ToolbarGroup, 
    ToolbarSeparator 
} from './ui/toolbar';
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cn } from '../lib/utils';

interface JournalEditorProps {
  journal: Partial<JournalEntry>;
  onSave: (journal: Partial<JournalEntry>, shouldNavigate?: boolean) => void;
  onCancel: () => void;
  templates: CustomTemplate[];
  journals: JournalEntry[];
}

const builtInTemplates = [
    { name: 'Empty', content: ''},
    { name: '5-Minute Journal', content: '<h3>I am grateful for...</h3><p>1. </p><p>2. </p><p>3. </p><h3>What would make today great?</h3><p>1. </p><p>2. </p><p>3. </p>' },
    { name: 'Debug My Life', content: '<h3>Issue Description</h3><p>What is currently not working?</p><h3>Root Cause</h3><p>Why is this happening?</p><h3>Fix</h3><p>Steps to resolve.</p>'},
];

const MORNING_TEMPLATE = `<h3>☀️ Morning Intentions</h3><p><strong>3 Things I am grateful for:</strong></p><ul><li></li><li></li><li></li></ul><p><strong>What would make today great?</strong></p><ul><li></li></ul><p><strong>Daily Affirmation:</strong></p><p>I am...</p>`;
const EVENING_TEMPLATE = `<h3>🌙 Evening Reflection</h3><p><strong>3 Amazing things that happened today:</strong></p><ul><li></li><li></li><li></li></ul><p><strong>How could I have made today even better?</strong></p><p></p><p><strong>Thought for tomorrow:</strong></p><p></p>`;

const FONT_FAMILIES = {
    'Handwriting': ['Dancing Script', 'Caveat', 'Pacifico', 'Satisfy', 'Gloria Hallelujah', 'Indie Flower', 'Patrick Hand', 'Reenie Beanie', 'Rock Salt', 'Homemade Apple'],
    'Calligraphy': ['Great Vibes', 'Allura', 'Alex Brush', 'Parisienne', 'Sacramento', 'Tangerine', 'Cookie'],
    'Display': ['Abril Fatface', 'Bebas Neue', 'Lobster', 'Righteous', 'Cinzel Decorative', 'Bangers', 'Press Start 2P', 'Monoton'],
    'Serif': ['Playfair Display', 'Merriweather', 'Lora', 'Bitter', 'Libre Baskerville', 'Crimson Text', 'Zilla Slab'],
    'Sans-Serif': ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Quicksand'],
    'Monospace': ['Fira Code', 'JetBrains Mono', 'Inconsolata', 'Source Code Pro', 'Courier Prime']
};

const EditorToolbar: React.FC<{ 
    onFormat: (cmd: string, val?: any) => void, 
    onFileClick: () => void, 
    onScanTextClick: () => void, 
    onMicClick: () => void, 
    isRecording: boolean, 
    onTemplateSelect: (content: string) => void, 
    activeFormats: Record<string, boolean | string>, 
    onAddLink: () => void,
    onBeautify: () => void,
    isBeautifying: boolean,
    onToggleFocusMode: () => void,
    onOpenPatternSelector: () => void,
    onUndo: () => void,
    onRedo: () => void,
    onSetFont: (font: string) => void,
    onSetFontSize: (size: string) => void,
    onSetColor: (color: string) => void,
    onSetBgColor: (color: string) => void
}> = ({ onFormat, onFileClick, onScanTextClick, onMicClick, isRecording, onTemplateSelect, activeFormats, onAddLink, onBeautify, isBeautifying, onToggleFocusMode, onOpenPatternSelector, onUndo, onRedo, onSetFont, onSetFontSize, onSetColor, onSetBgColor }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fontSizeLevel, setFontSizeLevel] = useState(3);
    
    const activeClass = "bg-accent text-cafe shadow-md !opacity-100";
    
    // Prevent focus loss when clicking buttons
    const preventFocusLoss = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const level = parseInt(e.target.value);
        setFontSizeLevel(level);
        onSetFontSize(level.toString());
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-fit px-4">
            {isExpanded && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex flex-col gap-2 p-3 bg-card/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full sm:w-[500px]"
                 >
                    {/* Row 1: Font & Size */}
                    <div className="flex gap-2 items-center">
                        <select 
                            onChange={(e) => onSetFont(e.target.value)} 
                            className="bg-card/50 text-xs rounded-xl p-2 flex-grow text-isabelline outline-none border border-border-subtle focus:border-accent h-9"
                        >
                            <option value="">Default Font</option>
                            {Object.entries(FONT_FAMILIES).map(([category, fonts]) => (
                                <optgroup key={category} label={category}>
                                    {fonts.map(font => (
                                        <option key={font} value={font} style={{fontFamily: font}}>{font}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 bg-card/50 rounded-xl px-3 border border-border-subtle h-9">
                            <span className="text-[10px] text-dun uppercase font-bold">Size</span>
                            <input 
                                type="range" min="1" max="7" step="1" 
                                value={fontSizeLevel} 
                                onChange={handleFontSizeChange}
                                className="w-20 accent-amber"
                            />
                            <span className="text-xs w-3 text-center">{fontSizeLevel}</span>
                        </div>
                    </div>

                    {/* Row 2: Secondary Tools */}
                    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar py-1">
                        <button onClick={onOpenPatternSelector} className="flex-shrink-0 h-9 px-3 rounded-xl bg-card/50 border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-dun flex items-center gap-2 hover:bg-accent/10 transition-colors"><PaletteIcon className="w-3.5 h-3.5"/> Cover</button>
                        <button onClick={onScanTextClick} className="flex-shrink-0 h-9 px-3 rounded-xl bg-card/50 border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-dun flex items-center gap-2 hover:bg-accent/10 transition-colors"><ScanIcon className="w-3.5 h-3.5"/> Scan</button>
                        <button onClick={onFileClick} className="flex-shrink-0 h-9 px-3 rounded-xl bg-card/50 border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-dun flex items-center gap-2 hover:bg-accent/10 transition-colors"><PaperclipIcon className="w-3.5 h-3.5"/> File</button>
                        <select onChange={(e) => onTemplateSelect(e.target.value)} className="flex-shrink-0 h-9 px-3 rounded-xl bg-card/50 border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-dun outline-none transition-colors">
                            <option value="">Template</option>
                            {builtInTemplates.map(t => <option key={t.name} value={t.content} className="text-black">{t.name}</option>)}
                        </select>
                    </div>
                 </motion.div>
            )}

            <Toolbar className="!flex-nowrap overflow-x-auto no-scrollbar max-w-[95vw] sm:max-w-fit shadow-2xl border-white/10 p-1">
                <ToolbarGroup className="flex-shrink-0">
                    <ToolbarButton 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => onFormat('bold')} 
                        className={cn(activeFormats['bold'] && activeClass)}
                        title="Bold"
                    >
                        <BoldIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => onFormat('italic')} 
                        className={cn(activeFormats['italic'] && activeClass)}
                        title="Italic"
                    >
                        <ItalicIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => onFormat('underline')} 
                        className={cn(activeFormats['underline'] && activeClass)}
                        title="Underline"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </ToolbarButton>
                </ToolbarGroup>
                
                <ToolbarSeparator orientation="vertical" />
                
                <ToolbarGroup className="flex-shrink-0">
                    <ToolbarButton 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => onFormat('justifyLeft')} 
                        className={cn(activeFormats['justifyLeft'] && activeClass)}
                    >
                        <AlignLeftIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => onFormat('justifyCenter')} 
                        className={cn(activeFormats['justifyCenter'] && activeClass)}
                    >
                        <AlignCenterIcon className="w-4 h-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                <ToolbarSeparator orientation="vertical" />
                
                <ToolbarGroup className="flex-shrink-0">
                    <ToolbarButton 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => onFormat('insertUnorderedList')} 
                        className={cn(activeFormats['ul'] && activeClass)}
                        title="Bullet List"
                    >
                        <ListIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => onFormat('formatBlock', 'BLOCKQUOTE')} 
                        className={cn(activeFormats['blockquote'] && activeClass)}
                        title="Blockquote"
                    >
                        <QuoteIcon className="w-4 h-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                <ToolbarSeparator orientation="vertical" />

                <ToolbarGroup className="flex-shrink-0">
                    <ToolbarButton onClick={onMicClick} className={cn(isRecording && "bg-red-500 text-white animate-pulse")} title="Dictation">
                        {isRecording ? <StopIcon className="w-4 h-4"/> : <MicIcon className="w-4 h-4"/>}
                    </ToolbarButton>
                    <ToolbarButton onClick={onBeautify} disabled={isBeautifying} className={cn(isBeautifying && "bg-purple-500 text-white animate-pulse")} title="AI Beautify">
                        <WandIcon className="w-4 h-4"/>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => setIsExpanded(!isExpanded)} className={cn("transition-all", isExpanded ? "bg-accent text-cafe" : "text-dun")} title="More Tools">
                        <ChevronUpIcon className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </ToolbarButton>
                    <ToolbarButton onClick={onToggleFocusMode} title="Focus Mode">
                        <EyeIcon className="w-4 h-4"/>
                    </ToolbarButton>
                </ToolbarGroup>
            </Toolbar>
        </div>
    );
};

const RoutineHeader: React.FC<{ type: JournalType }> = ({ type }) => {
    if (type === 'Morning Intention') {
        return (
            <div className="mb-4 bg-gradient-to-r from-orange-400/20 to-rose-500/20 border border-orange-400/30 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
                <div className="p-2 bg-orange-400/20 rounded-full text-orange-400"><SunIcon className="w-6 h-6"/></div>
                <div>
                    <h3 className="text-sm font-bold text-orange-300 uppercase tracking-widest">Morning Routine</h3>
                    <p className="text-xs text-orange-200/70">Win the morning, win the day.</p>
                </div>
            </div>
        );
    }
    if (type === 'Evening Reflection') {
        return (
            <div className="mb-4 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
                <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-300"><MoonIcon className="w-6 h-6"/></div>
                <div>
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Evening Reflection</h3>
                    <p className="text-xs text-indigo-200/70">Close the day with gratitude.</p>
                </div>
            </div>
        );
    }
    if (type === 'Bible Study' || type === 'Sermon Notes') {
        return (
            <div className="mb-4 bg-gradient-to-r from-amber/20 to-yellow-600/20 border border-accent/30 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
                <div className="p-2 bg-accent/20 rounded-full text-accent"><BookIcon className="w-6 h-6"/></div>
                <div>
                    <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Spiritual Growth</h3>
                    <p className="text-xs text-accent/70">{type === 'Bible Study' ? 'Deepen your understanding.' : 'Capture the message.'}</p>
                </div>
            </div>
        );
    }
    if (type === 'Engineering Log') {
        return (
            <div className="mb-4 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
                <div className="p-2 bg-blue-500/20 rounded-full text-blue-400"><CodeIcon className="w-6 h-6"/></div>
                <div>
                    <h3 className="text-sm font-bold text-blue-300 uppercase tracking-widest">Engineering Log</h3>
                    <p className="text-xs text-blue-200/70">Document the logic and the journey.</p>
                </div>
            </div>
        );
    }
    return null;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ journal, onSave, onCancel, templates, journals }) => {
  const [title, setTitle] = useState(journal.title || '');
  const [content, setContent] = useState(journal.content || '');
  const [tags, setTags] = useState<string[]>(journal.tags || []);
  const [mood, setMood] = useState(journal.mood);
  const [patternIndex, setPatternIndex] = useState(journal.patternIndex ?? 0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [suggestedTitlesList, setSuggestedTitlesList] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState(journal.id || '');
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showPatternPicker, setShowPatternPicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [files, setFiles] = useState<FileData[]>(journal.files || []);
  const [isRecording, setIsRecording] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean | string>>({});
  const [globalFont, setGlobalFont] = useState(journal.tags?.find(t => t.startsWith('font:'))?.replace('font:', '') || '');
  
  // Selection State Tracking
  const lastSelection = useRef<Range | null>(null);
  
  // Biometric mood state
  const [isDetectingMood, setIsDetectingMood] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (!currentId) setCurrentId(new Date().getTime().toString() + Math.random().toString(36).substr(2, 9));
  }, []);

  const updateWordCount = (html: string) => {
      const text = html.replace(/<[^>]+>/g, ' ').trim();
      const count = text ? text.split(/\s+/).filter(Boolean).length : 0;
      setWordCount(count);
  };

  const saveSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
          lastSelection.current = sel.getRangeAt(0);
      }
  };

  const restoreSelection = () => {
      if (lastSelection.current) {
          const sel = window.getSelection();
          if (sel) {
              sel.removeAllRanges();
              sel.addRange(lastSelection.current);
          }
      }
  };

  useEffect(() => {
      const timer = setTimeout(() => {
          const currentText = editorRef.current?.innerText.trim() || '';
          const hasContent = currentText.length > 2 || title.trim().length > 0 || files.length > 0;
          if (currentId && hasContent) {
              const entryToSave: Partial<JournalEntry> = {
                  id: currentId,
                  title: title || 'Untitled Draft',
                  content: editorRef.current?.innerHTML || '',
                  mood,
                  tags,
                  patternIndex,
                  files,
                  type: journal.type,
                  topic: journal.topic,
                  date: journal.date || new Date().toISOString()
              };
              onSave(entryToSave, false);
              setShowSaveIndicator(true);
              setTimeout(() => setShowSaveIndicator(false), 2000);
          }
      }, 3000); 
      return () => clearTimeout(timer);
  }, [title, content, mood, tags, patternIndex, files, currentId]);

  const [showDraftSavedIndicator, setShowDraftSavedIndicator] = useState(false);

  const updateActiveFormats = useCallback(() => {
    const newActiveFormats: Record<string, boolean | string> = {};
    ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].forEach(cmd => {
        newActiveFormats[cmd === 'insertUnorderedList' ? 'ul' : cmd === 'insertOrderedList' ? 'ol' : cmd] = document.queryCommandState(cmd);
    });
    // Check block format
    const block = document.queryCommandValue('formatBlock');
    if (block) newActiveFormats[block.toLowerCase()] = true;
    
    setActiveFormats(newActiveFormats);
  }, []);
  
  useEffect(() => {
    let initialContent = journal.content || '';
    if (!initialContent.trim()) {
        if (journal.type === 'Morning Intention') initialContent = MORNING_TEMPLATE;
        else if (journal.type === 'Evening Reflection') initialContent = EVENING_TEMPLATE;
    }
    setContent(initialContent);
    updateWordCount(initialContent);
    if (editorRef.current) editorRef.current.innerHTML = initialContent;
  }, []);

  const handleSave = () => {
    const currentHtml = editorRef.current?.innerHTML || content;
    const currentText = editorRef.current?.innerText || content.replace(/<[^>]+>/g, '');
    const finalTitle = title.trim() || (currentText.trim().length > 0 ? currentText.trim().split(/\s+/).slice(0, 5).join(' ') + '...' : 'Untitled Entry');
    
    onSave({ 
        id: currentId,
        title: finalTitle, 
        content: currentHtml, 
        mood, 
        tags, 
        patternIndex,
        files,
        isDraft: false,  // Published
    }, true);
  };

  const handleSaveDraft = () => {
    const currentHtml = editorRef.current?.innerHTML || content;
    const finalTitle = title.trim() || 'Untitled Draft';
    onSave({
        id: currentId,
        title: finalTitle,
        content: currentHtml,
        mood,
        tags,
        patternIndex,
        files,
        type: journal.type,
        topic: journal.topic,
        date: journal.date || new Date().toISOString(),
        isDraft: true,  // Draft
    }, false);  // false = don't navigate away
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2500);
  };
  
  const handleFormat = (command: string, value?: string) => {
      // 1. Restore selection first, as clicking a button or color input might have blurred the editor
      restoreSelection();
      
      // 2. Ensure the editor has focus
      editorRef.current?.focus();
      
      // 3. Enable styleWithCSS to ensure colors apply as inline styles, not deprecated tags
      document.execCommand('styleWithCSS', false, 'true');

      // 4. Special case: blockquote toggle
      if (command === 'formatBlock' && value === 'BLOCKQUOTE') {
          const currentBlock = document.queryCommandValue('formatBlock').toLowerCase();
          if (currentBlock === 'blockquote') {
              // Already in blockquote → toggle off to paragraph
              document.execCommand('formatBlock', false, 'P');
          } else {
              document.execCommand('formatBlock', false, 'BLOCKQUOTE');
          }
      } else {
          // 5. Execute all other commands normally
          document.execCommand(command, false, value);
      }
      
      // 6. Save the new selection state
      saveSelection();
      updateActiveFormats();
  };

  const handleAddLink = () => {
      const url = prompt("Enter the URL:");
      if (url) {
          handleFormat('createLink', url);
      }
  };

  const handleSetFont = (font: string) => {
      if (!font) return;
      setGlobalFont(font);
      setTags(prev => [...prev.filter(t => !t.startsWith('font:')), `font:${font}`]);
      handleFormat('fontName', font);
  };
  
  const handleUndo = () => { document.execCommand('undo'); if(editorRef.current) updateWordCount(editorRef.current.innerHTML); };
  const handleRedo = () => { document.execCommand('redo'); if(editorRef.current) updateWordCount(editorRef.current.innerHTML); };

  const handleBeautify = async () => {
      const currentContent = editorRef.current?.innerText || content.replace(/<[^>]+>/g, '');
      if (!currentContent.trim()) return;
      setIsBeautifying(true);
      try {
          const result = await beautifyJournalContent(currentContent);
          setContent(result);
          if (editorRef.current) editorRef.current.innerHTML = result;
      } catch (e) {
          console.error(e);
      } finally {
          setIsBeautifying(false);
      }
  };

  const handleSuggestTitle = async () => {
      const currentContent = editorRef.current?.innerText || content.replace(/<[^>]+>/g, '');
      if (!currentContent.trim()) return;
      setIsGenerating(true);
      try {
          const suggestions = await suggestTitles(currentContent);
          if (suggestions.length > 0) {
              setSuggestedTitlesList(suggestions);
              setShowTitleSuggestions(true);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleScanTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setIsScanning(true);
          try {
              // Upload to Cloudinary for "archive"
              const remoteUrl = await cloudinaryService.uploadImage(file);
              
              const reader = new FileReader();
              reader.onload = async (ev) => {
                  if (ev.target?.result) {
                      const fileData = { name: file.name, type: file.type, data: ev.target.result as string };
                      const text = await scanImageToText(fileData);
                      const newContent = (editorRef.current?.innerHTML || content) + `<p>${text}</p>`;
                      setContent(newContent);
                      if (editorRef.current) editorRef.current.innerHTML = newContent;
                      
                      // Also add to files
                      setFiles(prev => [...prev, { name: file.name, type: file.type, url: remoteUrl }]);
                  }
              };
              reader.readAsDataURL(file);
          } catch (e) {
              console.error(e);
          } finally {
              setIsScanning(false);
          }
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setIsUploading(true);
          const newFiles: FileData[] = [];
          for (let i = 0; i < e.target.files.length; i++) {
              const file = e.target.files[i];
              try {
                  const url = await cloudinaryService.uploadImage(file);
                  newFiles.push({
                      name: file.name,
                      type: file.type,
                      url: url
                  });
              } catch (err) {
                  console.error("Upload failed for", file.name, err);
              }
          }
          setFiles(prev => [...prev, ...newFiles]);
          setIsUploading(false);
      }
  };

  // Biometric Mood Detection Logic (Simplified for web)
  const handleDetectMood = async () => {
      setIsDetectingMood(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              await new Promise(resolve => videoRef.current!.onloadedmetadata = resolve);
              await new Promise(r => setTimeout(r, 1000));
              const canvas = document.createElement('canvas');
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
              const imageData = canvas.toDataURL('image/jpeg');
              stream.getTracks().forEach(t => t.stop());
              
              const result = await identifyComponent(imageData);
              const text = result.description.toLowerCase();
              if (text.includes('happy') || text.includes('smile')) setMood(5);
              else if (text.includes('sad') || text.includes('frown')) setMood(1);
              else if (text.includes('angry')) setMood(1);
              else if (text.includes('surprise')) setMood(4);
              else setMood(3);
          }
      } catch (e) {
          console.error("Mood detection failed", e);
          alert("Camera access required for mood detection.");
      } finally {
          setIsDetectingMood(false);
      }
  };
  

  return (
    <div className={`flex flex-col h-full animate-slide-in-from-bottom relative overflow-hidden transition-colors duration-500 ${isFocusMode ? 'bg-black' : 'bg-bg-primary'}`}>
      
      <video ref={videoRef} autoPlay playsInline className="hidden" />

      {showPatternPicker && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in" onClick={() => setShowPatternPicker(false)}>
              <div className="bg-card w-full max-w-2xl rounded-3xl p-6 border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-serif text-isabelline">Choose Cover Art</h3>
                      <button onClick={() => setShowPatternPicker(false)} className="p-2 hover:bg-white/10 rounded-full"><XIcon className="w-5 h-5"/></button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                      {patterns.map((pattern, idx) => (
                          <button key={idx} onClick={() => { setPatternIndex(idx); setShowPatternPicker(false); }} className={`aspect-square rounded-xl ${pattern} hover:scale-105 transition-transform shadow-lg ring-2 ${patternIndex === idx ? 'ring-white' : 'ring-transparent'}`} />
                      ))}
                  </div>
              </div>
          </div>
      )}

      {showTitleSuggestions && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowTitleSuggestions(false)}>
              <div className="bg-card w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-serif text-isabelline mb-4">Suggested Titles</h3>
                  <div className="space-y-2">
                      {suggestedTitlesList.map((t, i) => (
                          <button key={i} onClick={() => { setTitle(t); setShowTitleSuggestions(false); }} className="w-full text-left p-3 rounded-xl bg-jet hover:bg-white/10 text-isabelline transition-colors">
                              {t}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {isFocusMode && (
          <button onClick={() => setIsFocusMode(false)} className="fixed top-4 right-4 z-50 p-2 bg-black/50 hover:bg-accent text-white rounded-full transition-colors shadow-lg animate-fade-in">
              <EyeOffIcon className="w-5 h-5" />
          </button>
      )}

      {!isFocusMode && (
          <EditorToolbar 
                onFormat={handleFormat} 
                onAddLink={handleAddLink} 
                onFileClick={() => fileInputRef.current?.click()} 
                onScanTextClick={() => scanInputRef.current?.click()} 

                onMicClick={() => {
                    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                    if (!SpeechRecognition) {
                        alert("Voice recognition is not supported in this browser.");
                        return;
                    }

                    if (isRecording) {
                        (window as any)._recognition?.stop();
                        setIsRecording(false);
                        return;
                    }

                    const recognition = new SpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = false;
                    recognition.lang = 'en-US';

                    recognition.onstart = () => setIsRecording(true);
                    recognition.onend = () => setIsRecording(false);
                    recognition.onresult = (event: any) => {
                        const result = event.results[event.results.length - 1][0].transcript;
                        if (editorRef.current) {
                            editorRef.current.innerHTML += ` ${result}`;
                            setContent(editorRef.current.innerHTML);
                            updateWordCount(editorRef.current.innerHTML);
                        }
                    };

                    recognition.start();
                    (window as any)._recognition = recognition;
                }} 
                isRecording={isRecording} 
                onTemplateSelect={(c) => {setContent(c); updateWordCount(c); if(editorRef.current) editorRef.current.innerHTML=c;}} 
                activeFormats={activeFormats} 
                onBeautify={handleBeautify} 
                isBeautifying={isBeautifying} 
                onToggleFocusMode={() => setIsFocusMode(true)} 
                onOpenPatternSelector={() => setShowPatternPicker(true)}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onSetFont={handleSetFont}
                onSetFontSize={(size) => handleFormat('fontSize', size)}
                onSetColor={(color) => handleFormat('foreColor', color)}
                onSetBgColor={(color) => handleFormat('hiliteColor', color)}
            />
      )}

      <div className={`flex flex-col h-full overflow-hidden transition-all duration-500 ${isFocusMode ? 'bg-black' : 'bg-bg-primary'}`}>
        <div className={`p-4 flex flex-col h-full overflow-hidden transition-all duration-500 ${isFocusMode ? 'pt-4' : 'pt-16'}`}>
        {!isFocusMode && (
            <header className="flex flex-wrap justify-between items-center mb-4 z-10 gap-2">
            <div className="flex items-center gap-1 order-1">
                <button title="Cancel" onClick={onCancel} className="p-2 rounded-full hover:bg-white/10"><ArrowLeftIcon className="w-6 h-6" /></button>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5 ml-2">
                    <button onClick={handleUndo} className="p-1.5 text-dun hover:text-white transition-colors" title="Undo"><UndoIcon className="w-4 h-4"/></button>
                    <button onClick={handleRedo} className="p-1.5 text-dun hover:text-white transition-colors" title="Redo"><RedoIcon className="w-4 h-4"/></button>
                </div>
            </div>
            
            <div className="flex items-center gap-2 order-3 sm:order-2 w-full sm:w-auto justify-center">
                <button 
                    onClick={handleDetectMood} 
                    disabled={isDetectingMood}
                    className={`p-1.5 rounded-full border transition-all ${isDetectingMood ? 'border-accent text-accent animate-pulse' : 'border-white/10 text-dun hover:text-white'}`}
                    title="Detect Mood with Camera"
                >
                    <CameraIcon className="w-4 h-4"/>
                </button>
                <div className="flex gap-2">
                    {[1,2,3,4,5].map(v => <button key={v} onClick={() => setMood(v)} className="p-1"><MoodIcon mood={v} className={`w-7 h-7 ${mood === v ? 'text-accent' : 'text-dun'}`} /></button>)}
                </div>
            </div>

            <div className="flex items-center gap-3 order-2 sm:order-3 ml-auto sm:ml-0">
                <div className={`text-xs font-bold text-green-400 transition-opacity duration-500 flex items-center gap-1 ${showSaveIndicator ? 'opacity-100' : 'opacity-0'}`}>
                    <CheckIcon className="w-4 h-4" /> Saved
                </div>
                <button onClick={handleSaveDraft} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full border border-dun/30 text-dun hover:border-accent hover:text-accent transition-all">Draft</button>
                <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold rounded-full bg-accent text-cafe">Save</button>
            </div>
            </header>
        )}

        <div className="flex-grow flex flex-col gap-4 overflow-y-auto pb-32 no-scrollbar">
          
          {journal.type && <RoutineHeader type={journal.type} />}

          {!isFocusMode && (
              <div className={`w-full h-32 rounded-2xl shrink-0 ${patterns[patternIndex]} transition-all duration-500 shadow-inner flex items-end p-4 cursor-pointer group relative`} onClick={() => setShowPatternPicker(true)}>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full">Change Cover</span>
                  </div>
                  <h1 className="text-3xl font-serif text-white drop-shadow-md line-clamp-1">{title || "Untitled"}</h1>
              </div>
          )}

          {/* Files / Attachments Preview */}
          {files.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                  {files.map((f, i) => (
                      <div key={i} className="relative group shrink-0">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-jet">
                              {f.type.startsWith('image') ? (
                                  <img src={f.url || f.data} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-dun uppercase font-bold p-2 text-center">{f.name.split('.').pop()}</div>
                              )}
                          </div>
                          <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><XIcon className="w-3 h-3"/></button>
                      </div>
                  ))}
                  {isUploading && (
                      <div className="w-20 h-20 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 animate-pulse">
                          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[8px] text-dun uppercase font-bold">Uploading</span>
                      </div>
                  )}
              </div>
          )}

          <div className="relative shrink-0 mt-2">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." className={`w-full bg-transparent text-2xl font-serif p-2 pr-10 focus:outline-none border-b border-transparent focus:border-accent/30 transition-colors ${isFocusMode ? 'text-white placeholder-white/30' : 'placeholder-dun/50'}`} />
              {!isFocusMode && <button onClick={handleSuggestTitle} disabled={isGenerating} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:bg-white/10 rounded-full" title="Suggest Titles"><WandIcon className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`}/></button>}
          </div>
          
          <div className="flex-grow flex flex-col relative min-h-[60vh]">
              {/* Theme-aware styles for the editor content */}
              <style>{`
                .editor-content ul { list-style-type: disc; padding-left: 1.5em; margin: 1em 0; }
                .editor-content ol { list-style-type: decimal; padding-left: 1.5em; margin: 1em 0; }
                .editor-content blockquote {
                  border-left: 4px solid var(--color-accent);
                  padding: 0.75em 1em;
                  background-color: color-mix(in srgb, var(--color-accent) 8%, transparent);
                  border-radius: 0 8px 8px 0;
                  color: var(--color-text-secondary);
                  font-style: italic;
                  margin: 1em 0;
                }
                .editor-content a { color: var(--color-accent); text-decoration: underline; }
                .editor-content h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; color: var(--color-text-primary); }
                .editor-content h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; color: var(--color-text-primary); }
                .editor-content h3 { font-size: 1.2em; font-weight: bold; margin: 0.67em 0; padding: 4px 12px; background: color-mix(in srgb, var(--color-accent) 15%, transparent); border-radius: 6px; color: var(--color-text-primary); display: inline-block; }
                .editor-content strong { font-weight: 700; color: var(--color-text-primary); }
                .editor-content em { font-style: italic; }
                .focus-editor { color: #f1f5f9 !important; }
                .focus-editor * { color: #f1f5f9 !important; }
                .focus-editor blockquote { color: #94a3b8 !important; background: rgba(255,255,255,0.05) !important; }
              `}</style>
              <div 
                ref={editorRef} 
                onInput={e => {
                    const html = (e.currentTarget as HTMLDivElement).innerHTML;
                    setContent(html);
                    updateWordCount(html);
                    updateActiveFormats();
                    saveSelection();
                }} 
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onBlur={saveSelection}
                onTouchEnd={saveSelection}
                onClick={() => { updateActiveFormats(); saveSelection(); }}
                contentEditable 
                style={{ fontFamily: globalFont || 'inherit' }}
                className={`flex-grow w-full p-4 pb-32 rounded-xl resize-none focus:outline-none editor-content shadow-inner transition-colors overflow-visible min-h-full bg-transparent text-lg leading-relaxed ${isFocusMode ? 'focus-editor' : 'text-isabelline/90'}`} 
              />
          </div>
          
          <div className="absolute bottom-24 right-4 text-xs text-dun/50 pointer-events-none">
              {wordCount} words
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
          <input type="file" ref={scanInputRef} onChange={handleScanTextChange} accept="image/*" className="hidden" />
        </div>
      </div>
    </div>
    </div>
  );
};

export default JournalEditor;
