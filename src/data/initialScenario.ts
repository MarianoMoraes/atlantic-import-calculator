import type { AppState, Expense, ExpenseClassification, Scenario } from '../types';
import { createId } from '../lib/id';

type SeedExpense = Omit<Expense, 'id' | 'included' | 'notes'> & {
  included?: boolean;
  notes?: string;
};

function expense(seed: SeedExpense): Expense {
  return {
    id: createId('expense'),
    included: seed.included ?? true,
    notes: seed.notes ?? '',
    ...seed,
  };
}

const D: ExpenseClassification = 'DOCUMENTED';
const U: ExpenseClassification = 'UNDOCUMENTED';

export const initialExpenses: Expense[] = [
  expense({ date: '2026-01-12', name: 'TRANSFERENCIA PROVEEDOR', classification: D, currency: 'USD', netAmount: 4755, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: null, includeInFiscalNet: true }),
  expense({ date: '2026-01-12', name: 'FEE BANCO TRANSFERENCIA INTERNACIONAL', classification: D, currency: 'USD', netAmount: 40, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: null, includeInFiscalNet: false, notes: 'En la hoja original integra el bruto documentado, pero no el costo neto fiscal.' }),
  expense({ date: '2026-02-06', name: 'FEE CRYPTO A USD', classification: U, currency: 'USD', netAmount: 24, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: null, includeInFiscalNet: false }),
  expense({ date: '2026-02-07', name: 'FEE CRYPTO A USD', classification: U, currency: 'USD', netAmount: 216.6, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: null, includeInFiscalNet: false, notes: 'Se usa USD 216,60 porque es el valor computado en las columnas de totales del Excel.' }),
  expense({ date: '2026-03-10', name: 'TRANSFERENCIA PROVEEDOR', classification: D, currency: 'USD', netAmount: 12975, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: null, includeInFiscalNet: true }),
  expense({ date: '2026-03-10', name: 'FEE BANCO TRANSFERENCIA INTERNACIONAL', classification: D, currency: 'USD', netAmount: 40, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: null, includeInFiscalNet: false, notes: 'En la hoja original integra el bruto documentado, pero no el costo neto fiscal.' }),
  expense({ date: '2026-05-07', name: 'CERTIFICADO CARTA GARANTÍA MAERSK', classification: D, currency: 'ARS', netAmount: 61265, vatAmount: 1735, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1400, includeInFiscalNet: true }),
  expense({ date: '2026-05-09', name: 'ENVÍO CARTA GARANTÍA A BS. AS.', classification: D, currency: 'ARS', netAmount: 7766.41, vatAmount: 1630.9461, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1400, includeInFiscalNet: true }),
  expense({ date: '2026-05-14', name: 'MAERSK', classification: D, currency: 'ARS', netAmount: 1181754, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1420, includeInFiscalNet: true }),
  expense({ date: '2026-05-19', name: 'PERCEPCIÓN SOBRE DEPÓSITO DINERO GALICIA', classification: D, currency: 'ARS', netAmount: 0, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 20800, incomeTaxAmount: 15015.32, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-22', name: 'PERCEPCIÓN SOBRE DEPÓSITO DINERO GALICIA', classification: D, currency: 'ARS', netAmount: 0, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 90880, incomeTaxAmount: 34625.28, exchangeRate: 1425, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'PERCEPCIÓN SOBRE DEPÓSITO DINERO GALICIA', classification: D, currency: 'ARS', netAmount: 0, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 94720, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'ARCA LIBERACIÓN ADUANA: DERECHO DE IMPORTACIÓN', classification: D, currency: 'ARS', netAmount: 3134273.94, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'ARCA LIBERACIÓN ADUANA: IVA 10,5%', classification: D, currency: 'ARS', netAmount: 0, vatAmount: 2940996.66, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'ARCA LIBERACIÓN ADUANA: IVA ADICIONAL', classification: D, currency: 'ARS', netAmount: 0, vatAmount: 2800949.2, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'ARCA LIBERACIÓN ADUANA: IMPUESTO A LAS GANANCIAS', classification: D, currency: 'ARS', netAmount: 0, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 1680569.52, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'ARCA LIBERACIÓN ADUANA: IIBB', classification: D, currency: 'ARS', netAmount: 0, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 700237.3, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'ARCA LIBERACIÓN ADUANA: ARANCEL SIM IMPORTACIÓN', classification: D, currency: 'ARS', netAmount: 14030, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'VERIFICACIÓN CONTENEDOR MAERSK: TASA CARGA', classification: D, currency: 'ARS', netAmount: 68400, vatAmount: 14364, vatPerceptionAmount: 2052, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'VERIFICACIÓN CONTENEDOR MAERSK: SERVICIO CARGA IMPORTACIÓN', classification: D, currency: 'ARS', netAmount: 1659412.5, vatAmount: 348476.625, vatPerceptionAmount: 49782.375, grossIncomeAmount: 49782.375, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'VERIFICACIÓN CONTENEDOR MAERSK: TRANSPORTE ZONA OPERATIVA', classification: D, currency: 'ARS', netAmount: 508725, vatAmount: 106832.25, vatPerceptionAmount: 15261.75, grossIncomeAmount: 15261.75, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'VERIFICACIÓN CONTENEDOR MAERSK: INSPECCIÓN', classification: D, currency: 'ARS', netAmount: 933375, vatAmount: 196008.75, vatPerceptionAmount: 28001.25, grossIncomeAmount: 28001.25, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: true }),
  expense({ date: '2026-05-26', name: 'COMISIÓN DESPACHANTE DÉBITO A IMPUESTO (1%)', classification: U, currency: 'ARS', netAmount: 40263.125, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1435, includeInFiscalNet: false, notes: 'En el Excel original se obtiene por diferencia residual.' }),
  expense({ date: '2026-05-27', name: 'DESPACHANTE: DIGITALIZACIÓN Y ARCHIVO', classification: D, currency: 'ARS', netAmount: 39284, vatAmount: 8249.64, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1440, includeInFiscalNet: true }),
  expense({ date: '2026-05-27', name: 'DESPACHANTE: IMPUESTOS CTA. CTE.', classification: D, currency: 'ARS', netAmount: 40380.93, vatAmount: 8479.9953, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1440, includeInFiscalNet: true }),
  expense({ date: '2026-05-27', name: 'DESPACHANTE: GASTOS OPERATIVOS', classification: D, currency: 'ARS', netAmount: 210450, vatAmount: 44194.5, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1440, includeInFiscalNet: true }),
  expense({ date: '2026-05-27', name: 'DESPACHANTE: HONORARIOS', classification: D, currency: 'ARS', netAmount: 841800, vatAmount: 176778, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1440, includeInFiscalNet: true }),
  expense({ date: '2026-05-27', name: 'DESPACHANTE: GASTOS EXTRA', classification: U, currency: 'ARS', netAmount: 1400000, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1440, includeInFiscalNet: false }),
  expense({ date: '2026-06-02', name: 'TRANSPORTE — FACTURA PENDIENTE', classification: D, currency: 'ARS', netAmount: 1900000, vatAmount: 399000, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1440, includeInFiscalNet: true }),
  expense({ date: '2026-06-02', name: 'DESCARGA Y CARGA (7 HS. GRÚA)', classification: U, currency: 'ARS', netAmount: 2120000, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1440, includeInFiscalNet: false }),
  expense({ date: '2026-06-02', name: 'DESCONSOLIDADO (SAMPI 4 HS. Y CAMIÓN)', classification: U, currency: 'ARS', netAmount: 750000, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: 1440, includeInFiscalNet: false }),
  expense({ date: '2026-07-06', name: 'COSTO PRÉSTAMO EE. UU.', classification: U, currency: 'USD', netAmount: 1450, vatAmount: 0, vatPerceptionAmount: 0, grossIncomeAmount: 0, incomeTaxAmount: 0, exchangeRate: null, includeInFiscalNet: false }),
];

export function createInitialScenario(): Scenario {
  return {
    id: createId('scenario'),
    name: 'Escenario base',
    referenceExchangeRate: 1450,
    displayCurrency: 'USD',
    referenceDate: '2026-07-06',
    sale: {
      grossPriceUsd: 34500,
      vatRate: 10.5,
      grossIncomeRate: 3,
      incomeTaxRate: 30,
      applyVat: true,
      applyGrossIncome: true,
      applyIncomeTax: true,
    },
    expenses: initialExpenses,
  };
}

export function createInitialState(): AppState {
  const scenario = createInitialScenario();
  return { scenarios: [scenario], activeScenarioId: scenario.id };
}

export function createBlankScenario(name: string): Scenario {
  return {
    id: createId('scenario'),
    name,
    referenceExchangeRate: 1450,
    displayCurrency: 'USD',
    referenceDate: new Date().toISOString().slice(0, 10),
    sale: {
      grossPriceUsd: 0,
      vatRate: 10.5,
      grossIncomeRate: 3,
      incomeTaxRate: 30,
      applyVat: true,
      applyGrossIncome: true,
      applyIncomeTax: true,
    },
    expenses: [],
  };
}
