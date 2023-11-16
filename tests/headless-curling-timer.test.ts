import { expect, jest, test } from "bun:test";
import {
	getBasicConfig,
	getStandardConfig,
	BasicTimer,
	ThinkingTimeBlock,
	CurlingTimer,
} from "../lib/headless-curling-timer";
import { SuperCountdown } from "@trevorsg/super-timer";

const anyJest = jest as any;

const thinkingTimeTestBlock: ThinkingTimeBlock = {
	startEnd: 1,
	endEnd: 10,
	thinkingTime: 100,
};

// @TODO As soon as Bun supports fake timers like jest, update the async
// tests in this file to use fake timers instead of Bun.sleep().

test("Get basic configuration", () => {
	const config = getBasicConfig("6end");
	expect(typeof config).toBe("object");
	expect(config).toHaveProperty("totalTime");

	config.totalTime = 0;
	expect(getBasicConfig("6end")).toHaveProperty("totalTime", 1.5 * 60 * 60);
});

test("Get standard configuration", () => {
	const config = getStandardConfig("8end");
	expect(typeof config).toBe("object");

	const props = [
		"allowExtraEnd",
		"awayTravelTime",
		"betweenEndTime",
		"endCount",
		"extraEndTime",
		"extraEndTimeoutCount",
		"homeTravelTime",
		"lsfeTime",
		"midgameBreakAfterEnd",
		"midgameBreakTime",
		"practiceTime",
		"prepTime",
		"stonesPerEnd",
		"thinkingTimeBlocks",
		"timeoutCount",
		"timeoutTime",
		"warmupTime",
	];
	for (const prop of props) {
		expect(config).toHaveProperty(prop);
	}

	config.endCount = 0;
	expect(getStandardConfig("8end")).toHaveProperty("endCount", 8);
});

test("Basic timer countdown instance", () => {
	const timer = new BasicTimer(getBasicConfig("6end"), () => {});
	expect(timer.timer).toBeInstanceOf(SuperCountdown);
});

test("Basic timer complete callback", async () => {
	let complete = false;
	const config = { totalTime: 10, timerSpeedMultiplier: 1000 };
	const timer = new BasicTimer(config, () => {
		complete = true;
	});
	timer.start();
	expect(complete).toBe(false);
	await Bun.sleep(20);
	expect(complete).toBe(true);
});

test("Basic timer pause", async () => {
	let complete = false;
	const config = { totalTime: 100, timerSpeedMultiplier: 1000 };
	const timer = new BasicTimer(config, () => {
		complete = true;
	});
	timer.start();
	expect(complete).toBe(false);
	await Bun.sleep(50);
	timer.pause();
	await Bun.sleep(100);
	expect(complete).toBe(false);
	timer.start();
	await Bun.sleep(50);
	expect(complete).toBe(true);
});

test("Basic timer add time", async () => {
	let complete = false;
	const config = { totalTime: 100, timerSpeedMultiplier: 1000 };
	const timer = new BasicTimer(config, () => {
		complete = true;
	});
	timer.start();
	expect(complete).toBe(false);
	await Bun.sleep(50);
	expect(complete).toBe(false);
	timer.addTime(50);
	await Bun.sleep(50);
	expect(complete).toBe(false);
	await Bun.sleep(50);
	expect(complete).toBe(true);
});

test("Basic timer subtract time", async () => {
	let complete = false;
	const config = { totalTime: 100, timerSpeedMultiplier: 1000 };
	const timer = new BasicTimer(config, () => {
		complete = true;
	});
	timer.start();
	expect(complete).toBe(false);
	await Bun.sleep(25);
	expect(complete).toBe(false);
	timer.addTime(-50);
	expect(complete).toBe(false);
	await Bun.sleep(25);
	expect(complete).toBe(true);
});

test("Basic timer subtract time ends timer", async () => {
	let complete = false;
	const config = { totalTime: 100, timerSpeedMultiplier: 1 };
	const timer = new BasicTimer(config, () => {
		complete = true;
	});
	timer.start();
	expect(complete).toBe(false);
	await Bun.sleep(50);
	expect(complete).toBe(false);
	timer.addTime(-150);
	expect(complete).toBe(true);
});

test("Validate thinking time blocks: should not throw error for 'track-only' input", () => {
	const config = getStandardConfig("10end");
	config.thinkingTimeBlocks = "track-only";
	expect(() => new CurlingTimer(config)).not.toThrow();
});

