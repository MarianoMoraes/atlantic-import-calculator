import { useMemo, useState } from 'react';
import {
  expenseGrossAmount,
  expenseGrossUsd,
  expenseNetUsd,
} from '../lib/calculations';
import { formatCurrency, formatNumber } from '../lib/format';
import type { Expense, ExpenseClassification } from '../types';
import { NumericInput } from './NumericInput';

interface ExpensesTableProps {
  expenses: Expense[];
  referenceExchangeRate: number;
  onChangeExpense: (id: string, patch: Partial<Expense>) => void;
  onAddExpense: () => void;
  onDuplicateExpense: (id: string) => void;
  onDeleteExpense: (id: string) => void;
}

type Filter = 'ALL' | ExpenseClassification;
type TableView = 'COSTS' | 'TAXES';
type NumericExpenseField =
  | 'netAmount'
  | 'vatAmount'
  | 'vatPerceptionAmount'
  | 'grossIncomeAmount'
  | 'incomeTaxAmount';

function FieldCell({
  expense,
  field,
  label,
  onChangeExpense,
}: {
  expense: Expense;
  field: NumericExpenseField;
  label: string;
  onChangeExpense: (id: string, patch: Partial<Expense>) => void;
}) {
  return (
    <td className="numeric-cell editable-cell">
      <NumericInput
        ariaLabel={`${label} de ${expense.name}`}
        value={expense[field]}
        onChange={(value) => onChangeExpense(expense.id, { [field]: value })}
      />
    </td>
  );
}

function expenseTaxes(expense: Expense): number {
  return (
    expense.vatAmount +
    expense.vatPerceptionAmount +
    expense.grossIncomeAmount +
    expense.incomeTaxAmount
  );
}

function nonZeroTaxes(expense: Expense): number {
  return [
    expense.vatAmount,
    expense.vatPerceptionAmount,
    expense.grossIncomeAmount,
    expense.incomeTaxAmount,
  ].filter((amount) => Math.abs(amount) > 0.000001).length;
}

