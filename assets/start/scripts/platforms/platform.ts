export abstract class Platform {
    supports: string[]

    init(...args: any) { }

    /**
     * 登录
     */
    login(...args: any) { }

    /**
     * 支付
     */
    pay(...args: any) { }

    /**
     * 打开广告
     */
    openAdvert(...args: any) { }

    /**
     * 关闭广告
     */
    closeAdvert(...args: any) { }

    /**
     * 分享
     */
    sociaShare(...args: any) { }

    /**
     * 复制到剪贴板
     */
    copyToClipBoard(...args: any) { }

    /**
     * 是否支持插件
     */
    isSupport(name: string) {
        return this.supports && this.supports.indexOf(name) > -1
    }
}
