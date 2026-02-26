export type IdeaCategory = 'process-improvement' | 'new-product' | 'other';

export interface DynamicFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  required: boolean;
}

const BASE_FIELDS: DynamicFieldConfig[] = [
  { name: 'title', label: 'Idea title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
];

const CATEGORY_FIELDS: Record<IdeaCategory, DynamicFieldConfig[]> = {
  'process-improvement': [
    { name: 'currentOwner', label: 'Current process owner', type: 'text', required: true },
    { name: 'expectedSavings', label: 'Expected cost savings', type: 'number', required: false },
  ],
  'new-product': [
    { name: 'targetCustomer', label: 'Target customer segment', type: 'text', required: true },
    { name: 'estimatedRevenue', label: 'Estimated annual revenue', type: 'number', required: false },
  ],
  other: [],
};

/**
 * Resolve the dynamic form configuration for a given idea category.
 * Always includes base fields (title, description) plus any category-specific fields.
 */
export function getIdeaFormConfig(category: string | null | undefined): DynamicFieldConfig[] {
  const normalized = (category ?? 'other').toLowerCase() as IdeaCategory;
  const extra = CATEGORY_FIELDS[normalized] ?? CATEGORY_FIELDS.other;
  return [...BASE_FIELDS, ...extra];
}
