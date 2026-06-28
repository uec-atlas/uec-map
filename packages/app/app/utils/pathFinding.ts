import { bbox, bearing, distance, nearestPointOnLine, point } from "@turf/turf";
import type { Feature, LineString, Point, Position } from "geojson";
import createGraph, { type Graph } from "ngraph.graph";
import { aStar, type PathFinder } from "ngraph.path";
import RBush from "rbush";

interface NodeData {
  x: number;
  y: number;
}

interface LinkData {
  distance: number;
  weight: number;
}

interface NetworkIndexItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  feature: Feature<LineString>;
}

export interface SnapResult {
  point: Position;
  neighbors: {
    id: string;
    dist: number;
  }[];
}

let graph: Graph<NodeData, LinkData>;
let spatialIndex: RBush<NetworkIndexItem>;
let pathFinder: PathFinder<NodeData>;
let weightedPathFinder: PathFinder<NodeData>;
const buildingEntrances = new Map<string, Position[]>();

const MAX_WEIGHT = 8;

export function initPathFinding(paths: Feature[], entrances?: Feature[]): void {
  graph = createGraph<NodeData, LinkData>();
  spatialIndex = new RBush<NetworkIndexItem>();

  const bulkItems: NetworkIndexItem[] = [];
  paths.forEach((feature) => {
    if (feature.geometry.type !== "LineString") return;

    const [minX, minY, maxX, maxY] = bbox(feature);
    bulkItems.push({
      minX,
      minY,
      maxX,
      maxY,
      feature: feature as Feature<LineString>,
    });

    const coords = feature.geometry.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      const from = coords[i];
      const to = coords[i + 1];
      if (!from || !to) continue;

      const fromId = from.join(",");
      const toId = to.join(",");

      const distMeters = distance(from, to, { units: "meters" });

      graph.addNode(fromId, { x: from[0], y: from[1] } as NodeData);
      graph.addNode(toId, { x: to[0], y: to[1] } as NodeData);
      graph.addLink(fromId, toId, {
        distance: distMeters,
        weight: MAX_WEIGHT / ((feature.properties?.weight ?? 1) + 1),
      });
      graph.addLink(toId, fromId, {
        distance: distMeters,
        weight: MAX_WEIGHT / ((feature.properties?.weight ?? 1) + 1),
      });
    }
  });

  spatialIndex.load(bulkItems);

  pathFinder = aStar(graph, {
    distance(_fromNode, _toNode, link) {
      return link.data.distance;
    },
    heuristic(fromNode, toNode) {
      return distance(
        [fromNode.data.x, fromNode.data.y],
        [toNode.data.x, toNode.data.y],
        { units: "meters" },
      );
    },
  });
  weightedPathFinder = aStar(graph, {
    distance(_fromNode, _toNode, link) {
      return link.data.distance * link.data.weight;
    },
    heuristic(fromNode, toNode) {
      return distance(
        [fromNode.data.x, fromNode.data.y],
        [toNode.data.x, toNode.data.y],
        { units: "meters" },
      );
    },
  });

  if (entrances) {
    entrances.forEach((f) => {
      const bid: string = f.properties?.building_id;
      if (bid) {
        if (!buildingEntrances.has(bid)) {
          buildingEntrances.set(bid, []);
        }
        buildingEntrances.get(bid)?.push((f.geometry as Point).coordinates);
      }
    });
  }
}

/**
 * 座標から最寄りの道路上の点を特定し、接続情報を返す
 */
export function findNearestNetworkPoint(coords: Position): SnapResult | null {
  const r = 5e-4; // 約50m
  const candidates = spatialIndex.search({
    minX: (coords[0] as number) - r,
    minY: (coords[1] as number) - r,
    maxX: (coords[0] as number) + r,
    maxY: (coords[1] as number) + r,
  });

  let bestMatch: {
    snapped: Feature<Point>;
    feature: Feature<LineString>;
  } | null = null;
  let minD = Infinity;
  const pt = point(coords);

  for (const item of candidates) {
    const snapped = nearestPointOnLine(item.feature, pt);
    const d = snapped.properties?.dist ?? Infinity;
    if (d < minD) {
      minD = d;
      bestMatch = { snapped, feature: item.feature };
    }
  }

  if (!bestMatch) return null;

  const { snapped, feature } = bestMatch;
  const lineCoords = feature.geometry.coordinates;
  let idx = snapped.properties?.index;
  if (idx >= lineCoords.length - 1) {
    idx = lineCoords.length - 2;
  }

  if (typeof idx === "undefined" || idx >= lineCoords.length - 1) return null;

  const pA = lineCoords[idx];
  const pB = lineCoords[idx + 1];

  if (!pA || !pB) return null;

  const distA = distance(snapped, pA, { units: "meters" });
  const distB = distance(snapped, pB, { units: "meters" });

  return {
    point: snapped.geometry.coordinates,
    neighbors: [
      { id: pA.join(","), dist: distA },
      { id: pB.join(","), dist: distB },
    ],
  };
}

