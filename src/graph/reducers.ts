import { KIND_THEME } from './theme';
import { useFiltersStore, makeNodePredicate } from '../state/filtersStore';

export const nodeReducer = (id: string, attrs: Record<string, any>) => {
  const kind = (attrs as any).kind || 'default';
  const theme = (KIND_THEME as any)[kind] || KIND_THEME.default;

  const base = { ...attrs } as any;
  const { selected, search } = useFiltersStore.getState();
  const visible = makeNodePredicate(selected, search)(attrs);

  const visual = {
    ...base,
    size: Math.max(14, (base as any).size || 14),
    color: theme.color,
    headerColor: theme.header,
  } as any;

  return visible ? visual : { ...visual, hidden: true };
};
