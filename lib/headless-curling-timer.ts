import { SuperCountdown } from "@trevorsg/super-timer";

/**
 * A thinking time block represents an amount of thinking time
 * that will apply to a range of ends. For example, in the common
 * case, 38 minutes of thinking time is given for the range of
 * end 1 through end 10. However, some tournaments may have
 * "per-end" thinking time, where a "block" may represent only a
 * single end.
 *
 * In the first case, CurlingTimerSettings would specify an array
 * containing only one ThinkingTimeBlock, with startEnd=1,
 * endEnd=10, and thinkingTime=38*60.
 *
 * In the second case, CurlingTimerSettings would specify an array
 * containing 10 ThinkingTimeBlocks, each with startEnd=endEnd=i,
 * and thinkingTime=n, where n may be 240 (4 minutes) for the first
 * 5 ends and 255 (4 minutes 15 seconds) for the last 5 ends.
 */
export interface ThinkingTimeBlock {
	/**
	 * The first end this block applies to.
	 */
	startEnd: number;

	/**
	 * The last end this block applies to.
	 */
	endEnd: number;

	/**
	 * The full amount of thinking time given for this block.
	 */
	thinkingTime: number;
}

/**
 * These settings are the parameters of a curling match. All time values
 * are given in seconds.
 */
export interface CurlingTimerSettings {
	/**
	 * Whether or not extra ends may be started
	 */
	allowExtraEnd: boolean;

	/**
	 * Coach travel time when the playing area is at the away
	 * end. This time is effectively added to timeout time.
	 */
	awayTravelTime: number;

	/**
	 * Time between ends.
	 */
	betweenEndTime: number;

	/**
	 * The official WCF software for curling timing has a few bugs where extra
	 * seconds are given here and there. This setting emulates those bugs by
	 * adding 1 second to each of the following:
	 * - Between-end break time
	 * - Midgame break time
	 * - Prep time
	 * - Travel time (both home and away)
	 * - Timeout time
	 */
	emulateWcfCurlTime: boolean;

	/**
	 * Number of ends in the game.
	 */
	endCount: number;

	/**
	 * Amount of thinking time for each team for any extra
	 * ends played.
	 */
	extraEndTime: number;

	/**
	 * Number of timeouts allowed per team per extra end.
	 */
	extraEndTimeoutCount: number;

	/**
	 * Coach travel time when the playing area is at the home
	 * end. This time is effectively added to timeout time.
	 */
	homeTravelTime: number;

	/**
	 * Amount of time given to throw the LSD (last stone draw).
	 */
	lsdTime: number;

	/**
	 * End number after which the midgame break occurs.
	 */
	midgameBreakAfterEnd: number;

	/**
	 * Amount of time given for the midgame break.
	 */
	midgameBreakTime: number;

	/**
	 * Amount of time given for practice. Not to be confused
	 * with pre-game warmup time.
	 */
	practiceTime: number;

	/**
	 * Amount of time given after the between-ends or midgame break
	 * to prepare for and deliver the first stone of the next end.
	 */
	prepTime: number;

	/**
	 * Number of stones per end.
	 */
	stonesPerEnd: number;

	/**
	 * Array of thinking time blocks. See ThinkingTimeBlock for more
	 * info. If set to "track-only", timers will count up instead of
	 * down, and is intended for use in practice/informational purposes.
	 *
	 * The array of ThinkingTimeBlock must satisfy:
	 *   - The first block must start at end 1.
	 *   - The last block must end at the last end.
	 *   - Each end is accounted for in exactly one of the blocks.
	 */
	thinkingTimeBlocks: ThinkingTimeBlock[] | "track-only";

	/**
	 * Number of timeouts allowed per team per game.
	 */
	timeoutCount: number;

	/**
	 * Amount of time given for each timeout.
	 */
	timeoutTime: number;

	/**
	 * Amount of time given for the pre-game warmup.
	 */
	warmupTime: number;

	/**
	 * Multiplier for the speed of the timers. For example, a value of 2
	 * would cause the timers to run twice as fast as normal. A value of
	 * 0.5 would cause the timers to run at half speed.
	 *
	 * This should only intended to be used for testing purposes!
	 *
	 * If a value other than 1.0 is used, a console message will be printed
	 * to indicate that the timers are running at a non-standard speed.
	 *
	 * @default 1.0
	 */
	timerSpeedMultiplier?: number;
}

export interface CurlingTimerState {
	/**
	 * String representing the current mode of the timer. Modes include:
	 * "idle": - Base state when no functions are being used.
	 * "practice": Sanctioned practice time for an event.
	 * "warmup": Pre-game warmup time.
	 * "lsd": Draw to the button for determination of hammer.
	 * "game": Any part of the game play.
	 */
	mode: CurlingTimerMode;

	/**
	 * String representing the current state of the game. Only used when
	 * mode="game", otherwise null. States include:
	 *
	 * "thinking": A team's thinking time clock is running
	 * "idle": Game is in progress but no clocks are currently running
	 * "home-travel": Travel time for the home-end
	 * "away-travel": Travel time for the away-end
	 * "timeout": The normal part of a timeout is running
	 * "between-ends": The between-end break is running
	 * "prep": The timer before the first stone of the end is running
	 * "midgame-break": The midgame break is running
	 */
	gameState: CurlingTimerGameState | null;

	/**
	 * Represents the current end. May exceed the number of ends in the game
	 * in the event of extra ends.
	 */
	end: number;

	/**
	 * The thinking time remaining, in milliseconds, for team 1.
	 * If thinkingTimeBlocks is "track-only", this is the total elapsed
	 * thinking time for team1 (rather than time remaining).
	 */
	team1Time: number;

	/**
	 * The thinking time remaining, in milliseconds, for team 2.
	 * If thinkingTimeBlocks is "track-only", this is the total elapsed
	 * thinking time for team1 (rather than time remaining).
	 */
	team2Time: number;

	/**
	 * The time remaining, in milliseconds, for the global timer. This timer is
	 * used for everything except thinking time (breaks, timeouts, etc.)
	 */
	globalTime: number;

