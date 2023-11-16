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
    lsfeTime: number;
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
    timerSpeedMultiplier: number;
}
export interface CurlingTimerState {
    /**
     * String representing the current mode of the timer. Modes include:
     * "idle": - Base state when no functions are being used.
     * "practice": Sanctioned practice time for an event.
     * "warmup": Pre-game warmup time.
     * "lsfe": Draw to the button for determination of hammer.
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
     */
    team1Time: number;
    /**
     * The thinking time remaining, in milliseconds, for team 2.
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
    timerSpeedMultiplier: number;
}
export type StandardConfigName = "10end" | "8end" | "doubles";
export type BasicConfigNAme = "10end" | "8end" | "6end" | "doubles";
/**
 * Gets one of the built-in configurations for a standard timer
 * @param configName
 * @returns
 */
export declare function getStandardConfig(configName: StandardConfigName): CurlingTimerSettings;
/**
 * Gets one of the built-in configurations for a basic timer
 * @param configName
 * @returns
 */
export declare function getBasicConfig(configName: BasicConfigNAme): BasicTimerSettings;
export declare class BasicTimer {
    private _timer;
    constructor(settings: BasicTimerSettings, onCompletion: () => void);
    get timer(): SuperCountdown;
    start(): void;
    pause(): void;
    addTime(sec: number): void;
}
export type CurlingTimerMode = "idle" | "practice" | "warmup" | "lsfe" | "game";
export type CurlingTimerGameState = "thinking" | "idle" | "home-travel" | "away-travel" | "timeout" | "between-ends" | "prep" | "midgame-break";
export declare class CurlingTimer {
    private readonly team1Timer;
    private readonly team2Timer;
    private readonly globalTimer;
    private end;
    private team1Timeouts;
    private team2Timeouts;
    private settings;
    private mode;
    private gameState;
    private teamTimedOut;
    private teamThinking;
    private currentTeam1Stone;
    private currentTeam2Stone;
    private lastThinkingTeam;
    private hammerTeam;
    constructor(settings: CurlingTimerSettings);
    private getCurrentThinkingTimeBlock;
    private getThinkingTimers;
    private getTimer;
    get timers(): {
        team1Timer: SuperCountdown;
        team2Timer: SuperCountdown;
        globalTimer: SuperCountdown;
    };
    /**
     * Disposes all timers and prevents any further callbacks. This object cannot be
     * used after calling this function.
     */
    dispose(): void;
    /**
     * Starts the practice period.
     */
    startPractice(): void;
    /**
     * Starts the warm-up period.
     */
    startWarmup(): void;
    /**
     * Starts the timer for the last stone draw.
     */
    startLSFE(): void;
    /**
     * Starts the game by setting all the clocks and other state to their initial
     * values.
     */
    startGame(hammerTeam?: 1 | 2): void;
    /**
     * Pause whatever timer is currently running. Does NOT change the game state.
     * Invariant: calling unpause() after pause() (assuming no intervening calls)
     * will resume the same timer.
     */
    pause(): void;
    /**
     * Unpauses whatever timer is relevant to the current game state.
     */
    unpause(): void;
    /**
     * Starts the thinking time clock for the given team. This function also
     * advances stone counts. This should be called as soon as rocks come to
     * rest and players yield the ice to the team whose clock is starting.
     * @param team
     */
    startThinking(team: 1 | 2): void;
    /**
     * Stop the currently-running thinking time. This should be called as the
     * stone crosses the tee line at the delivery end.
     */
    stopThinking(): void;
    /**
     * Sets the next stone number to be thrown. The next stone delivered will be
     * the stone matching the number provided. If the next stone thrown belongs
     * to the hammer team, the non-hammer team's stone count will be set to one
     * more than the number provided since they have already thrown for the end.
     * @param nextStoneNumber
     */
    setNextStoneNumber(nextStoneNumber: number): void;
    /**
     * Sets the hammer team. This should be called prior to thinking time being
     * used in an end.
     * @param team
     */
    setHammerTeam(team: 1 | 2): void;
    /**
     * Sets the current end. Calling this function changes nothing else about the
     * state of the game, including thinking time.
     * @param end
     */
    setCurrentEnd(end: number): void;
    /**
     * Starts the between-ends break. When it is over, start the prep time countdown, and
     * then move to the idle state.
     */
    betweenEnds(): void;
    /**
     * Ends the current between-ends break (or prep time if that's in progress). Goes directly
     * to the idle state without stopping at prep time.
     *
     * By default, advance the end count. If this break is canceled (e.g. because an input error),
     * caller may pass false to prevent the end count from advancing.
     *
     * @param advanceEnd
     */
    endBetweenEnds(advanceEnd?: boolean): void;
    /**
     * Advance to the next end:
     *   - Set thinking time if entering a new ThinkingTimeBlock
     *   - Set stone count to null
     */
    advanceEnd(): void;
    /**
     * Starts the midgame break. When it is over, start the prep time countdown, and
     * then move to the idle state.
     */
    midgameBreak(): void;
    /**
     * Ends the midgame break (or prep time if that's in progress). Goes directly
     * to the idle state without stopping at prep time.
     *
     * By default, advance the end count. If this break is canceled (e.g. because an input error),
     * caller may pass false to prevent the end count from advancing.
     *
     * @param advanceEnd
     */
    endMidgameBreak(advanceEnd?: boolean): void;
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
    startTimeout(team: 1 | 2, side?: "home" | "away"): void;
    /**
     * Ends the travel time, which immediately begins the timeout time.
     */
    endTravelTime(): void;
    /**
     * Ends the current timeout. If travel time is in progress, end that too.
     * @param replenishTimeout
     */
    endTimeout(replenishTimeout?: boolean): void;
    /**
     * Adds the given number of seconds to a timer. If timer is provided,
     * update that one. If not, try to figure out the current timer based
     * on the state of this object.
     *
     * @param sec
     * @param timer
     */
    addTime(sec: number, timerName?: "team1" | "team2" | "global"): void;
    /**
     * Sets the given number of seconds to the timer identified by the given
     * name. If a timer name is not provided, try to figure out the current
     * timer based on the state of the object.
     *
     * @param clock
     * @param secRemaining
     */
    setTime(secRemaining: number, timerName?: "team1" | "team2" | "global"): void;
    /**
     * Sets the timeout count for the given team
     * @param team
     * @param timeoutCount
     */
    setTimeoutCount(team: 1 | 2, timeoutCount: number): void;
    /**
     * Gets the current state of the game timers. This object
     * is safely JSON-serializable.
     * @returns
     */
    getFullState(): CurlingTimerState;
    /**
     * Alias for getFullState(), but may diverge in the future. This method
     * is always guaranteed to return a JSON-serializable object.
     * @returns
     */
    serialize(): CurlingTimerState;
    /**
     * Synthesize a CurlingTimer from a state object (e.g. from getFullState()).
     * @param state
     * @returns
     */
    static unserialize(state: CurlingTimerState): CurlingTimer;
}
