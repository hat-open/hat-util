from pathlib import Path

from hat.doit import common

from .c import *  # NOQA
from .docs import *  # NOQA
from .js import *  # NOQA
from .py import *  # NOQA
from . import c
from . import docs
from . import js
from . import py


__all__ = ['task_clean_all',
           'task_build',
           'task_check',
           'task_test',
           'task_format',
           *c.__all__,
           *docs.__all__,
           *js.__all__,
           *py.__all__]


build_dir = Path('build')


def task_clean_all():
    """Clean all"""
    return {'actions': [(common.rm_rf, [build_dir])]}


def task_build():
    """Build"""
    return {'actions': None,
            'task_dep': ['py_build',
                         'js_build']}


def task_check():
    """Check"""
    return {'actions': None,
            'task_dep': ['py_check',
                         'js_check']}


def task_test():
    """Test"""
    return {'actions': None,
            'task_dep': ['py_test']}


def task_format():
    """Format"""
    return {'actions': None,
            'task_dep': ['c_format']}
