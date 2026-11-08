import time
from contextlib import contextmanager
from typing import Generator

@contextmanager
def measure_time_ms() -> Generator[dict, None, None]:
    start = time.perf_counter()
    result = {"elapsed_ms": 0.0}
    try:
        yield result
    finally:
        end = time.perf_counter()
        result["elapsed_ms"] = round((end - start) * 1000.0, 2)

