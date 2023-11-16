import { SuperCountdown } from "@trevorsg/super-timer";
const basic10EndSettings = {
    totalTime: 2.5 * 60 * 60,
    timerSpeedMultiplier: 1.0,
};
const basic8EndSettings = {
    totalTime: 2 * 60 * 60,
    timerSpeedMultiplier: 1.0,
};
const basic6EndSettings = {
    totalTime: 1.5 * 60 * 60,
    timerSpeedMultiplier: 1.0,
};
const basicMixedDoublesSettings = {
    totalTime: 1.5 * 60 * 60,
    timerSpeedMultiplier: 1.0,
};
const wcf10EndStandardSettings = {
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
    prepTime: 10,
    stonesPerEnd: 8,
    thinkingTimeBlocks: [{ startEnd: 1, endEnd: 10, thinkingTime: 38 * 60 }],
    timeoutCount: 1,
    timeoutTime: 60,
    warmupTime: 9 * 60,
    timerSpeedMultiplier: 1.0,
};
const wcf8EndStandardSettings = {
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
    prepTime: 10,
    stonesPerEnd: 8,
    thinkingTimeBlocks: [{ startEnd: 1, endEnd: 8, thinkingTime: 30 * 60 }],
    timeoutCount: 1,
    timeoutTime: 60,
    warmupTime: 9 * 60,
    timerSpeedMultiplier: 1.0,
};
const wcfMixedDoublesStandardSettings = {
    allowExtraEnd: true,
    awayTravelTime: 75,
    betweenEndTime: 90,
    endCount: 8,
    extraEndTime: 3 * 60,
    extraEndTimeoutCount: 1,
    homeTravelTime: 45,
    lsfeTime: 60,
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
/**
 * Gets one of the built-in configurations for a standard timer
 * @param configName
 * @returns
 */
export function getStandardConfig(configName) {
    let result;
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
export function getBasicConfig(configName) {
    let result;
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
export class BasicTimer {
    _timer;
    constructor(settings, onCompletion) {
        if (settings.timerSpeedMultiplier !== 1.0 && !isBunTestEnv()) {
            console.warn("WARNING: The setting `timerSpeedMultiplier` is set to " +
                settings.timerSpeedMultiplier +
                ". The clocks will not run at the normal speed!");
        }
        this._timer = new SuperCountdown(settings.totalTime * milliseconds, onCompletion, {
            timerSpeedMultiplier: settings.timerSpeedMultiplier,
        });
    }
    get timer() {
        return this._timer;
    }
    start() {
        this._timer.start();
    }
    pause() {
        this._timer.pause();
    }
    addTime(sec) {
        this._timer.addTime(sec * milliseconds);
    }
}
function validateThinkingTimeBlocks(blocks, numEnds) {
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
const milliseconds = 1000;
export class CurlingTimer {
    team1Timer;
    team2Timer;
    globalTimer;
    end;
    team1Timeouts;
    team2Timeouts;
    settings;
    mode;
    gameState;
    teamTimedOut;
    teamThinking;
    currentTeam1Stone = null;
    currentTeam2Stone = null;
    lastThinkingTeam = null;
    hammerTeam = null;
    constructor(settings) {
        if (settings.timerSpeedMultiplier !== 1.0 && !isBunTestEnv()) {
            console.warn("WARNING: The setting `timerSpeedMultiplier` is set to " +
                settings.timerSpeedMultiplier +
                ". The clocks will not run at the normal speed!");
        }
        validateThinkingTimeBlocks(settings.thinkingTimeBlocks, settings.endCount);
        this.team1Timer = new SuperCountdown(10, undefined, { timerSpeedMultiplier: settings.timerSpeedMultiplier });
        this.team2Timer = new SuperCountdown(10, undefined, { timerSpeedMultiplier: settings.timerSpeedMultiplier });
        this.globalTimer = new SuperCountdown(10, undefined, { timerSpeedMultiplier: settings.timerSpeedMultiplier });
        this.team1Timeouts = settings.timeoutCount;
        this.team2Timeouts = settings.timeoutCount;
        this.settings = settings;
        this.end = 0;
        this.mode = "idle";
        this.gameState = null;
        this.teamTimedOut = null;
        this.teamThinking = null;
    }
    getCurrentThinkingTimeBlock() {
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
    getThinkingTimers(team) {
        const currentTeam = team ?? this.teamThinking;
        if (!currentTeam) {
            throw new Error("No team is thinking");
        }
        const timer = currentTeam === 1 ? this.team1Timer : this.team2Timer;
        const otherTimer = currentTeam === 1 ? this.team2Timer : this.team1Timer;
        return { timer, otherTimer };
    }
    getTimer(name) {
        if (name) {
            if (name === "team1") {
                return this.team1Timer;
            }
            else if (name === "team2") {
                return this.team2Timer;
            }
            else if (name === "global") {
                return this.globalTimer;
            }
        }
        if (this.mode !== "game") {
            if (this.mode === "idle") {
                return undefined;
            }
            else {
                return this.globalTimer;
            }
        }
        else {
            if (this.gameState === "thinking") {
                return this.getThinkingTimers().timer;
            }
            if (this.gameState !== "idle") {
                return this.globalTimer;
            }
        }
        return undefined;
    }
    get timers() {
        return { team1Timer: this.team1Timer, team2Timer: this.team2Timer, globalTimer: this.globalTimer };
    }
    /**
     * Disposes all timers and prevents any further callbacks. This object cannot be
     * used after calling this function.
     */
    dispose() {
        this.team1Timer.dispose();
        this.team2Timer.dispose();
        this.globalTimer.dispose();
    }
    /**
     * Starts the practice period.
     */
    startPractice() {
        this.mode = "practice";
        this.gameState = null;
        this.globalTimer.setTimeRemaining(this.settings.practiceTime * milliseconds);
        this.globalTimer.start();
    }
    /**
     * Starts the warm-up period.
     */
    startWarmup() {
        this.mode = "warmup";
        this.gameState = null;
        this.globalTimer.setTimeRemaining(this.settings.warmupTime * milliseconds);
        this.globalTimer.start();
    }
    /**
     * Starts the timer for the last stone draw.
     */
    startLSFE() {
        this.mode = "lsfe";
        this.gameState = null;
        this.globalTimer.setTimeRemaining(this.settings.lsfeTime * milliseconds);
        this.globalTimer.start();
    }
    /**
     * Starts the game by setting all the clocks and other state to their initial
     * values.
     */
    startGame(hammerTeam) {
        this.mode = "game";
        this.gameState = "idle";
        this.end = 1;
        this.currentTeam1Stone = null;
        this.currentTeam1Stone = null;
        this.hammerTeam = hammerTeam ?? null;
        const thinkingTimeBlock = this.getCurrentThinkingTimeBlock();
        const thinkingTime = thinkingTimeBlock ? thinkingTimeBlock.thinkingTime : 3600;
        this.team1Timer.setTimeRemaining(thinkingTime * milliseconds);
        this.team2Timer.setTimeRemaining(thinkingTime * milliseconds);
        this.globalTimer.start();
    }
    /**
     * Pause whatever timer is currently running. Does NOT change the game state.
     * Invariant: calling unpause() after pause() (assuming no intervening calls)
     * will resume the same timer.
     */
    pause() {
        this.team1Timer.pause();
        this.team2Timer.pause();
        this.globalTimer.pause();
    }
    /**
     * Unpauses whatever timer is relevant to the current game state.
     */
    unpause() {
        const timer = this.getTimer();
        if (timer) {
            timer.unpause();
        }
    }
    /**
     * Starts the thinking time clock for the given team. This function also
     * advances stone counts. This should be called as soon as rocks come to
     * rest and players yield the ice to the team whose clock is starting.
     * @param team
     */
    startThinking(team) {
        if (this.mode === "game") {
            this.gameState = "thinking";
            this.teamThinking = team;
            const { timer, otherTimer } = this.getThinkingTimers(team);
            otherTimer.pause();
            this.globalTimer.pause();
            timer.start();
            // If the hammer team is set, this is the first thinking time of the end,
            // and the team thinking is the hammer team, then advance the stone count
            // of the non-hammer team (since they have already thrown for the end
            // without using any thinking time).
            if (this.hammerTeam !== null &&
                this.currentTeam1Stone === null &&
                this.currentTeam2Stone === null &&
                this.hammerTeam === team) {
                if (this.hammerTeam === 1) {
                    this.currentTeam2Stone = 1;
                }
                else {
                    this.currentTeam1Stone = 1;
                }
            }
            // Unless this is a restart of the most recent throwing team's thinking
            // time, advance the stone count.
            if (team === 1 && this.lastThinkingTeam !== 1) {
                if (this.currentTeam1Stone === null) {
                    this.currentTeam1Stone = 1;
                }
                else {
                    this.currentTeam1Stone++;
                }
            }
            else if (team === 2 && this.lastThinkingTeam !== 2) {
                if (this.currentTeam2Stone === null) {
                    this.currentTeam2Stone = 1;
                }
                else {
                    this.currentTeam2Stone++;
                }
            }
            this.currentTeam1Stone =
                this.currentTeam1Stone === null ? null : Math.min(this.currentTeam1Stone, this.settings.stonesPerEnd);
            this.currentTeam2Stone =
                this.currentTeam2Stone === null ? null : Math.min(this.currentTeam2Stone, this.settings.stonesPerEnd);
            this.lastThinkingTeam = team;
        }
    }
    /**
     * Stop the currently-running thinking time. This should be called as the
     * stone crosses the tee line at the delivery end.
     */
    stopThinking() {
        if (this.mode === "game") {
            this.gameState = "idle";
            this.teamThinking = null;
            this.team1Timer.pause();
            this.team2Timer.pause();
        }
    }
    /**
     * Sets the next stone number to be thrown. The next stone delivered will be
     * the stone matching the number provided. If the next stone thrown belongs
     * to the hammer team, the non-hammer team's stone count will be set to one
     * more than the number provided since they have already thrown for the end.
     * @param nextStoneNumber
     */
    setNextStoneNumber(nextStoneNumber) {
        if (this.mode === "game") {
            if (nextStoneNumber < 1 || nextStoneNumber > this.settings.stonesPerEnd) {
                throw new Error("Invalid stone number");
            }
            const currentStone = nextStoneNumber === 1 ? null : nextStoneNumber - 1;
            this.currentTeam1Stone = currentStone;
            this.currentTeam2Stone = currentStone;
            // If non-hammer team has already thrown, advance their stone count
            if (this.lastThinkingTeam !== this.hammerTeam) {
                if (this.lastThinkingTeam === 1) {
                    if (this.currentTeam1Stone === null) {
                        this.currentTeam1Stone = 1;
                    }
                    else {
                        this.currentTeam1Stone++;
                    }
                }
                else if (this.lastThinkingTeam === 2) {
                    if (this.currentTeam2Stone === null) {
                        this.currentTeam2Stone = 1;
                    }
                    else {
                        this.currentTeam2Stone++;
                    }
                }
            }
        }
    }
    /**
     * Sets the hammer team. This should be called prior to thinking time being
     * used in an end.
     * @param team
     */
    setHammerTeam(team) {
        if (this.mode === "game") {
            this.hammerTeam = team;
        }
    }
    /**
     * Sets the current end. Calling this function changes nothing else about the
     * state of the game, including thinking time.
     * @param end
     */
    setCurrentEnd(end) {
        if (end < 1 || end > this.settings.endCount) {
            throw new Error("Invalid end number");
        }
        this.end = end;
    }
    /**
     * Starts the between-ends break. When it is over, start the prep time countdown, and
     * then move to the idle state.
     */
    betweenEnds() {
        if (this.mode === "game") {
            this.gameState = "between-ends";
            this.hammerTeam = null;
            this.team1Timer.pause();
            this.team2Timer.pause();
            this.teamThinking = null;
            this.globalTimer.setTimeRemaining(this.settings.betweenEndTime * milliseconds);
            this.globalTimer.registerCompleteCallback(() => {
                this.gameState = "prep";
                this.globalTimer.setTimeRemaining(this.settings.prepTime * milliseconds);
                this.globalTimer.registerCompleteCallback(() => {
                    this.advanceEnd();
                    this.gameState = "idle";
                }, true);
                this.globalTimer.start();
            }, true);
            this.globalTimer.start();
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
    endBetweenEnds(advanceEnd = true) {
        if (this.mode === "game" && (this.gameState === "between-ends" || this.gameState === "prep")) {
            this.globalTimer.setTimeRemaining(0, true);
            if (advanceEnd) {
                this.advanceEnd();
            }
            this.gameState = "idle";
        }
    }
    /**
     * Advance to the next end:
     *   - Set thinking time if entering a new ThinkingTimeBlock
     *   - Set stone count to null
     */
    advanceEnd() {
        this.lastThinkingTeam = null;
        this.hammerTeam = null;
        const currentThinkingTimeBlock = this.getCurrentThinkingTimeBlock();
        this.end++;
        const nextThinkingTimeBlock = this.getCurrentThinkingTimeBlock();
        this.currentTeam1Stone = null;
        this.currentTeam2Stone = null;
        if (currentThinkingTimeBlock === nextThinkingTimeBlock) {
            // The next end uses the same block of thinking time as the previous
            return;
        }
        else if (nextThinkingTimeBlock === null) {
            // The next end is an extra end
            this.team1Timer.setTimeRemaining(this.settings.extraEndTime * milliseconds);
            this.team2Timer.setTimeRemaining(this.settings.extraEndTime * milliseconds);
        }
        else {
            // The next end uses a different block of thinking time
            this.team1Timer.setTimeRemaining(nextThinkingTimeBlock.thinkingTime * milliseconds);
            this.team2Timer.setTimeRemaining(nextThinkingTimeBlock.thinkingTime * milliseconds);
        }
    }
    /**
     * Starts the midgame break. When it is over, start the prep time countdown, and
     * then move to the idle state.
     */
    midgameBreak() {
        if (this.mode === "game") {
            this.gameState = "midgame-break";
            this.team1Timer.pause();
            this.team2Timer.pause();
            this.teamThinking = null;
            this.globalTimer.setTimeRemaining(this.settings.midgameBreakTime * milliseconds);
            this.globalTimer.registerCompleteCallback(() => {
                this.gameState = "prep";
                this.globalTimer.setTimeRemaining(this.settings.prepTime * milliseconds);
                this.globalTimer.registerCompleteCallback(() => {
                    this.gameState = "idle";
                    this.advanceEnd();
                }, true);
                this.globalTimer.start();
            }, true);
            this.globalTimer.start();
        }
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
    endMidgameBreak(advanceEnd = true) {
        if ((this.mode === "game" && this.gameState === "midgame-break") || this.gameState === "prep") {
            this.globalTimer.setTimeRemaining(0, true);
            if (advanceEnd) {
                this.advanceEnd();
            }
            this.gameState = "idle";
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
    startTimeout(team, side) {
        const autoSide = this.end % 2 === 0 ? "home" : "away";
        const defaultedSide = side ?? autoSide;
        const travelTime = defaultedSide === "home" ? this.settings.homeTravelTime : this.settings.awayTravelTime;
        if (this.mode === "game") {
            if (team === 1) {
                if (this.team1Timeouts < 1) {
                    return;
                }
                this.team1Timeouts--;
            }
            else {
                if (this.team2Timeouts < 1) {
                    return;
                }
                this.team2Timeouts--;
            }
            this.gameState = `${defaultedSide}-travel`;
            this.team1Timer.pause();
            this.team2Timer.pause();
            this.globalTimer.setTimeRemaining(travelTime * milliseconds);
            this.teamTimedOut = team;
            this.globalTimer.registerCompleteCallback(() => {
                this.gameState = "timeout";
                this.globalTimer.setTimeRemaining(this.settings.timeoutTime * milliseconds);
                this.globalTimer.registerCompleteCallback(() => {
                    this.gameState = "idle";
                    this.teamTimedOut = null;
                }, true);
                this.globalTimer.start();
            }, true);
            this.globalTimer.start();
        }
    }
    /**
     * Ends the travel time, which immediately begins the timeout time.
     */
    endTravelTime() {
        if (this.gameState === "home-travel" || this.gameState === "away-travel") {
            this.globalTimer.setTimeRemaining(0);
        }
    }
    /**
     * Ends the current timeout. If travel time is in progress, end that too.
     * @param replenishTimeout
     */
    endTimeout(replenishTimeout = false) {
        this.endTravelTime();
        if (this.teamTimedOut) {
            this.globalTimer.setTimeRemaining(0);
            if (replenishTimeout) {
                if (this.teamTimedOut === 1) {
                    this.team1Timeouts++;
                }
                else {
                    this.team2Timeouts++;
                }
            }
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
    addTime(sec, timerName) {
        const timer = this.getTimer(timerName);
        if (timer) {
            timer.addTime(sec * milliseconds);
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
    setTime(secRemaining, timerName) {
        const timer = this.getTimer(timerName);
        if (timer) {
            timer.setTimeRemaining(secRemaining * milliseconds);
        }
    }
    /**
     * Sets the timeout count for the given team
     * @param team
     * @param timeoutCount
     */
    setTimeoutCount(team, timeoutCount) {
        if (team === 1) {
            this.team1Timeouts = timeoutCount;
        }
        else {
            this.team2Timeouts = timeoutCount;
        }
    }
    /**
     * Gets the current state of the game timers. This object
     * is safely JSON-serializable.
     * @returns
     */
    getFullState() {
        return {
            mode: this.mode,
            gameState: this.gameState,
            end: this.end,
            team1Time: this.mode === "game" ? this.team1Timer.getTimeRemaining() : 0,
            team2Time: this.mode === "game" ? this.team2Timer.getTimeRemaining() : 0,
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
        };
    }
    /**
     * Alias for getFullState(), but may diverge in the future. This method
     * is always guaranteed to return a JSON-serializable object.
     * @returns
     */
    serialize() {
        return this.getFullState();
    }
    /**
     * Synthesize a CurlingTimer from a state object (e.g. from getFullState()).
     * @param state
     * @returns
     */
    static unserialize(state) {
        const timer = new CurlingTimer(state.settings);
        timer.mode = state.mode;
        timer.gameState = state.gameState;
        timer.end = state.end;
        timer.team1Timer.setTimeRemaining(state.team1Time);
        timer.team2Timer.setTimeRemaining(state.team2Time);
        timer.globalTimer.setTimeRemaining(state.globalTime);
        timer.team1Timeouts = state.team1Timeouts;
        timer.team2Timeouts = state.team2Timeouts;
        timer.teamTimedOut = state.teamTimedOut;
        timer.teamThinking = state.teamThinking;
        timer.currentTeam1Stone = state.currentTeam1Stone;
        timer.currentTeam2Stone = state.currentTeam2Stone;
        timer.lastThinkingTeam = state.lastThinkingTeam;
        timer.hammerTeam = state.hammerTeam;
        return timer;
    }
}
function isBunTestEnv() {
    if (globalThis["Bun"] && globalThis["Bun"]["jest"]) {
        return true;
    }
    return false;
}
