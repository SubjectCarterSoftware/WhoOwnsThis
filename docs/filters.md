# Dynamic Filters

The Filters panel discovers facets directly from the data on the graph. Keys are
scanned from the nodes and matched against a whitelist of candidates defined in
`src/filters/facetConfig.ts`. A facet is shown only when it appears on at least
5% of sampled nodes and has at least two distinct values.

Each option displays two counts:
- `countAll`: how many nodes on the canvas have that value.
- `countWithOtherFilters`: how many nodes would remain if this value were
  toggled while preserving other active filters.

To add or remove candidate keys, edit the arrays in
`src/filters/facetConfig.ts`. Array-valued fields such as `tags` are split into
individual values.
