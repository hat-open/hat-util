import collections
import typing


Bytes: typing.TypeAlias = bytes | bytearray | memoryview


class BytesBuffer:
    """Bytes buffer

    All data added to BytesBuffer is considered immutable - it's content
    (including size) should not be modified.

    """

    def __init__(self):
        self._data = collections.deque()
        self._data_len = 0

    def __len__(self):
        return self._data_len

    def add(self, data: Bytes):
        """Add data"""
        if not data:
            return

        self._data.append(data)
        self._data_len += len(data)

    def read(self, n: int = -1) -> Bytes:
        """Read up to `n` bytes

        If ``n < 0``, read all data.

        """
        if n == 0:
            return b''

        if n < 0 or n >= self._data_len:
            data, self._data = self._data, collections.deque()
            data_len, self._data_len = self._data_len, 0

        else:
            data = collections.deque()
            data_len = 0

            while data_len < n:
                head = self._data.popleft()
                self._data_len -= len(head)

                if data_len + len(head) <= n:
                    data.append(head)
                    data_len += len(head)

                else:
                    head = memoryview(head)
                    head1, head2 = head[:n-data_len], head[n-data_len:]

                    data.append(head1)
                    data_len += len(head1)

                    self._data.appendleft(head2)
                    self._data_len += len(head2)

        if len(data) < 1:
            return b''

        if len(data) < 2:
            return data[0]

        data_bytes = bytearray(data_len)
        data_bytes_len = 0

        while data:
            head = data.popleft()
            data_bytes[data_bytes_len:data_bytes_len+len(head)] = head
            data_bytes_len += len(head)

        return data_bytes

    def clear(self) -> int:
        """Clear data and return number of bytes cleared"""
        self._data.clear()
        data_len, self._data_len = self._data_len, 0
        return data_len
