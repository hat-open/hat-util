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
        if n == 0 or self._data_len < 1:
            return b''

        if n < 0 or n >= self._data_len:
            data, self._data = self._data, collections.deque()
            data_len, self._data_len = self._data_len, 0

            if len(data) < 2:
                return data[0]

            return b''.join(data)

        self._data_len -= n

        head = self._data[0]
        head_len = len(head)

        if n < head_len:
            if not isinstance(head, memoryview):
                head = memoryview(head)

            self._data[0] = head[n:]
            return head[:n]

        if n == head_len:
            return self._data.popleft()

        data = collections.deque()
        data_len = 0

        while data_len < n:
            head = self._data.popleft()

            if data_len + len(head) > n:
                if not isinstance(head, memoryview):
                    head = memoryview(head)

                head, rest = head[:n-data_len], head[n-data_len:]
                self._data.appendleft(rest)

            data.append(head)
            data_len += len(head)

        return b''.join(data)

    def clear(self) -> int:
        """Clear data and return number of bytes cleared"""
        self._data.clear()
        data_len, self._data_len = self._data_len, 0
        return data_len
