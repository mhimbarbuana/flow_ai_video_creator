import React from 'react';
import { LayoutGrid, Film, Image as ImageIcon, Settings, Scissors, MessageSquare, Mic, History } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
    const navItems = [
        { id: 'projects', icon: LayoutGrid, label: 'Projects' },
        { id: 'editor', icon: Film, label: 'Editor' },
        { id: 'tools', icon: Scissors, label: 'AI Tools' },
        { id: 'chat', icon: MessageSquare, label: 'Assistant' },
        { id: 'audio', icon: Mic, label: 'Audio Studio' },
        { id: 'assets', icon: ImageIcon, label: 'Assets' },
        { id: 'history', icon: History, label: 'History' },
    ];

    return (
        <aside className="w-16 md:w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between flex-shrink-0 z-20">
            <div>
                <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-zinc-800">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        F
                    </div>
                    <span className="ml-3 font-bold text-xl tracking-tight hidden md:block">Flow</span>
                </div>

                <nav className="mt-6 px-2 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-2 py-3 rounded-xl transition-all duration-200 group ${
                                activeTab === item.id 
                                ? 'bg-zinc-800 text-white shadow-lg shadow-violet-500/10' 
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                            }`}
                        >
                            <item.icon size={20} className={`${activeTab === item.id ? 'text-violet-400' : 'group-hover:text-violet-400 transition-colors'}`} />
                            <span className="ml-3 font-medium hidden md:block">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="px-2 pb-6 space-y-2">
                 <button 
                    onClick={onOpenSettings}
                    className="w-full flex items-center px-2 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-all"
                 >
                    <Settings size={20} />
                    <span className="ml-3 font-medium hidden md:block">Settings</span>
                </button>
                <div className="mx-2 pt-4 border-t border-zinc-800">
                     <div className="flex items-center px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">
                            AI
                        </div>
                         <div className="ml-3 hidden md:block">
                             <p className="text-sm font-medium text-white">Pro Plan</p>
                             <p className="text-xs text-zinc-500">850 Credits</p>
                         </div>
                     </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;