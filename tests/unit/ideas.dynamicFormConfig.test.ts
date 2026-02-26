import { getIdeaFormConfig } from '../../src/frontend/lib/ideaFormConfig';

function fieldNames(fields: { name: string }[]): string[] {
  return fields.map((f) => f.name);
}

describe('getIdeaFormConfig', () => {
  it('includes base fields for any category', () => {
    const fields = getIdeaFormConfig('other');
    const names = fieldNames(fields);
    expect(names).toContain('title');
    expect(names).toContain('description');
  });

  it('returns process-improvement specific fields', () => {
    const fields = getIdeaFormConfig('process-improvement');
    const names = fieldNames(fields);
    expect(names).toContain('currentOwner');
    expect(names).toContain('expectedSavings');
  });

  it('returns new-product specific fields', () => {
    const fields = getIdeaFormConfig('new-product');
    const names = fieldNames(fields);
    expect(names).toContain('targetCustomer');
    expect(names).toContain('estimatedRevenue');
  });

  it('is case-insensitive and falls back to other', () => {
    const fields = getIdeaFormConfig('NeW-PrOdUcT');
    const names = fieldNames(fields);
    expect(names).toContain('title');
    expect(names).toContain('description');
    expect(names).toContain('targetCustomer');

    const fallback = getIdeaFormConfig('unknown-category');
    const fallbackNames = fieldNames(fallback);
    expect(fallbackNames).toEqual(['title', 'description']);
  });
});
