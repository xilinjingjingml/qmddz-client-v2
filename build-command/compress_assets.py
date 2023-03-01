# coding=utf-8
import gzip
import json
import os
import sys
import zipfile

import encrypt_xxtea
import utils
from urllib.parse import quote


class CompressAssets:
    def __init__(self, config, z: zipfile.ZipFile):
        self.config = config
        self.zip = z
        self.manifest = {
            'packageUrl': '',
            'remoteManifestUrl': '',
            'remoteVersionUrl': '',
            'version': '1.0.0.0',
            'assets': {},
            'searchPaths': []
        }

    def run(self, name: str, configs: []):
        self.name = name
        self.configs = configs
        self.manifest['assets'] = {}

        self.zipWriteDir(name)
        for path in self.config['assets_paths']:
            if path in self.config['zip_paths']:
                pass
            elif os.path.isfile(path):
                self.assetWriteFile(path)
            elif os.path.isdir(path) and os.listdir(path):
                self.assetWriteDir(path)

        for path in self.config['zip_paths']:
            if os.path.isfile(path):
                self.assetWriteZipFile(path)
            elif os.path.isdir(path) and os.listdir(path):
                self.assetWriteZipDir(path)

        self.jsonWriteDict(os.path.join(self.name, 'project.manifest'))

        self.manifest['assets'] = {}
        self.jsonWriteDict(os.path.join(self.name, 'version.manifest'))

    def assetWriteDir(self, root: str):
        self.zipWriteDir(os.path.join(
            self.name, os.path.relpath(root, self.config['work_path'])))

        for path in os.listdir(root):
            path = os.path.join(root, path)
            if path in self.config['zip_paths']:
                pass
            elif os.path.isfile(path):
                self.assetWriteFile(path)
            elif os.path.isdir(path) and os.listdir(path):
                self.assetWriteDir(path)

    def assetWriteFile(self, path: str):
        texts = os.path.splitext(path)
        data = utils.readfile(path)
        for config in self.configs:
            match = False
            if type(config['from']) is str:
                match = config['from'] == '.*' or texts[1] == config['from']
            else:
                match = texts[1] in config['from']

            if not match:
                continue

            operates = []
            if type(config['operates']) is str:
                operates.append({'name': config['operates']})
            else:
                for operate in config['operates']:
                    if type(operate) is str:
                        operates.append({'name': operate})
                    else:
                        operates.append(operate)

            for operate in operates:
                if operate['name'] == 'compress':
                    data = self.compressData(path, data)
                if operate['name'] == 'zip':
                    data = self.zipData(path, data)
                if operate['name'] == 'gzip':
                    data = self.gzipData(path, data)
                if operate['name'] == 'encrypt_xxtea':
                    data = encrypt_xxtea.encryptData(
                        operate['key'], operate.get('sign', ''), data)

            if 'to' in config:
                path = texts[0] + config['to']
            break

        self.assetWriteData(path, data)

    def compressData(self, path: str, data):
        path = os.path.join(
            self.config['resources_warehouse'], utils.uniquename(path))
        if os.path.exists(path):
            data = utils.readfile(path)
        return data

    def zipData(self, path: str, data):
        filepath = utils.zipname(path)
        with zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED, True) as z:
            utils.zipWriteData(z, os.path.basename(path), data)
        data = utils.readfile(filepath)
        os.remove(filepath)
        return data

    def gzipData(self, path: str, data):
        filepath = utils.zipname(path)
        with gzip.GzipFile(filepath, 'wb') as z:
            z.write(data)
        data = utils.readfile(filepath)
        os.remove(filepath)
        return data

    def assetWriteData(self, path: str, data):
        relpath = os.path.relpath(path, self.config['work_path'])
        name = quote(relpath.replace(os.sep, '/'))
        self.manifest['assets'][name] = {
            'size': len(data),
            'md5': utils.md5(data),
        }
        if path.endswith('.zip'):
            self.manifest['assets'][name]['compressed'] = True
        self.zipWriteData(os.path.join(self.name, relpath), data)

    def assetWriteZipDir(self, path: str):
        filepath = utils.zipname(path)
        utils.zipDir(path, filepath, os.path.basename(path))
        self.assetWriteData(filepath, utils.readfile(filepath))
        os.remove(filepath)

    def assetWriteZipFile(self, path: str):
        filepath = utils.zipname(path)
        self.assetWriteData(filepath, self.zipData(path, utils.readfile(path)))

    def zipWriteDir(self, path: str):
        utils.zipWriteDir(self.zip, path)

    def zipWriteData(self, path: str, data):
        utils.zipWriteData(self.zip, path, data)

    def jsonWriteDict(self, path: str):
        data = json.dumps(self.manifest)
        self.zipWriteData(path, data)


def run(config):
    assets_path = config['assets_path']
    utils.makedirs(os.path.dirname(assets_path))
    utils.removefile(assets_path)

    with zipfile.ZipFile(assets_path, 'w', zipfile.ZIP_DEFLATED, True) as z:
        compress = CompressAssets(config, z)
        for compress_config in config['compress_configs']:
            compress.run(compress_config['name'],
                         compress_config.get('configs', []))
