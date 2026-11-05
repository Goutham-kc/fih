export interface MapHubNode {
  id: number;
  x: number;
  y: number;
  locations?: string;
  type?: number;
  assetX?: number;
  assetY?: number;
}

export interface InteractiveDoor {
  id: number;
  destinationId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
  hubX?: number;
  hubY?: number;
}

export interface WarpPoint {
  id: number;
  destinationId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  playerDirection?: number;
  specificKey?: string;
}

export interface InteractivePoint {
  id: number;
  name: string;
  x: number;
  y: number;
  prompt: string;
}

const DESTINATION_NAMES: Record<string, string> = {
  general_store_store: 'General Store & Treasury',
  inn: 'The Sleeping Dragon Inn',
  blacksmith_store: 'Blacksmith Forge',
  bathhouse: 'Town Bathhouse',
  clinic_f1: 'Village Clinic',
  celines_room: "Celine's Cottage",
  manor_house_entry: 'Manor House',
  mill: 'Town Mill',
  bell_tower_f1: 'The Bell Tower',
  eastern_road: 'To Eastern Road',
  narrows: 'To The Narrows',
  farm: 'To The Farm',
};

export function parseMapHubsAndWarps(map: Phaser.Tilemaps.Tilemap | any) {
  const hubs: MapHubNode[] = [];
  const doors: InteractiveDoor[] = [];
  const warpPoints: WarpPoint[] = [];
  const interactivePoints: InteractivePoint[] = [];

  // Helper to extract properties dictionary
  function getProps(obj: any): Record<string, any> {
    const props: Record<string, any> = {};
    if (Array.isArray(obj.properties)) {
      obj.properties.forEach((p: any) => {
        props[p.name] = p.value;
      });
    } else if (obj.properties && typeof obj.properties === 'object') {
      return obj.properties;
    }
    return props;
  }

  // Helper to get object layer data either from Phaser Tilemap or raw Tiled JSON
  function getLayerObjects(layerName: string): any[] {
    if (typeof map.getObjectLayer === 'function') {
      const l = map.getObjectLayer(layerName);
      return l?.objects || [];
    }
    if (map.layers) {
      const l = map.layers.find((layer: any) => layer.name === layerName);
      return l?.objects || [];
    }
    return [];
  }

  // 1. Parse MapHubs
  const hubObjects = getLayerObjects('MapHubs');
  for (const obj of hubObjects) {
    const props = getProps(obj);
    hubs.push({
      id: obj.id,
      x: obj.x,
      y: obj.y,
      locations: props.locations,
      type: props.type,
      assetX: props.asset_x,
      assetY: props.asset_y,
    });
  }

  // 2. Parse Meta (Room Transitions / Doors / Warps)
  const metaObjects = getLayerObjects('Meta');
  for (const obj of metaObjects) {
    const props = getProps(obj);
    const dest = props.destination_id || (obj.y > 2800 ? 'farm' : null);

    if (dest) {
      const isExternalWarp = ['eastern_road', 'narrows', 'farm'].includes(dest);
      const friendlyName = DESTINATION_NAMES[dest] || dest;

      if (isExternalWarp) {
        warpPoints.push({
          id: obj.id,
          destinationId: dest,
          name: friendlyName,
          x: obj.x,
          y: obj.y,
          width: obj.width || 32,
          height: obj.height || 32,
          playerDirection: props.player_direction,
          specificKey: props.specific_key,
        });
      } else {
        // Find corresponding map hub near this door
        const nearbyHub = hubs.find(
          (h) => Math.hypot(h.x - obj.x, h.y - obj.y) < 120
        );

        doors.push({
          id: obj.id,
          destinationId: dest,
          name: friendlyName,
          x: obj.x,
          y: obj.y,
          width: obj.width || 32,
          height: obj.height || 24,
          prompt: `[E] Enter ${friendlyName}`,
          hubX: nearbyHub?.x,
          hubY: nearbyHub?.y,
        });
      }
    }
  }

  // 3. Parse TrellisPoints (Notice Board / Stalls / Specific Interactive Spots)
  const trellisObjects = getLayerObjects('TrellisPoints');
  for (const obj of trellisObjects) {
    if (obj.name && (obj.name.includes('Board') || obj.name.includes('Notice') || obj.name.includes('Door'))) {
      interactivePoints.push({
        id: obj.id,
        name: obj.name,
        x: obj.x,
        y: obj.y,
        prompt: `[E] Check ${obj.name}`,
      });
    }
  }

  return { hubs, doors, warpPoints, interactivePoints };
}
