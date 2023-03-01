/**
 * 任务计数器
 */
export default class TaskCounter {
    private counter: number
    private finish: Function

    constructor(finish: Function) {
        this.counter = 0
        this.finish = finish
    }

    count() {
        this.counter++
    }

    done() {
        this.counter--
        if (this.counter === 0) {
            this.finish()
        }
    }
}
