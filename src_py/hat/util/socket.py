import contextlib
import socket


def get_unused_tcp_port(host: str = '127.0.0.1') -> int:
    """Search for unused TCP port"""
    with contextlib.closing(socket.socket()) as sock:
        sock.bind((host, 0))
        return sock.getsockname()[1]


def get_unused_udp_port(host: str = '127.0.0.1') -> int:
    """Search for unused UDP port"""
    with contextlib.closing(socket.socket(type=socket.SOCK_DGRAM)) as sock:
        sock.bind((host, 0))
        return sock.getsockname()[1]
