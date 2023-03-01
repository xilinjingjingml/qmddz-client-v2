# coding=utf-8
import struct
import sys


_DELTA = 0x9E3779B9


def _ljust(s, width, fillchar=b' '):
    if sys.version_info.major == 2:
        return s.ljust(width, fillchar)
    if type(s) == str:
        s = s.encode()
    return (s + width * fillchar)[:width]


def _long2str(v, w):
    n = (len(v) - 1) << 2
    if w:
        m = v[-1]
        if (m < n - 3) or (m > n):
            return ''
        n = m
    s = struct.pack('<%iL' % len(v), *v)
    return s[0:n] if w else s


def _str2long(s, w):
    n = len(s)
    m = (4 - (n & 3) & 3) + n
    s = _ljust(s, m, b'\0')
    v = list(struct.unpack('<%iL' % (m >> 2), s))
    if w:
        v.append(n)
    return v


def encrypt(str, key):
    if str == '':
        return str
    v = _str2long(str, True)
    k = _str2long(_ljust(key, 16, b'\0'), False)
    n = len(v) - 1
    z = v[n]
    y = v[0]
    sum = 0
    q = 6 + 52 // (n + 1)
    while q > 0:
        sum = (sum + _DELTA) & 0xffffffff
        e = sum >> 2 & 3
        for p in range(n):
            y = v[p + 1]
            v[p] = (v[p] + ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4)
                            ^ (sum ^ y) + (k[p & 3 ^ e] ^ z))) & 0xffffffff
            z = v[p]
        y = v[0]
        v[n] = (v[n] + ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4)
                        ^ (sum ^ y) + (k[n & 3 ^ e] ^ z))) & 0xffffffff
        z = v[n]
        q -= 1
    return _long2str(v, False)


def decrypt(str, key):
    if str == '':
        return str
    v = _str2long(str, False)
    k = _str2long(_ljust(key, 16, b'\0'), False)
    n = len(v) - 1
    z = v[n]
    y = v[0]
    q = 6 + 52 // (n + 1)
    sum = (q * _DELTA) & 0xffffffff
    while (sum != 0):
        e = sum >> 2 & 3
        for p in range(n, 0, -1):
            z = v[p - 1]
            v[p] = (v[p] - ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4)
                            ^ (sum ^ y) + (k[p & 3 ^ e] ^ z))) & 0xffffffff
            y = v[p]
        z = v[n]
        v[0] = (v[0] - ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4)
                        ^ (sum ^ y) + (k[0 & 3 ^ e] ^ z))) & 0xffffffff
        y = v[0]
        sum = (sum - _DELTA) & 0xffffffff
    return _long2str(v, True)


def encryptData(key, sign, data):
    return sign.encode(encoding='utf-8') + encrypt(data, key)


def decryptData(key, sign, data):
    head, = struct.unpack('%ds' % len(sign), data[:len(sign)])
    if head == sign:
        return decrypt(data[len(sign):], key)


def encryptFile(key, sign, source, target):
    with open(source, 'rb') as fs:
        with open(target, 'wb') as ft:
            ft.write(sign + encrypt(fs.read(), key))


def decryptFile(key, sign, source, target):
    with open(source, 'rb') as fs:
        head, = struct.unpack('%ds' % len(sign), fs.read(len(sign)))
        if head != sign:
            return
        with open(target, 'wb') as ft:
            ft.write(decrypt(fs.read(), key))
