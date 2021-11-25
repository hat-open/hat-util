from pathlib import Path


__all__ = ['task_c_format']


def task_c_format():
    """C - format with clang-format"""
    files = [*Path('src_c/hat').rglob('*.c'),
             *Path('src_c/hat').rglob('*.h')]
    for f in files:
        yield {'name': str(f),
               'actions': [f'clang-format -style=file -i {f}'],
               'file_dep': [f]}
