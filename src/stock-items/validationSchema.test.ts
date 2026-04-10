import { createStockItemDetailsSchema } from './validationSchema';

const t = (_key: string, defaultValue: string) => defaultValue;

const baseData = {
  isDrug: false,
  hasExpiration: false,
};

describe('createStockItemDetailsSchema — purchase price validation', () => {
  const schema = createStockItemDetailsSchema(t);

  it('passes when purchase price is set with a packaging unit', () => {
    const result = schema.safeParse({
      ...baseData,
      purchasePrice: 100,
      purchasePriceUoMUuid: 'uom-uuid-001',
    });
    expect(result.success).toBe(true);
  });

  it('fails when purchase price is set without a packaging unit', () => {
    const result = schema.safeParse({
      ...baseData,
      purchasePrice: 100,
      purchasePriceUoMUuid: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('purchasePriceUoMUuid');
    }
  });

  it('fails when purchase price is set and packaging unit is undefined', () => {
    const result = schema.safeParse({
      ...baseData,
      purchasePrice: 50,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('purchasePriceUoMUuid');
    }
  });

  it('passes when purchase price is 0 without a packaging unit', () => {
    const result = schema.safeParse({
      ...baseData,
      purchasePrice: 0,
      purchasePriceUoMUuid: null,
    });
    expect(result.success).toBe(true);
  });

  it('passes when purchase price is null without a packaging unit', () => {
    const result = schema.safeParse({
      ...baseData,
      purchasePrice: null,
      purchasePriceUoMUuid: null,
    });
    expect(result.success).toBe(true);
  });

  it('passes when neither purchase price nor packaging unit is set', () => {
    const result = schema.safeParse(baseData);
    expect(result.success).toBe(true);
  });
});
