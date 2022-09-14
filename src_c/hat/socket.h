#ifndef HAT_SOCKET_H
#define HAT_SOCKET_H

#include <stdbool.h>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#include <iphlpapi.h>
#include <windows.h>
#else
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <unistd.h>
#endif

#include "buff.h"

#define HAT_SOCKET_SUCCESS 0
#define HAT_SOCKET_ERROR 1

#define HAT_SOCKET_TYPE_IP4_TCP 0
#define HAT_SOCKET_TYPE_IP4_UDP 1

#ifdef __cplusplus
extern "C" {
#endif

typedef uint32_t hat_socket_ip4_addr_t;
typedef uint16_t hat_socket_port_t;

typedef struct {
    int type;
    hat_socket_ip4_addr_t local_host;
    hat_socket_port_t local_port;
    hat_socket_ip4_addr_t remote_host;
    hat_socket_port_t remote_port;

    // internal
#ifdef _WIN32
    SOCKET socket;
#else
    int socket;
#endif
} hat_socket_t;


int hat_socket_setup();
void hat_socket_cleanup();

int hat_socket_addr_resolve(char *name, hat_socket_ip4_addr_t *host);
int hat_socket_addr_convert(char *addr, hat_socket_ip4_addr_t *host);

int hat_socket_open(hat_socket_t *s, int type);
int hat_socket_close(hat_socket_t *s);
int hat_socket_set_blocking(hat_socket_t *s, bool blocking);

int hat_socket_connect(hat_socket_t *s, hat_socket_ip4_addr_t host,
                       hat_socket_port_t port);
int hat_socket_bind(hat_socket_t *s, hat_socket_ip4_addr_t host,
                    hat_socket_port_t port);
int hat_socket_listen(hat_socket_t *s, int backlog);
int hat_socket_accept(hat_socket_t *s, hat_socket_t *client);

int hat_socket_send(hat_socket_t *s, hat_buff_t *data);
int hat_socket_send_to(hat_socket_t *s, hat_buff_t *data,
                       hat_socket_ip4_addr_t host, hat_socket_port_t port);
int hat_socket_receive(hat_socket_t *s, hat_buff_t *data);
int hat_socket_receive_from(hat_socket_t *s, hat_buff_t *data,
                            hat_socket_ip4_addr_t host, hat_socket_port_t port);

#ifdef __cplusplus
}
#endif

#endif
