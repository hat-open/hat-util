#ifndef HAT_JSON_H
#define HAT_JSON_H

#include <stdbool.h>
#include <stdint.h>
#include "allocator.h"
#include "buff.h"

#ifndef HAT_JSON_MAX_DEPTH
#define HAT_JSON_MAX_DEPTH 1024
#endif

#define HAT_JSON_SUCCESS 0
#define HAT_JSON_ERROR (-1)

#define HAT_JSON_TOKEN_NULL 0
#define HAT_JSON_TOKEN_BOOL 1
#define HAT_JSON_TOKEN_INT 2
#define HAT_JSON_TOKEN_REAL 3
#define HAT_JSON_TOKEN_STR 4
#define HAT_JSON_TOKEN_ARR 5
#define HAT_JSON_TOKEN_ARR_END 6
#define HAT_JSON_TOKEN_OBJ 7
#define HAT_JSON_TOKEN_OBJ_KEY 8
#define HAT_JSON_TOKEN_OBJ_END 9

#ifdef __cplusplus
extern "C" {
#endif

typedef int hat_json_error_t;

typedef int hat_json_token_t;

typedef union {
    bool bool_value;
    int64_t int_value;
    double real_value;
    struct {
        char *data;
        size_t len;
    } str_value;
} hat_json_value_t;

// in case of HAT_JSON_TOKEN_ARR, HAT_JSON_TOKEN_OBJ and
// HAT_JSON_TOKEN_OBJ_KEY, return value is used as ctx for child tokens
typedef void *(*hat_json_parser_cb_t)(hat_json_token_t *token,
                                      hat_json_value_t *value, void *ctx);

typedef hat_json_error_t (*hat_json_writer_cb_t)(char *data, size_t len,
                                                 void *ctx);

typedef struct hat_json_parser_t hat_json_parser_t;

typedef struct hat_json_writer_t hat_json_writer_t;


hat_json_parser_t *hat_json_parser_create(hat_allocator_t *a,
                                          hat_json_parser_cb_t cb, void *ctx);
hat_json_error_t hat_json_parser_parse(hat_json_parser_t *p, hat_buff_t *buff);
bool hat_json_parser_empty(hat_json_parser_t *p);
void hat_json_parser_destroy(hat_json_parser_t *p);

hat_json_writer_t *hat_json_writer_create(hat_allocator_t *a,
                                          hat_json_writer_cb_t cb, void *ctx);
void hat_json_writer_write_null(hat_json_writer_t *w);
void hat_json_writer_write_bool(hat_json_writer_t *w, bool value);
void hat_json_writer_write_int(hat_json_writer_t *w, int64_t value);
void hat_json_writer_write_real(hat_json_writer_t *w, double value);
void hat_json_writer_write_str(hat_json_writer_t *w, char *value, size_t len);
void hat_json_writer_write_arr(hat_json_writer_t *w);
void hat_json_writer_write_obj(hat_json_writer_t *w);
void hat_json_writer_write_end(hat_json_writer_t *w);
void hat_json_writer_destroy(hat_json_writer_t *w);

#ifdef __cplusplus
}
#endif

#endif
