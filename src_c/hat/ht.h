#ifndef HAT_HT_H
#define HAT_HT_H

/*! \file
    \brief Hash table

    This hash table implementation stores copies of key data and value
    pointers.
 */

#include <stddef.h>
#include <stdint.h>
#include "allocator.h"

#define HAT_HT_SUCCESS 0
#define HAT_HT_ERROR 1

#ifdef __cplusplus
extern "C" {
#endif

/*! \brief Hash table */
typedef struct hat_ht_t hat_ht_t;

/*! \brief Hash table iterator */
typedef void *hat_ht_iter_t;


/*! \brief Create new hash table
    \param[in] a allocator
    \param[in] avg_count estimated number of elements in table
    \return table or ``NULL`` on failure
 */
hat_ht_t *hat_ht_create(hat_allocator_t *a, size_t avg_count);

/*! \brief Destroy hash table
    \param[in] t table
 */
void hat_ht_destroy(hat_ht_t *t);

/*! \brief Reallocate hash table based on new average count
    \param[in] t table
    \param[in] avg_count new estimated number of elements in table
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_resize(hat_ht_t *t, size_t avg_count);

/*! \brief Number of elements in table
    \param[in] t table
    \return elements count
 */
size_t hat_ht_count(hat_ht_t *t);

/*! \brief Initially estimated number of elements in table
    \param[in] t table
    \return elements count
 */
size_t hat_ht_avg_count(hat_ht_t *t);

/*! \brief Set element in table
    \param[in] t table
    \param[in] key key
    \param[in] key_size key size
    \param[in] value value
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``

    If key already exist, value is overridden.
 */
int hat_ht_set(hat_ht_t *t, uint8_t *key, size_t key_size, void *value);

/*! \brief Set element in table (string key)
    \param[in] t table
    \param[in] key key
    \param[in] value value
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``

    If key already exist, value is overridden.
 */
int hat_ht_set_s(hat_ht_t *t, char *key, void *value);

/*! \brief Set element in table (int64_t key)
    \param[in] t table
    \param[in] key key
    \param[in] value value
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``

    If key already exist, value is overridden.
 */
int hat_ht_set_i64(hat_ht_t *t, int64_t key, void *value);

/*! \brief Set element in table (uint64_t key)
    \param[in] t table
    \param[in] key key
    \param[in] value value
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``

    If key already exist, value is overridden.
 */
int hat_ht_set_u64(hat_ht_t *t, uint64_t key, void *value);

/*! \brief Get element from table
    \param[in] t table
    \param[in] key key
    \param[in] key_size key size
    \return value or ``NULL`` on failure
 */
void *hat_ht_get(hat_ht_t *t, uint8_t *key, size_t key_size);

/*! \brief Get element from table (string key)
    \param[in] t table
    \param[in] key key
    \return value or ``NULL`` on failure
 */
void *hat_ht_get_s(hat_ht_t *t, char *key);

/*! \brief Get element from table (int64_t key)
    \param[in] t table
    \param[in] key key
    \return value or ``NULL`` on failure
 */
void *hat_ht_get_i64(hat_ht_t *t, int64_t key);

/*! \brief Get element from table (uint64_t key)
    \param[in] t table
    \param[in] key key
    \return value or ``NULL`` on failure
 */
void *hat_ht_get_u64(hat_ht_t *t, uint64_t key);

/*! \brief Delete element from table
    \param[in] t table
    \param[in] key key
    \param[in] key_size key size
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_del(hat_ht_t *t, uint8_t *key, size_t key_size);

/*! \brief Delete element from table (string key)
    \param[in] t table
    \param[in] key key
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_del_s(hat_ht_t *t, char *key);

/*! \brief Delete element from table (int64_t key)
    \param[in] t table
    \param[in] key key
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_del_i64(hat_ht_t *t, int64_t key);

/*! \brief Delete element from table (uint64_t key)
    \param[in] t table
    \param[in] key key
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_del_u64(hat_ht_t *t, uint64_t key);

/*! \brief Get next iterator position
    \param[in] t table
    \param[in] prev previous iterator position
    \return iterator or ``NULL``

    If `prev` is ``NULL``, new iterator points to first entry. If all
    entries are iterated, ``NULL`` is returned.
 */
hat_ht_iter_t hat_ht_iter_next(hat_ht_t *t, hat_ht_iter_t prev);

/*! \brief Get current key
    \param[in] i iterator
    \param[out] key key
    \param[out] key_size key size
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_iter_key(hat_ht_iter_t i, uint8_t **key, size_t *key_size);

/*! \brief Get current key (string key)
    \param[in] i iterator
    \param[out] key key
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_iter_key_s(hat_ht_iter_t i, char **key);

/*! \brief Get current key (int64_t key)
    \param[in] i iterator
    \param[out] key key
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_iter_key_i64(hat_ht_iter_t i, int64_t *key);

/*! \brief Get current key (uint64_t key)
    \param[in] i iterator
    \param[out] key key
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_iter_key_u64(hat_ht_iter_t i, uint64_t *key);

/*! \brief Get current value
    \param[in] i iterator
    \param[out] value value
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_iter_value(hat_ht_iter_t i, void **value);

#ifdef __cplusplus
}
#endif
#endif