	/**
	 * Number of remaining timeouts for team 1.
	 */
	team1Timeouts: number;

	/**
	 * Number of remaining timeouts for team 2.
	 */
	team2Timeouts: number;

	/**
	 * Indicates which team, if any, is currently in a timeout.
	 */
	teamTimedOut: 1 | 2 | null;

	/**
	 * Indicates which team, if any, is currently using thinking time or a timeout,
	 * or which team will resume thinking when calling unpause() after pause().
	 */
	teamThinking: 1 | 2 | null;

	/**
	 * Indicates whether the thinking time clock for team 1 is running. This
	 * value should almost always agree with teamThinking, except when a timeout
	 * is in progress (in which case, the team thinking is still set but their
	 * timer will not be running).
	 */
	team1TimerRunning: boolean;

	/**
	 * Indicates whether the thinking time clock for team 2 is running. This
	 * value should almost always agree with teamThinking, except when a timeout
	 * is in progress (in which case, the team thinking is still set but their
	 * timer will not be running).
	 */
	team2TimerRunning: boolean;

	/**
	 * Indicates whether the global time clock is running.
	 */
	globalTimerRunning: boolean;

	/**
	 * Indicates the stone that Team 1 is on. This value advances when Team 1
	 * starts its thinking time for that stone. For example, before the end
	 * begins, this value is null. When Team 1 starts its first thinking time
	 * of the end, this value updates to 1 to indicate they are thinking for
	 * Stone #1 of the end.
	 */
	currentTeam1Stone: number | null;

	/**
	 * Indicates the stone that Team 2 is on. This value advances when Team 2
	 * starts its thinking time for that stone. For example, before the end
	 * begins, this value is null. When Team 2 starts its first thinking time
	 * of the end, this value updates to 1 to indicate they are thinking for
	 * Stone #1 of the end.
	 */
	currentTeam2Stone: number | null;

	/**
	 * Similar to teamThinking, but doesn't get cleared when the team has stopped
	 * using thinking time.
	 */
	lastThinkingTeam: 1 | 2 | null;

	/**
	 * The team that has the hammer for the current end. This value is set manually
	 * and cleared at the end of the end.
	 */
	hammerTeam: 1 | 2 | null;

	/**
	 * The settings that were used to create this timer. This is a reference
	 * to the same object that was passed into the Timer constructor.
	 */
	settings: CurlingTimerSettings;

	/**
	 * A snapshot of the full game state taken at the conclusion of each end.
	 */
	endSnapshots: CurlingTimerState[] | undefined;

	/**
	 * Indicates whether the game has started. The game is not considered to have
	 * started until a timer has been run. If timers are reset to initial values
	 * (and the end and stones are all reset back to initial states), we will
	 * also consider the game not to have started.
	 *
	 * Practice, Warmup, and LSD periods are not considered to be part of the game.
	 */
	gameHasStarted: boolean;

	/**
	 * The time in milliseconds that Team 1 has spent on their current (or most recent)
	 * shot. If the same team's thinking time is stopped and resumed, the total
	 * consumed time is counted in the shot clock.
	 */
	team1ShotClockTime: number;

	/**
	 * The time in milliseconds that Team 2 has spent on their current (or most recent)
	 * shot. If the same team's thinking time is stopped and resumed, the total
	 * consumed time is counted in the shot clock.
	 */
	team2ShotClockTime: number;

	/**
	 * Indicates whether the game is paused. When the game is paused, the only next
	 * legal action is to unpause the game. Just because timers are not running
	 * does not mean the game is paused.
	 *
	 * The game can only enter a paused state if a timer is currently running.
	 */
	paused: boolean;
}

export interface BasicTimerSettings {
	/**
	 * Total time, in seconds, for the timer to run.
	 */
	totalTime: number;

	/**
	 * Multiplier for the speed of the timers. For example, a value of 2
	 * would cause the timers to run twice as fast as normal. A value of
	 * 0.5 would cause the timers to run at half speed.
	 *
	 * This should only intended to be used for testing purposes!
	 *
	 * If a value other than 1.0 is used, a console message will be printed
	 * to indicate that the timers are running at a non-standard speed.
	 *
	 * @default 1.0
	 */
	timerSpeedMultiplier?: number;
}

const basic10EndSettings: BasicTimerSettings = {
	totalTime: 2.5 * 60 * 60,
	timerSpeedMultiplier: 1.0,
};

const basic8EndSettings: BasicTimerSettings = {
	totalTime: 2 * 60 * 60,
	timerSpeedMultiplier: 1.0,
};

const basic6EndSettings: BasicTimerSettings = {
	totalTime: 1.5 * 60 * 60,
	timerSpeedMultiplier: 1.0,
};

const basicMixedDoublesSettings: BasicTimerSettings = {
	totalTime: 1.5 * 60 * 60,
	timerSpeedMultiplier: 1.0,
};

const wcf10EndStandardSettings: CurlingTimerSettings = {
	allowExtraEnd: true,
	awayTravelTime: 75,
	betweenEndTime: 60,
	emulateWcfCurlTime: true,
	endCount: 10,
	extraEndTime: 4 * 60 + 30,
	extraEndTimeoutCount: 1,
	homeTravelTime: 45,
	lsdTime: 60,
	midgameBreakAfterEnd: 5,
	midgameBreakTime: 5 * 60,
	practiceTime: 30 * 60,
	prepTime: 10,
	stonesPerEnd: 8,
	thinkingTimeBlocks: [{ startEnd: 1, endEnd: 10, thinkingTime: 38 * 60 }],
	timeoutCount: 1,
	timeoutTime: 60,
	warmupTime: 9 * 60,
	timerSpeedMultiplier: 1.0,
};

