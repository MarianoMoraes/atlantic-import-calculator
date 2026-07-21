import { useEffect, useMemo, useState } from 'react';
import { ExpensesTable } from './components/ExpensesTable';
import { GeneralParameters } from './components/GeneralParameters';
import { Header } from './components/Header';
import { ScenarioTabs } from './components/ScenarioTabs';
import { SummaryPanel } from './components/SummaryPanel';
import { TaxPosition } from './components/TaxPosition';
import {
  createBlankScenario,
  createInitialState,
} from './data/initialScenario';
import { calculateScenario } from './lib/calculations';
import { fileSafeName } from './lib/format';
import { createId } from './lib/id';
import { loadState, normalizeScenario, saveState } from './lib/storage';
import type { AppState, Expense, Scenario } from './types';

function createEmptyExpense(referenceExchangeRate: number): Expense {
  return {
    id: createId('expense'),
    included: true,
    date: new Date().toISOString().slice(0, 10),
    name: 'NUEVO GASTO',
    classification: 'DOCUMENTED',
    currency: 'ARS',
    netAmount: 0,
    vatAmount: 0,
    vatPerceptionAmount: 0,
    grossIncomeAmount: 0,
    incomeTaxAmount: 0,
    exchangeRate: referenceExchangeRate,
    includeInFiscalNet: true,
    notes: '',
  };
}

function downloadJson(scenario: Scenario): void {
  const blob = new Blob([JSON.stringify(scenario, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileSafeName(scenario.name) || 'simulacion'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [state, setState] = useState<AppState>(() =>
    loadState(createInitialState()),
  );

  const activeScenario =
    state.scenarios.find((scenario) => scenario.id === state.activeScenarioId) ??
    state.scenarios[0]!;

  const result = useMemo(
    () => calculateScenario(activeScenario),
    [activeScenario],
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateActiveScenario = (
    updater: (scenario: Scenario) => Scenario,
  ): void => {
    setState((current) => ({
      ...current,
      scenarios: current.scenarios.map((scenario) =>
        scenario.id === current.activeScenarioId ? updater(scenario) : scenario,
      ),
    }));
  };

  const patchScenario = (patch: Partial<Scenario>): void => {
    updateActiveScenario((scenario) => ({ ...scenario, ...patch }));
  };

  const newScenario = (): void => {
    const sequence = state.scenarios.length + 1;
    const scenario = createBlankScenario(`Escenario ${sequence}`);
    setState((current) => ({
      scenarios: [...current.scenarios, scenario],
      activeScenarioId: scenario.id,
    }));
  };

  const duplicateScenario = (): void => {
    const clone: Scenario = {
      ...activeScenario,
      id: createId('scenario'),
      name: `${activeScenario.name} — copia`,
      expenses: activeScenario.expenses.map((expense) => ({
        ...expense,
        id: createId('expense'),
      })),
    };
    setState((current) => ({
      scenarios: [...current.scenarios, clone],
      activeScenarioId: clone.id,
    }));
  };

  const importScenario = async (file: File): Promise<void> => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const normalized = normalizeScenario(parsed);
      if (!normalized) throw new Error('Formato inválido');
      const imported = {
        ...normalized,
        id: createId('scenario'),
        name: `${normalized.name} — importado`,
        expenses: normalized.expenses.map((expense) => ({
          ...expense,
          id: createId('expense'),
        })),
      };
      setState((current) => ({
        scenarios: [...current.scenarios, imported],
        activeScenarioId: imported.id,
      }));
    } catch {
      window.alert(
        'No se pudo importar el archivo. Verificá que sea un JSON exportado por esta aplicación.',
      );
    }
  };

  const updateExpense = (id: string, patch: Partial<Expense>): void => {
    updateActiveScenario((scenario) => ({
      ...scenario,
      expenses: scenario.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...patch } : expense,
      ),
    }));
  };

  const addExpense = (): void => {
    updateActiveScenario((scenario) => ({
      ...scenario,
      expenses: [
        ...scenario.expenses,
        createEmptyExpense(scenario.referenceExchangeRate),
      ],
    }));
  };

  const duplicateExpense = (id: string): void => {
    updateActiveScenario((scenario) => {
      const source = scenario.expenses.find((expense) => expense.id === id);
      if (!source) return scenario;
      const index = scenario.expenses.findIndex((expense) => expense.id === id);
      const expenses = [...scenario.expenses];
      expenses.splice(index + 1, 0, {
        ...source,
        id: createId('expense'),
        name: `${source.name} — copia`,
      });
      return { ...scenario, expenses };
    });
  };

  const deleteExpense = (id: string): void => {
    const expense = activeScenario.expenses.find((item) => item.id === id);
    if (!expense) return;
    if (!window.confirm(`¿Eliminar el gasto “${expense.name}”?`)) return;
    updateActiveScenario((scenario) => ({
      ...scenario,
      expenses: scenario.expenses.filter((item) => item.id !== id),
    }));
  };

  return (
    <>
      <Header
        scenarioName={activeScenario.name}
        onNew={newScenario}
        onDuplicate={duplicateScenario}
        onImport={(file) => void importScenario(file)}
        onExport={() => downloadJson(activeScenario)}
        onPrint={() => window.print()}
        onSettings={() =>
          document
            .getElementById('configuracion')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
      />

      <div className="workspace">
        <main className="main-column">
          <ScenarioTabs
            scenarios={state.scenarios}
            activeScenarioId={state.activeScenarioId}
            onSelect={(activeScenarioId) =>
              setState((current) => ({ ...current, activeScenarioId }))
            }
            onNew={newScenario}
          />

          <GeneralParameters
            scenario={activeScenario}
            onChange={patchScenario}
          />

          <SummaryPanel scenario={activeScenario} result={result} />

          <ExpensesTable
            expenses={activeScenario.expenses}
            referenceExchangeRate={activeScenario.referenceExchangeRate}
            onChangeExpense={updateExpense}
            onAddExpense={addExpense}
            onDuplicateExpense={duplicateExpense}
            onDeleteExpense={deleteExpense}
          />

          <TaxPosition result={result} />
        </main>
      </div>
    </>
  );
}
