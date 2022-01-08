#include "ht.h"
#include <stdint.h>
#include <string.h>


typedef struct element_t {
    struct element_t *next;
    size_t hash;
    size_t key_size;
    void *value;
    uint8_t key[];
} element_t;

struct hat_ht_t {
    hat_allocator_t *a;
    size_t count;
    size_t cap;
    element_t **slots;
};


static size_t hash_function(uint8_t *key, size_t key_size) {
    size_t fnv_prime = (sizeof(size_t) > 4 ? 1099511628211ULL : 16777619UL);
    size_t hash = (sizeof(size_t) > 4 ? 14695981039346656037ULL : 2166136261UL);

    for (size_t i = 0; i < key_size; ++i) {
        hash ^= key[i];
        hash *= fnv_prime;
    }

    return hash;
}


hat_ht_t *hat_ht_create(hat_allocator_t *a, size_t avg_count) {
    hat_ht_t *t = hat_allocator_alloc(a, sizeof(hat_ht_t), NULL);
    if (!t)
        return NULL;

    t->a = a;
    t->count = 0;
    t->cap = avg_count * 10 / 8 + 1;

    t->slots = hat_allocator_alloc(a, t->cap * sizeof(element_t *), NULL);
    if (!t->slots) {
        hat_allocator_free(a, t);
        return NULL;
    }

    memset(t->slots, 0, t->cap * sizeof(element_t *));
    return t;
}


void hat_ht_destroy(hat_ht_t *t) {
    for (size_t i = 0; i < t->cap; ++i) {
        element_t *el = t->slots[i];
        while (el) {
            element_t *next = el->next;
            hat_allocator_free(t->a, el);
            el = next;
        }
    }

    hat_allocator_free(t->a, t->slots);
    hat_allocator_free(t->a, t);
}


size_t hat_ht_count(hat_ht_t *t) { return t->count; }


int hat_ht_set(hat_ht_t *t, uint8_t *key, size_t key_size, void *value) {
    size_t hash = hash_function(key, key_size);
    element_t *el = NULL;
    element_t **slot = t->slots + (hash % t->cap);

    while (*slot) {
        if ((*slot)->hash == hash && (*slot)->key_size == key_size &&
            memcmp((*slot)->key, key, key_size) == 0) {
            el = *slot;
            break;
        }
        slot = &((*slot)->next);
    }

    if (!el) {
        el = hat_allocator_alloc(t->a, sizeof(element_t) + key_size, NULL);
        if (!el)
            return HAT_HT_ERROR;

        el->next = NULL;
        el->hash = hash;
        el->key_size = key_size;
        memcpy(el->key, key, key_size);

        *slot = el;
        t->count += 1;
    }

    el->value = value;
    return HAT_HT_SUCCESS;
}


int hat_ht_set_s(hat_ht_t *t, char *key, void *value) {
    return hat_ht_set(t, (void *)key, strlen(key) + 1, value);
}


int hat_ht_set_i64(hat_ht_t *t, int64_t key, void *value) {
    return hat_ht_set(t, (void *)&key, sizeof(int64_t), value);
}


int hat_ht_set_u64(hat_ht_t *t, uint64_t key, void *value) {
    return hat_ht_set(t, (void *)&key, sizeof(uint64_t), value);
}


void *hat_ht_get(hat_ht_t *t, uint8_t *key, size_t key_size) {
    size_t hash = hash_function(key, key_size);
    element_t *el = t->slots[hash % t->cap];

    while (el) {
        if (el->hash == hash && el->key_size == key_size &&
            memcmp(el->key, key, key_size) == 0) {
            return el->value;
        }
        el = el->next;
    }

    return NULL;
}


void *hat_ht_get_s(hat_ht_t *t, char *key) {
    return hat_ht_get(t, (void *)key, strlen(key) + 1);
}


void *hat_ht_get_i64(hat_ht_t *t, int64_t key) {
    return hat_ht_get(t, (void *)&key, sizeof(int64_t));
}


void *hat_ht_get_u64(hat_ht_t *t, uint64_t key) {
    return hat_ht_get(t, (void *)&key, sizeof(uint64_t));
}


int hat_ht_del(hat_ht_t *t, uint8_t *key, size_t key_size) {
    size_t hash = hash_function(key, key_size);
    element_t **slot = t->slots + (hash % t->cap);

    while (*slot) {
        if ((*slot)->hash == hash && (*slot)->key_size == key_size &&
            memcmp((*slot)->key, key, key_size) == 0) {
            element_t *el = *slot;
            *slot = el->next;
            hat_allocator_free(t->a, el);
            t->count -= 1;
            return HAT_HT_SUCCESS;
        }
        slot = &((*slot)->next);
    }

    return HAT_HT_ERROR;
}


int hat_ht_del_s(hat_ht_t *t, char *key) {
    return hat_ht_del(t, (void *)key, strlen(key) + 1);
}


int hat_ht_del_i64(hat_ht_t *t, int64_t key) {
    return hat_ht_del(t, (void *)&key, sizeof(int64_t));
}


int hat_ht_del_u64(hat_ht_t *t, uint64_t key) {
    return hat_ht_del(t, (void *)&key, sizeof(uint64_t));
}


int hat_ht_iter_init(hat_ht_t *t, hat_ht_iter_t *i) {
    i->t = t;
    i->el = NULL;

    for (size_t j = 0; j < t->cap; ++j) {
        if (t->slots[j]) {
            i->el = t->slots[j];
            return HAT_HT_SUCCESS;
        }
    }

    return HAT_HT_ERROR;
}


int hat_ht_iter_next(hat_ht_iter_t *i) {
    element_t *el = i->el;
    if (!el)
        return HAT_HT_ERROR;

    if (el->next) {
        i->el = el->next;
        return HAT_HT_SUCCESS;
    }

    hat_ht_t *t = i->t;
    for (size_t j = (el->hash % t->cap) + 1; j < t->cap; ++i) {
        if (t->slots[j]) {
            i->el = t->slots[j];
            return HAT_HT_SUCCESS;
        }
    }

    i->el = NULL;
    return HAT_HT_ERROR;
}


int hat_ht_iter_key(hat_ht_iter_t *i, uint8_t **key, size_t *key_size) {
    element_t *el = i->el;
    if (!el)
        return HAT_HT_ERROR;

    *key = el->key;
    *key_size = el->key_size;
    return HAT_HT_SUCCESS;
}


int hat_ht_iter_key_s(hat_ht_iter_t *i, char **key) {
    element_t *el = i->el;
    if (!el)
        return HAT_HT_ERROR;

    *key = (char *)el->key;
    return HAT_HT_SUCCESS;
}


int hat_ht_iter_key_i64(hat_ht_iter_t *i, int64_t *key) {
    element_t *el = i->el;
    if (!el)
        return HAT_HT_ERROR;

    *key = *((int64_t *)el->key);
    return HAT_HT_SUCCESS;
}


int hat_ht_iter_key_u64(hat_ht_iter_t *i, uint64_t *key) {
    element_t *el = i->el;
    if (!el)
        return HAT_HT_ERROR;

    *key = *((uint64_t *)el->key);
    return HAT_HT_SUCCESS;
}


int hat_ht_iter_value(hat_ht_iter_t *i, void **value) {
    element_t *el = i->el;
    if (!el)
        return HAT_HT_ERROR;

    *value = el->value;
    return HAT_HT_SUCCESS;
}
