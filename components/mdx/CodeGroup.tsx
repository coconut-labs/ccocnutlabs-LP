"use client";

import { useState } from "react";

export function CodeGroup({ tabs }: { tabs: Array<{ label: string; code: string }> }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active] ?? tabs[0];

  return (
    <div className="rounded-lg border border-rule bg-bg-1">
      <div className="flex gap-1 border-b border-rule p-2">
        {tabs.map((item, index) => (
          <button
            className="rounded px-3 py-2 font-mono text-xs text-ink-1 data-[active=true]:bg-bg-2 data-[active=true]:text-ink-0"
            data-active={active === index}
            key={item.label}
            onClick={() => setActive(index)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <pre className="m-0 rounded-none">
        <code>{tab?.code}</code>
      </pre>
    </div>
  );
}