const wcf8EndStandardSettings: CurlingTimerSettings = {
	allowExtraEnd: true,
	awayTravelTime: 75,
	betweenEndTime: 60,
	emulateWcfCurlTime: true,
	endCount: 8,
	extraEndTime: 4 * 60 + 30,
	extraEndTimeoutCount: 1,
	homeTravelTime: 45,
	lsdTime: 60,
	midgameBreakAfterEnd: 4,
	midgameBreakTime: 5 * 60,
	practiceTime: 30 * 60,
	prepTime: 10,
	stonesPerEnd: 8,
	thinkingTimeBlocks: [{ startEnd: 1, endEnd: 8, thinkingTime: 30 * 60 }],
	timeoutCount: 1,
	timeoutTime: 60,
	warmupTime: 9 * 60,
	timerSpeedMultiplier: 1.0,
};

const wcfMixedDoublesStandardSettings: CurlingTimerSettings = {
	allowExtraEnd: true,
	awayTravelTime: 75,
	betweenEndTime: 90,
	emulateWcfCurlTime: true,
	endCount: 8,
	extraEndTime: 3 * 60,
	extraEndTimeoutCount: 1,
	homeTravelTime: 45,
	lsdTime: 60,
	midgameBreakAfterEnd: 4,
	midgameBreakTime: 5 * 60,
	practiceTime: 30 * 60,
	prepTime: 10,
	stonesPerEnd: 5,
	thinkingTimeBlocks: [{ startEnd: 1, endEnd: 8, thinkingTime: 22 * 60 }],
	timeoutCount: 1,
	timeoutTime: 60,
	warmupTime: 7 * 60,
	timerSpeedMultiplier: 1.0,
};

export type StandardConfigName = "10end" | "8end" | "doubles";
export type BasicConfigNAme = "10end" | "8end" | "6end" | "doubles";

/**
 * Gets one of the built-in configurations for a standard timer
 * @param configName
 * @returns
 */
export function getStandardConfig(configName: StandardConfigName): CurlingTimerSettings {
	let result: CurlingTimerSettings;
	switch (configName) {
		case "10end":
			result = wcf10EndStandardSettings;
			break;
		case "8end":
			result = wcf8EndStandardSettings;
			break;
		case "doubles":
			result = wcfMixedDoublesStandardSettings;
			break;
	}
	return JSON.parse(JSON.stringify(result));
}

/**
 * Gets one of the built-in configurations for a basic timer
 * @param configName
 * @returns
 */
export function getBasicConfig(configName: BasicConfigNAme): BasicTimerSettings {
	let result: BasicTimerSettings;
	switch (configName) {
		case "10end":
			result = basic10EndSettings;
			break;
		case "8end":
			result = basic8EndSettings;
			break;
		case "6end":
			result = basic6EndSettings;
			break;
		case "doubles":
			result = basicMixedDoublesSettings;
			break;
	}
	return JSON.parse(JSON.stringify(result));
}

const TRACK_TIME = Math.round(Number.MAX_SAFE_INTEGER / 10000) * 1000;

export class BasicTimer {
	private _timer: SuperCountdown;
	private disposed: boolean = false;

	constructor(settings: BasicTimerSettings, onCompletion: () => void) {
		if (settings.timerSpeedMultiplier !== 1.0 && !isBunTestEnv()) {
			console.warn(
				"WARNING: The setting `timerSpeedMultiplier` is set to " +
					settings.timerSpeedMultiplier +
					". The clocks will not run at the normal speed!",
			);
		}
		this._timer = new SuperCountdown(settings.totalTime * milliseconds, onCompletion, {
			timerSpeedMultiplier: settings.timerSpeedMultiplier,
		});
	}

	public get timer() {
		return this._timer;
	}

	public start() {
		this._timer.start();
	}

	public pause() {
		this._timer.pause();
	}

	public addTime(sec: number) {
		this._timer.addTime(sec * milliseconds);
	}

	public dispose() {
		this._timer.dispose();
		this.disposed = true;
	}

	public isDisposed() {
		return this.disposed;
	}
}

function validateThinkingTimeBlocks(blocks: ThinkingTimeBlock[] | "track-only", numEnds: number) {
	if (blocks === "track-only") {
		return;
	}
	if (blocks.length === 0) {
		throw new Error("Thinking time blocks cannot be empty");
	}
	if (blocks[0].startEnd !== 1) {
		throw new Error("First thinking time block must start at end 1");
	}
	if (blocks[blocks.length - 1].endEnd !== numEnds) {
		throw new Error("Last thinking time block must end at end " + numEnds);
	}
	let nextEnd = 1;
	for (const block of blocks) {
		if (block.startEnd !== nextEnd) {
			throw new Error("Thinking time blocks must be contiguous and span the full range of ends.");
		}
		nextEnd = block.endEnd + 1;
	}
}

export type CurlingTimerMode = "idle" | "practice" | "warmup" | "lsd" | "game";
export type CurlingTimerGameState =
	| "thinking"
	| "idle"
	| "home-travel"
	| "away-travel"
	| "timeout"
	| "between-ends"
	| "prep"
	| "midgame-break";

const milliseconds = 1000;

export class CurlingTimer {
	private readonly team1Timer: SuperCountdown;
	private readonly team2Timer: SuperCountdown;
	private readonly globalTimer: SuperCountdown;
	private end: number;
	private team1Timeouts: number;
	private team2Timeouts: number;
	private settings: CurlingTimerSettings;
	private mode: CurlingTimerMode;
	private gameState: CurlingTimerGameState | null;
	private teamTimedOut: 1 | 2 | null;
	private teamThinking: 1 | 2 | null;
	private currentTeam1Stone: number | null = null;
	private currentTeam2Stone: number | null = null;
	private lastThinkingTeam: 1 | 2 | null = null;
	private hammerTeam: 1 | 2 | null = null;
	private eventListeners: Map<string, ((state: CurlingTimerState) => void)[]> = new Map();
	private batchedStateChangeCount: number = 0;
	private stateChangeBatchDepth: number = 0;
	private endSnapshots: CurlingTimerState[] = [];
	private team1LastTurnTime: number = 0;
	private team2LastTurnTime: number = 0;
	private lastTeamThinking: 1 | 2 | null = null;
	private paused: boolean = false;

