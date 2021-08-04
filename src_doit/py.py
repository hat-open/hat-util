from pathlib import Path
import subprocess
import sys

from hat.doit import common


__all__ = ['task_py_build',
           'task_py_check',
           'task_py_test']


build_dir = Path('build/py')
src_py_dir = Path('src_py')
pytest_dir = Path('test_pytest')
license_path = Path('LICENSE')


def task_py_build():
    """Python - build"""

    def build():
        common.rm_rf(build_dir)
        build_dir.mkdir(parents=True, exist_ok=True)

        common.cp_r(src_py_dir, build_dir)
        common.rm_rf(*build_dir.rglob('__pycache__'))

        manifest_path = build_dir / 'MANIFEST.in'
        paths = [path for path in build_dir.rglob('*') if not path.is_dir()]
        with open(manifest_path, 'w', encoding='utf-8') as f:
            for path in paths:
                f.write(f"include {path.relative_to(manifest_path.parent)}\n")

        readme = Path('README.rst').read_text().strip()
        version = common.get_version(common.VersionType.PIP)
        setup_py = _setup_py.format(readme=repr(readme),
                                    requirements=[],
                                    version=repr(version))
        (build_dir / 'setup.py').write_text(setup_py)

        common.cp_r(license_path, build_dir / 'LICENSE')

        subprocess.run([sys.executable, 'setup.py', '-q', 'bdist_wheel'],
                       cwd=str(build_dir),
                       check=True)

    return {'actions': [build]}


def task_py_check():
    """Python - check with flake8"""
    return {'actions': [(_run_flake8, [src_py_dir]),
                        (_run_flake8, [pytest_dir])]}


def task_py_test():
    """Python - test"""

    def run(args):
        subprocess.run([sys.executable, '-m', 'pytest',
                        '-s', '-p', 'no:cacheprovider',
                        *(args or [])],
                       cwd=str(pytest_dir),
                       check=True)

    return {'actions': [run],
            'pos_arg': 'args'}


def _run_flake8(path):
    subprocess.run([sys.executable, '-m', 'flake8', str(path)],
                   check=True)


_setup_py = r"""
from setuptools import setup

readme = {readme}
requirements = {requirements}
version = {version}

setup(
    name='hat-util',
    version=version,
    description='Hat utility library',
    long_description=readme,
    long_description_content_type='text/x-rst',
    url='https://github.com/hat-open/hat-util',
    license='Apache-2.0',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: Apache Software License'],
    packages=['hat'],
    include_package_data=True,
    install_requires=requirements,
    python_requires='>=3.8',
    options={{
        'bdist_wheel': {{
            'python_tag': 'cp38.cp39',
            'py_limited_api': 'cp38.cp39',
            'plat_name': 'any'
        }}
    }},
    zip_safe=False)
"""
