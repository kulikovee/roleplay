import React, { Component } from 'react';
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

class App extends Component {
	constructor(props) {
		super(props);

		this.initScene = this.initScene.bind(this);
		this.getAPI = this.getAPI.bind(this);
		this.update = this.update.bind(this);
		this.setPause = this.setPause.bind(this);
		this.switchCamera = this.switchCamera.bind(this);
		this.buy = this.buy.bind(this);
		this.setRestartButtonVisible = this.setRestartButtonVisible.bind(this);
		this.reviveHero = this.reviveHero.bind(this);
		this.takeHost = this.takeHost.bind(this);
		this.restartServer = this.restartServer.bind(this);
		this.updatePlayerParams = this.updatePlayerParams.bind(this);
		this.setFps = this.setFps.bind(this);
		this.setPing = this.setPing.bind(this);
		this.setNotification = this.setNotification.bind(this);
		this.setConnectionRole = this.setConnectionRole.bind(this);
		this.setLoading = this.setLoading.bind(this);
		this.render = this.render.bind(this);
		this.clearHpBars = () => {
		};

		this.state = {
			// UI
			pause: false,
			showRestart: false,
			notification: '',
			isNotificationVisible: false,
			isLoading: false,

			// Renderer
			fps: 0,
			targetFps: 0,

			// Input
			isPointerLocked: false,

			// Connection
			connectionRole: null,

			// Camera
			isThirdPerson: true,

			// Player
			unspentTalents: 0,
			hp: 0,
			hpMax: 0,
			speed: 0,
			damage: 0,
			money: 0,
			experience: 0,
			levelExperience: 0,
			position: { x: 0, y: 0, z: 0 },
			render: 0,
		};

		this.container = React.createRef();
	}

	componentDidMount() {
		this.initScene();
	}

	initScene() {
		if (this.container.current) {
			console.log({ THREE });
			// THREE.Cache.enabled = true;

			const container = this.container.current,
				renderer = new Renderer(container),
				scene = new Scene(renderer, this.getAPI()),
				onResize = () => {
					scene.camera.camera.aspect = container.clientWidth / container.clientHeight;
					scene.camera.camera.updateProjectionMatrix();
					renderer.setSize(container.clientWidth, container.clientHeight);
				},
				nonPauseRequestPointerLock = () => !scene.ui.isPause() && requestPointerLock();

			window.addEventListener('resize', onResize, false);
			document.body.addEventListener('click', nonPauseRequestPointerLock, false);
			addPointerLockEvents({
				onPointerLock: () => onPointerLockChange((isPointerLocked) => {
					if (this.state.isPointerLocked === isPointerLocked) {
						return;
					}

					this.setState({ isPointerLocked });

					if (isPointerLocked) {
						this.scene.input.cursor.x = this.scene.input.mouse.x;
						this.scene.input.cursor.y = this.scene.input.mouse.y;
					} else {
						this.setPause(true);
					}
				})
			});

			/**
			 * @type {Scene}
			 */
			this.scene = scene;
			this.scene.setLoggedUser(this.props.userName, this.props.password);
		}
	}

	getAPI() {
		return {
			setRestartButtonVisible: this.setRestartButtonVisible,
			setPause: this.setPause,
			restartGame: this.restartGame,
			isPause: () => this.state.pause,
			isThirdPerson: () => this.state.isThirdPerson,
			update: this.update,
			setConnectionRole: this.setConnectionRole,
			updatePlayerParams: this.updatePlayerParams,
			clearHpBars: this.clearHpBars,
			switchCamera: this.switchCamera,
			setFps: this.setFps,
			setPing: this.setPing,
			notify: this.setNotification,
			setLoading: this.setLoading,
		};
	}

	update() {
		if (!this.scene || !this.scene.input || !this.scene.getPlayer()) {
			return;
		}

		if (this.updateCursor) {
			this.updateCursor();
		}

		if (this.updateHpBars) {
			this.updateHpBars();
		}
	}

	setLoading(isLoading) {
		this.setState({ isLoading });
	}

	setFps(fps, targetFps) {
		this.setState({ fps, targetFps });
	}