	constructor(settings: CurlingTimerSettings) {
		const _settings = structuredClone(settings);
		if (_settings.timerSpeedMultiplier !== 1.0 && !isBunTestEnv()) {
			console.warn(
				"WARNING: The setting `timerSpeedMultiplier` is set to " +
					_settings.timerSpeedMultiplier +
					". The clocks will not run at the normal speed!",
			);
		}

		validateThinkingTimeBlocks(_settings.thinkingTimeBlocks, _settings.endCount);
		this.team1Timer = new SuperCountdown(10, this.countdownComplete.bind(this), {
			timerSpeedMultiplier: _settings.timerSpeedMultiplier,
		});
		this.team2Timer = new SuperCountdown(10, this.countdownComplete.bind(this), {
			timerSpeedMultiplier: _settings.timerSpeedMultiplier,
		});
		this.globalTimer = new SuperCountdown(10, this.countdownComplete.bind(this), {
			timerSpeedMultiplier: _settings.timerSpeedMultiplier,
		});
		this.team1Timeouts = _settings.timeoutCount;
		this.team2Timeouts = _settings.timeoutCount;
		this.settings = _settings;
		this.end = 0;
		this.mode = "idle";
		this.gameState = null;
		this.teamTimedOut = null;
		this.teamThinking = null;
	}

	private getTimerDuration(
		event:
			| "away-travel"
			| "between-ends"
			| "extra-end"
			| "home-travel"
			| "lsd"
			| "midgame-break"
			| "practice"
			| "prep"
			| "timeout"
			| "warmup",
	) {
		const wcfComp = this.settings.emulateWcfCurlTime ? 1000 : 0;
		switch (event) {
			case "away-travel":
				return this.settings.awayTravelTime * milliseconds + wcfComp;
			case "between-ends":
				return this.settings.betweenEndTime * milliseconds + wcfComp;
			case "extra-end":
				return this.settings.extraEndTime * milliseconds;
			case "home-travel":
				return this.settings.homeTravelTime * milliseconds + wcfComp;
			case "lsd":
				return this.settings.lsdTime * milliseconds;
			case "midgame-break":
				return this.settings.midgameBreakTime * milliseconds + wcfComp;
			case "practice":
				return this.settings.practiceTime * milliseconds;
			case "prep":
				return this.settings.prepTime * milliseconds + wcfComp;
			case "timeout":
				return this.settings.timeoutTime * milliseconds + wcfComp;
			case "warmup":
				return this.settings.warmupTime * milliseconds;
		}
	}

	private beginStateChangeBatch() {
		this.stateChangeBatchDepth++;
		if (this.batchedStateChangeCount === 0) {
			this.batchedStateChangeCount = 1;
		}
	}

	private endStateChangeBatch() {
		this.stateChangeBatchDepth--;
		if (this.stateChangeBatchDepth <= 0) {
			if (this.batchedStateChangeCount > 0) {
				this.fireEventListeners("statechange");
			}
			this.batchedStateChangeCount = 0;
		}
		if (this.stateChangeBatchDepth < 0) {
			this.stateChangeBatchDepth = 0;
		}
	}

	private countdownComplete() {
		this.fireEventListeners("countdowncomplete");
	}

	private triggerStateChange() {
		// If we're not in a batch just fire the listeners
		if (this.batchedStateChangeCount === 0) {
			this.fireEventListeners("statechange");
		}

		// Otherwise add to the batch and move on
		this.batchedStateChangeCount++;
	}

	private fireEventListeners(eventName: string) {
		setImmediate(() => {
			const listeners = this.eventListeners.get(eventName);
			if (listeners) {
				for (const listener of listeners) {
					listener(this.getFullState());
				}
			}
		});
	}

	private gameHasStarted() {
		if (this.mode !== "game") {
			return false;
		}
		if (this.end === 0) {
			return false;
		}
		if (this.end > 1) {
			return true;
		}
		if (this.currentTeam1Stone !== null || this.currentTeam2Stone !== null) {
			return true;
		}
		const thinkingTimeBlock = this.getCurrentThinkingTimeBlock();
		const thinkingTime = thinkingTimeBlock ? thinkingTimeBlock.thinkingTime : TRACK_TIME / 1000;
		if (this.getThinkingTime(1) !== thinkingTime * milliseconds) {
			return true;
		}
		if (this.getThinkingTime(2) !== thinkingTime * milliseconds) {
			return true;
		}
		return false;
	}

	private getThinkingTime(team: 1 | 2) {
		const timer = team === 1 ? this.team1Timer : this.team2Timer;
		return this.mode === "game"
			? this.settings.thinkingTimeBlocks === "track-only"
				? TRACK_TIME - timer.getTimeRemaining()
				: timer.getTimeRemaining()
			: 0;
	}

	private getCurrentThinkingTimeBlock() {
		if (this.settings.thinkingTimeBlocks === "track-only") {
			return null;
		}
		for (const block of this.settings.thinkingTimeBlocks) {
			if (block.startEnd <= this.end && block.endEnd >= this.end) {
				return block;
			}
		}
		return null;
	}

	private getThinkingTimers(team?: 1 | 2) {
		const currentTeam = team ?? this.teamThinking;
		if (!currentTeam) {
			throw new Error("No team is thinking");
		}
		const timer = currentTeam === 1 ? this.team1Timer : this.team2Timer;
		const otherTimer = currentTeam === 1 ? this.team2Timer : this.team1Timer;
		return { timer, otherTimer };
	}

	private getTimer(name?: "team1" | "team2" | "global") {
		if (name) {
			if (name === "team1") {
				return this.team1Timer;
			} else if (name === "team2") {
				return this.team2Timer;
			} else if (name === "global") {
				return this.globalTimer;
			}
		}
		if (this.mode !== "game") {
			if (this.mode === "idle") {
				return undefined;
			} else {
				return this.globalTimer;
			}
		} else {
			if (this.gameState === "thinking") {
				return this.getThinkingTimers().timer;
			}
			if (this.gameState !== "idle") {
				return this.globalTimer;
			}
		}
		return undefined;
	}