/**
 * 建物IDに対応する全ての入口についてスナップ情報を返す
 */
export function getBuildingEntrances(buildingId: string): SnapResult[] {
  const coordsList = buildingEntrances.get(buildingId);
  if (!coordsList) return [];
  return coordsList
    .map((c) => findNearestNetworkPoint(c))
    .filter((res): res is SnapResult => !!res);
}

/**
 * 2点間（またはスナップ情報間）の最短経路をGeoJSON LineStringとして返す
 */
export function calculateRoute(
  startSnaps: SnapResult | SnapResult[],
  endSnaps: SnapResult | SnapResult[],
  useWeight: boolean,
): Feature<LineString> | null {
  const starts = Array.isArray(startSnaps) ? startSnaps : [startSnaps];
  const targets = Array.isArray(endSnaps) ? endSnaps : [endSnaps];

  let bestPathCoordinates: Position[] | null = null;
  let minTotalDist = Infinity;

  /**
   * 180°折り返しを検出・修正する
   */
  const removeStraightBacktracks = (coords: Position[]): Position[] => {
    const result: Position[] = [];
    for (let i = 0; i < coords.length; i++) {
      const curr = coords[i];
      const prev = coords[i - 1];
      if (!curr) continue;
      if (i === 0 || !prev || curr[0] !== prev[0] || curr[1] !== prev[1]) {
        result.push(curr);
      }
    }

    let changed = true;
    const BACKTRACK_THRESHOLD = 179;

    while (changed && result.length >= 3) {
      changed = false;
      const first = result[0];
      const last = result[result.length - 1];
      if (!first || !last) break;

      const nextResult: Position[] = [first];

      for (let i = 1; i < result.length - 1; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        const next = result[i + 1];

        if (!prev || !curr || !next) continue;

        const pPrev = point(prev);
        const pCurr = point(curr);
        const pNext = point(next);

        const bearingIn = bearing(pPrev, pCurr);
        const bearingOut = bearing(pCurr, pNext);

        let diff = Math.abs(bearingOut - bearingIn);
        if (diff > 180) {
          diff = 360 - diff;
        }

        // ほぼ180°なら折り返しと判定
        if (diff >= BACKTRACK_THRESHOLD) {
          changed = true;
          continue;
        }

        nextResult.push(curr);
      }

      nextResult.push(last);
      result.length = 0;
      result.push(...nextResult);
    }

    return result;
  };

  // 全ての入口候補 × スタートの両隣接 × ゴールの両隣接 の組み合わせを探索
  for (const endSnap of targets) {
    for (const startSnap of starts) {
      for (const sNode of startSnap.neighbors) {
        for (const eNode of endSnap.neighbors) {
          const pathNodes = (useWeight ? weightedPathFinder : pathFinder).find(
            sNode.id,
            eNode.id,
          );
          if (pathNodes.length === 0 && sNode.id !== eNode.id) continue;

          let graphDist = 0;
          for (let i = 0; i < pathNodes.length - 1; i++) {
            const currentNode = pathNodes[i];
            const nextNode = pathNodes[i + 1];
            if (!currentNode || !nextNode) continue;
            const link = graph.getLink(currentNode.id, nextNode.id);
            if (link) {
              graphDist += useWeight
                ? link.data.distance * link.data.weight
                : link.data.distance;
            }
          }

          const total = sNode.dist + graphDist + eNode.dist;

          if (total < minTotalDist) {
            minTotalDist = total;
            const pathCoords = pathNodes
              .reverse()
              .map((n) => [n.data.x, n.data.y]);
            const fullCoords = [startSnap.point, ...pathCoords, endSnap.point];
            // 180°折り返しを修正
            bestPathCoordinates = removeStraightBacktracks(fullCoords);
          }
        }
      }
    }
  }

  if (!bestPathCoordinates) return null;

  return {
    type: "Feature",
    properties: { distance: minTotalDist },
    geometry: {
      type: "LineString",
      coordinates: bestPathCoordinates,
    },
  };
}
