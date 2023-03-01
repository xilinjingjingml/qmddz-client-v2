/**
 * 操作compontent的方法合集
 */
export namespace ComponentExtend {
    /**
     * 替换组件
     */
    export function replace(componentA: typeof cc.Component, componentB: typeof cc.Component) {
        const idA = cc.js._getClassId(componentA)
        const nameA = cc.js.getClassName(componentA)
        const scriptUuidA = componentA.prototype.__scriptUuid

        cc.js.unregisterClass(componentA)
        cc.js.unregisterClass(componentB)

        cc.js._setClassId(idA, componentB)
        cc.js.setClassName(nameA, componentB)
        componentB.prototype.__scriptUuid = scriptUuidA
    }
}
