#include "ring.h"

#include <stdatomic.h>
#include <string.h>


struct hat_ring_t {
    hat_allocator_t *a;
    size_t size;
    volatile atomic_size_t head;
    volatile atomic_size_t tail;
    uint8_t data[];
};


static inline void move_head(hat_ring_t *r, size_t len) {
    size_t head = atomic_load(&(r->head));
    atomic_store(&(r->head), (head + len) % (r->size + 1));
}


static inline void move_tail(hat_ring_t *r, size_t len) {
    size_t tail = atomic_load(&(r->tail));
    atomic_store(&(r->tail), (tail + len) % (r->size + 1));
}


hat_ring_t *hat_ring_create(hat_allocator_t *a, size_t size) {
    hat_ring_t *r = hat_allocator_alloc(a, sizeof(hat_ring_t) + size + 1);
    if (!r)
        return NULL;

    r->a = a;
    r->size = size;

    atomic_init(&(r->head), 0);
    atomic_init(&(r->tail), 0);

    return r;
}


void hat_ring_destroy(hat_ring_t *r) { hat_allocator_free(r->a, r); }


size_t hat_ring_len(hat_ring_t *r) {
    size_t head = atomic_load(&(r->head));
    size_t tail = atomic_load(&(r->tail));

    if (head <= tail)
        return tail - head;

    return r->size + 1 - (head - tail);
}


size_t hat_ring_size(hat_ring_t *r) { return r->size; }


void hat_ring_move_head(hat_ring_t *r, size_t len) {
    size_t max_len = hat_ring_len(r);
    move_head(r, (len < max_len ? len : max_len));
}


void hat_ring_move_tail(hat_ring_t *r, size_t len) {
    size_t max_len = r->size - hat_ring_len(r);
    move_tail(r, (len < max_len ? len : max_len));
}


size_t hat_ring_read(hat_ring_t *r, uint8_t *data, size_t data_len) {
    size_t max_len = hat_ring_len(r);

    if (data_len > max_len)
        data_len = max_len;

    if (!data_len)
        return 0;

    size_t head = atomic_load(&(r->head));

    if (r->size - head >= data_len) {
        memcpy(data, r->data + head + 1, data_len);

    } else {
        memcpy(data, r->data + head + 1, r->size - head);
        memcpy(data + r->size - head, r->data, data_len - r->size + head);
    }

    move_head(r, data_len);

    return data_len;
}


size_t hat_ring_write(hat_ring_t *r, uint8_t *data, size_t data_len) {
    size_t max_len = r->size - hat_ring_len(r);

    if (data_len > max_len)
        data_len = max_len;

    if (!data_len)
        return 0;

    size_t tail = atomic_load(&(r->tail));

    if (r->size - tail >= data_len) {
        memcpy(r->data + tail + 1, data, data_len);

    } else {
        memcpy(r->data + tail + 1, data, r->size - tail);
        memcpy(r->data, data + r->size - tail, data_len - r->size + tail);
    }

    move_tail(r, data_len);

    return data_len;
}


void hat_ring_used(hat_ring_t *r, uint8_t *data[2], size_t data_len[2]) {
    size_t head = atomic_load(&(r->head));
    size_t used_len = hat_ring_len(r);

    data[0] = (head == r->size ? r->data : r->data + head + 1);
    data[1] = r->data;

    if (used_len <= r->size - head || head == r->size) {
        data_len[0] = used_len;
        data_len[1] = 0;

    } else {
        data_len[0] = r->size - head;
        data_len[1] = used_len - r->size + head;
    }
}


void hat_ring_unused(hat_ring_t *r, uint8_t *data[2], size_t data_len[2]) {
    size_t tail = atomic_load(&(r->tail));
    size_t unused_len = r->size - hat_ring_len(r);

    data[0] = (tail == r->size ? r->data : r->data + tail + 1);
    data[1] = r->data;

    if (unused_len <= r->size - tail || tail == r->size) {
        data_len[0] = unused_len;
        data_len[1] = 0;

    } else {
        data_len[0] = r->size - tail;
        data_len[1] = unused_len - r->size + tail;
    }
}
