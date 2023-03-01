# coding=utf-8
import os
import time


def run(config):
    os.chdir(config['android_path'])

    # 编译 APK
    os.system('call gradlew :%s:assemble%s' %
              (config['name'], config['mode'].capitalize()))

    # 移动 APK
    filepath = '%s\\%s-%s.apk' % (config['apk_path'], config['filename'],
                                  time.strftime('%Y%m%d%H%M%S', time.localtime()))
    os.rename('app\\build\\outputs\\apk\\%s\\%s-%s.apk' %
              (config['mode'], config['name'], config['mode']), filepath)

    # 打开文件夹
    os.system('call explorer.exe /select, %s' % filepath)
