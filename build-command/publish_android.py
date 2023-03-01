# coding=utf-8
import json
import os
import shutil
import zipfile

import manifest_version
import utils


def run(config):
    assets_path = os.path.dirname(config['assets_path'])
    work_path = os.path.join(assets_path, config['name'])
    android_path = os.path.join(config['android_path'], config['assets_dir'])

    print(u'解压资源')
    if os.path.exists(work_path):
        shutil.rmtree(work_path)
    with zipfile.ZipFile(config['assets_path'], 'r', zipfile.ZIP_DEFLATED, True) as z:
        z.extractall(assets_path)

    for root, _, files in os.walk(work_path):
        for file in files:
            if os.path.splitext(file)[1] == '.zip':
                path = os.path.join(root, file)
                with zipfile.ZipFile(path, 'r', zipfile.ZIP_DEFLATED, True) as z:
                    z.extractall(root)
                os.remove(path)

    version = manifest_version.getversion(config)
    print(u'修改版本号', version)
    manifest_path = os.path.join(work_path, 'project.manifest')
    with open(manifest_path, 'r') as f:
        data = json.loads(f.read())
    data['version'] = version
    with open(manifest_path, 'w') as f:
        f.write(json.dumps(data))

    for name in config['assets_paths']:
        name = os.path.basename(name)
        source_path = os.path.join(work_path, name)
        target_path = os.path.join(android_path, name)
        if os.path.exists(target_path):
            shutil.rmtree(target_path)
        if os.path.exists(source_path):
            shutil.move(source_path, target_path)
    shutil.move(manifest_path, os.path.join(
        android_path, 'thirdparty\\game.manifest'))

    shutil.rmtree(work_path)