	private setMode(mode: CurlingTimerMode) {
		this.paused = false;
		if (this.mode === mode) {
			return;
		}

		this.mode = mode;
		if (mode === "game") {
			this.gameState = "idle";
		} else {
			this.gameState = null;
		}
		this.triggerStateChange();
	}

	private setGameState(gameState: CurlingTimerGameState | null) {
		this.paused = false;
		if (this.mode !== "game" || gameState === null || this.gameState === gameState) {
			return;
		}

		this.gameState = gameState;
		this.triggerStateChange();
	}

	private pauseAllTimers() {
		this.team1Timer.pause();
		this.team2Timer.pause();
		this.globalTimer.pause();
	}

	public get timers() {
		return { team1Timer: this.team1Timer, team2Timer: this.team2Timer, globalTimer: this.globalTimer };
	}

	/**
	 * Add an event listener for the given event name. The callback will be called
	 * with the current state of the timer after the event occurs.
	 *
	 * "statechange" happens when state.mode changes or state.gameState changes.
	 * "countdowncomplete" happens when any timer completes. Inspect the state to
	 * find out which timer completed.
	 *
	 * @param eventName
	 * @param callback
	 */
	public addEventListener(
		eventName: "statechange" | "countdowncomplete",
		callback: (state: CurlingTimerState) => void,
	) {
		this.eventListeners.set(eventName, [...(this.eventListeners.get(eventName) ?? []), callback]);
	}

	/**
	 * Disposes all timers and prevents any further callbacks. This object cannot be
	 * used after calling this function.
	 */
	public dispose() {
		this.team1Timer.dispose();
		this.team2Timer.dispose();
		this.globalTimer.dispose();
		this.fireEventListeners("dispose");
	}

