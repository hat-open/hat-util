from hat import util


def test_get_unused_tcp_port():
    port = util.get_unused_tcp_port()
    assert isinstance(port, int)
    assert 0 < port <= 0xFFFF


def test_get_unused_udp_port():
    port = util.get_unused_udp_port()
    assert isinstance(port, int)
    assert 0 < port <= 0xFFFF
