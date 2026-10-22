import React, { useState } from 'react';
import { ShopItem, WeaponType } from '../../types/pubg';
import { WEAPON_REGISTRY } from '../../game/pubg/weaponModels';
import { ShoppingCart, Shield, Crosshair, Heart, Zap, X, Check, Flame } from 'lucide-react';

interface PubgShopModalProps {
  isOpen: boolean;
  battlePoints: number;
  onClose: () => void;
  onBuyItem: (item: ShopItem) => boolean;
}

export const SHOP_CATALOG: ShopItem[] = [
  // Weapons
  {
    id: 'buy_m249',
    name: 'M249 Squad Automatic Weapon',
    category: 'weapon',
    subType: 'M249',
    cost: 1200,
    description: '100-round continuous suppression drum magazine, 800 RPM cyclic rate.',
    statsPreview: {
      damage: 45,
      fireRate: 13.5,
      range: 500,
      magSize: 100,
    },
  },
  {
    id: 'buy_awm',
    name: 'AWM .300 Magnum Sniper',
    category: 'weapon',
    subType: 'AWM',
    cost: 1400,
    description: 'Lethal one-shot headshot bolt action sniper with 8x optical scope.',
    statsPreview: {
      damage: 105,
      fireRate: 0.8,
      range: 850,
      magSize: 5,
    },
  },
  {
    id: 'buy_scarl',
    name: 'SCAR-L 5.56mm Special Forces',
    category: 'weapon',
    subType: 'SCAR_L',
    cost: 900,
    description: 'FDE desert finish, low recoil bloom, superb stability at mid-range.',
    statsPreview: {
      damage: 42,
      fireRate: 10.8,
      range: 440,
      magSize: 30,
    },
  },
  {
    id: 'buy_kar98k',
    name: 'Kar98k 7.62mm Vintage Sniper',
    category: 'weapon',
    subType: 'KAR98K',
    cost: 1000,
    description: 'Classic walnut stock precision marksman rifle with 4x optic.',
    statsPreview: {
      damage: 79,
      fireRate: 0.95,
      range: 650,
      magSize: 5,
    },
  },
  {
    id: 'buy_vector',
    name: 'KRISS Vector 9mm SMG',
    category: 'weapon',
    subType: 'VECTOR',
    cost: 850,
    description: '1200 RPM blazing shredder with minimal vertical recoil climb.',
    statsPreview: {
      damage: 31,
      fireRate: 20.0,
      range: 160,
      magSize: 19,
    },
  },
  {
    id: 'buy_ump45',
    name: 'UMP45 .45 ACP Tactical SMG',
    category: 'weapon',
    subType: 'UMP45',
    cost: 750,
    description: 'Balanced CQB submachine gun with high stopping power.',
    statsPreview: {
      damage: 38,
      fireRate: 11.0,
      range: 220,
      magSize: 25,
    },
  },
  {
    id: 'buy_deagle',
    name: 'Desert Eagle .50 AE Hand Cannon',
    category: 'weapon',
    subType: 'DEAGLE',
    cost: 600,
    description: 'Massive semi-auto hand cannon dealing 62 damage per bullet.',
    statsPreview: {
      damage: 62,
      fireRate: 4.0,
      range: 150,
      magSize: 7,
    },
  },

  // Armor & Gear
  {
    id: 'buy_helm3',
    name: 'Level 3 Spetsnaz Helmet',
    category: 'armor',
    subType: '3_helm',
    cost: 800,
    description: 'Military helmet with bulletproof welding visor (55% damage reduction).',
  },
  {
    id: 'buy_vest3',
    name: 'Level 3 Military Heavy Plate Vest',
    category: 'armor',
    subType: '3_vest',
    cost: 900,
    description: 'Ceramic ballistic armor vest (55% damage reduction, 300 durability).',
  },
  {
    id: 'buy_backpack3',
    name: 'Level 3 Tactical Rucksack',
    category: 'armor',
    subType: '3_backpack',
    cost: 400,
    description: 'Maximum gear capacity for high-yield ammo and medical supply hauls.',
  },

  // Ammo Crates
  {
    id: 'buy_ammo_556',
    name: '5.56mm Ammo Crate (120 rds)',
    category: 'ammo',
    subType: '5.56mm',
    cost: 250,
    description: 'Full ammo can of NATO standard 5.56mm rounds for M416 / SCAR-L / M249.',
  },
  {
    id: 'buy_ammo_762',
    name: '7.62mm Ammo Crate (100 rds)',
    category: 'ammo',
    subType: '7.62mm',
    cost: 300,
    description: 'High-caliber heavy rounds for AKM / Kar98k.',
  },
  {
    id: 'buy_ammo_300m',
    name: '.300 Magnum Match Grade (20 rds)',
    category: 'ammo',
    subType: '300Mag',
    cost: 400,
    description: 'Ultra high-velocity magnum cartridges for AWM sniper.',
  },
  {
    id: 'buy_ammo_9mm',
    name: '9mm Bulk Pack (120 rds)',
    category: 'ammo',
    subType: '9mm',
    cost: 200,
    description: 'Submachine gun and sidearm ammo.',
  },

  // Medical & Boost
  {
    id: 'buy_medkit',
    name: 'Full Trauma Medkit',
    category: 'meds',
    subType: 'medkit',
    cost: 350,
    description: 'Restores player health to 100% full capacity.',
  },
  {
    id: 'buy_adrenaline',
    name: 'Adrenaline Syringe',
    category: 'meds',
    subType: 'adrenaline',
    cost: 300,
    description: 'Maxes out energy boost bar to 100% for rapid HP regen and sprint speed.',
  },
  {
    id: 'buy_drinks',
    name: 'Energy Drink 3-Pack',
    category: 'meds',
    subType: 'energyDrink_pack',
    cost: 220,
    description: '3 chilled cans of energy drink for continuous boost.',
  },

  // Tactical
  {
    id: 'buy_frag',
    name: 'M67 Frag Grenade (x2)',
    category: 'tactical',
    subType: 'FRAG_GRENADE',
    cost: 250,
    description: '2 lethal explosive fragmentation grenades with 3.2s fuses.',
  },
  {
    id: 'buy_uav',
    name: 'Tactical UAV Recon Scan',
    category: 'tactical',
    subType: 'uav_scan',
    cost: 700,
    description: 'Satellite sweep revealing all remaining enemy bot locations on radar.',
  },
];

