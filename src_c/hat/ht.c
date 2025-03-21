#include "ht.h"
#include <stddef.h>
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


static int resize(hat_ht_t *t) {
    if (t->count * 2 < 8)
        return HAT_HT_SUCCESS;

    size_t avg_count = (t->cap - 1) * 8 / 10;
    if (t->count < avg_count && t->count > avg_count / 4)
        return HAT_HT_SUCCESS;

    size_t new_cap = t->count * 2 * 10 / 8 + 1;

    element_t **new_slots =
        hat_allocator_alloc(t->a, new_cap * sizeof(element_t *));
    if (!new_slots)
        return HAT_HT_ERROR;

    memset(new_slots, 0, new_cap * sizeof(element_t *));

    for (size_t i = 0; i < t->cap; ++i) {
        element_t *el = t->slots[i];
        while (el) {
            element_t *next = el->next;
            el->next = new_slots[el->hash % new_cap];
            new_slots[el->hash % new_cap] = el;
            el = next;
        }
    }

    hat_allocator_free(t->a, t->slots);

    t->cap = new_cap;
    t->slots = new_slots;
    return HAT_HT_SUCCESS;
}


hat_ht_t *hat_ht_create(hat_allocator_t *a) {
    hat_ht_t *t = hat_allocator_alloc(a, sizeof(hat_ht_t));
    if (!t)
        return NULL;

    t->a = a;
    t->count = 0;
    t->cap = 8 * 10 / 8 + 1;

    t->slots = hat_allocator_alloc(a, t->cap * sizeof(element_t *));
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


int hat_ht_set(hat_ht_t *t, void *key, size_t key_size, void *value) {
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

    if (el) {
        el->value = value;
        return HAT_HT_SUCCESS;
    }

    el = hat_allocator_alloc(t->a, sizeof(element_t) + key_size);
    if (!el)
        return HAT_HT_ERROR;

    el->next = NULL;
    el->hash = hash;
    el->key_size = key_size;
    el->value = value;
    memcpy(el->key, key, key_size);

    *slot = el;
    t->count += 1;

    resize(t); // TODO check resize error

    return HAT_HT_SUCCESS;
}


void *hat_ht_get(hat_ht_t *t, void *key, size_t key_size) {
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


void *hat_ht_pop(hat_ht_t *t, void *key, size_t key_size) {
    size_t hash = hash_function(key, key_size);
    element_t **slot = t->slots + (hash % t->cap);

    while (*slot) {
        if ((*slot)->hash == hash && (*slot)->key_size == key_size &&
            memcmp((*slot)->key, key, key_size) == 0) {
            element_t *el = *slot;
            void *value = el->value;
            *slot = el->next;
            hat_allocator_free(t->a, el);
            t->count -= 1;
            resize(t); // TODO check resize error
            return value;
        }
        slot = &((*slot)->next);
    }

    return NULL;
}


int hat_ht_del(hat_ht_t *t, void *key, size_t key_size) {
    size_t hash = hash_function(key, key_size);
    element_t **slot = t->slots + (hash % t->cap);

    while (*slot) {
        if ((*slot)->hash == hash && (*slot)->key_size == key_size &&
            memcmp((*slot)->key, key, key_size) == 0) {
            element_t *el = *slot;
            *slot = el->next;
            hat_allocator_free(t->a, el);
            t->count -= 1;
            resize(t); // TODO check resize error
            return HAT_HT_SUCCESS;
        }
        slot = &((*slot)->next);
    }

    return HAT_HT_ERROR;
}


hat_ht_iter_t hat_ht_iter_next(hat_ht_t *t, hat_ht_iter_t prev) {
    element_t *el = prev;

    if (el && el->next)
        return el->next;

    for (size_t i = (el ? (el->hash % t->cap) + 1 : 0); i < t->cap; ++i) {
        if (t->slots[i])
            return t->slots[i];
    }

    return NULL;
}


void *hat_ht_iter_key(hat_ht_iter_t i) {
    element_t *el = i;
    return el->key;
}


size_t hat_ht_iter_key_size(hat_ht_iter_t i) {
    element_t *el = i;
    return el->key_size;
}


void *hat_ht_iter_value(hat_ht_iter_t i) {
    element_t *el = i;
    return el->value;
}
