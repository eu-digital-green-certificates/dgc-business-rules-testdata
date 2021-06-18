from os import path
from pathlib import Path
from io import BytesIO
from json import load
from binascii import hexlify, unhexlify
from pytest import fixture, skip, fail
from pytest import mark
from glob import glob
from typing import Dict
from traceback import format_exc
from filecache import DAY,HOUR, MINUTE, filecache
from json import load
from jsonschema import validate as schema_validate
import os

CONFIG_ERROR = 'CONFIG_ERROR'

def _getSchema():
    try:
        with open(Path(path.dirname(path.dirname(path.abspath(__file__))),"tests","validation-rule-schema.json"), encoding='utf8') as file:
            print(file)
            schema = load(file)
        return schema
    except Exception:
       return {CONFIG_ERROR: format_exc()}

def pytest_generate_tests(metafunc):
    if "config_env" in metafunc.fixturenames:
        country_code = metafunc.config.getoption("country_code")
        file_name = metafunc.config.getoption("file_name")
        test_dir = path.dirname(path.dirname(path.abspath(__file__)))
        test_files = glob(
            str(Path(test_dir, country_code, "*", "rule.json")), recursive=True)
        metafunc.parametrize("config_env", test_files, indirect=True)

@fixture
def config_env(request):
    print(request.param)
    try:
        with open(request.param, encoding='utf8') as test_file:
            config_env = load(test_file)
            return config_env
    except Exception:
        return {CONFIG_ERROR: format_exc()}

def test_upload(config_env: Dict):
    schema_validate(config_env, _getSchema())
    