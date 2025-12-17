type TabKey = "single" | "table" | "settings";

const tabs: { key: TabKey; label: string }[] = [
  { key: "single", label: "Single Card Mode" },
  { key: "table", label: "Table Mode" },
  { key: "settings", label: "Settings / Decks" },
];

export const NavBar = ({
  activeTab,
  onChange,
  onOpenModal,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  onOpenModal: () => void;
}) => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-900/70 backdrop-blur w-full overflow-x-hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-2 sm:px-4 py-3 text-slate-50 sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="text-base sm:text-lg font-semibold text-amber-200 whitespace-nowrap flex-shrink-0">
          Blackjack Counter Trainer
        </div>
        <nav 
          className="flex flex-1 justify-center overflow-x-auto w-full max-w-full"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          } as React.CSSProperties}
        >
          <div className="flex rounded-full border border-white/10 bg-slate-800 px-1 text-xs sm:text-sm font-medium text-slate-200 shadow-inner whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange(tab.key)}
                className={`rounded-full px-2 sm:px-4 py-1.5 sm:py-2 transition ${
                  activeTab === tab.key
                    ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                    : "hover:bg-slate-700/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
        <button
          type="button"
          onClick={onOpenModal}
          className="text-xs sm:text-sm font-semibold text-indigo-300 transition hover:text-indigo-100 whitespace-nowrap flex-shrink-0"
        >
          How counting works
        </button>
      </div>
    </header>
  );
};

export type { TabKey };

