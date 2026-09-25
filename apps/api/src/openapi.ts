const errorResponse = {
  description: 'Request failed.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
    },
  },
};

const secured = [{ cookieAuth: [] }];
const mutatingSecurity = [{ cookieAuth: [], csrfToken: [] }];
const idParameter = (name: string, description: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string' },
});
const paginatedParameters = [
  {
    name: 'page',
    in: 'query',
    schema: { type: 'integer', minimum: 1, default: 1 },
  },
  {
    name: 'pageSize',
    in: 'query',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
];

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Client Project Portal API',
    version: '1.0.0',
    description:
      'Tenant-scoped collaboration API. Protected mutations require both the httpOnly access cookie and the CSRF token returned by GET /auth/csrf.',
  },
  servers: [{ url: '/api/v1', description: 'Current host' }],
  tags: [
    { name: 'Health' },
    { name: 'Authentication' },
    { name: 'Invitations' },
    { name: 'Dashboard' },
    { name: 'Clients' },
    { name: 'Projects' },
    { name: 'Requirements' },
    { name: 'Tasks' },
    { name: 'Comments' },
    { name: 'Notifications' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API and database health',
        responses: {
          200: { description: 'Service is healthy.' },
          503: errorResponse,
        },
      },
    },
    '/auth/csrf': {
      get: {
        tags: ['Authentication'],
        summary: 'Issue a CSRF token and matching cookie',
        responses: {
          200: {
            description: 'CSRF token issued.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: { csrfToken: { type: 'string' } },
                      required: ['csrfToken'],
                    },
                  },
                  required: ['data'],
                },
              },
            },
          },
        },
      },
    },
    '/auth/register-org': {
      post: {
        tags: ['Authentication'],
        summary: 'Register an organization and its first administrator',
        security: [{ csrfToken: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterOrganization' },
            },
          },
        },
        responses: {
          201: { description: 'Organization registered.' },
          400: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign in with email and password',
        security: [{ csrfToken: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Login' },
            },
          },
        },
        responses: {
          200: { description: 'Signed in.' },
          401: errorResponse,
          429: errorResponse,
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Clear the current session',
        security: mutatingSecurity,
        responses: { 204: { description: 'Signed out.' }, 403: errorResponse },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get the authenticated user',
        security: secured,
        responses: {
          200: { description: 'Current user.' },
          401: errorResponse,
        },
      },
    },
    '/invites': {
      post: {
        tags: ['Invitations'],
        summary: 'Invite a user to the authenticated organization',
        security: mutatingSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateInvite' },
            },
          },
        },
        responses: {
          201: { description: 'Invitation created.' },
          403: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/invites/{token}/accept': {
      post: {
        tags: ['Invitations'],
        summary: 'Accept an invitation and create a user account',
        security: [{ csrfToken: [] }],
        parameters: [idParameter('token', 'Invitation token')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AcceptInvite' },
            },
          },
        },
        responses: {
          201: { description: 'Invitation accepted.' },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get the role-aware operational dashboard',
        security: secured,
        responses: {
          200: { description: 'Dashboard metrics and work queues.' },
          401: errorResponse,
        },
      },
    },
    '/clients': {
      get: {
        tags: ['Clients'],
        summary: 'List visible clients',
        security: secured,
        parameters: paginatedParameters,
        responses: {
          200: { description: 'Paginated clients.' },
          403: errorResponse,
        },
      },
      post: {
        tags: ['Clients'],
        summary: 'Create a client',
        security: mutatingSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateClient' },
            },
          },
        },
        responses: {
          201: { description: 'Client created.' },
          400: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List tenant- and role-visible projects',
        security: secured,
        parameters: [
          ...paginatedParameters,
          { name: 'clientId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated projects.' },
          403: errorResponse,
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create a project for a client in the current organization',
        security: mutatingSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProject' },
            },
          },
        },
        responses: {
          201: { description: 'Project created.' },
          400: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get a visible project',
        security: secured,
        parameters: [idParameter('id', 'Project ID')],
        responses: { 200: { description: 'Project.' }, 404: errorResponse },
      },
    },
    '/projects/{id}/requirements': {
      get: {
        tags: ['Requirements'],
        summary: 'List visible requirements for a project',
        security: secured,
        parameters: [
          idParameter('id', 'Project ID'),
          ...paginatedParameters,
          {
            name: 'status',
            in: 'query',
            schema: { $ref: '#/components/schemas/RequirementStatus' },
          },
        ],
        responses: {
          200: { description: 'Paginated requirements.' },
          404: errorResponse,
        },
      },
      post: {
        tags: ['Requirements'],
        summary: 'Submit a requirement as the project client',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Project ID')],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CreateRequirement' },
            },
          },
        },
        responses: {
          201: { description: 'Requirement submitted.' },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/requirements/{id}': {
      get: {
        tags: ['Requirements'],
        summary: 'Get a visible requirement',
        security: secured,
        parameters: [idParameter('id', 'Requirement ID')],
        responses: { 200: { description: 'Requirement.' }, 404: errorResponse },
      },
      patch: {
        tags: ['Requirements'],
        summary: 'Update a client-owned requirement while changes are allowed',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Requirement ID')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateRequirement' },
            },
          },
        },
        responses: {
          200: { description: 'Requirement updated.' },
          409: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/requirements/{id}/transition': {
      post: {
        tags: ['Requirements'],
        summary: 'Apply a validated PM requirement transition',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Requirement ID')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RequirementTransition' },
            },
          },
        },
        responses: {
          200: { description: 'Requirement transitioned.' },
          409: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/requirements/{id}/activity': {
      get: {
        tags: ['Requirements'],
        summary: 'List requirement activity',
        security: secured,
        parameters: [
          idParameter('id', 'Requirement ID'),
          ...paginatedParameters,
        ],
        responses: {
          200: { description: 'Paginated activity.' },
          404: errorResponse,
        },
      },
    },
    '/requirements/{id}/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List visible tasks for a requirement',
        security: secured,
        parameters: [
          idParameter('id', 'Requirement ID'),
          ...paginatedParameters,
        ],
        responses: {
          200: { description: 'Paginated tasks.' },
          404: errorResponse,
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task from an approved requirement',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Requirement ID')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTask' },
            },
          },
        },
        responses: {
          201: { description: 'Task created.' },
          409: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List PM-visible or engineer-assigned board tasks',
        security: secured,
        parameters: [
          ...paginatedParameters,
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'assigneeId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated board tasks.' },
          403: errorResponse,
        },
      },
    },
    '/tasks/assignees': {
      get: {
        tags: ['Tasks'],
        summary: 'List engineers eligible for assignment',
        security: secured,
        responses: {
          200: { description: 'Engineer list.' },
          403: errorResponse,
        },
      },
    },
    '/tasks/{id}': {
      patch: {
        tags: ['Tasks'],
        summary: 'Update task details as a PM',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Task ID')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTask' },
            },
          },
        },
        responses: {
          200: { description: 'Task updated.' },
          404: errorResponse,
        },
      },
    },
    '/tasks/{id}/move': {
      post: {
        tags: ['Tasks'],
        summary: 'Advance a task through the controlled delivery workflow',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Task ID')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MoveTask' },
            },
          },
        },
        responses: {
          200: { description: 'Task moved.' },
          409: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/requirements/{id}/comments': {
      get: {
        tags: ['Comments'],
        summary: 'List visible requirement comments',
        security: secured,
        parameters: [
          idParameter('id', 'Requirement ID'),
          ...paginatedParameters,
        ],
        responses: {
          200: { description: 'Paginated comments.' },
          404: errorResponse,
        },
      },
      post: {
        tags: ['Comments'],
        summary: 'Add a requirement comment',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Requirement ID')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateComment' },
            },
          },
        },
        responses: {
          201: { description: 'Comment created.' },
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/tasks/{id}/comments': {
      get: {
        tags: ['Comments'],
        summary: 'List visible task comments',
        security: secured,
        parameters: [idParameter('id', 'Task ID'), ...paginatedParameters],
        responses: {
          200: { description: 'Paginated comments.' },
          404: errorResponse,
        },
      },
      post: {
        tags: ['Comments'],
        summary: 'Add a task comment',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Task ID')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateComment' },
            },
          },
        },
        responses: {
          201: { description: 'Comment created.' },
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications for the authenticated user',
        security: secured,
        parameters: [
          ...paginatedParameters,
          {
            name: 'unreadOnly',
            in: 'query',
            schema: { type: 'boolean', default: false },
          },
        ],
        responses: {
          200: { description: 'Paginated notifications.' },
          401: errorResponse,
        },
      },
    },
    '/notifications/{id}/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Mark the current user’s notification as read',
        security: mutatingSecurity,
        parameters: [idParameter('id', 'Notification ID')],
        responses: {
          200: { description: 'Notification updated.' },
          404: errorResponse,
        },
      },
    },
    '/events': {
      get: {
        tags: ['Notifications'],
        summary: 'Open a tenant-filtered server-sent event stream',
        security: secured,
        responses: {
          200: {
            description: 'SSE stream of notification events.',
            content: { 'text/event-stream': { schema: { type: 'string' } } },
          },
          401: errorResponse,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'portal_access' },
      csrfToken: { type: 'apiKey', in: 'header', name: 'x-csrf-token' },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['code', 'message'],
          },
        },
        required: ['error'],
      },
      Login: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 1 },
        },
        required: ['email', 'password'],
      },
      RegisterOrganization: {
        type: 'object',
        properties: {
          organizationName: { type: 'string', minLength: 2, maxLength: 100 },
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 12 },
        },
        required: ['organizationName', 'name', 'email', 'password'],
      },
      CreateClient: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          contactEmail: { type: 'string', format: 'email' },
        },
        required: ['name', 'contactEmail'],
      },
      CreateInvite: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['PM', 'ENGINEER', 'CLIENT'] },
          clientId: { type: 'string' },
        },
        required: ['email', 'role'],
      },
      AcceptInvite: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          password: { type: 'string', format: 'password', minLength: 12 },
        },
        required: ['name', 'password'],
      },
      CreateProject: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          name: { type: 'string', minLength: 2, maxLength: 120 },
          description: { type: 'string', minLength: 10, maxLength: 2000 },
        },
        required: ['clientId', 'name', 'description'],
      },
      RequirementStatus: {
        type: 'string',
        enum: [
          'SUBMITTED',
          'IN_REVIEW',
          'NEEDS_INFO',
          'APPROVED',
          'IN_PROGRESS',
          'DELIVERED',
          'REJECTED',
        ],
      },
      CreateRequirement: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 160 },
          description: { type: 'string', minLength: 20, maxLength: 10000 },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          attachment: { type: 'string', format: 'binary' },
        },
        required: ['title', 'description', 'priority'],
      },
      UpdateRequirement: {
        type: 'object',
        minProperties: 1,
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 160 },
          description: { type: 'string', minLength: 20, maxLength: 10000 },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
        },
      },
      RequirementTransition: {
        type: 'object',
        properties: {
          to: { $ref: '#/components/schemas/RequirementStatus' },
          reason: { type: 'string', minLength: 5, maxLength: 2000 },
        },
        required: ['to'],
      },
      CreateTask: {
        type: 'object',
        properties: {
          idempotencyKey: { type: 'string', format: 'uuid' },
          title: { type: 'string', minLength: 3, maxLength: 160 },
          description: { type: 'string', minLength: 10, maxLength: 5000 },
          assigneeId: { type: ['string', 'null'] },
          estimateHours: { type: ['number', 'null'], exclusiveMinimum: 0 },
          dueDate: { type: ['string', 'null'], format: 'date' },
        },
        required: ['idempotencyKey', 'title', 'description'],
      },
      UpdateTask: {
        type: 'object',
        minProperties: 1,
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 160 },
          description: { type: 'string', minLength: 10, maxLength: 5000 },
          assigneeId: { type: ['string', 'null'] },
          estimateHours: {
            type: ['number', 'null'],
            exclusiveMinimum: 0,
          },
          dueDate: { type: ['string', 'null'], format: 'date' },
        },
      },
      MoveTask: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
          },
        },
        required: ['to'],
      },
      CreateComment: {
        type: 'object',
        properties: {
          body: { type: 'string', minLength: 1, maxLength: 5000 },
          visibility: {
            type: 'string',
            enum: ['INTERNAL', 'CLIENT_VISIBLE'],
          },
          parentId: { type: ['string', 'null'] },
        },
        required: ['body', 'visibility'],
      },
    },
  },
} as const;
