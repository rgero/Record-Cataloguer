import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    filterVariant?: 'date' | 'select' | 'text' | 'number' | 'boolean';
    filterOptions?: string[];
    disableFilter?: boolean;
  }
}