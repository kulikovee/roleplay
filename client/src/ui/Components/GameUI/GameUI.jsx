import React, { useRef, useState, useEffect, useCallback } from 'react';
import TopRight from './TopRightLabel';
import BottomRight from './BottomRightLabel';
import BottomLeft from './BottomLeftLabel';
import Cursor from './Cursor';
import ActionLabel from './ActionLabel';
import HpBars from './HpBars';
import Pause from './Pause';
import LoadingScreen from './LoadingScreen';
import {
	addPointerLockEvents,
	onPointerLockChange,
	exitPointerLock,
	requestPointerLock
} from '../../Utilities/PointerLocks';

import Renderer from '../../../js/Renderer';
import Scene from '../../../js/Scene';

export default ({ userName, password }) => {
	// Imperative handles that must not trigger re-renders.
	const containerRef = useRef(null);
	const sceneRef = useRef(null);
	const updateCursorRef = useRef(null);
	const updateHpBarsRef = useRef(null);
	const clearHpBarsRef = useRef(() => {});
	const notificationTimeoutRef = useRef(0);

	// Live mirrors of state read synchronously from the game loop / event handlers.
	const pauseRef = useRef(false);
	const isThirdPersonRef = useRef(true);
	const isPointerLockedRef = useRef(false);

	// Rendered state, one setter per value.
	const [isSceneReady, setSceneReady] = useState(false);
	const [pause, setPauseState] = useState(false);
	const [showRestart, setRestartButtonVisible] = useState(false);
	const [notification, setNotificationText] = useState('');
	const [isNotificationVisible, setNotificationVisible] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const [fps, setFps] = useState(0);
	const [targetFps, setTargetFps] = useState(0);
	const [ping, setPing] = useState(0);
	const [connectionRole, setConnectionRole] = useState(null);
	const [isThirdPerson, setIsThirdPerson] = useState(true);
	const [unspentTalents, setUnspentTalents] = useState(0);
	const [level, setLevel] = useState(0);
	const [hp, setHp] = useState(0);
	const [hpMax, setHpMax] = useState(0);
	const [speed, setSpeed] = useState(0);
	const [damage, setDamage] = useState(0);
	const [fireDamage, setFireDamage] = useState(0);
	const [money, setMoney] = useState(0);
	const [experience, setExperience] = useState(0);
	const [levelExperience, setLevelExperience] = useState(0);
	const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
	const [rotation, setRotation] = useState(null);

	const setUpdateCursorRef = useCallback(callback => updateCursorRef.current = callback, []);
	const setUpdateHpBarsRef = useCallback(callback => updateHpBarsRef.current = callback, []);
	const setClearHpBarsRef = useCallback(callback => clearHpBarsRef.current = callback, []);

	const setPause = useCallback((next = !pauseRef.current) => {
		pauseRef.current = next;
		setPauseState(next);

		if (next) {
			exitPointerLock();

			const player = sceneRef.current && sceneRef.current.getPlayer();

			if (player) {
				setRestartButtonVisible(!player.getHP());
			}
		} else if (sceneRef.current.location.isLoaded) {
			requestPointerLock();
		}
	}, []);

	const switchCamera = useCallback(() => {
		const next = !isThirdPersonRef.current;

		isThirdPersonRef.current = next;
		setIsThirdPerson(next);
		sceneRef.current.input.isThirdPerson = next;
		sceneRef.current.camera.update();
	}, []);

	const setFpsAndTarget = useCallback((fps, targetFps) => {
		setFps(fps);
		setTargetFps(targetFps);
	}, []);

	const setNotification = useCallback((notification, timeout = 8000) => {
		if (notificationTimeoutRef.current) {
			clearInterval(notificationTimeoutRef.current);
		}

		notificationTimeoutRef.current = setTimeout(
			() => setNotificationVisible(false),
			timeout,
		);

		setNotificationText(notification);
		setNotificationVisible(true);
	}, []);

	const updatePlayerParams = useCallback(() => {
		const scene = sceneRef.current;

		if (scene) {
			const player = scene.getPlayer();

			if (player) {
				setLevel(player.getLevel());
				setUnspentTalents(player.getUnspentTalents());
				setHp(player.getHP());
				setHpMax(player.getMaxHP());
				setSpeed(player.getSpeed());
				setDamage(player.getDamage());
				setFireDamage(player.getFireDamage());
				setMoney(player.getMoney());
				setExperience(player.getExperience());
				setLevelExperience(player.getLevelExperience());
				setPosition({
					x: player.position.x,
					y: player.position.y,
					z: player.position.z,
				});
				setRotation({
					x: player.rotation.x,
					y: player.rotation.y,
					z: player.rotation.z,
				});
			}
		}
	}, []);

	const buy = useCallback((type) => {
		const player = sceneRef.current.getPlayer();
		const unspentTalents = player.getUnspentTalents();

		switch (type) {
			case 'hp':
				if (player.getMoney() >= 100) {
					player.addMoney(-100);
					player.addHP(player.getMaxHP());
				}
				break;
			case 'talent-hp':
				if (unspentTalents > 0) {
					player.decreaseUnspentTalents();
					player.addMaxHP(10);
				}
				break;
			case 'talent-speed':
				if (unspentTalents > 0) {
					player.decreaseUnspentTalents();
					player.addSpeed(0.05);
				}
				break;
			case 'talent-damage':
				if (unspentTalents > 0) {
					player.decreaseUnspentTalents();
					player.addDamage(5);
				}
				break;
			case 'talent-fire-damage':
				if (unspentTalents > 0) {
					player.decreaseUnspentTalents();
					player.addFireDamage(3);
				}
				break;
			default:
				break;
		}

		updatePlayerParams();
	}, [updatePlayerParams]);

	const restartGame = useCallback(() => {
		sceneRef.current.location.restartLevel();
		sceneRef.current.camera.update();
		clearHpBarsRef.current();
		setRestartButtonVisible(false);
	}, []);

	const reviveHero = useCallback(() => {
		sceneRef.current.location.reviveHero();
		setRestartButtonVisible(false);
		setPause(false);
	}, [setPause]);

	const moveToSpawn = useCallback(() => {
		sceneRef.current.getPlayer().position.set(-58, 0, 106);
		setPause(false);
	}, [setPause]);

	const restartServer = useCallback(() => {
		sceneRef.current.connection.restartServer();
	}, []);

	const update = useCallback(() => {
		const scene = sceneRef.current;

		if (!scene || !scene.input || !scene.getPlayer()) {
			return;
		}

		if (updateCursorRef.current) {
			updateCursorRef.current(scene.input.cursor.x, scene.input.cursor.y);
		}

		if (updateHpBarsRef.current) {
			updateHpBarsRef.current(scene);
		}
	}, []);

	const clearHpBars = useCallback(() => clearHpBarsRef.current(), []);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		THREE.Cache.enabled = true;

		const container = containerRef.current;
		const renderer = new Renderer(container);
		const api = {
			setRestartButtonVisible,
			setPause,
			restartGame,
			isPause: () => pauseRef.current,
			isThirdPerson: () => isThirdPersonRef.current,
			update,
			setConnectionRole,
			updatePlayerParams,
			clearHpBars,
			switchCamera,
			setFps: setFpsAndTarget,
			setPing,
			notify: setNotification,
			setLoading,
		};
		const scene = new Scene(renderer, api);
		const onResize = () => {
			scene.camera.camera.aspect = container.clientWidth / container.clientHeight;
			scene.camera.camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		};
		const nonPauseRequestPointerLock = () => !scene.ui.isPause() && requestPointerLock();

		window.addEventListener('resize', onResize, false);
		document.body.addEventListener('click', nonPauseRequestPointerLock, false);
		addPointerLockEvents({
			onPointerLock: () => onPointerLockChange((isPointerLocked) => {
				if (isPointerLockedRef.current === isPointerLocked) {
					return;
				}

				isPointerLockedRef.current = isPointerLocked;

				if (isPointerLocked) {
					scene.input.cursor.x = scene.input.mouse.x;
					scene.input.cursor.y = scene.input.mouse.y;
				} else {
					setPause(true);
				}
			})
		});

		sceneRef.current = scene;
		scene.setLoggedUser(userName, password);
		setSceneReady(true);

		return () => {
			window.removeEventListener('resize', onResize, false);
			document.body.removeEventListener('click', nonPauseRequestPointerLock, false);
		};
	}, []);

	const scene = sceneRef.current;

	return (
		<div>
			<div ref={containerRef}></div>
			{isSceneReady && (
				<div>
					{!isLoading && <TopRight
						money={money}
						rotation={rotation}
						position={position}
						fps={fps}
						ping={ping}
						targetFps={targetFps}
					/>}
					{!isLoading && <BottomRight
						unspentTalents={unspentTalents}
						level={level}
						experience={experience}
						levelExperience={levelExperience}
					/>}
					{!isLoading && <BottomLeft
						hp={hp}
						hpMax={hpMax}
						speed={speed}
						damage={damage}
						fireDamage={fireDamage}
					/>}
					{!isThirdPerson
						? <Cursor setUpdate={setUpdateCursorRef} />
						: null
					}
					{scene.camera && <HpBars
						setUpdate={setUpdateHpBarsRef}
						setClearHpBars={setClearHpBarsRef}
					/>}
					{notification && <ActionLabel action={notification} isVisible={isNotificationVisible} />}
					{!isLoading && pause && <Pause
						isThirdPerson={isThirdPerson}
						unspentTalents={unspentTalents}
						money={money}
						speed={speed}
						showRestart={showRestart}
						setPause={setPause}
						switchCamera={switchCamera}
						restartServer={restartServer}
						reviveHero={reviveHero}
						moveToSpawn={moveToSpawn}
						buy={buy}
					/>}
					{isLoading && <LoadingScreen />}
				</div>
			)}
		</div>
	);
};
