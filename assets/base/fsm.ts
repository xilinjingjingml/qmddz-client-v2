/**
 * 简易状态机
 */
export default class FSM<T extends string | number> {
    private events: Record<string | number, { froms?: T[], callback?: Function, target?: any }>
    private _state: T

    constructor(events: Record<string | number, { froms?: T[], callback?: Function, target?: any }>) {
        this.events = events
    }

    get state() {
        return this._state
    }

    transform(state: T, ...args: any[]) {
        /*
        if (this.state == state) {
            cc.warn(`already in state:${state}`)
            return
        }
        */

        const event = this.events[state]
        if (event == null) {
            cc.warn(`[FSM.transform] the state:${state} was not found`)
            return
        }

        if (this.state != null && event.froms && !event.froms.includes(this.state)) {
            cc.warn(`[FSM.transform] cannot transform state from ${this.state} to ${state}`)
            return
        }

        // args.unshift(this._state)
        this._state = state
        event.callback && event.callback.apply(event.target, args)
    }
}
