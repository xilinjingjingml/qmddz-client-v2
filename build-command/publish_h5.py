# coding=utf-8
import os
import subprocess
import zipfile

import utils


def run(config):
    workpath = os.getcwd()

    output_path = config['output_path']
    os.chdir(os.path.dirname(output_path))
    os.system('svn update')

    os.chdir(workpath)
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED, True) as z:
        for root, _, files in os.walk(config['assets_path']):
            if root == config['assets_path']:
                relpath = config['name']
            else:
                relpath = os.path.join(
                    config['name'], os.path.relpath(root, config['assets_path']))
            utils.zipWriteDir(z, relpath)

            for file in files:
                filepath = os.path.join(root, file)
                data = utils.readfile(filepath)
                if os.path.splitext(file)[1] in config['resources_exts']:
                    uniquepath = os.path.join(
                        config['resources_warehouse'], utils.uniquename(filepath))
                    if os.path.exists(uniquepath):
                        data = utils.readfile(uniquepath)

                utils.zipWriteData(z, os.path.join(relpath, file), data)

    ret = subprocess.run(["git", "show", "-s",  "--format=%s"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8")
    if ret.returncode == 0:
        commmit = ret.stdout
    else:
        print("error:", ret.stderr)
        commmit = "调整代码 修复bug"
    os.chdir(os.path.dirname(output_path))
    os.system('svn commit -m "%s"' % commmit)
