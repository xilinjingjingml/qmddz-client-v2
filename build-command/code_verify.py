# coding=utf-8
import os
import re
import subprocess
import time

import web_request

try:
    import pytesseract
    from PIL import Image
except:
    pass


def addCookie(cookie, data):
    for k in cookie:
        data[k.name] = k.value
    return data


def readCodeORC(data, codepath):
    with open(codepath, 'wb') as f:
        f.write(data)

    try:
        im = Image.open(codepath)
        im = im.resize(tuple(map(lambda x: 10 * x, im.size)), Image.ANTIALIAS)
        code = pytesseract.image_to_string(im)
        for ts in [('', ' '), ('0', 'oO'), ('1', 'iIlL'), ('5', 'sS')]:
            for s in ts[1]:
                code = code.replace(s, ts[0])
    except:
        code = None

    os.remove(codepath)

    return code


def readCodeUser(data, codepath):
    with open(codepath, 'wb') as f:
        f.write(data)

    process = subprocess.Popen(
        'rundll32.exe C:\\Windows\\System32\\shimgvw.dll,ImageView_Fullscreen %s' % os.path.abspath(codepath))
    code = input(u'请输入验证码:')
    os.remove(codepath)
    process.kill()

    return code


def readCodeOnline(data, codepath):
    request = web_request.Requests()
    request.initHost('http://lab.ocrking.com')

    content = request.open(
        path='upload.html',
        data=addCookie(request.cookie, {
            'ts': str(int(time.time())),
            'Upload': 'Submit Query',
            'Filename': os.path.basename(codepath),
        }),
        files={
            'name': 'Filedata',
            'filename': os.path.basename(codepath),
            'data': data,
            'boundary': 'cH2ei4ae0GI3Ij5ei4Ij5KM7ei4Ef1',
        },
    )
    content = content.decode()
    status = re.findall('<Status>(true)</Status>', content)
    result = re.findall('<Result>(.*)</Result>', content)
    if len(status) == 0:
        print(result)
        return
    fileid = result[0]

    content = request.open(
        path='do.html',
        data={
            'service': 'OcrKingForCaptcha',
            'language': 'eng',
            'charset': '1',
            'upfile': 'true',
            'fileID': fileid,
            'outputFormat': '',
            'email': '',
        }
    )
    content = content.decode()
    status = re.findall('<Status>(true)</Status>', content)
    result = re.findall('<Result>(.*)</Result>', content)
    if len(status) == 0:
        print(result)
        return

    return result[0]
