import { KIND_THEME } from './theme';
import type { NodeReducer } from 'sigma/types';
import { useFiltersStore, makeNodePredicate } from '../state/filtersStore';

export const nodeReducer: NodeReducer = (id, attrs) => {
  const kind = (attrs as any).kind || 'default';
  const theme = (KIND_THEME as any)[kind] || KIND_THEME.default;

  const size = Math.max(14, (attrs as any).size || 14);

  let type = (attrs as any).type as string | undefined;
  if (!type) {
    type = kind === 'asset' ? 'square' : kind === 'person' ? 'image' : 'circle';
  }

  const { selected, search } = useFiltersStore.getState();
  const visible = makeNodePredicate(selected, search)(attrs);

  const base = {
    ...(attrs as any),
    size,
    color: theme.color,
    headerColor: theme.header,
    type,
  } as any;

  return visible ? base : { ...base, hidden: true };
};
