# /api/conferences

## GET /api/conferences

Get the list of conferences.

**Request Headers:**

- Accept: application/json

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

An array of conferences.

**Status Codes:**

- 200 OK

**Request:**

    GET /api/conferences
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 200 OK
    [

      {
        "__v": 5,
        "_id": "5391ba41367488554ffd20b5",
        "creator": "5375de9fd684db7f6fbd5010",
        "schemaVersion": 1,
        "attendees": [
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "offline"
            },
            {
                "user": "5375de4bd684db7f6fbd4f97",
                "status": "online"
            },
            {
                "user": "537cbe3a22ac6e00007fab31",
                "status": "invited",
                "_id": "5391ba45367488554ffd20b9"
            },
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "invited",
                "_id": "5391ba46367488554ffd20ba"
            }
        ],
        "history": [
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "creation",
                "_id": "5391ba41367488554ffd20b6",
                "date": "2014-06-06T12:55:29.045Z"
            },
            {
                "user": "5375de4bd684db7f6fbd4f97",
                "status": "join",
                "_id": "5391ba54367488554ffd20bb",
                "date": "2014-06-06T12:55:48.126Z"
            },
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "leave",
                "_id": "5391ba5c367488554ffd20bc",
                "date": "2014-06-06T12:55:56.101Z"
            }
        ],
        "timestamps": {
            "creation": "2014-06-06T12:55:29.044Z"
        }
      },
      {
        "__v": 5,
        "_id": "5391b9ff367488554ffd20a9",
        "creator": "5375de9fd684db7f6fbd5010",
        "schemaVersion": 1,
        "attendees": [
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "online"
            },
            {
                "user": "5375de4bd684db7f6fbd4f97",
                "status": "invited",
                "_id": "5391ba38367488554ffd20af"
            }
        ],
        "history": [
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "creation",
                "_id": "5391b9ff367488554ffd20aa",
                "date": "2014-06-06T12:54:23.026Z"
            },
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "leave",
                "_id": "5391ba3a367488554ffd20b0",
                "date": "2014-06-06T12:55:22.704Z"
            },
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "join",
                "_id": "5391ba5d367488554ffd20bd",
                "date": "2014-06-06T12:55:57.703Z"
            },
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "leave",
                "_id": "5391ba61367488554ffd20be",
                "date": "2014-06-06T12:56:01.570Z"
            },
            {
                "user": "5375de9fd684db7f6fbd5010",
                "status": "join",
                "_id": "5391ba66367488554ffd20c3",
                "date": "2014-06-06T12:56:06.486Z"
            }
        ],
        "timestamps": {
            "creation": "2014-06-06T12:54:23.025Z"
        }
      }
    ]

## GET /api/conferences/{id}

Get a conference from its id.

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: The conference id

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

A conference.

**Status Codes:**

- 200 OK
- 404 Not Found

**Request:**

    GET /api/conferences/5391b9ff367488554ffd20a9
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 200 OK
    {
      "__v": 5,
      "_id": "5391b9ff367488554ffd20a9",
      "creator": "5375de9fd684db7f6fbd5010",
      "schemaVersion": 1,
      "attendees": [
          {
              "user": "5375de9fd684db7f6fbd5010",
              "status": "online"
          },
          {
              "user": "5375de4bd684db7f6fbd4f97",
              "status": "invited",
              "_id": "5391ba38367488554ffd20af"
          }
      ],
      "history": [
          {
              "user": "5375de9fd684db7f6fbd5010",
              "status": "creation",
              "_id": "5391b9ff367488554ffd20aa",
              "date": "2014-06-06T12:54:23.026Z"
          },
          {
              "user": "5375de9fd684db7f6fbd5010",
              "status": "leave",
              "_id": "5391ba3a367488554ffd20b0",
              "date": "2014-06-06T12:55:22.704Z"
          },
          {
              "user": "5375de9fd684db7f6fbd5010",
              "status": "join",
              "_id": "5391ba5d367488554ffd20bd",
              "date": "2014-06-06T12:55:57.703Z"
          },
          {
              "user": "5375de9fd684db7f6fbd5010",
              "status": "leave",
              "_id": "5391ba61367488554ffd20be",
              "date": "2014-06-06T12:56:01.570Z"
          },
          {
              "user": "5375de9fd684db7f6fbd5010",
              "status": "join",
              "_id": "5391ba66367488554ffd20c3",
              "date": "2014-06-06T12:56:06.486Z"
          }
      ],
      "timestamps": {
          "creation": "2014-06-06T12:54:23.025Z"
      }
    }

