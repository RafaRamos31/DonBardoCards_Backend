# Aplicación Backend para sistema de recompensas (cartas) en Twitch

* Version 1.2.0
* Autor: @RafaRamos31
---
## Tecnologias Utilizadas
* **Node js**: como entorno de ejecucion y desarrollo

* **Express js**: para las solicitudes REST que se realizarán desde el lado del cliente en Twitch
* **GraphQL**: asistente de consultas a la base de datos para filtrado de información
* **Apollo Server**: servidor para consultas de GraphQL
* **MongoDB**: base de datos no relacional para guardar la información generada
* **tmi.js**: Biblioteca para conexion en tiempo real con el chat de Twitch

---

**NOTAS VERSION 1.2.0**

- Se reubicó la peticion de desencriptar nombre de usuario, ya no se maneja con Express sino que con GraphQL.