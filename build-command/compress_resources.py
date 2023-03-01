# coding=utf-8
import os

# pip install tinify
import tinify

import utils


def run(config):
    utils.makedirs(config['resources_warehouse'])

    tinify.key = config['tinify_key']

    for path in config['assets_paths']:
        for root, _, files in os.walk(path):
            for file in files:
                if os.path.splitext(file)[1] in config['resources_exts']:
                    filepath = os.path.join(root, file)
                    compress_path = os.path.join(
                        config['resources_warehouse'], utils.uniquename(filepath))
                    if os.path.exists(compress_path):
                        continue

                    print('compress %s' % filepath)
                    try:
                        tinify.from_file(filepath).to_file(compress_path)
                    except Exception as e:
                        if e.kind == 'Unauthorized':
                            utils.print_error(e)
                            os._exit(0)
                        utils.print_warn(e)
