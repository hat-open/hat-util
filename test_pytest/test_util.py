import datetime
import sqlite3

import pytest

from hat import util


@pytest.fixture(scope='session', autouse=True)
def register_sqlite3_timestamp_converter():
    util.register_sqlite3_timestamp_converter()


def test_first():
    x = [1, 2, 3]
    assert util.first(x) == 1
    assert util.first([]) is None
    assert util.first(x, lambda x: x > 1) == 2
    assert util.first(x, lambda x: x > 3) is None
    assert util.first([], default=4) == 4


def test_first_example():
    assert util.first(range(3)) == 0
    assert util.first(range(3), lambda x: x > 1) == 2
    assert util.first(range(3), lambda x: x > 2) is None
    assert util.first(range(3), lambda x: x > 2, 123) == 123
    assert util.first({1: 'a', 2: 'b', 3: 'c'}) == 1
    assert util.first([], default=123) == 123


def test_callback_registry():
    counter = 0

    def on_event():
        nonlocal counter
        counter = counter + 1

    registry = util.CallbackRegistry()

    assert counter == 0

    with registry.register(on_event):
        registry.notify()

    assert counter == 1

    registry.notify()

    assert counter == 1


def test_callback_registry_example():
    x = []
    y = []
    registry = util.CallbackRegistry()

    registry.register(x.append)
    registry.notify(1)
    with registry.register(y.append):
        registry.notify(2)
    registry.notify(3)

    assert x == [1, 2, 3]
    assert y == [2]


@pytest.mark.parametrize('value_count', [1, 2, 10])
@pytest.mark.parametrize('cb_count', [0, 1, 2, 10])
def test_callback_registry_with_exception_cb(value_count, cb_count):

    def exception_cb(e):
        assert isinstance(e, Exception)
        raised.append(str(e))

    def cb(value):
        raise Exception(value)

    registry = util.CallbackRegistry(exception_cb)
    handlers = [registry.register(cb) for _ in range(cb_count)]

    raised = []
    expected = []
    for value in range(value_count):
        registry.notify(str(value))
        expected.extend(str(value) for _ in range(cb_count))
        assert raised == expected

    for handler in handlers:
        handler.cancel()

    raised = []
    expected = []
    for value in range(value_count):
        registry.notify(str(value))
        assert raised == expected


@pytest.mark.parametrize('cb_count', [1, 2, 10])
def test_callback_registry_without_exception_cb(cb_count):

    def cb():
        nonlocal call_count
        call_count += 1
        raise Exception()

    registry = util.CallbackRegistry()
    for _ in range(cb_count):
        registry.register(cb)

    call_count = 0
    with pytest.raises(Exception):
        registry.notify()
    assert call_count == 1


def test_get_unused_tcp_port():
    port = util.get_unused_tcp_port()
    assert isinstance(port, int)
    assert 0 < port <= 0xFFFF


def test_get_unused_udp_port():
    port = util.get_unused_udp_port()
    assert isinstance(port, int)
    assert 0 < port <= 0xFFFF


def test_bytes_buffer():
    buff = util.BytesBuffer()

    assert len(buff) == 0
    data = buff.read()
    assert bytes(data) == b''
    assert len(buff) == 0

    buff.add(b'a')
    buff.add(b'b')
    buff.add(b'c')
    assert len(buff) == 3
    data = buff.read()
    assert bytes(data) == b'abc'
    assert len(buff) == 0

    buff.add(b'12')
    buff.add(b'34')
    buff.add(b'56')
    assert len(buff) == 6
    data = buff.read(3)
    assert bytes(data) == b'123'
    assert len(buff) == 3
    data = buff.read(6)
    assert bytes(data) == b'456'
    assert len(buff) == 0

    buff.add(b'123')
    assert len(buff) == 3
    assert buff.clear() == 3
    assert len(buff) == 0


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