test("Validate thinking time blocks: should throw error for empty blocks array", () => {
	const config = getStandardConfig("10end");
	config.thinkingTimeBlocks = [];
	expect(() => new CurlingTimer(config)).toThrow();
});

test("Validate thinking time blocks: should validate a single block spanning all ends", () => {
	const config = getStandardConfig("10end");
	const blocks: ThinkingTimeBlock[] = [{ startEnd: 1, endEnd: 10, thinkingTime: 2280 }];
	config.thinkingTimeBlocks = blocks;
	expect(() => new CurlingTimer(config)).not.toThrow();
});

test("Validate thinking time blocks: should validate multiple blocks", () => {
	const config = getStandardConfig("10end");
	const blocks: ThinkingTimeBlock[] = [
		{ startEnd: 1, endEnd: 5, thinkingTime: 240 },
		{ startEnd: 6, endEnd: 10, thinkingTime: 255 },
	];
	config.thinkingTimeBlocks = blocks;
	expect(() => new CurlingTimer(config)).not.toThrow();
});

test("Validate thinking time blocks: 1-end blocks", () => {
	const config = getStandardConfig("10end");
	const blocks: ThinkingTimeBlock[] = [
		{ startEnd: 1, endEnd: 1, thinkingTime: 240 },
		{ startEnd: 2, endEnd: 2, thinkingTime: 240 },
		{ startEnd: 3, endEnd: 3, thinkingTime: 240 },
		{ startEnd: 4, endEnd: 4, thinkingTime: 240 },
		{ startEnd: 5, endEnd: 5, thinkingTime: 240 },
		{ startEnd: 6, endEnd: 6, thinkingTime: 255 },
		{ startEnd: 7, endEnd: 7, thinkingTime: 255 },
		{ startEnd: 8, endEnd: 8, thinkingTime: 255 },
		{ startEnd: 9, endEnd: 9, thinkingTime: 255 },
		{ startEnd: 10, endEnd: 10, thinkingTime: 255 },
	];
	config.thinkingTimeBlocks = blocks;
	expect(() => new CurlingTimer(config)).not.toThrow();
});

test("Validate thinking time blocks: should throw error if first block does not start at end 1", () => {
	const config = getStandardConfig("10end");
	const blocks: ThinkingTimeBlock[] = [{ startEnd: 2, endEnd: 10, thinkingTime: 2280 }];
	config.thinkingTimeBlocks = blocks;
	expect(() => new CurlingTimer(config)).toThrow();
});

test("Validate thinking time blocks: should throw error if last block does not end at numEnds", () => {
	const config = getStandardConfig("10end");
	const blocks: ThinkingTimeBlock[] = [{ startEnd: 1, endEnd: 9, thinkingTime: 2280 }];
	config.thinkingTimeBlocks = blocks;
	expect(() => new CurlingTimer(config)).toThrow();
});

test("Validate thinking time blocks: should throw error for non-contiguous blocks", () => {
	const config = getStandardConfig("10end");
	const blocks: ThinkingTimeBlock[] = [
		{ startEnd: 1, endEnd: 4, thinkingTime: 240 },
		{ startEnd: 6, endEnd: 10, thinkingTime: 255 },
	];
	config.thinkingTimeBlocks = blocks;
	expect(() => new CurlingTimer(config)).toThrow();
});

test("State changes", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	expect(timer.getFullState().mode).toBe("idle");
	timer.startPractice();
	expect(timer.getFullState().mode).toBe("practice");
	timer.startWarmup();
	expect(timer.getFullState().mode).toBe("warmup");
	timer.startLSFE();
	expect(timer.getFullState().mode).toBe("lsfe");
	timer.startGame();
	expect(timer.getFullState().mode).toBe("game");
});

test("Practice mode", async () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	expect(timer.getFullState().globalTimerRunning).toBe(false);
	timer.startPractice();
	expect(timer.getFullState().globalTimerRunning).toBe(true);
});

test("Warmup mode", async () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	expect(timer.getFullState().globalTimerRunning).toBe(false);
	timer.startWarmup();
	expect(timer.getFullState().globalTimerRunning).toBe(true);
});

