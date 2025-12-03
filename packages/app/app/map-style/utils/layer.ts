import type { LayerSpecification } from "maplibre-gl";

export function defineLayerFactory<
  // biome-ignore lint/suspicious/noExplicitAny: cannot avoid any here
  F extends (...args: any[]) => LayerSpecification | LayerSpecification[],
>(factory: F): (...args: Parameters<F>) => LayerSpecification[] {
  const factoryWrapper = (...args: Parameters<F>) => {
    const layers = factory(...args);
    if (Array.isArray(layers)) return layers;
    return [layers];
  };
  return factoryWrapper;
}