export function ExpensesTable({
  expenses,
  referenceExchangeRate,
  onChangeExpense,
  onAddExpense,
  onDuplicateExpense,
  onDeleteExpense,
}: ExpensesTableProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [showExcluded, setShowExcluded] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<TableView>('COSTS');

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return expenses.filter((expense) => {
      if (!showExcluded && !expense.included) return false;
      if (filter !== 'ALL' && expense.classification !== filter) return false;
      return (
        !normalizedQuery ||
        expense.name.toLocaleLowerCase('es').includes(normalizedQuery)
      );
    });
  }, [expenses, filter, query, showExcluded]);

  const included = expenses.filter((expense) => expense.included);
  const documented = included.filter(
    (expense) => expense.classification === 'DOCUMENTED',
  );
  const undocumented = included.filter(
    (expense) => expense.classification === 'UNDOCUMENTED',
  );

  const documentedNetUsd = documented
    .filter((expense) => expense.includeInFiscalNet)
    .reduce(
      (total, expense) =>
        total + expenseNetUsd(expense, referenceExchangeRate),
      0,
    );
  const documentedGrossUsd = documented.reduce(
    (total, expense) =>
      total + expenseGrossUsd(expense, referenceExchangeRate),
    0,
  );
  const undocumentedUsd = undocumented.reduce(
    (total, expense) =>
      total + expenseGrossUsd(expense, referenceExchangeRate),
    0,
  );

  const taxesArs = included.reduce(
    (acc, expense) => {
      const rate =
        expense.currency === 'USD'
          ? expense.exchangeRate || referenceExchangeRate
          : 1;
      acc.vat += expense.vatAmount * rate;
      acc.vatPerception += expense.vatPerceptionAmount * rate;
      acc.grossIncome += expense.grossIncomeAmount * rate;
      acc.incomeTax += expense.incomeTaxAmount * rate;
      return acc;
    },
    { vat: 0, vatPerception: 0, grossIncome: 0, incomeTax: 0 },
  );
  const totalTaxesArs =
    taxesArs.vat +
    taxesArs.vatPerception +
    taxesArs.grossIncome +
    taxesArs.incomeTax;

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderClassification = (expense: Expense) => (
    <select
      className={`classification-select ${expense.classification.toLowerCase()}`}
      aria-label={`Clasificación de ${expense.name}`}
      value={expense.classification}
      onChange={(event) => {
        const classification = event.target.value as ExpenseClassification;
        onChangeExpense(expense.id, {
          classification,
          includeInFiscalNet:
            classification === 'DOCUMENTED'
              ? expense.includeInFiscalNet
              : false,
        });
      }}
    >
      <option value="DOCUMENTED">Documentado</option>
      <option value="UNDOCUMENTED">No documentado</option>
    </select>
  );

  const renderCurrency = (expense: Expense) => (
    <select
      className="currency-select"
      aria-label={`Moneda de ${expense.name}`}
      value={expense.currency}
      onChange={(event) =>
        onChangeExpense(expense.id, {
          currency: event.target.value as 'ARS' | 'USD',
          exchangeRate:
            event.target.value === 'USD'
              ? null
              : expense.exchangeRate || referenceExchangeRate,
        })
      }
    >
      <option value="ARS">ARS</option>
      <option value="USD">USD</option>
    </select>
  );

  const renderCommonStart = (expense: Expense) => (
    <>
      <td className="col-include center-cell">
        <input
          aria-label={`Incluir ${expense.name}`}
          type="checkbox"
          checked={expense.included}
          onChange={(event) =>
            onChangeExpense(expense.id, { included: event.target.checked })
          }
        />
      </td>
      <td className="col-date editable-cell">
        <input
          aria-label={`Fecha de ${expense.name}`}
          type="date"
          value={expense.date}
          onChange={(event) =>
            onChangeExpense(expense.id, { date: event.target.value })
          }
        />
      </td>
      <td className="col-name editable-cell name-cell">
        <input
          aria-label="Nombre del gasto"
          value={expense.name}
          onChange={(event) =>
            onChangeExpense(expense.id, { name: event.target.value })
          }
        />
        {!expense.includeInFiscalNet &&
          expense.classification === 'DOCUMENTED' && (
            <span
              className="row-warning"
              title="No computa en costo neto fiscal"
            >
              !
            </span>
          )}
      </td>
    </>
  );

  const renderActions = (expense: Expense, expanded: boolean) => (
    <td className="action-cell">
      <button
        type="button"
        title={expanded ? 'Cerrar detalle' : 'Abrir detalle'}
        onClick={(event) => {
          event.stopPropagation();
          toggleExpanded(expense.id);
        }}
      >
        {expanded ? '⌃' : '⌄'}
      </button>
      <button
        type="button"
        title="Duplicar"
        onClick={(event) => {
          event.stopPropagation();
          onDuplicateExpense(expense.id);
        }}
      >
        ⧉
      </button>
      <button
        type="button"
        className="danger"
        title="Eliminar"
        onClick={(event) => {
          event.stopPropagation();
          onDeleteExpense(expense.id);
        }}
      >
        ×
      </button>
      {expanded && (
        <div
          className="row-details"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="row-details-title">Detalle de la fila</div>
          <div className="row-details-tax-grid">
            <label>
              <span>IVA</span>
              <NumericInput
                ariaLabel={`IVA de ${expense.name}`}
                value={expense.vatAmount}
                onChange={(vatAmount) =>
                  onChangeExpense(expense.id, { vatAmount })
                }
              />
            </label>
            <label>
              <span>Percepción IVA</span>
              <NumericInput
                ariaLabel={`Percepción IVA de ${expense.name}`}
                value={expense.vatPerceptionAmount}
                onChange={(vatPerceptionAmount) =>
                  onChangeExpense(expense.id, { vatPerceptionAmount })
                }
              />
            </label>
            <label>
              <span>IIBB</span>
              <NumericInput
                ariaLabel={`IIBB de ${expense.name}`}
                value={expense.grossIncomeAmount}
                onChange={(grossIncomeAmount) =>
                  onChangeExpense(expense.id, { grossIncomeAmount })
                }
              />
            </label>
            <label>
              <span>Ganancias</span>
              <NumericInput
                ariaLabel={`Ganancias de ${expense.name}`}
                value={expense.incomeTaxAmount}
                onChange={(incomeTaxAmount) =>
                  onChangeExpense(expense.id, { incomeTaxAmount })
                }
              />
            </label>
          </div>
          <label className="fiscal-net-check">
            <span>Computa en costo neto fiscal</span>
            <input
              type="checkbox"
              checked={expense.includeInFiscalNet}
              disabled={expense.classification === 'UNDOCUMENTED'}
              onChange={(event) =>
                onChangeExpense(expense.id, {
                  includeInFiscalNet: event.target.checked,
                })
              }
            />
          </label>
          <label className="notes-field">
            <span>Observaciones</span>
            <textarea
              value={expense.notes}
              onChange={(event) =>
                onChangeExpense(expense.id, { notes: event.target.value })
              }
            />
          </label>
        </div>
      )}
    </td>
  );

  return (
    <section className="panel expenses-panel">
      <div className="expenses-toolbar">
        <div className="title-row">
          <span>▦</span>
          <h2>Detalle de gastos</h2>
          <span className="count-badge">{expenses.length} gastos</span>
        </div>
        <div className="toolbar-controls">
          <div className="view-switch" aria-label="Vista de columnas">
            <button
              type="button"
              className={view === 'COSTS' ? 'active' : ''}
              aria-pressed={view === 'COSTS'}
              onClick={() => setView('COSTS')}
            >
              Costos
            </button>
            <button
              type="button"
              className={view === 'TAXES' ? 'active' : ''}
              aria-pressed={view === 'TAXES'}
              onClick={() => setView('TAXES')}
            >
              Impuestos
            </button>
          </div>
          <input
            className="search-input"
            aria-label="Buscar concepto"
            placeholder="Buscar concepto"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            aria-label="Filtrar clasificación"
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
          >
            <option value="ALL">Todos</option>
            <option value="DOCUMENTED">Documentados</option>
            <option value="UNDOCUMENTED">No documentados</option>
          </select>
          <label className="inline-check">
            <input
              type="checkbox"
              checked={showExcluded}
              onChange={(event) => setShowExcluded(event.target.checked)}
            />
            Mostrar excluidos
          </label>
          <span className="toolbar-divider" />
          <button
            type="button"
            className="text-button primary"
            onClick={onAddExpense}
          >
            ＋ Agregar gasto
          </button>
          <button
            type="button"
            className="text-button"
            disabled={!selectedId}
            onClick={() => selectedId && onDuplicateExpense(selectedId)}
          >
            ⧉ Duplicar fila
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table className={`expenses-table ${view === 'COSTS' ? 'cost-view' : 'tax-view'}`}>
          {view === 'COSTS' ? (
            <colgroup>
              <col className="w-include" />
              <col className="w-date" />
              <col className="w-name" />
              <col className="w-classification" />
              <col className="w-currency" />
              <col className="w-money" />
              <col className="w-money" />
              <col className="w-money" />
              <col className="w-exchange" />
              <col className="w-money" />
              <col className="w-money" />
              <col className="w-actions" />
            </colgroup>
          ) : (
            <colgroup>
              <col className="w-include" />
              <col className="w-date" />
              <col className="w-name" />
              <col className="w-classification" />
              <col className="w-currency" />
              <col className="w-tax" />
              <col className="w-tax" />
              <col className="w-tax" />
              <col className="w-tax" />
              <col className="w-tax-total" />
              <col className="w-money" />
              <col className="w-actions" />
            </colgroup>
          )}

          <thead>
            {view === 'COSTS' ? (
              <tr>
                <th>Inc.</th>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Clasificación</th>
                <th>Moneda</th>
                <th className="align-right">Total neto</th>
                <th className="align-right calculated-heading">Impuestos ƒx</th>
                <th className="align-right calculated-heading">Total bruto ƒx</th>
                <th className="align-right">Tipo cambio</th>
                <th className="align-right calculated-heading">Neto USD ƒx</th>
                <th className="align-right calculated-heading">Bruto USD ƒx</th>
                <th>Acc.</th>
              </tr>
            ) : (
              <tr>
                <th>Inc.</th>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Clasificación</th>
                <th>Moneda</th>
                <th className="align-right">IVA</th>
                <th className="align-right">Perc. IVA</th>
                <th className="align-right">IIBB</th>
                <th className="align-right">Ganancias</th>
                <th className="align-right calculated-heading">Total impuestos ƒx</th>
                <th className="align-right calculated-heading">Total bruto ƒx</th>
                <th>Acc.</th>
              </tr>
            )}
          </thead>

          <tbody>
            {filteredExpenses.map((expense) => {
              const expanded = expandedIds.has(expense.id);
              const selected = selectedId === expense.id;
              const rowClass = [
                !expense.included ? 'excluded-row' : '',
                selected ? 'selected-row' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <tr
                  key={expense.id}
                  className={rowClass}
                  onClick={() => setSelectedId(expense.id)}
                >
                  {renderCommonStart(expense)}
                  <td>{renderClassification(expense)}</td>
                  <td>{renderCurrency(expense)}</td>

                  {view === 'COSTS' ? (
                    <>
                      <FieldCell
                        expense={expense}
                        field="netAmount"
                        label="Neto"
                        onChangeExpense={onChangeExpense}
                      />
                      <td
                        className="numeric-cell calculated-cell taxes-summary-cell"
                        title={`IVA: ${formatNumber(expense.vatAmount)} · Percepción IVA: ${formatNumber(expense.vatPerceptionAmount)} · IIBB: ${formatNumber(expense.grossIncomeAmount)} · Ganancias: ${formatNumber(expense.incomeTaxAmount)}`}
                      >
                        <span>{formatNumber(expenseTaxes(expense))}</span>
                        <small>
                          {nonZeroTaxes(expense) > 0
                            ? `${nonZeroTaxes(expense)} concepto(s)`
                            : 'Sin impuestos'}
                        </small>
                      </td>
                      <td className="numeric-cell calculated-cell">
                        {formatNumber(expenseGrossAmount(expense))}
                      </td>
                      <td className="numeric-cell editable-cell">
                        {expense.currency === 'USD' ? (
                          <span className="not-applicable">—</span>
                        ) : (
                          <NumericInput
                            ariaLabel={`Tipo de cambio de ${expense.name}`}
                            value={
                              expense.exchangeRate ?? referenceExchangeRate
                            }
                            onChange={(exchangeRate) =>
                              onChangeExpense(expense.id, { exchangeRate })
                            }
                          />
                        )}
                      </td>
                      <td className="numeric-cell calculated-cell">
                        {formatNumber(
                          expenseNetUsd(expense, referenceExchangeRate),
                        )}
                      </td>
                      <td className="numeric-cell calculated-cell strong">
                        {formatNumber(
                          expenseGrossUsd(expense, referenceExchangeRate),
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <FieldCell
                        expense={expense}
                        field="vatAmount"
                        label="IVA"
                        onChangeExpense={onChangeExpense}
                      />
                      <FieldCell
                        expense={expense}
                        field="vatPerceptionAmount"
                        label="Percepción IVA"
                        onChangeExpense={onChangeExpense}
                      />
                      <FieldCell
                        expense={expense}
                        field="grossIncomeAmount"
                        label="IIBB"
                        onChangeExpense={onChangeExpense}
                      />
                      <FieldCell
                        expense={expense}
                        field="incomeTaxAmount"
                        label="Ganancias"
                        onChangeExpense={onChangeExpense}
                      />
                      <td className="numeric-cell calculated-cell">
                        {formatNumber(expenseTaxes(expense))}
                      </td>
                      <td className="numeric-cell calculated-cell strong">
                        {formatNumber(expenseGrossAmount(expense))}
                      </td>
                    </>
                  )}

                  {renderActions(expense, expanded)}
                </tr>
              );
            })}

            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={12} className="empty-state">
                  No hay gastos para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>

          {view === 'COSTS' ? (
            <tfoot>
              <tr className="documented-total-row">
                <td colSpan={5} className="footer-label">
                  Documentado
                </td>
                <td className="numeric-cell strong">
                  {formatCurrency(documentedNetUsd, 'USD')}
                </td>
                <td className="numeric-cell">
                  {formatCurrency(
                    documentedGrossUsd - documentedNetUsd,
                    'USD',
                  )}
                </td>
                <td className="numeric-cell strong">
                  {formatCurrency(documentedGrossUsd, 'USD')}
                </td>
                <td />
                <td className="numeric-cell">
                  {formatCurrency(documentedNetUsd, 'USD')}
                </td>
                <td className="numeric-cell strong">
                  {formatCurrency(documentedGrossUsd, 'USD')}
                </td>
                <td />
              </tr>
              <tr className="undocumented-total-row">
                <td colSpan={5} className="footer-label">
                  No documentado
                </td>
                <td className="numeric-cell strong">
                  {formatCurrency(undocumentedUsd, 'USD')}
                </td>
                <td className="numeric-cell">—</td>
                <td className="numeric-cell strong">
                  {formatCurrency(undocumentedUsd, 'USD')}
                </td>
                <td />
                <td className="numeric-cell">
                  {formatCurrency(undocumentedUsd, 'USD')}
                </td>
                <td className="numeric-cell strong">
                  {formatCurrency(undocumentedUsd, 'USD')}
                </td>
                <td />
              </tr>
              <tr className="grand-total-row">
                <td colSpan={5} className="footer-label">
                  Total general
                </td>
                <td className="numeric-cell">
                  {formatCurrency(documentedNetUsd + undocumentedUsd, 'USD')}
                </td>
                <td />
                <td className="numeric-cell strong">
                  {formatCurrency(documentedGrossUsd + undocumentedUsd, 'USD')}
                </td>
                <td />
                <td className="numeric-cell">
                  {formatCurrency(documentedNetUsd + undocumentedUsd, 'USD')}
                </td>
                <td className="numeric-cell strong">
                  {formatCurrency(documentedGrossUsd + undocumentedUsd, 'USD')}
                </td>
                <td />
              </tr>
            </tfoot>
          ) : (
            <tfoot>
              <tr className="tax-summary-row">
                <td colSpan={5} className="footer-label">
                  Impuestos incluidos
                </td>
                <td className="numeric-cell">
                  {formatCurrency(taxesArs.vat, 'ARS')}
                </td>
                <td className="numeric-cell">
                  {formatCurrency(taxesArs.vatPerception, 'ARS')}
                </td>
                <td className="numeric-cell">
                  {formatCurrency(taxesArs.grossIncome, 'ARS')}
                </td>
                <td className="numeric-cell">
                  {formatCurrency(taxesArs.incomeTax, 'ARS')}
                </td>
                <td className="numeric-cell strong">
                  {formatCurrency(totalTaxesArs, 'ARS')}
                </td>
                <td className="numeric-cell strong">
                  {formatCurrency(documentedGrossUsd + undocumentedUsd, 'USD')}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
