# coding=utf-8
import sys
from http import cookiejar
from urllib import parse, request

CookieJar = cookiejar.CookieJar
urlencode = parse.urlencode
build_opener = request.build_opener
HTTPCookieProcessor = request.HTTPCookieProcessor
install_opener = request.install_opener
urlopen = request.urlopen
Request = request.Request


class Requests:
    def __init__(self):
        self.cookie = CookieJar()
        self.opener = build_opener(HTTPCookieProcessor(self.cookie))

    def initHost(self, host):
        self.host = host
        return self.open()

    def open(self, path=None, params=None, data=None, files=None, decodeutf8=False):
        install_opener(self.opener)

        url = self.host
        if path:
            url += '/' + path
        if params:
            url += '?' + urlencode(params)

        headers = {}
        if files:
            headers['Content-Type'] = 'multipart/form-data; boundary=------------%s' % files['boundary']

            datas = []
            data['files'] = files
            for key in data:
                value = data[key]
                datas.append(b'--------------%s' %
                             (files['boundary'].encode()))
                if key == 'files':
                    datas.append(b'Content-Disposition: form-data; name="%s"; filename="%s"' %
                                 (key.encode(),  value['name'].encode()))
                    datas.append(b'Content-Type: application/octet-stream')
                    datas.append(b'\r\n' + value['data'])
                else:
                    datas.append(
                        b'Content-Disposition: form-data; name="%s"' % (key.encode()))
                    datas.append(b'\r\n%s' % value.encode())
            datas.append(b'--------------%s--' % files['boundary'].encode())
            data = b'\r\n'.join(datas)
        elif data:
            data = urlencode(data).encode(encoding='UTF8')

        req = Request(url, data=data, headers=headers)
        res = urlopen(req)
        content = res.read()

        code = getattr(res, 'code', None) or getattr(res, 'status', None)
        if code == 200:
            return content.decode('utf-8') if decodeutf8 else content
