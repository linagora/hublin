# /api/conferences

## GET /conferences?token=:token

Open an existing conference from a user token.

**Query Parameters:**

- token: A unique token which links an unique user to an unique conference.

**Response Headers:**

- Location: The URL of the conference to redirect to.

**Status Codes:**

- 302 Moved Temporarily
- 404 Not found. No conference found for the given token
- 500 Internal Server Error

**Request:**

    GET /conferences?token=54eb5dff8e7036781b03abad
    Host: localhost:8080

**Response:**

    HTTP/1.1 302 Moved
    Location: /foobar


## GET /conferences/:id

Open the a conference page, creates the conference if needed.

**Response Headers:**

- Location: The URL of the conference to redirect to.

**Status Codes:**

- 302 Moved Temporarily
- 500 Internal Server Error

**Request:**

    GET /conferences/foobar
    Host: localhost:8080

**Response:**

    HTTP/1.1 302 Moved
    Location: /foobar

## PUT /api/conferences/:id

Creates a new conference. It will also invites members which are defined in the request.
It will not accept following ids for technical reasons : 'api', 'views' and 'favicon.ico'.

**Request Headers:**

- Accept: application/json

**Query Parameters:**

- displayName: The display name of the user creating the public conference

**Request JSON Object:**

- members: Array of members to invite to join the created conference.

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json
- X-Hublin-Token: the token which can be used by the user to connect to the conference

**Response JSON Object**

The created conference.

**Status Codes:**

- 200 OK: The conference already exists and has not been created
- 201 Created: The conference has been created
- 202 Accepted: The conference has been created but the server needs additional time to finalize it
- 400 Bad request

**Request:**

    PUT /api/conferences/foobar?displayName=Bruce
    Accept: application/json
    Host: localhost:8080

    {
      members: [
        {
          "objectType": "email",
          "id": "inviteme@hubl.in"
        }
      ]
    }

**Response:**

    HTTP/1.1 201 Created
    {
      "_id": "foobar",
      "members": [
        {
          "_id": "123456789",
          "objectType": "hublin:anonymous",
          "id": "5ddbb5c3-1adc-43e9-a1ba-3c10a8b6c905",
          "displayName": "Bruce"
        }
      ],
      "history": [],
      "timestamps": {
          "creation": "2014-06-03T21:19:18.766Z"
      }
    }

## PUT /conferences/:id

Creates a new conference and redirects to the conference page.

**Request Headers:**

- Location: The URL of the conference

**Status Codes:**

- 302 Moved Temporarily
- 500 Internal Server Error

**Request:**

    POST /conferences/foobar
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 302 Found
    Location: https://hubl.in/foobar


## GET /api/conferences/{id}/members

Get full information about the conference members.

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: The conference ID

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

Array of members.

**Status Codes:**

- 200 OK
- 400 Bad request
- 404 Not found
- 500 Internal server error

**Request:**

    GET /api/conferences/538e3bd6654d7c3307f990fa/members
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 200 OK

    [
      {
        _id: "54eb5dff8e7036781b03abad"
        objectType: "email",
        id: "user1@linagora.com",
        displayName: "user1",
        status: "invited"
      },
      {
        _id: "538e3bd6654d7c3307f990fa"
        objectType: "email",
        id: "user2@linagora.com",
        displayName: "user2",
        status: "invited"
      }
    ]

## PUT /api/conferences/{id}/members

Add members to the conference. The caller must be a member of the conference to perform this action.

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: Conference id

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

No response.

**Status Codes:**

- 202 Accepted
- 400 Bad request
- 404 Not found (conference)
- 500 Internal server error

**Request:**

    PUT /api/conferences/538e3bd6654d7c3307f990fa/members
    Accept: application/json
    Host: localhost:8080
    [
      {
        objectType: 'email',
        id: 'user1@linagora.com'
      },
      {
        objectType: 'email',
        id: 'user1@lng.fr'
      }
    ]

**Response:**

    HTTP/1.1 202 Accepted

## PUT /api/conferences/{id}/members/:mid/:field

Update a conference member field.

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: Conference id
- mid: The member id in the given conference
- field: The field to update

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Status Codes:**

- 200 OK
- 400 Bad request
- 404 Not found (conference)
- 500 Internal server error

**Request:**

    PUT /api/conferences/awesome/members/538e3bd6654d7c3307f990fa/displayName
    Accept: application/json
    Host: localhost:8080
    {
      value: 'Bruce Willis',
    }

**Response:**

    HTTP/1.1 200 OK

## POST /api/conferences/:id/reports

Creates a new report associated with the conference id.

**Request Headers:**

- Accept: application/json

**Request JSON Object:**

- reported: the member to report
- members: Array of attendees IDs in the room
- description: text description of the report

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

No objects.

**Status Codes:**

- 201 Created: The report has been created
- 400 Bad request

**Request:**

    POST /api/conferences/myconf/reports
    Accept: application/json
    Host: localhost:8080

    {
      reported: "55068fbe3834fbd00beb0183",
      members: ["55068fbe3834fbd00beb0184","55068fbe3834fbd00beb0183","55068fbe3834fbd00beb0185"],
      description: "description brève"
    }

**Response:**

    HTTP/1.1 201 Created
    {"id":"5506df2b7ef1d0473511bc9e"}

