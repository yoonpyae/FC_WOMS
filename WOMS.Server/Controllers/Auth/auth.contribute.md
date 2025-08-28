# Authorization Token Management API

## Overview

This project provides an API for managing tokens, including revoking tokens for users. It is built with ASP.NET Core and follows best practices for API development.

## Features

- User authentication and authorization
- Token management
- Logging
- Error handling

## Endpoints

<details>
<summary><b>Access Token</b></summary>

This API endpoint generates an access token for a requested user. The token will be valid for one day, and a refresh token, valid for 30 days, will also be provided if the access token expires.

## Endpoint

#### `POST /access-token`

#### Request

- **Content-Type:** `application/json`
- **Body Parameters:**

```json
{
  "username": "string",
  "password": "string",
  "device": "string"
}
```
#### Response

- **200 OK: Successfully generated access token and refresh token.**
```json
{
  "success": true,
  "code": 200,
  "message": "Successfully generated access token.",
  "data": {
    "access_token": "string",
    "refresh_token": "string",
    "expiration": 30,
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "phoneNumber": "string",
      "user_role": "string"
    }
  }
}
```

- **400 Bad Request: If the request data is invalid.**

```json
{
  "success": false,
  "code": 400,
  "message": "Please fill in the required data.",
  "data": null
}
```

- **401 Unauthorized: If the username or password is invalid.**

```json
{
  "success": false,
  "code": 401,
  "message": "The username or password is invalid. Please try again.",
  "data": null
}
```

- **404 Not Found: If the user is not found.**

```json
{
  "success": false,
  "code": 404,
  "message": "Invalid username or email. User not found."
}
```

- **500 Internal Server Error: If there is an error on the server side.**

```json
{
  "success": false,
  "code": 500,
  "message": "An error occurred while generation the access token. See server logs for details."
}
```
</details>

<details>
<summary><b>Refresh Token</b></summary>

This API endpoint is used to generate a new access token and refresh token for a user who possesses a valid refresh token. The new refresh token will be valid for 30 days, while the new access token will be valid for 1 day.

## Endpoint
#### `POST /refresh-token`

#### Request

- **Content-Type:** `application/json`
- **Body Parameters:**

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "device": "string"
}
```
#### Response

- **200 OK: Successfully generated access token and refresh token.**
```json
{
  "success": true,
  "code": 200,
  "message": "Successfully generated access token.",
  "data": {
    "access_token": "string",
    "refresh_token": "string",
    "expiration": 30,
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "phoneNumber": "string",
      "user_role": "string"
    }
  }
}
```

- **401 Unauthorized**: If the access token is invalid, or the refresh token is invalid or expired.
```json
{
  "success": false,
  "code": 401,
  "message": "Invalid access token.",
  "data": null
}
```

- **404 Not Found**: If the user is not found.
```json
{
  "success": false,
  "code": 404,
  "message": "User not found",
  "data": null
}
```

- **500 Internal Server Error**: If an internal server error occurs.
```json
{
  "success": false,
  "code": 500,
  "message": "An error occurred while generation the refresh token. See server logs for details."
}
```

</details>

<details>
<summary><b>Revoke Token</b></summary>
</br>

This API endpoint allows for revoking the token of a specified user. This action will log out the user from the current device.

## Endpoint

#### `POST /revoke-token/{username}`

#### Request

- **Content-Type:** `application/json`

#### Parameters

- `username` (string): The username of the user whose token is to be revoked.
- `device` (string): The device identifier from which the user is logging out.

#### Response

- **200 OK: Token revoked successfully.**

```json
{
  "success": true,
  "code": 200,
  "message": "Token revoked successfully.",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "phoneNumber": "string",
      "user_role": "string"
    }
  }
}
```

- **400 Bad Request: Invalid username.**

```json
{
  "success": false,
  "code": 400,
  "message": "Invalid username or missing data."
}
```

- **500 Internal Server Error: An error occurred while revoking the token.**

```json
{
  "success": false,
  "code": 401,
  "message": "An error occurred while revoking the tokens. See server logs for details."
}
```
</details>
