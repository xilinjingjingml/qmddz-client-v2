# coding=utf-8
import manifest_version
import os


def run(config):
    version = manifest_version.getversion(config)
    print(u'修改版本号', version)
    manifest_version.setversion(config['assets_path'], version)

    # 打开文件夹
    os.system('call explorer.exe /select, %s' % config['assets_path'])