	setPing(ping) {
		this.setState({ ping });
	}

	setConnectionRole(connectionRole) {
		this.setState({ connectionRole });
	}

	setPause(pause = !this.state.pause) {
		this.setState({ pause });

		if (pause) {
			exitPointerLock();

			const player = this.scene && this.scene.getPlayer();

			if (player) {
				this.setRestartButtonVisible(!player.getHP());
			}
		} else {
			requestPointerLock();
		}
	}

	switchCamera() {
		const { isThirdPerson } = this.state;

		this.setState({ isThirdPerson: !isThirdPerson });
		this.scene.input.isThirdPerson = !isThirdPerson;
		this.scene.camera.update();
	}

	setNotification(notification) {
		this.setState({ notification, isNotificationVisible: true });

		setTimeout(() => this.setState({ isNotificationVisible: false }), 8000);
	}

	buy(type) {
		const player = this.scene.getPlayer();
		const unspentTalents = player.getUnspentTalents();

		switch (type) {
			case 'hp':
				if (player.getMoney() >= 100) {
					player.addMoney(-100);
					player.addHP(10);
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
			case 'god-hp':
				player.addMaxHP(9999);

				break;
			case 'god-lvl':
				player.addExperience(player.getLevelExperience() - player.getExperience());

				break;
			default:
				break;
		}

		this.updatePlayerParams();
	}

	updatePlayerParams() {
		if (this.scene) {
			const player = this.scene.getPlayer();

			if (player) {
				this.setState({
					level: player.getLevel(),
					unspentTalents: player.getUnspentTalents(),
					hp: player.getHP(),
					hpMax: player.getMaxHP(),
					speed: player.getSpeed(),
					damage: player.getDamage(),
					money: player.getMoney(),
					experience: player.getExperience(),
					levelExperience: player.getLevelExperience(),
					position: {
						x: player.position.x,
						y: player.position.y,
						z: player.position.z,
					},
				});
			}
		}
	}

	setRestartButtonVisible(showRestart) {
		this.setState({ showRestart });
	}

	restartGame() {
		this.scene.location.restartLevel();
		this.scene.camera.update();
		this.clearHpBars();
		this.setState({ showRestart: false });
	}

	reviveHero() {
		this.scene.location.reviveHero();
		this.setState({ showRestart: false });
		this.setPause(false);
	}

	takeHost() {
		this.scene.connection.takeHost();
	}

	restartServer() {
		this.scene.connection.restartServer();
	}

	render() {
		const {
			hp,
			hpMax,
			speed,
			damage,
			pause,
			money,
			unspentTalents,
			showRestart,
			level,
			experience,
			levelExperience,
			isThirdPerson,
			ping,
			fps,
			targetFps,
			position,
			notification,
			isNotificationVisible,
			isLoading,
			connectionRole,
		} = this.state;

		const isClient = connectionRole === 'client';

		return (
			<div>
				<div ref={this.container}></div>
				{this.scene && (
					<div>
						{!isLoading && <TopRight
							money={money}
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
						/>}
						{!isThirdPerson
							? <Cursor scene={this.scene} setUpdate={callback => this.updateCursor = callback} />
							: null
						}
						{this.scene.camera && <HpBars
							scene={this.scene}
							camera={this.scene.camera.camera}
							toScreenPosition={this.scene.camera.toScreenPosition}
							setUpdate={callback => this.updateHpBars = callback}
							setClearHpBars={callback => this.clearHpBars = callback}
						/>}
						{notification && <ActionLabel action={notification} isVisible={isNotificationVisible} />}
						{!isLoading && pause && <Pause
							isThirdPerson={isThirdPerson}
							isClient={isClient}
							unspentTalents={unspentTalents}
							money={money}
							showRestart={showRestart}
							setPause={this.setPause}
							switchCamera={this.switchCamera}
							takeHost={this.takeHost}
							restartServer={this.restartServer}
							reviveHero={this.reviveHero}
							buy={this.buy}
						/>}
						{isLoading && <LoadingScreen />}
					</div>
				)}
			</div>
		);
	}
}

export default App;