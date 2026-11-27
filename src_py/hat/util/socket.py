import contextlib
import socket


def get_unused_tcp_port(host: str = '127.0.0.1') -> int:
    """Search for unused TCP port"""
    return _get_unused_port(host, socket.SOCK_STREAM)


def get_unused_udp_port(host: str = '127.0.0.1') -> int:
    """Search for unused UDP port"""
    return _get_unused_port(host, socket.SOCK_DGRAM)


def _get_unused_port(host, socket_type):
    for family, _, proto, _, addr in socket.getaddrinfo(host=host,
                                                        port=0,
                                                        type=socket_type,
                                                        flags=socket.AI_PASSIVE):  # NOQA
        with contextlib.suppress(OSError):
            with contextlib.closing(socket.socket(family=family,
                                                  type=socket_type,
                                                  proto=proto)) as sock:
                sock.bind(addr)
                return sock.getsockname()[1]

    raise OSError('no address available')
