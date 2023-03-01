const resetFrame = cc.Label.prototype["_resetFrame"]

cc.Label.prototype["_resetFrame"] = function (...args) {
    if (this._frame && !(this.font instanceof cc.BitmapFont)) {
        resetFrame.call(this, ...args)
    }
}