test("LSFE mode", async () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	expect(timer.getFullState().globalTimerRunning).toBe(false);
	timer.startLSFE();
	expect(timer.getFullState().globalTimerRunning).toBe(true);
});

test("Global timer pause/unpause", async () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	timer.startPractice();
	await Bun.sleep(25);
	timer.pause();
	expect(timer.getFullState().globalTimerRunning).toBe(false);
	await Bun.sleep(25);
	timer.unpause();
	expect(timer.getFullState().globalTimerRunning).toBe(true);
});

test("Global timer add time/set time", async () => {
	const config = getStandardConfig("10end");
	config.practiceTime = 100;
	const timer = new CurlingTimer(config);
	timer.startPractice();
	expect(timer.getFullState().globalTime).toBe(100000);
	timer.addTime(10);
	expect(timer.getFullState().globalTime).toBe(110000);
	timer.addTime(-20);
	expect(timer.getFullState().globalTime).toBe(90000);
	timer.setTime(200);
	expect(timer.getFullState().globalTime).toBe(200000);
});

test("Serializable state", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	const state = timer.getFullState();
	expect(() => JSON.stringify(state)).not.toThrow();
});

test("Unserialize works.", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	const state = timer.getFullState();
	const timer2 = CurlingTimer.unserialize(state);
	expect(timer2.getFullState()).toEqual(state);
});

test("Getting timer instances", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	const { team1Timer, team2Timer, globalTimer } = timer.timers;
	expect(team1Timer).toBeInstanceOf(SuperCountdown);
	expect(team2Timer).toBeInstanceOf(SuperCountdown);
	expect(globalTimer).toBeInstanceOf(SuperCountdown);
	timer.startGame();
	timer.setTime(10, "global");
	timer.setTime(20, "team1");
	timer.setTime(30, "team2");
	expect(globalTimer.getTimeRemaining()).toBe(10000);
	expect(team1Timer.getTimeRemaining()).toBe(20000);
	expect(team2Timer.getTimeRemaining()).toBe(30000);
});

test("Pause/unpause thinking time resumes correct timer.", async () => {
	const config = getStandardConfig("10end");
	config.thinkingTimeBlocks = [thinkingTimeTestBlock];
	config.timerSpeedMultiplier = 1000;
	const timer = new CurlingTimer(config);
	timer.startGame();
	timer.startThinking(1);
	await Bun.sleep(10);
	timer.pause();
	const initialTimeRemaining1 = timer.getFullState().team1Time;
	await Bun.sleep(10);
	expect(timer.getFullState().team1Time).toBe(initialTimeRemaining1);
	timer.unpause();
	await Bun.sleep(10);
	timer.stopThinking();
	const finalTeam1Time = timer.getFullState().team1Time;
	expect(finalTeam1Time < initialTimeRemaining1).toBe(true);
	expect(timer.getFullState().team2Time).toBe(100000);

	timer.startThinking(2);
	await Bun.sleep(10);
	timer.pause();
	const initialTimeRemaining2 = timer.getFullState().team2Time;
	await Bun.sleep(10);
	expect(timer.getFullState().team2Time).toBe(initialTimeRemaining2);
	timer.unpause();
	await Bun.sleep(10);
	expect(timer.getFullState().team2Time < initialTimeRemaining2).toBe(true);
	expect(timer.getFullState().team1Time).toBe(finalTeam1Time);
});

