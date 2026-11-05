import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseMapHubsAndWarps } from '../src/game/mapHubs';
import { MAP_HUBS, ROOM_TRANSITIONS, DOORS_BY_DESTINATION } from '../lib/mapHubsData';

describe('MapHubs & Meta Authentic Doors & Warp Points Engine', () => {
  const mapData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../public/village_assets/tiled_map/rm_town.json'), 'utf8')
  );

  it('correctly loads and parses all 44 MapHubs navigation nodes from rm_town.json', () => {
    const { hubs } = parseMapHubsAndWarps(mapData);
    expect(hubs.length).toBe(44);
    expect(MAP_HUBS.length).toBe(44);

    // Verify key building hubs exist
    const clinicHub = hubs.find(h => h.locations?.includes('Clinic'));
    expect(clinicHub).toBeDefined();
    expect(clinicHub?.x).toBe(1416);
    expect(clinicHub?.y).toBe(1192);

    const manorHub = hubs.find(h => h.locations?.includes('ManorHouseEntry'));
    expect(manorHub).toBeDefined();
    expect(manorHub?.x).toBe(1088);
    expect(manorHub?.y).toBe(400);

    const generalStoreHub = hubs.find(h => h.locations?.includes('GeneralStoreStore'));
    expect(generalStoreHub).toBeDefined();
    expect(generalStoreHub?.x).toBe(1224);
    expect(generalStoreHub?.y).toBe(1640);

    const innHub = hubs.find(h => h.locations?.includes('Inn'));
    expect(innHub).toBeDefined();
    expect(innHub?.x).toBe(920);
    expect(innHub?.y).toBe(1624);
  });

  it('dynamically maps all building entrance doors from Meta obj_roomtransition without manual placement', () => {
    const { doors } = parseMapHubsAndWarps(mapData);

    const expectedDoors = [
      'general_store_store',
      'inn',
      'blacksmith_store',
      'bathhouse',
      'clinic_f1',
      'celines_room',
      'manor_house_entry',
      'mill',
      'bell_tower_f1',
    ];

    for (const destId of expectedDoors) {
      const door = doors.find(d => d.destinationId === destId);
      expect(door, `Door for ${destId} should be mapped from Meta`).toBeDefined();
      expect(door?.x).toBeGreaterThan(0);
      expect(door?.y).toBeGreaterThan(0);
      expect(door?.prompt).toContain('[E] Enter');
    }

    // Specific coordinates verification from rm_town
    const gsDoor = doors.find(d => d.destinationId === 'general_store_store');
    expect(gsDoor?.x).toBe(1216);
    expect(gsDoor?.y).toBe(1720);

    const innDoor = doors.find(d => d.destinationId === 'inn');
    expect(innDoor?.x).toBe(896);
    expect(innDoor?.y).toBe(1720);

    const blacksmithDoor = doors.find(d => d.destinationId === 'blacksmith_store');
    expect(blacksmithDoor?.x).toBe(696);
    expect(blacksmithDoor?.y).toBe(968);
  });

  it('dynamically maps edge-of-map warp points (Eastern Road, Narrows, Farm)', () => {
    const { warpPoints } = parseMapHubsAndWarps(mapData);

    const eastRoad = warpPoints.filter(w => w.destinationId === 'eastern_road');
    expect(eastRoad.length).toBeGreaterThanOrEqual(1);

    const narrows = warpPoints.filter(w => w.destinationId === 'narrows');
    expect(narrows.length).toBeGreaterThanOrEqual(1);

    const farm = warpPoints.filter(w => w.destinationId === 'farm');
    expect(farm.length).toBeGreaterThanOrEqual(1);
  });

  it('provides direct lookup map via DOORS_BY_DESTINATION', () => {
    expect(DOORS_BY_DESTINATION['general_store_store']).toBeDefined();
    expect(DOORS_BY_DESTINATION['inn']).toBeDefined();
    expect(DOORS_BY_DESTINATION['blacksmith_store']).toBeDefined();
    expect(DOORS_BY_DESTINATION['celines_room']).toBeDefined();
    expect(DOORS_BY_DESTINATION['manor_house_entry']).toBeDefined();
    expect(DOORS_BY_DESTINATION['bell_tower_f1']).toBeDefined();
  });
});