	/**
	 * Starts the practice period.
	 */
	public startPractice() {
		try {
			this.beginStateChangeBatch();
			this.setMode("practice");
			this.setGameState(null);
			this.pauseAllTimers();
			this.globalTimer.setTimeRemaining(this.getTimerDuration("practice"));
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Starts the warm-up period.
	 */
	public startWarmup() {
		try {
			this.beginStateChangeBatch();
			this.setMode("warmup");
			this.setGameState(null);
			this.pauseAllTimers();
			this.globalTimer.setTimeRemaining(this.getTimerDuration("warmup"));
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Starts the timer for the last stone draw.
	 */
	public startLsd() {
		try {
			this.beginStateChangeBatch();
			this.setMode("lsd");
			this.setGameState(null);
			this.pauseAllTimers();
			this.globalTimer.setTimeRemaining(this.getTimerDuration("lsd"));
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Starts the game by setting all the clocks and other state to their initial
	 * values.
	 */
	public startGame(hammerTeam?: 1 | 2) {
		try {
			this.beginStateChangeBatch();
			this.setMode("game");
			this.pauseAllTimers();
			this.end = 1;
			this.currentTeam1Stone = null;
			this.currentTeam1Stone = null;
			this.hammerTeam = hammerTeam ?? null;
			const thinkingTimeBlock = this.getCurrentThinkingTimeBlock();
			const thinkingTime = thinkingTimeBlock ? thinkingTimeBlock.thinkingTime : TRACK_TIME / 1000;
			this.team1Timer.setTimeRemaining(thinkingTime * milliseconds);
			this.team2Timer.setTimeRemaining(thinkingTime * milliseconds);
			this.team1LastTurnTime = thinkingTime * milliseconds;
			this.team2LastTurnTime = thinkingTime * milliseconds;
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Pause whatever timer is currently running. Does NOT change the game state.
	 * Invariant: calling unpause() after pause() (assuming no intervening calls)
	 * will resume the same timer.
	 */
	public pause() {
		if (
			this.globalTimer.getState().isPaused &&
			this.team1Timer.getState().isPaused &&
			this.team2Timer.getState().isPaused
		) {
			return;
		}
		try {
			this.beginStateChangeBatch();
			this.pauseAllTimers();
			this.paused = true;
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Unpauses whatever timer is relevant to the current game state. Game
	 * must currently be paused.
	 */
	public unpause() {
		const timer = this.getTimer();
		if (timer) {
			try {
				this.beginStateChangeBatch();
				timer.unpause();
			} finally {
				this.endStateChangeBatch();
			}
		}
		this.paused = false;
	}

	/**
	 * Starts the thinking time clock for the given team. This function also
	 * advances stone counts. This should be called as soon as rocks come to
	 * rest and players yield the ice to the team whose clock is starting.
	 * @param team
	 */
	public startThinking(team: 1 | 2) {
		if (this.paused) {
			return;
		}
		if (this.mode === "game") {
			try {
				this.beginStateChangeBatch();
				this.setGameState("thinking");
				this.teamThinking = team;
				if (team !== this.lastTeamThinking) {
					this.lastTeamThinking = team;
					if (team === 1) {
						this.team1LastTurnTime = this.getThinkingTime(1);
					}
					if (team === 2) {
						this.team2LastTurnTime = this.getThinkingTime(2);
					}
				}
				const { timer, otherTimer } = this.getThinkingTimers(team);
				otherTimer.pause();
				this.globalTimer.pause();
				timer.start();

				// If the hammer team is set, this is the first thinking time of the end,
				// and the team thinking is the hammer team, then advance the stone count
				// of the non-hammer team (since they have already thrown for the end
				// without using any thinking time).
				if (
					this.hammerTeam !== null &&
					this.currentTeam1Stone === null &&
					this.currentTeam2Stone === null &&
					this.hammerTeam === team
				) {
					if (this.hammerTeam === 1) {
						this.currentTeam2Stone = 1;
					} else {
						this.currentTeam1Stone = 1;
					}
				}

				// Unless this is a restart of the most recent throwing team's thinking
				// time, advance the stone count.
				if (team === 1 && this.lastThinkingTeam !== 1) {
					if (this.currentTeam1Stone === null) {
						this.currentTeam1Stone = 1;
					} else {
						this.currentTeam1Stone++;
					}
				} else if (team === 2 && this.lastThinkingTeam !== 2) {
					if (this.currentTeam2Stone === null) {
						this.currentTeam2Stone = 1;
					} else {
						this.currentTeam2Stone++;
					}
				}
				this.currentTeam1Stone =
					this.currentTeam1Stone === null
						? null
						: Math.min(this.currentTeam1Stone, this.settings.stonesPerEnd);
				this.currentTeam2Stone =
					this.currentTeam2Stone === null
						? null
						: Math.min(this.currentTeam2Stone, this.settings.stonesPerEnd);

				this.lastThinkingTeam = team;
			} finally {
				this.endStateChangeBatch();
			}
		}
	}

	/**
	 * Stop the currently-running thinking time. This should be called as the
	 * stone crosses the tee line at the delivery end.
	 *
	 * @returns true if a thinking time was stopped, false if it ended up
	 * being a no-op.
	 */
	public stopThinking(): boolean {
		if (this.paused) {
			return false;
		}
		if (this.mode === "game") {
			try {
				this.beginStateChangeBatch();
				const returnVal = this.gameState === "thinking";
				this.setGameState("idle");
				this.teamThinking = null;
				this.pauseAllTimers();
				return returnVal;
			} finally {
				this.endStateChangeBatch();
			}
		}
		return false;
	}

	/**
	 * Sets the next stone number to be thrown. The next stone delivered will be
	 * the stone matching the number provided. If the next stone thrown belongs
	 * to the hammer team, the non-hammer team's stone count will be set to one
	 * more than the number provided since they have already thrown for the end.
	 * @param nextStoneNumber
	 */
	public setNextStoneNumber(nextStoneNumber: number) {
		if (this.mode === "game") {
			if (nextStoneNumber < 1 || nextStoneNumber > this.settings.stonesPerEnd) {
				throw new Error("Invalid stone number");
			}
			try {
				this.beginStateChangeBatch();
				const currentStone = nextStoneNumber === 1 ? null : nextStoneNumber - 1;
				this.currentTeam1Stone = currentStone;
				this.currentTeam2Stone = currentStone;

				// If non-hammer team has already thrown, advance their stone count
				if (this.lastThinkingTeam !== this.hammerTeam) {
					if (this.lastThinkingTeam === 1) {
						if (this.currentTeam1Stone === null) {
							this.currentTeam1Stone = 1;
						} else {
							this.currentTeam1Stone++;
						}
					} else if (this.lastThinkingTeam === 2) {
						if (this.currentTeam2Stone === null) {
							this.currentTeam2Stone = 1;
						} else {
							this.currentTeam2Stone++;
						}
					}
				}
			} finally {
				this.endStateChangeBatch();
			}
		}
	}

	/**
	 * Sets the hammer team. This should be called prior to thinking time being
	 * used in an end.
	 * @param team
	 */
	public setHammerTeam(team: 1 | 2 | null) {
		if (this.mode === "game" && this.hammerTeam !== team) {
			try {
				this.beginStateChangeBatch();
				this.hammerTeam = team;
			} finally {
				this.endStateChangeBatch();
			}
		}
	}

	/**
	 * Sets the current end. Calling this function changes nothing else about the
	 * state of the game, including thinking time.
	 * @param end
	 */
	public setCurrentEnd(end: number) {
		if (end < 1 || end > this.settings.endCount) {
			throw new Error("Invalid end number");
		}
		if (this.end !== end) {
			try {
				this.beginStateChangeBatch();
				this.end = end;
			} finally {
				this.endStateChangeBatch();
			}
		}
	}

	private _betweenEnds(isMidgameBreak: boolean) {
		if (this.mode === "game" && !this.paused) {
			try {
				this.beginStateChangeBatch();
				this.stopThinking();
				this.setGameState(isMidgameBreak ? "midgame-break" : "between-ends");
				this.hammerTeam = null;
				const breakTime = isMidgameBreak
					? this.getTimerDuration("midgame-break")
					: this.getTimerDuration("between-ends");
				this.globalTimer.setTimeRemaining(breakTime);
				this.globalTimer.registerCompleteCallback(() => {
					this.setGameState("prep");
					this.globalTimer.setTimeRemaining(this.getTimerDuration("prep"));
					this.globalTimer.registerCompleteCallback(() => {
						this.advanceEnd();
					}, true);
					this.globalTimer.start();
				}, true);
				this.globalTimer.start();
			} finally {
				this.endStateChangeBatch();
			}
		}
	}

	/**
	 * Starts the between-ends break. When it is over, start the prep time countdown, and
	 * then move to the idle state.
	 */
	public betweenEnds() {
		this._betweenEnds(false);
	}

	/**
	 * Starts the midgame break. When it is over, start the prep time countdown, and
	 * then move to the idle state.
	 */
	public midgameBreak() {
		this._betweenEnds(true);
	}

	private _endBetweenEnds(isMidgameBreak: boolean, advanceEnd = true) {
		if (this.paused) {
			return;
		}
		try {
			this.beginStateChangeBatch();
			const relevantGameState = isMidgameBreak ? "midgame-break" : "between-ends";
			if (this.gameState === relevantGameState) {
				this.globalTimer.setTimeRemaining(0);
			}
			if (this.gameState === "prep") {
				this.globalTimer.setTimeRemaining(0);
			}
			if (!advanceEnd) {
				this.goToEnd(this.end - 1, true);
				this.endSnapshots.pop();
			}
		} finally {
			this.endStateChangeBatch();
		}
	}
	/**
	 * Ends the current between-ends break (or prep time if that's in progress). Goes directly
	 * to the idle state without stopping at prep time.
	 *
	 * By default, advance the end count. If this break is canceled (e.g. because an input error),
	 * caller may pass false to prevent the end count from advancing.
	 *
	 * @param advanceEnd
	 */
	public endBetweenEnds(advanceEnd = true) {
		this._endBetweenEnds(false, advanceEnd);
	}

	/**
	 * Ends the midgame break (or prep time if that's in progress). Goes directly
	 * to the idle state without stopping at prep time.
	 *
	 * By default, advance the end count. If this break is canceled (e.g. because an input error),
	 * caller may pass false to prevent the end count from advancing.
	 *
	 * @param advanceEnd
	 */
	public endMidgameBreak(advanceEnd = true) {
		this._endBetweenEnds(true, advanceEnd);
	}

	/**
	 * Advance to the next end:
	 *   - Set thinking time if entering a new ThinkingTimeBlock
	 *   - Set stone count to null
	 */
	public advanceEnd() {
		if (this.paused) {
			return;
		}
		try {
			this.beginStateChangeBatch();
			this.endSnapshots.push(this.serialize());
			this.lastThinkingTeam = null;
			this.hammerTeam = null;
			const currentThinkingTimeBlock = this.getCurrentThinkingTimeBlock();
			this.end++;
			const nextThinkingTimeBlock = this.getCurrentThinkingTimeBlock();
			this.currentTeam1Stone = null;
			this.currentTeam2Stone = null;
			this.setGameState("idle");

			if (currentThinkingTimeBlock === nextThinkingTimeBlock) {
				// The next end uses the same block of thinking time as the previous
			} else if (nextThinkingTimeBlock === null) {
				// The next end is an extra end
				this.team1Timer.setTimeRemaining(this.settings.extraEndTime * milliseconds);
				this.team2Timer.setTimeRemaining(this.settings.extraEndTime * milliseconds);
			} else {
				// The next end uses a different block of thinking time
				this.team1Timer.setTimeRemaining(nextThinkingTimeBlock.thinkingTime * milliseconds);
				this.team2Timer.setTimeRemaining(nextThinkingTimeBlock.thinkingTime * milliseconds);
			}
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Replay the end specified by endNumber.
	 *
	 * Be default, go to the beginning of that end, but pass conclusion=true to
	 * advance to the end of the specified end.
	 *
	 * In the event that there are multiple instances of an end having been played,
	 * you may specify how far back in the history to go. For example, if the 3rd
	 * end was played 3 times, you can specify version=3 to replay the FIRST of
	 * those 3 ends. A version of 1 always refers to the most recent instance of
	 * that end being played.
	 *
	 * @param endNumber
	 * @param conclusion
	 * @param version
	 */
	public goToEnd(endNumber: number, conclusion = false, version: number = 1) {
		if (this.paused) {
			return;
		}
		try {
			this.beginStateChangeBatch();
			if (endNumber === 1 && !conclusion) {
				this.startGame();
			} else {
				const filteredEnds = this.endSnapshots.filter(state => state.end === endNumber - (conclusion ? 0 : 1));
				const endToReplay = filteredEnds[filteredEnds.length - version];
				if (!endToReplay) {
					throw new Error("No such end");
				}

				if (this.settings.thinkingTimeBlocks === "track-only") {
					this.team1Timer.setTimeRemaining(TRACK_TIME - endToReplay.team1Time);
					this.team2Timer.setTimeRemaining(TRACK_TIME - endToReplay.team2Time);
				} else {
					this.team1Timer.setTimeRemaining(endToReplay.team1Time);
					this.team2Timer.setTimeRemaining(endToReplay.team2Time);
				}
				this.globalTimer.setTimeRemaining(endToReplay.globalTime);
				this.end = endToReplay.end;
				this.team1Timeouts = endToReplay.team1Timeouts;
				this.team2Timeouts = endToReplay.team2Timeouts;
				this.gameState = "idle";
				this.hammerTeam = endToReplay.hammerTeam;
				this.lastThinkingTeam = null;
				this.currentTeam1Stone = conclusion ? this.settings.stonesPerEnd : null;
				this.currentTeam2Stone = conclusion ? this.settings.stonesPerEnd : null;
				this.teamThinking = null;
				this.teamTimedOut = null;
				this.batchedStateChangeCount = 0;
			}
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Starts a timeout for the given team. Decrements the number of timeouts. If the
	 * team does not have any timeouts remaining, this function does nothing.
	 *
	 * Timeouts start with travel time, if travel time is set to a value greater than zero.
	 *
	 * If side is provided, this is used to determine travel time duration. If not, we try
	 * to guess based on whether it's an even or odd end.
	 *
	 * This function can be called at any time during a game. It is up to the caller to
	 * ensure that it's legal to call a timeout for the given team.
	 *
	 * @param team
	 * @param side
	 */
	public startTimeout(team: 1 | 2, side?: "home" | "away") {
		if (this.paused) {
			return;
		}
		if (this.mode === "game") {
			try {
				this.beginStateChangeBatch();
				const autoSide = this.end % 2 === 0 ? "home" : "away";
				const defaultedSide = side ?? autoSide;
				const travelTime =
					defaultedSide === "home"
						? this.getTimerDuration("home-travel")
						: this.getTimerDuration("away-travel");
				if (team === 1) {
					if (this.team1Timeouts < 1) {
						return;
					}
					this.team1Timeouts--;
				} else {
					if (this.team2Timeouts < 1) {
						return;
					}
					this.team2Timeouts--;
				}
				this.setGameState(`${defaultedSide}-travel`);
				this.teamThinking = null;
				this.team1Timer.pause();
				this.team2Timer.pause();
				this.globalTimer.setTimeRemaining(travelTime);
				this.teamTimedOut = team;
				this.globalTimer.registerCompleteCallback(() => {
					try {
						this.beginStateChangeBatch();
						this.setGameState("timeout");
						this.globalTimer.setTimeRemaining(this.getTimerDuration("timeout"));
						this.globalTimer.registerCompleteCallback(() => {
							try {
								this.beginStateChangeBatch();
								this.setGameState("idle");
								this.teamTimedOut = null;
							} finally {
								this.endStateChangeBatch();
							}
						}, true);
						this.globalTimer.start();
					} finally {
						this.endStateChangeBatch();
					}
				}, true);
				this.globalTimer.start();
			} finally {
				this.endStateChangeBatch();
			}
		}
	}

	/**
	 * Ends the travel time, which immediately begins the timeout time.
	 *
	 * @returns true if a travel time was stopped, false if it ended up being
	 * a no-op.
	 */
	public endTravelTime(): boolean {
		if (this.paused) {
			return false;
		}
		if (this.gameState === "home-travel" || this.gameState === "away-travel") {
			try {
				this.beginStateChangeBatch();
				this.globalTimer.setTimeRemaining(0);
				return true;
			} finally {
				this.endStateChangeBatch();
			}
		}
		return false;
	}

	/**
	 * Ends the current timeout. If travel time is in progress, end that too.
	 * @param replenishTimeout
	 */
	public endTimeout(replenishTimeout = false) {
		if (this.paused) {
			return;
		}
		try {
			this.beginStateChangeBatch();
			const teamTimedOut = this.teamTimedOut;
			this.endTravelTime();

			if (teamTimedOut) {
				this.globalTimer.setTimeRemaining(0);
				if (replenishTimeout) {
					if (teamTimedOut === 1) {
						this.team1Timeouts++;
					} else {
						this.team2Timeouts++;
					}
				}
			}
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Adds the given number of seconds to a timer. If timer is provided,
	 * update that one. If not, try to figure out the current timer based
	 * on the state of this object.
	 *
	 * @param sec
	 * @param timer
	 */
	public addTime(sec: number, timerName?: "team1" | "team2" | "global") {
		const timer = this.getTimer(timerName);
		if (timer) {
			try {
				this.beginStateChangeBatch();
				timer.addTime(sec * milliseconds);
			} finally {
				this.endStateChangeBatch();
			}
		}
	}

	/**
	 * Sets the given number of seconds to the timer identified by the given
	 * name. If a timer name is not provided, try to figure out the current
	 * timer based on the state of the object.
	 *
	 * @param clock
	 * @param secRemaining
	 */
	public setTime(secRemaining: number, timerName?: "team1" | "team2" | "global") {
		const timer = this.getTimer(timerName);
		if (timer) {
			try {
				this.beginStateChangeBatch();
				timer.setTimeRemaining(secRemaining * milliseconds);
			} finally {
				this.endStateChangeBatch();
			}
		}
	}

	/**
	 * Sets the timeout count for the given team
	 * @param team
	 * @param timeoutCount
	 */
	public setTimeoutCount(team: 1 | 2, timeoutCount: number) {
		try {
			this.beginStateChangeBatch();
			if (team === 1) {
				if (this.team1Timeouts !== timeoutCount) {
					this.team1Timeouts = timeoutCount;
				}
			} else {
				if (this.team2Timeouts !== timeoutCount) {
					this.team2Timeouts = timeoutCount;
				}
			}
		} finally {
			this.endStateChangeBatch();
		}
	}

	/**
	 * Gets the current state of the game timers. This object
	 * is safely JSON-serializable.
	 * @returns
	 */
	public getFullState(includeEndSnapshots = false): CurlingTimerState {
		const team1Time = this.getThinkingTime(1);
		const team2Time = this.getThinkingTime(2);

		return {
			mode: this.mode,
			gameState: this.gameState,
			end: this.end,
			team1Time: team1Time,
			team2Time: team2Time,
			globalTime: this.globalTimer.getTimeRemaining(),
			team1Timeouts: this.team1Timeouts,
			team2Timeouts: this.team2Timeouts,
			teamTimedOut: this.teamTimedOut,
			teamThinking: this.teamThinking,
			team1TimerRunning: this.team1Timer.getState().isPaused === false,
			team2TimerRunning: this.team2Timer.getState().isPaused === false,
			globalTimerRunning: this.globalTimer.getState().isPaused === false,
			currentTeam1Stone: this.currentTeam1Stone,
			currentTeam2Stone: this.currentTeam2Stone,
			lastThinkingTeam: this.lastThinkingTeam,
			hammerTeam: this.hammerTeam,
			settings: this.settings,
			endSnapshots: includeEndSnapshots ? this.endSnapshots : undefined,
			gameHasStarted: this.gameHasStarted(),
			team1ShotClockTime: this.team1LastTurnTime - team1Time,
			team2ShotClockTime: this.team2LastTurnTime - team2Time,
			paused: this.paused,
		};
	}

	/**
	 * Alias for getFullState(), but may diverge in the future. This method
	 * is always guaranteed to return a JSON-serializable object.
	 * @returns
	 */
	public serialize(): CurlingTimerState {
		return this.getFullState();
	}

	/**
	 * Synthesize a CurlingTimer from a state object (e.g. from getFullState()).
	 * @param state
	 * @returns
	 */
	public static unserialize(state: CurlingTimerState): CurlingTimer {
		const timer = new CurlingTimer(state.settings);
		timer.mode = state.mode;
		timer.gameState = state.gameState;
		timer.end = state.end;
		timer.team1Timer.setTimeRemaining(
			state.settings.thinkingTimeBlocks === "track-only" ? TRACK_TIME - state.team1Time : state.team1Time,
		);
		timer.team2Timer.setTimeRemaining(
			state.settings.thinkingTimeBlocks === "track-only" ? TRACK_TIME - state.team2Time : state.team2Time,
		);
		timer.globalTimer.setTimeRemaining(state.globalTime);
		timer.team1Timeouts = state.team1Timeouts;
		timer.team2Timeouts = state.team2Timeouts;
		timer.teamTimedOut = state.teamTimedOut;
		timer.teamThinking = state.teamThinking;
		timer.currentTeam1Stone = state.currentTeam1Stone;
		timer.currentTeam2Stone = state.currentTeam2Stone;
		timer.lastThinkingTeam = state.lastThinkingTeam;
		timer.hammerTeam = state.hammerTeam;
		timer.team1LastTurnTime = state.team1Time + state.team1ShotClockTime;
		timer.team2LastTurnTime = state.team2Time + state.team2ShotClockTime;
		timer.paused = state.paused;
		return timer;
	}
}

function isBunTestEnv() {
	if (globalThis["Bun"] && (globalThis["Bun"] as any)["jest"]) {
		return true;
	}
	return false;
}
