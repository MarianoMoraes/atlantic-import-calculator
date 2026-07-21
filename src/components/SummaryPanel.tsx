import { formatCurrency } from '../lib/format';
import type { CalculationResult, Scenario } from '../types';

interface SummaryPanelProps {
  scenario: Scenario;
  result: CalculationResult;
}

function SummaryMetric({
  label,
  value,
  secondary,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  secondary?: string;
  tone?: 'neutral' | 'documented' | 'undocumented' | 'fiscal' | 'cash';
}) {
  return (
    <div className={`summary-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {secondary && <small>{secondary}</small>}
    </div>
  );
}

function secondaryAmount(usd: number, scenario: Scenario): string {
  return formatCurrency(usd * scenario.referenceExchangeRate, 'ARS');
}

export function SummaryPanel({ scenario, result }: SummaryPanelProps) {
  return (
    <section className="panel summary-strip" aria-label="Resumen de la operación">
      <div className="summary-strip-header">
        <div>
          <h2>Resumen de la operación</h2>
          <p>Totales recalculados con las filas actualmente incluidas.</p>
        </div>
        <span className={result.warnings.length ? 'status warning' : 'status ok'}>
          {result.warnings.length
            ? `⚠ ${result.warnings.length} advertencia(s)`
            : '● Cálculo completo'}
        </span>
      </div>

      <div className="summary-metrics-grid">
        <SummaryMetric
          label="Documentado neto"
          value={formatCurrency(result.documentedNetUsd, 'USD')}
          secondary={secondaryAmount(result.documentedNetUsd, scenario)}
          tone="documented"
        />
        <SummaryMetric
          label="No documentado"
          value={formatCurrency(result.undocumentedTotalUsd, 'USD')}
          secondary={secondaryAmount(result.undocumentedTotalUsd, scenario)}
          tone="undocumented"
        />
        <SummaryMetric
          label="Total gastado neto"
          value={formatCurrency(result.totalNetUsd, 'USD')}
          secondary={secondaryAmount(result.totalNetUsd, scenario)}
        />
        <SummaryMetric
          label="Total gastado bruto"
          value={formatCurrency(result.totalGrossUsd, 'USD')}
          secondary={secondaryAmount(result.totalGrossUsd, scenario)}
        />
        <SummaryMetric
          label="Ganancia limpia fiscal"
          value={formatCurrency(result.cleanAtlanticProfitUsd, 'USD')}
          secondary={secondaryAmount(result.cleanAtlanticProfitUsd, scenario)}
          tone="fiscal"
        />
        <SummaryMetric
          label="Resultado final de caja"
          value={formatCurrency(result.finalCashResultUsd, 'USD')}
          secondary={secondaryAmount(result.finalCashResultUsd, scenario)}
          tone="cash"
        />
      </div>

      {result.warnings.length > 0 && (
        <details className="summary-warnings">
          <summary>Ver advertencias</summary>
          {result.warnings.map((warning) => (
            <p key={warning}>• {warning}</p>
          ))}
        </details>
      )}
    </section>
  );
}
