# coding=utf-8
import json
import os
import re

import code_verify
import manifest_version
import utils
import web_request


def makeCounter(count):
    def counter():
        counter.count -= 1
        return counter.count >= 0

    counter.count = count
    return counter


def getCode(request):
    print(u'获取验证码')
    return request.open(
        path='get/validate/code',
        decodeutf8=False,
    )


def verifyCode(request, code):
    code = code[:4]
    print(u'验证验证码', code)
    content = request.open(
        path='check/validate/code',
        params={
            'code': code,
        },
    )

    print(u'验证验证码', content)
    if 'success' in json.loads(content):
        print(u'验证成功')
        return True
    else:
        print(u'验证失败')
        return False


def readCodeOnline(request, codepath):
    counter = makeCounter(1)
    while counter():
        data = getCode(request)

        print(u'识别验证码')
        code = None
        try:
            code = code_verify.readCodeOnline(data, codepath)
        except Exception as err:
            print(err)

        if code and verifyCode(request, code):
            return code


def readCodeORC(request, codepath):
    counter = makeCounter(3)
    while counter():
        data = getCode(request)

        print(u'识别验证码')
        code = code_verify.readCodeORC(data, codepath)

        if code and verifyCode(request, code):
            return code


def readCodeUser(request, codepath):
    while True:
        data = getCode(request)

        print(u'识别验证码')
        code = code_verify.readCodeUser(data, codepath)

        if code and verifyCode(request, code):
            return code


def run(config):
    pn = config['packages'][0]
    assets_path = config['assets_path']
    request = web_request.Requests()

    print(u'进入首页')
    request.initHost(config['host'])

    code = None
    if code == None:
        code = readCodeOnline(request, config['codepath'])
    if code == None:
        code = readCodeORC(request, config['codepath'])
    if code == None:
        code = readCodeUser(request, config['codepath'])

    print(u'登陆')
    request.open(
        path='login',
        data={
            'username': config['usrname'],
            'password': config['password'],
            'code': code,
        },
    )

    print(u'查询')
    content = request.open(
        path='load/wechat/applet/game/config',
        data={
            'pn': pn,
            'channel': config['channel'],
            'page': 1,
            'rows': 10,
        },
    )
    gameinfo = json.loads(content)['rows'][0]
    versionold = gameinfo['versionName']
    if 'version' in config:
        version = config['version']
    else:
        version = str(int(versionold.replace('.', '')) + config['version_add'])
        version = '.'.join(re.compile('.{1}').findall(version))
    print(u'修改版本号', version)
    manifest_version.setversion(assets_path, version)

    print(u'打开上传窗口')
    request.open(
        path='check/wechat/applet/version',
        data={
            'pn': pn,
            'versionName': version,
        },
    )

    print(u'上传文件')
    request.open(
        path='upload/wechat/applet/file',
        data={
            'pn': pn,
            'versionName': version,
        },
        files={
            'name': os.path.basename(assets_path),
            'data': utils.readfile(assets_path),
            'boundary': 'ej7KEe05Gej5cfi4e4431MaIIiIiH2',
        }
    )

    print(u'确定')
    request.open(
        path='execute/wechat/applet/manage',
        data={
            'operate': 1,
            'auto_id': config['auto_id'],
            'channel_id': config['channel_id'],
            'pn': pn,
            'versionName': version,
            'extparam': gameinfo['extparam'].replace(versionold, version),
        },
    )

    for pn in config['packages']:
        print(u'获取在线参数')
        content = request.open(
            path='load/online/param',
            data={
                'paramname': pn,
                'page': 1,
                'rows': 10,
            },
        )
        gameinfo = json.loads(content)['rows'][0]
        onlineParam = json.loads(gameinfo['opParamValue'])
        onlineParam['game_version'] = version
        gameinfo['opParamValue'] = json.dumps(onlineParam, ensure_ascii=False)

        print(u'提交')
        request.open(
            path='execute/online/param',
            data={
                'id': gameinfo['opId'],
                'paramname': gameinfo['opParamName'],
                'paramvalue': gameinfo['opParamValue'],
                'desc': gameinfo['opDesc'],
                'appcode': gameinfo['opAppCode'],
            },
        )

        print(u'刷新缓存')
        request.open(
            path='do/refresh/cache',
            data={
                'code': '20001',
                'arg0': gameinfo['opParamName'],
                'arg1': '',
            },
        )

        print(u'刷新大厅缓存', pn)
        request.open(
            path='refresh/cache/bypn',
            data={
                'pn': pn,
                'gameid': config['gameid'],
                'type': 0,
            },
        )
