from pathlib import Path

from hat.doit import common
from hat.doit.js import (build_npm,
                         run_eslint)


__all__ = ['task_js_build',
           'task_js_check',
           'task_js_deps']


build_js_dir = Path('build/js')
src_js_dir = Path('src_js')
node_modules_dir = Path('node_modules')
readme_path = Path('README.rst')


def task_js_build():
    """JavaScript - build"""

    def build():
        build_npm(
            src_dir=src_js_dir,
            dst_dir=build_js_dir,
            name='@hat-open/util',
            description='Hat utility module',
            license=common.License.APACHE2,
            homepage='https://github.com/hat-open/hat-util',
            repository='hat-open/hat-util')

    return {'actions': [build],
            'task_dep': ['js_deps']}


def task_js_check():
    """JavaScript - check with eslint"""
    return {'actions': [(run_eslint, [src_js_dir])],
            'task_dep': ['js_deps']}


def task_js_deps():
    """JavaScript - install dependencies"""
    return {'actions': ['yarn install --silent']}