export const PubgShopModal: React.FC<PubgShopModalProps> = ({
  isOpen,
  battlePoints,
  onClose,
  onBuyItem,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'weapon' | 'armor' | 'ammo' | 'meds' | 'tactical'>('all');
  const [boughtNotice, setBoughtNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = SHOP_CATALOG.filter(
    (item) => activeTab === 'all' || item.category === activeTab
  );

  const handlePurchase = (item: ShopItem) => {
    if (battlePoints < item.cost) return;
    const success = onBuyItem(item);
    if (success) {
      setBoughtNotice(`Purchased ${item.name}!`);
      setTimeout(() => setBoughtNotice(null), 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-amber-500/40 shadow-[0_0_90px_rgba(245,158,11,0.2)] text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono tracking-wider text-amber-300 uppercase flex items-center gap-2">
                BLACK MARKET ARSENAL
              </h2>
              <p className="text-xs text-gray-400 font-sans">
                Exchange Battle Points (BP) earned from kills, headshots, and damage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* BP Wallet */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black shadow-lg">
              <span className="text-xs uppercase text-amber-400/80">POINTS:</span>
              <span className="text-xl">{battlePoints}</span>
              <span className="text-xs text-amber-400 font-bold">BP</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Purchase Notification Banner */}
        {boughtNotice && (
          <div className="w-full py-2 bg-emerald-600/90 text-white font-mono text-center text-xs font-bold tracking-wider animate-pulse flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            {boughtNotice}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-neutral-950/60 overflow-x-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'weapon', label: 'Weapons' },
            { id: 'armor', label: 'Armor & Helmets' },
            { id: 'ammo', label: 'Ammo Supply' },
            { id: 'meds', label: 'Medical & Boost' },
            { id: 'tactical', label: 'Tactical & UAV' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const canAfford = battlePoints >= item.cost;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-amber-500/40 flex flex-col justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-mono text-sm font-black text-white">{item.name}</h3>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-black border border-amber-500/30 whitespace-nowrap">
                      {item.cost} BP
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 font-sans line-clamp-2">{item.description}</p>

                  {/* Weapon Stats Preview */}
                  {item.statsPreview && (
                    <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-white/10 text-[10px] font-mono text-gray-300">
                      <div>
                        <span className="text-gray-500 block">DMG</span>
                        <span className="font-bold text-amber-400">{item.statsPreview.damage}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">RATE</span>
                        <span className="font-bold text-cyan-400">{item.statsPreview.fireRate}/s</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">MAG</span>
                        <span className="font-bold text-emerald-400">{item.statsPreview.magSize}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">RANGE</span>
                        <span className="font-bold text-purple-400">{item.statsPreview.range}m</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg active:scale-98'
                      : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{canAfford ? 'PURCHASE ITEM' : 'INSUFFICIENT BP'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Earn +150 BP for Kills • +100 BP for Headshots • +200 BP for surviving Blue Zone phases</span>
          <span className="text-amber-400 font-bold">[ESC] / [B] to Close</span>
        </div>
      </div>
    </div>
  );
};