## POST /api/conferences

Creates a new conference where the creator is the logged in user.

**Request Headers:**

- Accept: application/json

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

The created conference.

**Status Codes:**

- 201 Created

**Request:**

    POST /api/conferences
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 201 Created
    {
      "_id": "538e3bd6654d7c3307f990fa",
      "creator": "5375de9fd684db7f6fbd5010"
      "attendees": [],
      "history": [],
      "timestamps": {
          "creation": "2014-06-03T21:19:18.766Z"
      }
    }

## GET /api/conferences/{id}/attendees

Get full information about the conference attendees.

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: The conference ID

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

Array or attendees with user information.

**Status Codes:**

- 200 OK
- 400 Bad request
- 404 Not found
- 500 Internal server error

**Request:**

    GET /api/conferences/538e3bd6654d7c3307f990fa/attendees
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 200 OK

    [
      {

        "__v": 5,
        "_id": "5375de4bd684db7f6fbd4f97",
        "currentAvatar": "e5396080-dcde-11e3-b0dd-978201406e85",
        "firstname": "christophe",
        "lastname": "hamerling",
        "avatars": [
            "e5396080-dcde-11e3-b0dd-978201406e85"
        ],
        "schemaVersion": 1,
        "login": {
            "success": "2014-06-05T20:28:31.843Z",
            "failures": [ ]
        },
        "domains": [
            {
                "domain_id": "5375de4bd684db7f6fbd4f98",
                "joined_at": "2014-05-16T09:45:47.307Z"
            }
        ],
        "timestamps": {
            "creation": "2014-05-16T09:45:47.231Z"
        },
        "emails": [
            "chamerling@linagora.com"
        ]

      },
      {
        "__v": 5,
        "_id": "5375de4bd684db7f6fbd4f97",
        "currentAvatar": "e5396080-dcde-11e3-b0dd-978201406e85",
        "firstname": "christophe",
        "lastname": "hamerling",
        "avatars": [
            "e5396080-dcde-11e3-b0dd-978201406e85"
        ],
        "schemaVersion": 1,
        "login": {
            "success": "2014-06-05T20:28:31.843Z",
            "failures": [ ]
        },
        "domains": [
            {
                "domain_id": "5375de4bd684db7f6fbd4f98",
                "joined_at": "2014-05-16T09:45:47.307Z"
            }
        ],
        "timestamps": {
            "creation": "2014-05-16T09:45:47.231Z"
        },
        "emails": [
            "chamerling@linagora.com"
        ]
      }
    ]

## PUT /api/conferences/{id}/attendees

Update the current user status as attendee in the conference.

**Request Headers:**

- Accept: application/json

**Request Parameters:**

- action: join|leave

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

No response.

**Status Codes:**

- 204 No content
- 400 Bad request
- 404 Not found
- 500 Internal server error

**Request:**

    PUT /api/conferences/538e3bd6654d7c3307f990fa/attendees?action=join
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 204 No Content

## PUT /conferences/{id}/attendees/{user_id}

Add an attendee to the conference. The caller must be creator/administrator or attendee of the conference to perform this action.

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: Conference id
- user_id: User to add as attendee of the conference

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

No response.

**Status Codes:**

- 204 No content
- 400 Bad request
- 404 Not found (conference or user)
- 500 Internal server error

**Request:**

    PUT /api/conferences/538e3bd6654d7c3307f990fa/attendees/538df8e110eca70000040b1d
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 204 No Content

## DELETE /conferences/{id}/attendees/{user_id}

Delete an attendee from the conference. The caller must write access to the conference to perform this action (creator or moderator).

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: Conference id
- user_id: User to remove as attendee from the conference

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

No response.

**Status Codes:**

- 204 No content
- 400 Bad request
- 404 Not found (conference or user)
- 500 Internal server error

**Request:**

    DELETE /api/conferences/538e3bd6654d7c3307f990fa/attendees/538df8e110eca70000040b1d
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 204 No Content

