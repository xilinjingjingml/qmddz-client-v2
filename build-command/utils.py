import hashlib
import os
import shutil
import zipfile


def print_warn(s):
    print('\033[1;33m' + str(s) + '\033[0m')


def print_error(s):
    print('\033[1;31m' + str(s) + '\033[0m')


def makedirs(path, clean=False):
    if os.path.exists(path):
        if not clean:
            return
        shutil.rmtree(path)

    os.makedirs(path)


def removefile(path):
    if os.path.isfile(path):
        os.remove(path)


def readfile(path, mode='rb'):
    with open(path, mode) as f:
        return f.read()


def md5(data):
    return hashlib.md5(data).hexdigest()


def uniquename(path):
    return '%s-%d%s' % (md5(readfile(path)), os.path.getsize(path), os.path.splitext(path)[1])

def zipname(path):
    return os.path.splitext(path)[0] + '.zip'


def zipWriteData(z, path, data):
    z.writestr(zipfile.ZipInfo(path), data, zipfile.ZIP_DEFLATED)


def zipWriteDir(z, path):
    zipWriteData(z, path + os.sep, b'')


def zipDir(inpath, outpath, name):
    with zipfile.ZipFile(outpath, 'w', zipfile.ZIP_DEFLATED, True) as z:
        for root, _, files in os.walk(inpath):
            if root == inpath:
                relpath = name
            else:
                relpath = os.path.join(name, os.path.relpath(root, inpath))
            zipWriteDir(z, relpath)

            for file in files:
                zipWriteData(z, os.path.join(relpath, file),
                             readfile(os.path.join(root, file)))
