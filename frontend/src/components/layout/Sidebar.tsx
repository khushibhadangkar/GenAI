import React from 'react';
import {
  LayoutDashboard,
  Languages,
  Image as ImageIcon,
  GitCompare,
  Volume2,
  Scale,
  FlaskConical,
  BookOpen,
  Cpu,
  Sparkles
} from 'lucide-react';

export type NavItem =
  | 'overview'
  | 'translator'
  | 'image-translator'
  | 'model-comparison'
  | 'voice-studio'
  | 'bias-analysis'
  | 'evaluation-lab'
  | 'about';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  device?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'translator', label: 'Translator', icon: Languages, badge: 'Core' },
  { id: 'image-translator', label: 'Image Translator', icon: ImageIcon, badge: 'BLIP' },
  { id: 'model-comparison', label: 'Model Comparison', icon: GitCompare, badge: null },
  { id: 'voice-studio', label: 'Voice Studio', icon: Volume2, badge: 'TTS' },
  { id: 'bias-analysis', label: 'Bias Analysis', icon: Scale, badge: 'Research' },
  { id: 'evaluation-lab', label: 'Evaluation Lab', icon: FlaskConical, badge: 'BLEU' },
  { id: 'about', label: 'About Project', icon: BookOpen, badge: 'P19' },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  device = 'auto',
  isMobileOpen = false,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-lavender-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 tracking-tight text-base">LINGUA AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-100">
                  P19
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Neural MT & LLM Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id as NavItem);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-brand-100 text-brand-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Footer Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                Compute Device
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                {device}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Backend Ready</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