test("Start/stop thinking", async () => {
	const config = getStandardConfig("10end");
	config.thinkingTimeBlocks = [thinkingTimeTestBlock];
	config.timerSpeedMultiplier = 1000;
	const timer = new CurlingTimer(config);
	timer.startGame();
	expect(timer.getFullState().gameState).toBe("idle");
	expect(timer.getFullState().teamThinking).toBe(null);
	expect(timer.getFullState().end).toBe(1);
	expect(timer.getFullState().currentTeam1Stone).toBe(null);
	expect(timer.getFullState().currentTeam2Stone).toBe(null);
	timer.startThinking(1);
	await Bun.sleep(10);
	expect(timer.getFullState().mode).toBe("game");
	expect(timer.getFullState().gameState).toBe("thinking");
	expect(timer.getFullState().teamThinking).toBe(1);
	expect(timer.getFullState().currentTeam1Stone).toBe(1);
	expect(timer.getFullState().currentTeam2Stone).toBe(null);
	timer.stopThinking();
	expect(timer.getFullState().gameState).toBe("idle");
	expect(timer.getFullState().teamThinking).toBe(null);
	expect(timer.getFullState().team1Time < 100000).toBe(true);
	expect(timer.getFullState().team2Time).toBe(100000);
	timer.startThinking(1);
	await Bun.sleep(10);
	expect(timer.getFullState().currentTeam1Stone).toBe(1);
	expect(timer.getFullState().currentTeam2Stone).toBe(null);
	timer.stopThinking();
	timer.startThinking(2);
	await Bun.sleep(10);
	expect(timer.getFullState().teamThinking).toBe(2);
	expect(timer.getFullState().currentTeam1Stone).toBe(1);
	expect(timer.getFullState().currentTeam2Stone).toBe(1);
	timer.stopThinking();
	expect(timer.getFullState().team2Time < 100000).toBe(true);

	// Start without stop
	timer.startThinking(1);
	await Bun.sleep(10);
	timer.startThinking(2);
	await Bun.sleep(10);
	const team1Time = timer.getFullState().team1Time;
	const team2Time = timer.getFullState().team2Time;
	await Bun.sleep(10);
	expect(timer.getFullState().team1Time).toBe(team1Time);
	expect(timer.getFullState().team2Time < team2Time).toBe(true);
	expect(timer.getFullState().teamThinking).toBe(2);
});

test("setNextStoneNumber error conditions", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	timer.startGame();
	expect(() => timer.setNextStoneNumber(0)).toThrow();
	expect(() => timer.setNextStoneNumber(11)).toThrow();
});

test("setNextStoneNumber logic", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	timer.startGame();
	timer.setHammerTeam(2);
	timer.startThinking(1);
	timer.stopThinking();
	timer.setNextStoneNumber(4);
	expect(timer.getFullState().currentTeam1Stone).toBe(4);
	expect(timer.getFullState().currentTeam2Stone).toBe(3);
	timer.startThinking(2);
	timer.stopThinking();
	timer.setNextStoneNumber(6);
	expect(timer.getFullState().currentTeam1Stone).toBe(5);
	expect(timer.getFullState().currentTeam1Stone).toBe(5);
});

test("setHammerTeam", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	timer.startGame();
	timer.setHammerTeam(2);
	expect(timer.getFullState().hammerTeam).toBe(2);
	timer.setHammerTeam(1);
	expect(timer.getFullState().hammerTeam).toBe(1);
});

test("between ends", async () => {
	const config = getStandardConfig("10end");
	config.betweenEndTime = 50;
	config.prepTime = 10;
	config.timerSpeedMultiplier = 1000;
	const timer = new CurlingTimer(config);
	timer.startGame();
	expect(timer.getFullState().end).toBe(1);
	timer.betweenEnds();
	await Bun.sleep(10);
	expect(timer.getFullState().gameState).toBe("between-ends");
	await Bun.sleep(40);
	expect(timer.getFullState().gameState).toBe("prep");
	await Bun.sleep(10);
	expect(timer.getFullState().gameState).toBe("idle");
	expect(timer.getFullState().end).toBe(2);
	timer.betweenEnds();
	timer.endBetweenEnds();
	expect(timer.getFullState().end).toBe(3);
	expect(timer.getFullState().gameState).toBe("idle");
	timer.betweenEnds();
	timer.endBetweenEnds(false);
	expect(timer.getFullState().end).toBe(3);
});

test("thinking time is correct per-end", async () => {
	const config = getStandardConfig("8end");
	config.betweenEndTime = 5;
	config.prepTime = 5;
	config.endCount = 6;
	config.timerSpeedMultiplier = 1000;
	const blocks: ThinkingTimeBlock[] = [
		{ startEnd: 1, endEnd: 2, thinkingTime: 240 },
		{ startEnd: 3, endEnd: 4, thinkingTime: 260 },
		{ startEnd: 5, endEnd: 6, thinkingTime: 280 },
	];
	config.thinkingTimeBlocks = blocks;
	config.extraEndTime = 300;
	const timer = new CurlingTimer(config);
	timer.startGame();
	expect(timer.getFullState().team1Time).toBe(blocks[0].thinkingTime * 1000);
	for (let i = 1; i < blocks.length * 2; ++i) {
		timer.startThinking(((i % 2) + 1) as 1 | 2);
		await Bun.sleep(5);
		timer.stopThinking();
		timer.betweenEnds();
		await Bun.sleep(11);
		expect(timer.getFullState().team1Time).toBe(blocks[Math.ceil((i + 1) / 2) - 1].thinkingTime * 1000);
	}
	expect(timer.getFullState().end).toBe(6);
	timer.betweenEnds();
	await Bun.sleep(11);
	expect(timer.getFullState().team1Time).toBe(300000);
});

