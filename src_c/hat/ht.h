#ifndef HAT_HT_H
#define HAT_HT_H

#include <stddef.h>
#include <stdint.h>
#include "allocator.h"

#define HAT_HT_SUCCESS 0
#define HAT_HT_ERROR 1

#ifdef __cplusplus
extern "C" {
#endif

typedef struct hat_ht_t hat_ht_t;
typedef void *hat_ht_iter_t;


hat_ht_t *hat_ht_create(hat_allocator_t *a, size_t avg_count);
void hat_ht_destroy(hat_ht_t *t);
int hat_ht_resize(hat_ht_t *t, size_t avg_count);
size_t hat_ht_count(hat_ht_t *t);
size_t hat_ht_avg_count(hat_ht_t *t);

int hat_ht_set(hat_ht_t *t, uint8_t *key, size_t key_size, void *value);
int hat_ht_set_s(hat_ht_t *t, char *key, void *value);
int hat_ht_set_i64(hat_ht_t *t, int64_t key, void *value);
int hat_ht_set_u64(hat_ht_t *t, uint64_t key, void *value);

void *hat_ht_get(hat_ht_t *t, uint8_t *key, size_t key_size);
void *hat_ht_get_s(hat_ht_t *t, char *key);
void *hat_ht_get_i64(hat_ht_t *t, int64_t key);
void *hat_ht_get_u64(hat_ht_t *t, uint64_t key);

int hat_ht_del(hat_ht_t *t, uint8_t *key, size_t key_size);
int hat_ht_del_s(hat_ht_t *t, char *key);
int hat_ht_del_i64(hat_ht_t *t, int64_t key);
int hat_ht_del_u64(hat_ht_t *t, uint64_t key);

hat_ht_iter_t hat_ht_iter_next(hat_ht_t *t, hat_ht_iter_t prev);
int hat_ht_iter_key(hat_ht_iter_t i, uint8_t **key, size_t *key_size);
int hat_ht_iter_key_s(hat_ht_iter_t i, char **key);
int hat_ht_iter_key_i64(hat_ht_iter_t i, int64_t *key);
int hat_ht_iter_key_u64(hat_ht_iter_t i, uint64_t *key);
int hat_ht_iter_value(hat_ht_iter_t i, void **value);

#ifdef __cplusplus
}
#endif
#endif
