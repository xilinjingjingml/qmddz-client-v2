# coding=utf-8
import json
import os
import re
import time


def compilets(proto_path, path):
    os.system('pbjs -t static-module -w commonjs %s --no-create --no-encode --no-decode --no-verify --no-convert --no-delimited --no-beautify --force-number | pbts -o %s --no-comments -' % (proto_path, path))

    arr = []
    with open(path, 'r') as f:
        findInterface = False
        for line in f.readlines():
            if findInterface:
                m = re.compile(r'    (.*)\?: \((.*)\|null\);').match(
                    line) or re.compile(r'    (.*): (.*);').match(line)
                if m:
                    arr.append('    %s: %s\n' % (m.group(1), m.group(2)))
                else:
                    arr.append(line)
                    if line == '}\n':
                        arr.append('\n')
                        findInterface = False
            else:
                m = re.compile(r'export interface I(.*) {').match(line)
                if m:
                    findInterface = True

                    opcode = m.group(1)
                    arr.append('interface I%s {\n' % opcode)

    if len(arr) > 0:
        arr.pop()
    with open(path, 'w') as f:
        f.write(''.join(arr))


def compilejs(proto_path, path):
    cmd = 'pbjs -t json %s > %s' % (proto_path, path)

    os.system(cmd)

    context = ''
    with open(path, 'r') as file:
        context = 'module.exports=' + \
            json.dumps(json.load(file)).replace(' ', '')

    with open(path, 'w') as file:
        file.write(context)


def runts(proto_path):
    compilets(proto_path,  proto_path + '.d.ts')


def runjs(proto_path):
    compilejs(proto_path,  os.path.splitext(proto_path)[0] + '.message.js')


def rundir(config, func):
    for root, _, files in os.walk(config['path']):
        for file in files:
            if file.endswith('.proto'):
                func(os.path.join(root, file))


def run(config):
    os.system("npm uninstall protobufjs -g")
    os.system("npm install protobufjs@5.0.3 -g")
    rundir(config, runjs)

    os.system("npm uninstall protobufjs -g")
    os.system("npm install protobufjs -g")
    os.system("pbjs")
    rundir(config, runts)