test("midgame break", async () => {
	const config = getStandardConfig("10end");
	config.midgameBreakTime = 50;
	config.prepTime = 10;
	config.timerSpeedMultiplier = 1000;
	const timer = new CurlingTimer(config);
	timer.startGame();
	timer.setCurrentEnd(5);
	expect(timer.getFullState().end).toBe(5);
	timer.midgameBreak();
	await Bun.sleep(10);
	expect(timer.getFullState().gameState).toBe("midgame-break");
	await Bun.sleep(40);
	expect(timer.getFullState().gameState).toBe("prep");
	await Bun.sleep(10);
	expect(timer.getFullState().gameState).toBe("idle");
	expect(timer.getFullState().end).toBe(6);

	timer.setCurrentEnd(5);
	timer.midgameBreak();
	timer.endMidgameBreak();
	expect(timer.getFullState().end).toBe(6);
	expect(timer.getFullState().gameState).toBe("idle");
	timer.setCurrentEnd(5);
	timer.midgameBreak();
	timer.endMidgameBreak(false);
	expect(timer.getFullState().end).toBe(5);
});

test("set current end", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	timer.startGame();
	expect(timer.getFullState().end).toBe(1);
	timer.setCurrentEnd(5);
	expect(timer.getFullState().end).toBe(5);
	expect(() => timer.setCurrentEnd(0)).toThrow();
	expect(() => timer.setCurrentEnd(11)).toThrow();
});

test("dispose", () => {
	const config = getStandardConfig("10end");
	const timer = new CurlingTimer(config);
	timer.startGame();
	expect(timer.getFullState().mode).toBe("game");
	timer.dispose();
	const {team1Timer, team2Timer, globalTimer} = timer.timers;
	expect(() => team1Timer.addTime(10)).toThrow();
	expect(() => team2Timer.addTime(10)).toThrow();
	expect(() => globalTimer.addTime(10)).toThrow();
});

test("Timeouts basic", async () => {
	const config = getStandardConfig("10end");
	config.timeoutTime = 30;
	config.awayTravelTime = 20;
	config.homeTravelTime = 10;
	config.timerSpeedMultiplier = 1000;
	const timer = new CurlingTimer(config);
	timer.startGame();
	expect(timer.getFullState().team1Timeouts).toBe(1);
	timer.startTimeout(1);
	expect(timer.getFullState().team1Timeouts).toBe(0);
	expect(timer.getFullState().teamTimedOut).toBe(1);
	await Bun.sleep(65);

	expect(timer.getFullState().teamTimedOut).toBe(null);
	expect(timer.getFullState().team1Timeouts).toBe(0);

	timer.startTimeout(2);
	expect(timer.getFullState().team2Timeouts).toBe(0);

	timer.setTimeoutCount(1, 1);
	timer.setTimeoutCount(2, 1);

	timer.startTimeout(1);
	Bun.sleep(10);
	timer.endTimeout(false);
	expect(timer.getFullState().team1Timeouts).toBe(0);
	expect(timer.getFullState().teamTimedOut).toBe(null);
	timer.startTimeout(2);
	Bun.sleep(10);
	timer.endTimeout(true);
	expect(timer.getFullState().team2Timeouts).toBe(1);
	expect(timer.getFullState().teamTimedOut).toBe(null);
});

test("Add/set time", () => {
	const config = getStandardConfig("10end");
	config.thinkingTimeBlocks = [thinkingTimeTestBlock];
	const timer = new CurlingTimer(config);
	timer.startGame();
	timer.addTime(10, "team1");
	timer.addTime(-10, "team2");
	expect(timer.getFullState().team1Time).toBe(110000);
	expect(timer.getFullState().team2Time).toBe(90000);
	timer.setTime(200, "team1");
	timer.setTime(300, "team2");
	expect(timer.getFullState().team1Time).toBe(200000);
	expect(timer.getFullState().team2Time).toBe(300000);
});