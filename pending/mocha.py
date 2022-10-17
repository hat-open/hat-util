from pathlib import Path
import tempfile
import subprocess

from playwright.sync_api import sync_playwright


def build_webpack():
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        config_path = tmpdir / 'webpack.config.js'
        config_path.write_text(_webpack_conf.format(
            src_path=Path('test_mocha/index.ts').resolve(),
            dst_dir=Path('build/test_mocha').resolve()))
        subprocess.run(['node_modules/.bin/webpack',
                        '--config', str(config_path)],
                       check=True)


def run_mocha(path: Path):
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        page.on("pageerror", print_error)
        page.add_script_tag(path=Path('node_modules/mocha/mocha.js'))
        page.add_script_tag(content="""
            mocha.setup('bdd');
            throw typeof mocha;
        """)
        page.add_script_tag(path=path)
        result = page.evaluate_handle('runMocha()').json_value()
        browser.close()
        return result


def print_error(err):
    print('page error:', err.message)
    if err.stack:
        print(err.stack)


_webpack_conf = r"""
module.exports = {{
    mode: 'none',
    entry: '{src_path}',
    output: {{
        filename: 'test.js',
        path: '{dst_dir}',
        library: {{
            name: 'runMocha',
            type: 'var',
            export: 'default'
        }}
    }},
    module: {{
        rules: [
            {{
                test: /\.ts$/,
                use: 'ts-loader'
            }}
        ]
    }},
    resolve: {{
        extensions: ['.ts', '.js'],
    }},
    devtool: 'source-map',
    stats: 'errors-only'
}};
"""
