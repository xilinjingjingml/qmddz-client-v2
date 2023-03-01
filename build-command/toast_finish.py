# coding=utf-8
# pip install win10toast
import win10toast

def run(config):
    win10toast.ToastNotifier().show_toast(title="build-command", msg="finish !!!")
