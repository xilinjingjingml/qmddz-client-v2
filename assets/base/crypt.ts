/**
 * 加密方法合集
 */
export namespace crypt {
    /**
     * 字符串进行加密
     */
    export function encrypt(code: string) {
        if (null == code) {
            return
        }
        let s = String.fromCharCode(code.charCodeAt(0) + code.length)
        for (let i = 1; i < code.length; i++) {
            s += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1))
        }
        return escape(s)
    }

    /**
     * 字符串进行解密
     */
    export function decrypt(code: string) {
        code = unescape(code)
        let s = String.fromCharCode(code.charCodeAt(0) - code.length)
        for (let i = 1; i < code.length; i++) {
            s += String.fromCharCode(code.charCodeAt(i) - s.charCodeAt(i - 1))
        }
        return s
    }
}
