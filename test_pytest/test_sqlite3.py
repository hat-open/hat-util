import datetime
import sqlite3

import pytest

from hat import util


@pytest.fixture(scope='session', autouse=True)
def register_sqlite3_timestamp_converter():
    sqlite3.register_adapter(datetime.datetime, util.sqlite3_adapt_datetime)
    sqlite3.register_converter("timestamp", util.sqlite3_convert_timestamp)


@pytest.mark.parametrize("t", [
    datetime.datetime.now(),
    datetime.datetime(2000, 1, 1),
    datetime.datetime(2000, 1, 2, 3, 4, 5, 123456),
    datetime.datetime(2000, 1, 2, 3, 4, 5, 123456,
                      tzinfo=datetime.timezone.utc),
    datetime.datetime(2000, 1, 2, 3, 4, 5, 123456,
                      tzinfo=datetime.timezone(datetime.timedelta(hours=1,
                                                                  minutes=2))),
    datetime.datetime(2000, 1, 2, 3, 4, 5, 123456,
                      tzinfo=datetime.timezone(-datetime.timedelta(hours=1,
                                                                   minutes=2)))
])
def test_sqlite3_timestamp_converter(t):
    with sqlite3.connect(':memory:',
                         isolation_level=None,
                         detect_types=sqlite3.PARSE_DECLTYPES) as conn:
        conn.execute("CREATE TABLE test (t TIMESTAMP)")
        conn.execute("INSERT INTO test VALUES (:t)", {'t': t})

        result = conn.execute("SELECT t FROM test").fetchone()[0]
        assert result == t
