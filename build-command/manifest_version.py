# coding=utf-8
import json
import os
import re
import zipfile

import requests


def getversion(config):
    if 'version' in config:
        return config['version']

    print(u'查询大厅缓存')
    req = requests.request('get', config['version_url'])
    version = json.loads(req.text)['onlineparam']['game_version']
    version = str(int(version.replace('.', '')) + config['version_add'])
    return '.'.join(re.compile('.{1}').findall(version))


def setversion(path, version):
    tempath = path + '.temp'
    zin = zipfile.ZipFile(path, 'r', zipfile.ZIP_DEFLATED, True)
    zout = zipfile.ZipFile(tempath, 'w', zipfile.ZIP_DEFLATED, True)
    for name in zin.namelist():
        data = zin.read(name)
        if os.path.splitext(name)[1] == '.manifest':
            manifest = json.loads(data.decode('utf-8'))
            manifest['version'] = version
            data = json.dumps(manifest).encode(encoding='utf-8')
        zout.writestr(zipfile.ZipInfo(name), data, zipfile.ZIP_DEFLATED)
    zout.close()
    zin.close()
    os.remove(path)
    os.rename(tempath, path)
