from pathlib import Path

from hat.doit.docs import (SphinxOutputType,
                           build_sphinx,
                           build_pdoc,
                           build_jsdoc)

from .js import src_js_dir


__all__ = ['task_docs',
           'task_docs_py',
           'task_docs_js']


build_docs_dir = Path('build/docs')
docs_dir = Path('docs')


def task_docs():
    """Docs - build documentation"""
    return {'actions': [(build_sphinx, [SphinxOutputType.HTML,
                                        docs_dir,
                                        build_docs_dir])],
            'task_dep': ['docs_py',
                         'docs_js']}


def task_docs_py():
    """Docs - build python documentation"""
    return {'actions': [(build_pdoc, ['hat.util',
                                      build_docs_dir / 'py_api'])]}


def task_docs_js():
    """Docs - build javascript documentation"""
    return {'actions': [(build_jsdoc, [src_js_dir,
                                       build_docs_dir / 'js_api'])],
            'task_dep': ['js_deps']}
