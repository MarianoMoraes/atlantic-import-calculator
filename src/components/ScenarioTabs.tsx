import type { Scenario } from '../types';

interface ScenarioTabsProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ScenarioTabs({
  scenarios,
  activeScenarioId,
  onSelect,
  onNew,
}: ScenarioTabsProps) {
  return (
    <div className="scenario-tabs" aria-label="Escenarios">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          className={scenario.id === activeScenarioId ? 'active' : ''}
          onClick={() => onSelect(scenario.id)}
        >
          {scenario.id === activeScenarioId ? '● ' : ''}
          {scenario.name}
        </button>
      ))}
      <button type="button" className="new-tab" onClick={onNew}>＋ Nuevo escenario</button>
    </div>
  );
}
