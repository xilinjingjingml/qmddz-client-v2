const resetFrame = cc.Label.prototype._resetFrame;

cc.Label.prototype._resetFrame = function(...e) {
!this._frame || this.font instanceof cc.BitmapFont || resetFrame.call(this, ...e);
};