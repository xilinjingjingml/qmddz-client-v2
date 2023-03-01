interface md5 {
    (message: message): string;
    hex(message: message): string;
    array(message: message): number[];
    digest(message: message): number[];
    arrayBuffer(message: message): ArrayBuffer;
    buffer(message: message): ArrayBuffer;
    create(): Md5;
    update(message: message): Md5;
    base64(message: message): string;
}

declare const md5: md5;