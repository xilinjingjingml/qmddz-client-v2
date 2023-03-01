# coding=utf-8
import os


def run(config):
    params = []
    for key in config['params']:
        params.append('%s=%s' % (key, config['params'][key]))

    os.system('chcp 65001')
    os.system('call "%s" --path "%s" --build "%s"' %
              (config['path'], os.getcwd(), ';'.join(params)))
    os.system('chcp 936')
