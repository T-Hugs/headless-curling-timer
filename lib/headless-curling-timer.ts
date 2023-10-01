import { SuperCountdown } from "@trevorsg/super-timer";

export interface ThinkingTimeBlock {
	startEnd: number;
	endEnd: number;
	thinkingTime: number;
}

export interface CurlingTimerSettings {
	allowExtraEnd: boolean;
	awayTravelTime: number;
	betweenEndTime: number;
	endCount: number;
	extraEndTime: number;
	extraEndTimeoutCount: number;
	homeTravelTime: number;
	lsfeTime: number;
	midgameBreakAfterEnd: number;
	midgameBreakTime: number;
	practiceTime: number;
	stonesPerEnd: number;
	thinkingTimeBlocks: ThinkingTimeBlock[] | "track-only";
	timeoutCount: number;
	timeoutTime: number;
	warmupTime: number;
}

export interface BasicTimerSettings {
	totalTime: number;
}

const basic10EndSettings: BasicTimerSettings = {
	totalTime: 2.5 * 60 * 60,
};

const basic8EndSettings: BasicTimerSettings = {
	totalTime: 2 * 60 * 60,
};

const basic6EndSettings: BasicTimerSettings = {
	totalTime: 1.5 * 60 * 60,
};

const basicMixedDoublesSettings: BasicTimerSettings = {
	totalTime: 1.5 * 60 * 60,
};

const wcf10EndStandardSettings: CurlingTimerSettings = {
	allowExtraEnd: true,
	awayTravelTime: 75,
	betweenEndTime: 60,
	endCount: 10,
	extraEndTime: 4 * 60 + 30,
	extraEndTimeoutCount: 1,
	homeTravelTime: 45,
	lsfeTime: 60,
	midgameBreakAfterEnd: 5,
	midgameBreakTime: 5 * 60,
	practiceTime: 30 * 60,
	stonesPerEnd: 8,
	thinkingTimeBlocks: [{ startEnd: 1, endEnd: 10, thinkingTime: 38 * 60 }],
	timeoutCount: 1,
	timeoutTime: 60,
	warmupTime: 9 * 60,
};

const wcf8EndStandardSettings: CurlingTimerSettings = {
	allowExtraEnd: true,
	awayTravelTime: 75,
	betweenEndTime: 60,
	endCount: 8,
	extraEndTime: 4 * 60 + 30,
	extraEndTimeoutCount: 1,
	homeTravelTime: 45,
	lsfeTime: 60,
	midgameBreakAfterEnd: 4,
	midgameBreakTime: 5 * 60,
	practiceTime: 30 * 60,
	stonesPerEnd: 8,
	thinkingTimeBlocks: [{ startEnd: 1, endEnd: 8, thinkingTime: 30 * 60 }],
	timeoutCount: 1,
	timeoutTime: 60,
	warmupTime: 9 * 60,
};

const wcfMixedDoublesStandardSettings: CurlingTimerSettings = {
	allowExtraEnd: true,
	awayTravelTime: 75,
	betweenEndTime: 60,
	endCount: 8,
	extraEndTime: 3 * 60,
	extraEndTimeoutCount: 1,
	homeTravelTime: 45,
	lsfeTime: 60,
	midgameBreakAfterEnd: 4,
	midgameBreakTime: 5 * 60,
	practiceTime: 30 * 60,
	stonesPerEnd: 8,
	thinkingTimeBlocks: [{ startEnd: 1, endEnd: 8, thinkingTime: 22 * 60 }],
	timeoutCount: 1,
	timeoutTime: 60,
	warmupTime: 7 * 60,
};

export class BasicTimer {
	private _timer: SuperCountdown;

