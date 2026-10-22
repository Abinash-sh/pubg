import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KillFeedEntry, PlayerPUBGState, PUBGWeather, ShopItem, WeaponSlot, WeaponType } from './types/pubg';
import { PubgEngine } from './game/pubg/pubgEngine';
import { PubgHUD } from './components/pubg/PubgHUD';
import { PubgStartModal } from './components/pubg/PubgStartModal';
import { PubgControlsModal } from './components/pubg/PubgControlsModal';
import { PubgVictoryModal } from './components/pubg/PubgVictoryModal';
import { PubgShopModal } from './components/pubg/PubgShopModal';
import { pubgAudio } from './game/pubg/pubgAudio';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PubgEngine | null>(null);

  const [isLobbyOpen, setIsLobbyOpen] = useState(true);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);
  const [endStats, setEndStats] = useState({
    kills: 0,
    headshots: 0,
    damage: 0,
    rank: 1,
    totalPlayers: 25,
  });

  // Default initial player state
  const [playerState, setPlayerState] = useState<PlayerPUBGState | null>(null);

  // Initialize and spawn game engine
  const startMatch = useCallback(
    (
      dropLocation: 'pochinki' | 'military' | 'warehouse' | 'ruins',
      weather: PUBGWeather,
      startingGun: WeaponType
    ) => {
      setIsLobbyOpen(false);
      setIsGameOverModalOpen(false);
      setIsShopOpen(false);
      setKillFeed([]);

      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }

      if (!canvasMountRef.current) return;

      const engine = new PubgEngine(canvasMountRef.current, weather);
      engineRef.current = engine;

      // Position drop based on selected sector
      let dropX = 0;
      let dropZ = 0;
      if (dropLocation === 'pochinki') {
        dropX = -10 + (Math.random() - 0.5) * 40;
        dropZ = -10 + (Math.random() - 0.5) * 40;
      } else if (dropLocation === 'military') {
        dropX = 280 + (Math.random() - 0.5) * 40;
        dropZ = -120 + (Math.random() - 0.5) * 40;
      } else if (dropLocation === 'warehouse') {
        dropX = -260 + (Math.random() - 0.5) * 40;
        dropZ = 240 + (Math.random() - 0.5) * 40;
      } else {
        dropX = -150 + (Math.random() - 0.5) * 30;
        dropZ = -220 + (Math.random() - 0.5) * 30;
      }

      engine.playerPosition.set(dropX, 150, dropZ);

      // Set chosen starting gun
      if (startingGun !== 'M416') {
        engine.collectLootItem({
          id: 'start_w',
          type: 'weapon',
          subType: startingGun,
          name: startingGun,
          amount: 1,
          position: engine.playerPosition,
        });
      }

      engine.onStateUpdate = (st) => {
        setPlayerState(st);
      };

      engine.onOpenShopUI = () => {
        setIsShopOpen((prev) => !prev);
      };

      engine.onKillFeed = (entry) => {
        setKillFeed((prev) => [...prev.slice(-8), entry]);
      };

      engine.onGameOver = (victory, stats) => {
        setIsVictory(victory);
        setEndStats({
          kills: stats.kills,
          headshots: engine.state.headshots,
          damage: stats.damage,
          rank: stats.rank,
          totalPlayers: engine.state.totalPlayers,
        });
        setIsGameOverModalOpen(true);
      };
    },
    []
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    pubgAudio.setMuted(next);
  };

  const handlePlayAgain = () => {
    setIsGameOverModalOpen(false);
    setIsShopOpen(false);
    setIsLobbyOpen(true);
  };

  const handleBuyItem = (item: ShopItem): boolean => {
    if (!engineRef.current) return false;
    return engineRef.current.buyShopItem(item);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={canvasMountRef} className="w-full h-full cursor-crosshair" />

      {/* In-Game Tactical HUD */}
      {!isLobbyOpen && playerState && (
        <PubgHUD
          state={playerState}
          killFeed={killFeed}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onInteract={() => engineRef.current?.handleInteract()}
          onFireTouch={(firing) => {
            if (engineRef.current) engineRef.current.isFiring = firing;
          }}
          onADSTouch={(aiming) => {
            if (engineRef.current) engineRef.current.isAimingADS = aiming;
          }}
          onReload={() => engineRef.current?.startReload()}
          onJump={() => {
            if (
              engineRef.current &&
              engineRef.current.playerPosition.y <=
                engineRef.current.map.getTerrainHeight(
                  engineRef.current.playerPosition.x,
                  engineRef.current.playerPosition.z
                ) + 0.1
            ) {
              engineRef.current.playerVelocity.y = 8.2;
            }
          }}
          onCrouch={() => {
            if (engineRef.current) {
              engineRef.current.state.isCrouching = !engineRef.current.state.isCrouching;
            }
          }}
          onSprintToggle={() => {
            if (engineRef.current) {
              engineRef.current.state.isSprinting = !engineRef.current.state.isSprinting;
            }
          }}
          onSwitchSlot={(slot: WeaponSlot) => engineRef.current?.switchWeaponSlot(slot)}
          onUseMed={(type) => engineRef.current?.useMed(type)}
          onToggleCamera={() => {
            if (engineRef.current) {
              engineRef.current.isFirstPerson = !engineRef.current.isFirstPerson;
            }
          }}
          onOpenControlsHelp={() => setIsControlsOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
          onTouchMove={(x, y) => {
            if (engineRef.current) {
              engineRef.current.touchMoveX = x;
              engineRef.current.touchMoveY = y;
            }
          }}
          onTouchLook={(dx, dy) => {
            engineRef.current?.handleTouchLook(dx, dy);
          }}
        />
      )}

      {/* Tactical Buy Station Shop Modal */}
      <PubgShopModal
        isOpen={isShopOpen}
        battlePoints={playerState?.battlePoints || 0}
        onClose={() => setIsShopOpen(false)}
        onBuyItem={handleBuyItem}
      />

      {/* Start / Deployment Lobby Modal */}
      <PubgStartModal isOpen={isLobbyOpen} onDeploy={startMatch} />

      {/* Controls Help Guide Modal */}
      <PubgControlsModal isOpen={isControlsOpen} onClose={() => setIsControlsOpen(false)} />

      {/* Victory / Defeat Modal */}
      <PubgVictoryModal
        isOpen={isGameOverModalOpen}
        isVictory={isVictory}
        stats={endStats}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
