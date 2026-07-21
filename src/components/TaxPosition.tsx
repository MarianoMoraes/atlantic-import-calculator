import { formatCurrency } from '../lib/format';
import type { CalculationResult } from '../types';

interface TaxPositionProps {
  result: CalculationResult;
}

export function TaxPosition({ result }: TaxPositionProps) {
  const rows = [
    { label: 'Impuestos ya pagados', values: result.taxesPaidArs, className: '' },
    { label: 'Estimados por la venta', values: result.estimatedTaxesArs, className: 'estimated' },
    { label: 'Saldo a pagar', values: result.taxBalancePayableArs, className: 'payable' },
    { label: 'Saldo a favor', values: result.taxBalanceFavorArs, className: 'favorable' },
  ];

  return (
    <section className="panel tax-position-panel">
      <div className="section-title">
        <span>▤</span>
        <h2>Posición fiscal</h2>
      </div>
      <div className="tax-grid-scroll">
        <table className="tax-grid">
          <thead>
            <tr>
              <th />
              <th>IVA</th>
              <th>Percepción IVA</th>
              <th>IIBB</th>
              <th>Ganancias</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={row.className}>
                <th>{row.label}</th>
                <td>{formatCurrency(row.values.vat, 'ARS')}</td>
                <td>{formatCurrency(row.values.vatPerception, 'ARS')}</td>
                <td>{formatCurrency(row.values.grossIncome, 'ARS')}</td>
                <td>{formatCurrency(row.values.incomeTax, 'ARS')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
