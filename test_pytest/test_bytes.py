from hat import util


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
