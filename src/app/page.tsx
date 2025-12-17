'use client';

import { useMemo, useState } from "react";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { NavBar, type TabKey } from "@/components/NavBar";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SingleCardMode } from "@/components/SingleCardMode";
import { TableMode } from "@/components/TableMode";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("single");
  const [showModal, setShowModal] = useState(false);

  const content = useMemo(() => {
    switch (activeTab) {
      case "single":
        return <SingleCardMode />;
      case "table":
        return <TableMode />;
      case "settings":
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Settings / Decks
            </h2>
            <p className="text-sm text-slate-600">
              Configure deck count and visibility preferences. Changes apply to
              all modes.
            </p>
            <div className="mt-4">
              <SettingsPanel />
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen casino-surface text-slate-50 overflow-x-hidden">
      <NavBar
        activeTab={activeTab}
        onChange={setActiveTab}
        onOpenModal={() => setShowModal(true)}
      />

      <main className="mx-auto max-w-6xl px-2 sm:px-4 py-6 overflow-x-hidden w-full">
        <div className="overflow-x-hidden">
          {content}
        </div>
      </main>

      <HowItWorksModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
