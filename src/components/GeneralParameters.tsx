import type { Scenario } from '../types';
import { NumericInput } from './NumericInput';

interface GeneralParametersProps {
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
}

interface RateRowProps {
  label: string;
  enabled: boolean;
  value: number;
  onEnabledChange: (value: boolean) => void;
  onValueChange: (value: number) => void;
}

function RateRow({
  label,
  enabled,
  value,
  onEnabledChange,
  onValueChange,
}: RateRowProps) {
  return (
    <div className={`parameter-row ${enabled ? '' : 'muted'}`}>
      <label className="toggle-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
        />
        {label}
      </label>
      <div className="input-with-suffix compact-input">
        <NumericInput
          ariaLabel={label}
          disabled={!enabled}
          value={value}
          onChange={onValueChange}
        />
        <span>%</span>
      </div>
    </div>
  );
}

export function GeneralParameters({
  scenario,
  onChange,
}: GeneralParametersProps) {
  const updateSale = (patch: Partial<Scenario['sale']>) => {
    onChange({ sale: { ...scenario.sale, ...patch } });
  };

  return (
    <section className="panel parameters-panel" id="configuracion">
      <div className="section-title">
        <span>⚙</span>
        <h2>Parámetros generales</h2>
      </div>

      <div className="parameters-grid">
        <div className="parameter-group">
          <h3>Referencias monetarias</h3>
          <div className="parameter-row">
            <label>Dólar de referencia final (ARS)</label>
            <div className="input-with-prefix compact-input">
              <span>$</span>
              <NumericInput
                ariaLabel="Dólar de referencia final"
                value={scenario.referenceExchangeRate}
                onChange={(referenceExchangeRate) =>
                  onChange({ referenceExchangeRate })
                }
              />
            </div>
          </div>
          <div className="parameter-row">
            <label htmlFor="display-currency">Moneda principal</label>
            <select
              id="display-currency"
              value={scenario.displayCurrency}
              onChange={(event) =>
                onChange({ displayCurrency: event.target.value as 'ARS' | 'USD' })
              }
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </div>
          <div className="parameter-row">
            <label htmlFor="reference-date">Fecha de referencia</label>
            <input
              id="reference-date"
              type="date"
              value={scenario.referenceDate}
              onChange={(event) => onChange({ referenceDate: event.target.value })}
            />
          </div>
        </div>

        <div className="parameter-group">
          <h3>
            Parámetros de venta
            <span className="fixed-rule">📌 Fórmula fija actual</span>
          </h3>
          <div className="parameter-row">
            <label>Precio de venta bruto en USD</label>
            <div className="input-with-prefix compact-input">
              <span>$</span>
              <NumericInput
                ariaLabel="Precio de venta bruto en USD"
                value={scenario.sale.grossPriceUsd}
                onChange={(grossPriceUsd) => updateSale({ grossPriceUsd })}
              />
            </div>
          </div>
          <RateRow
            label="IVA de venta"
            enabled={scenario.sale.applyVat}
            value={scenario.sale.vatRate}
            onEnabledChange={(applyVat) => updateSale({ applyVat })}
            onValueChange={(vatRate) => updateSale({ vatRate })}
          />
          <RateRow
            label="IIBB sobre venta"
            enabled={scenario.sale.applyGrossIncome}
            value={scenario.sale.grossIncomeRate}
            onEnabledChange={(applyGrossIncome) => updateSale({ applyGrossIncome })}
            onValueChange={(grossIncomeRate) => updateSale({ grossIncomeRate })}
          />
          <RateRow
            label="Impuesto a las Ganancias"
            enabled={scenario.sale.applyIncomeTax}
            value={scenario.sale.incomeTaxRate}
            onEnabledChange={(applyIncomeTax) => updateSale({ applyIncomeTax })}
            onValueChange={(incomeTaxRate) => updateSale({ incomeTaxRate })}
          />
        </div>
      </div>
    </section>
  );
}
