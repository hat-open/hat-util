from pathlib import Path
import subprocess
import tempfile

from hat.doit import common
from hat.doit.c import get_task_clang_format
from hat.doit.docs import (build_sphinx,
                           build_pdoc)
from hat.doit.js import (build_npm,
                         ESLintConf,
                         run_eslint)
from hat.doit.py import (build_wheel,
                         run_pytest,
                         run_flake8)


__all__ = ['task_clean_all',
           'task_node_modules',
           'task_build',
           'task_build_py',
           'task_build_js',
           'task_build_ts',
           'task_test',
           'task_test_pytest',
           'task_test_jest',
           'task_check',
           'task_format',
           'task_docs']


build_dir = Path('build')
src_py_dir = Path('src_py')
src_js_dir = Path('src_js')
src_c_dir = Path('src_c')
pytest_dir = Path('test_pytest')
jest_dir = Path('test_jest')
docs_dir = Path('docs')

build_py_dir = build_dir / 'py'
build_js_dir = build_dir / 'js'
build_ts_dir = build_dir / 'ts'
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
            license=common.License.APACHE2)

    return {'actions': [build]}


def task_build_js():
    """Build JavaScript npm"""

    def build():
        build_npm(
            src_dir=build_ts_dir,
            dst_dir=build_js_dir,
            name='@hat-open/util',
            description='Hat utility module',
            license=common.License.APACHE2,
            homepage='https://github.com/hat-open/hat-util',
            repository='hat-open/hat-util')

    return {'actions': [build],
            'task_dep': ['build_ts',
                         'node_modules']}


def task_build_ts():
    """Build TypeScript"""

    def build():
        subprocess.run(['node_modules/.bin/tsc'],
                       check=True)

    return {'actions': [build],
            'task_dep': ['node_modules']}


def task_test():
    """Test"""
    return {'actions': None,
            'task_dep': ['test_pytest',
                         'test_jest']}


def task_test_pytest():
    """Test pytest"""
    return {'actions': [lambda args: run_pytest(pytest_dir, *(args or []))],
            'pos_arg': 'args'}


def task_test_jest():
    """Test jest"""

    def run(args):
        subprocess.run(['node_modules/.bin/jest', *(args or [])],
                       check=True)

    return {'actions': [run],
            'pos_arg': 'args',
            'task_dep': ['node_modules']}


def task_check():
    """Check"""
    return {'actions': [(run_flake8, [src_py_dir]),
                        (run_flake8, [pytest_dir]),
                        (run_eslint, [src_js_dir, ESLintConf.TS]),
                        (run_eslint, [jest_dir, ESLintConf.TS])],
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
        subprocess.run(['node_modules/.bin/typedoc',
                        '--logLevel', 'Warn',
                        '--name', '@hat-open/util',
                        '--out', str(build_docs_dir / 'js_api'),
                        str(src_js_dir / 'index.ts')],
                       check=True)

        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            path = tmpdir / 'Doxyfile'
            path.write_text(_doxyfile)
            subprocess.run(['doxygen', str(path)],
                           check=True)

    return {'actions': [build],
            'task_dep': ['node_modules']}


_doxyfile = f"""
PROJECT_NAME          = "hat-util"
PROJECT_NUMBER        = "{common.get_version()}"
PROJECT_BRIEF         = "Utility library"
OUTPUT_DIRECTORY      = {build_docs_dir / 'c_api'}
INPUT                 = {src_c_dir}
FILE_PATTERNS         = *.h
RECURSIVE             = YES
STRIP_FROM_PATH       = {src_c_dir}
OPTIMIZE_OUTPUT_FOR_C = YES
SEARCHENGINE          = NO
GENERATE_TREEVIEW     = YES
FULL_SIDEBAR          = YES
DISABLE_INDEX         = YES
EXTRACT_ALL           = YES
EXTRACT_STATIC        = YES
GENERATE_LATEX        = NO
HTML_OUTPUT           = .
QUIET                 = YES
"""
