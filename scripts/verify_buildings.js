const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const buildings = [
  // Manor House
  { name: 'Manor Chimeys', file: 'public/village_assets/buildings/manor/spr_town_building_manor_spring.png', x: 872, y: 512, frameW: 448, frameH: 432 },
  { name: 'Manor Top/Main', file: 'public/village_assets/buildings/manor/spr_town_building_manor_spring_top.png', x: 872, y: 512, frameW: 448, frameH: 432 },
  { name: 'Manor Doorway', file: 'public/village_assets/buildings/manor/spr_town_building_manor_doorway_spring.png', x: 1048, y: 504, frameW: 96, frameH: 104 },
  { name: 'Manor Door', file: 'public/village_assets/buildings/manor/spr_town_building_manor_door_spring_closed.png', x: 1064, y: 504, frameW: 64, frameH: 88 },
  { name: 'Manor Tree L', file: 'public/village_assets/buildings/manor/spr_manorhouse_tree_square_spring.png', x: 1006, y: 480, frameW: 48, frameH: 88 },
  { name: 'Manor Tree R', file: 'public/village_assets/buildings/manor/spr_manorhouse_tree_square_spring.png', x: 1138, y: 480, frameW: 48, frameH: 88 },
  
  // Gazebo
  { name: 'Gazebo Ground', file: 'public/village_assets/buildings/manor/Gazebo/spr_town_gazebo_spring_ground.png', x: 1424, y: 284, frameW: 120, frameH: 144 },
  { name: 'Gazebo Structure', file: 'public/village_assets/buildings/manor/Gazebo/spr_town_gazebo_spring.png', x: 1424, y: 284, frameW: 120, frameH: 144 },

  // Blacksmith
  { name: 'Blacksmith Ground', file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_left_spring_ground.png', x: 504, y: 1016, frameW: 136, frameH: 248 },
  { name: 'Blacksmith Left', file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_left_spring.png', x: 504, y: 1016, frameW: 136, frameH: 248 },
  { name: 'Blacksmith Right', file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_right_spring.png', x: 600, y: 984, frameW: 232, frameH: 200 },
  { name: 'Blacksmith Door', file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_door_spring_closed.png', x: 684, y: 984, frameW: 56, frameH: 71 },

  // Bathhouse
  { name: 'Bathhouse', file: 'public/village_assets/buildings/bathhouse/spr_town_building_bathhouse_spring.png', x: 1388, y: 929, frameW: 280, frameH: 208 },
  { name: 'Bathhouse Door', file: 'public/village_assets/buildings/bathhouse/spr_town_building_bathhouse_door_spring_closed.png', x: 1436, y: 926, frameW: 56, frameH: 64 },

  // Clinic
  { name: 'Clinic', file: 'public/village_assets/buildings/clinic/spr_town_building_clinic_spring.png', x: 1344, y: 1281, frameW: 288, frameH: 224 },
  { name: 'Clinic Door 1', file: 'public/village_assets/buildings/clinic/spr_town_building_clinic_door1_spring_closed.png', x: 1396, y: 1281, frameW: 56, frameH: 71 },
  { name: 'Clinic Door 2', file: 'public/village_assets/buildings/clinic/spr_town_building_clinic_door2_spring_closed.png', x: 1508, y: 1281, frameW: 56, frameH: 71 },

  // Bell Tower
  { name: 'Bell Tower', file: 'public/village_assets/buildings/bell_tower/spr_town_building_bell_tower_fixed_spring.png', x: 448, y: 1280, frameW: 160, frameH: 240 },
  { name: 'Bell Tower Door', file: 'public/village_assets/buildings/bell_tower/spr_town_building_bell_tower_door_spring_closed.png', x: 504, y: 1276, frameW: 48, frameH: 54 },

  // Stable
  { name: 'Stable Ground', file: 'public/village_assets/buildings/stable/spr_town_building_stable_ground.png', x: 584, y: 1648, frameW: 216, frameH: 159 },
  { name: 'Stable', file: 'public/village_assets/buildings/stable/spr_town_building_stable_spring.png', x: 584, y: 1648, frameW: 216, frameH: 159 },

  // Sleeping Dragon Inn
  { name: 'Inn', file: 'public/village_assets/buildings/inn/spr_town_building_inn_spring.png', x: 812, y: 1736, frameW: 272, frameH: 272 },
  { name: 'Inn Wooden Beams', file: 'public/village_assets/buildings/inn/spr_town_building_inn_wooden_beams_spring.png', x: 1020, y: 1728, frameW: 64, frameH: 160 },
  { name: 'Inn Door', file: 'public/village_assets/buildings/inn/spr_town_building_inn_door_spring_closed.png', x: 916, y: 1735, frameW: 56, frameH: 71 },

  // General Store
  { name: 'General Store', file: 'public/village_assets/buildings/general_store/spr_town_building_generalstore_spring.png', x: 1148, y: 1729, frameW: 200, frameH: 248 },
  { name: 'General Store Side', file: 'public/village_assets/buildings/general_store/spr_town_building_generalstore_side_spring.png', x: 1284, y: 1727, frameW: 104, frameH: 184 },
  { name: 'General Store Door', file: 'public/village_assets/buildings/general_store/spr_town_building_generalstore_door_spring_closed.png', x: 1204, y: 1737, frameW: 56, frameH: 71 },

  // Mill
  { name: 'Mill Base', file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_base_on.png', x: 1408, y: 1728, frameW: 192, frameH: 288 },
  { name: 'Mill Doorway', file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_doorway_on.png', x: 1408, y: 1728, frameW: 192, frameH: 288 },
  { name: 'Mill Door', file: 'public/village_assets/buildings/mill/spr_town_building_mill_door_spring_closed.png', x: 1480, y: 1727, frameW: 48, frameH: 64 },
  { name: 'Mill Tower', file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_tower_on.png', x: 1408, y: 1728, frameW: 192, frameH: 288 },
  { name: 'Mill Blades', file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_blades_on.png', x: 1408, y: 1728, frameW: 192, frameH: 288 },

  // Celine's Cottage
  { name: 'Celine Cottage', file: 'public/village_assets/buildings/cottage/spr_town_building_celine_spring.png', x: 1256, y: 2129, frameW: 176, frameH: 208 },
  { name: 'Celine Door', file: 'public/village_assets/buildings/cottage/spr_town_building_celine_door_spring_closed.png', x: 1304, y: 2135, frameW: 64, frameH: 72 },

  // Bridges
  { name: 'Stone Bridge Ground', file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_spring_ground.png', x: 1616, y: 1128, frameW: 184, frameH: 112 },
  { name: 'Stone Bridge Water', file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_water.png', x: 1616, y: 1128, frameW: 184, frameH: 112 },
  { name: 'Stone Bridge Flat', file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_spring.png', x: 1616, y: 1128, frameW: 184, frameH: 112 },
  { name: 'Stone Bridge Top', file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_spring_top.png', x: 1616, y: 1128, frameW: 184, frameH: 112 },

  // Balor's Wagon
  { name: 'Balor Wagon', file: 'public/village_assets/architecture/market_stalls/Balor/spr_town_balor_wagon_spring.png', x: 875, y: 2056, frameW: 104, frameH: 96 }
];

async function checkAll() {
  console.log('Checking all building files...');
  let missing = 0;
  for (const b of buildings) {
    if (!fs.existsSync(b.file)) {
      console.error(`MISSING: ${b.name} -> ${b.file}`);
      missing++;
    } else {
      const meta = await sharp(b.file).metadata();
      console.log(`OK: ${b.name.padEnd(20)} | file size: ${meta.width}x${meta.height} | dest: (${b.x}, ${b.y}) frame: ${b.frameW}x${b.frameH}`);
    }
  }
  console.log(`Finished check. Missing files: ${missing}`);
}
checkAll();
