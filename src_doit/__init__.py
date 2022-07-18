from pathlib import Path

from hat.doit import common
from hat.doit.c import get_task_clang_format
from hat.doit.docs import (build_sphinx,
                           build_pdoc,
                           build_jsdoc)
from hat.doit.js import (build_npm,
                         run_eslint)
from hat.doit.py import (build_wheel,
                         run_pytest,
                         run_flake8)


__all__ = ['task_clean_all',
           'task_node_modules',
           'task_build',
           'task_build_py',
           'task_build_js',
           'task_test',
           'task_check',
           'task_format',
           'task_docs']


build_dir = Path('build')
src_py_dir = Path('src_py')
src_js_dir = Path('src_js')
pytest_dir = Path('test_pytest')
docs_dir = Path('docs')

build_py_dir = build_dir / 'py'
build_js_dir = build_dir / 'js'
build_docs_dir = build_dir / 'docs'


def task_clean_all():
    """Clean all"""
    return {'actions': [(common.rm_rf, [build_dir])]}


def task_node_modules():
    """Install node_modules"""
    return {'actions': ['yarn install --silent']}


def task_build():
    """Build"""
    return {'actions': None,
            'task_dep': ['build_py',
                         'build_js']}


def task_build_py():
    """Build Python wheel"""

    def build():
        build_wheel(
            src_dir=src_py_dir,
            dst_dir=build_py_dir,
            name='hat-util',
            description='Hat utility library',
            url='https://github.com/hat-open/hat-util',
            license=common.License.APACHE2,
            requirements_path=None)

    return {'actions': [build]}


def task_build_js():
    """Build JavaScript npm"""

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
            'task_dep': ['node_modules']}


def task_test():
    """Test"""
    return {'actions': [lambda args: run_pytest(pytest_dir, *(args or []))],
            'pos_arg': 'args'}


def task_check():
    """Check"""
    return {'actions': [(run_flake8, [src_py_dir]),
                        (run_flake8, [pytest_dir]),
                        (run_eslint, [src_js_dir])],
            'task_dep': ['node_modules']}


def task_format():
    """Format"""
    yield from get_task_clang_format([*Path('src_c/hat').rglob('*.c'),
                                      *Path('src_c/hat').rglob('*.h')])


def task_docs():
    """Docs - build documentation"""

    def build():
        build_sphinx(src_dir=docs_dir,
                     dst_dir=build_docs_dir,
                     project='hat-util')
        build_pdoc(module='hat.util',
                   dst_dir=build_docs_dir / 'py_api')
        build_jsdoc(src_js_dir, build_docs_dir / 'js_api')

    return {'actions': [build],
            'task_dep': ['node_modules']}