	constructor(settings: BasicTimerSettings, onCompletion: () => void) {
		this._timer = new SuperCountdown(settings.totalTime * milliseconds, onCompletion);
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

export type CurlingTimerMode = "idle" | "practice" | "warmup" | "lsfe" | "game";
export type CurlingTimerGameState =
	| "pre-game"
	| "thinking"
	| "idle"
	| "timeout"
	| "between-ends"
	| "midgame-break"
	| null;

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
	private gameState: CurlingTimerGameState;
	private teamTimedOut: 1 | 2 | null;
	private teamThinking: 1 | 2 | null;

	constructor(settings: CurlingTimerSettings) {
		validateThinkingTimeBlocks(settings.thinkingTimeBlocks, settings.endCount);
		this.team1Timer = new SuperCountdown(0);
		this.team2Timer = new SuperCountdown(0);
		this.globalTimer = new SuperCountdown(0);
		this.team1Timeouts = settings.timeoutCount;
		this.team2Timeouts = settings.timeoutCount;
		this.settings = settings;
		this.end = 0;
		this.mode = "idle";
		this.gameState = null;
		this.teamTimedOut = null;
		this.teamThinking = null;
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

	private getTimers(team: 1 | 2) {
		const timer = team === 1 ? this.team1Timer : this.team2Timer;
		const otherTimer = team === 1 ? this.team2Timer : this.team1Timer;
		return { timer, otherTimer };
	}

	public get timers() {
		return { team1Timer: this.team1Timer, team2Timer: this.team2Timer, globalTimer: this.globalTimer };
	}

	public startPractice() {
		this.mode = "practice";
		this.gameState = null;
		this.globalTimer.setTimeRemaining(this.settings.practiceTime * milliseconds);
		this.globalTimer.start();
	}

	public startWarmup() {
		this.mode = "warmup";
		this.gameState = null;
		this.globalTimer.setTimeRemaining(this.settings.warmupTime * milliseconds);
		this.globalTimer.start();
	}

	public startLSFE() {
		this.mode = "lsfe";
		this.gameState = null;
		this.globalTimer.setTimeRemaining(this.settings.lsfeTime * milliseconds);
		this.globalTimer.start();
	}

	public startGame() {
		this.mode = "game";
		this.gameState = "pre-game";
		this.end = 1;
		const thinkingTimeBlock = this.getCurrentThinkingTimeBlock();
		const thinkingTime = thinkingTimeBlock ? thinkingTimeBlock.thinkingTime : 3600;
		this.team1Timer.setTimeRemaining(thinkingTime * milliseconds);
		this.team2Timer.setTimeRemaining(thinkingTime * milliseconds);
		this.globalTimer.setTimeRemaining(this.settings.betweenEndTime * milliseconds);
		this.globalTimer.registerCompleteCallback(() => {
			this.gameState = "idle";
		}, true);
		this.globalTimer.start();
	}

	public startThinking(team: 1 | 2) {
		if (this.mode === "game") {
			this.gameState = "thinking";
			this.teamThinking = team;
			const { timer, otherTimer } = this.getTimers(team);
			otherTimer.pause();
			this.globalTimer.pause();
			timer.start();
		}
	}

	public stopThinking() {
		if (this.mode === "game") {
			this.gameState = "idle";
			this.teamThinking = null;
			this.team1Timer.pause();
			this.team2Timer.pause();
		}
	}

	public betweenEnds() {
		if (this.mode === "game") {
			this.gameState = "between-ends";
			this.team1Timer.pause();
			this.team2Timer.pause();
			this.globalTimer.setTimeRemaining(this.settings.betweenEndTime * milliseconds);
			this.globalTimer.registerCompleteCallback(() => {
				this.gameState = "idle";
				this.advanceEnd();
			}, true);
			this.globalTimer.start();
		}
	}

	public endBetweenEnds(advanceEnd = true) {
		if (this.mode === "game" && this.gameState === "between-ends") {
			this.globalTimer.setTimeRemaining(0);
			if (advanceEnd) {
				this.advanceEnd();
			}
		}
	}

	public advanceEnd() {
		const currentThinkingTimeBlock = this.getCurrentThinkingTimeBlock();
		this.end++;
		const nextThinkingTimeBlock = this.getCurrentThinkingTimeBlock();

		if (currentThinkingTimeBlock === nextThinkingTimeBlock) {
			// The next end uses the same block of thinking time as the previous
			return;
		} else if (nextThinkingTimeBlock === null) {
			// The next end is an extra end
			this.team1Timer.setTimeRemaining(this.settings.extraEndTime * milliseconds);
			this.team2Timer.setTimeRemaining(this.settings.extraEndTime * milliseconds);
		} else {
			// The next end uses a different block of thinking time
			this.team1Timer.setTimeRemaining(nextThinkingTimeBlock.thinkingTime * milliseconds);
			this.team2Timer.setTimeRemaining(nextThinkingTimeBlock.thinkingTime * milliseconds);
		}
	}

	public midgameBreak() {
		if (this.mode === "game") {
			this.gameState = "midgame-break";
			this.team1Timer.pause();
			this.team2Timer.pause();
			this.globalTimer.setTimeRemaining(this.settings.midgameBreakTime * milliseconds);
			this.globalTimer.registerCompleteCallback(() => {
				this.gameState = "idle";
			}, true);
			this.globalTimer.start();
		}
	}

	public endMidgameBreak(advanceEnd = true) {
		if (this.mode === "game" && this.gameState === "midgame-break") {
			this.globalTimer.setTimeRemaining(0);
			if (advanceEnd) {
				this.advanceEnd();
			}
		}
	}

	public startTimeout(team: 1 | 2) {
		if (this.mode === "game") {
			this.gameState = "timeout";
			this.team1Timer.pause();
			this.team2Timer.pause();
			this.globalTimer.setTimeRemaining(this.settings.timeoutTime * milliseconds);
			this.teamTimedOut = team;
			this.globalTimer.registerCompleteCallback(() => {
				this.gameState = "idle";
				this.teamTimedOut = null;
				if (team === 1) {
					this.team1Timeouts--;
				} else {
					this.team2Timeouts--;
				}
			}, true);
			this.globalTimer.start();
		}
	}

	public endTimeout(replenishTimeout = false) {
		if (this.mode === "game" && this.gameState === "timeout" && this.teamTimedOut) {
			this.globalTimer.setTimeRemaining(0);
			if (replenishTimeout) {
				if (this.teamTimedOut === 1) {
					this.team1Timeouts++;
				} else {
					this.team2Timeouts++;
				}
			}
		}
	}

	public addTime(team: 1 | 2, sec: number) {
		if (this.mode === "game") {
			const { timer } = this.getTimers(team);
			timer.addTime(sec * milliseconds);
		}
	}

	public setTime(team: 1 | 2, secRemaining: number) {
		if (this.mode === "game") {
			const { timer } = this.getTimers(team);
			timer.setTimeRemaining(secRemaining * milliseconds);
		}
	}

	public setTimeoutCount(team: 1 | 2, timeoutCount: number) {
		if (team === 1) {
			this.team1Timeouts = timeoutCount;
		} else {
			this.team2Timeouts = timeoutCount;
		}
	}

	public getFullState() {
		return {
			mode: this.mode,
			gameState: this.gameState,
			end: this.end,
			team1Time: Math.round(this.team1Timer.getTimeRemaining() / milliseconds),
			team2Time: Math.round(this.team2Timer.getTimeRemaining() / milliseconds),
			globalTime: Math.round(this.globalTimer.getTimeRemaining() / milliseconds),
			team1Timeouts: this.team1Timeouts,
			team2Timeouts: this.team2Timeouts,
			teamTimedOut: this.teamTimedOut,
			teamThinking: this.teamThinking,
		};
	}
}
