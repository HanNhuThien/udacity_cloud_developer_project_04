import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')
z
// const jwksUrl = 'https://${domain}/.well-known/jwks.json'

const certificate =`-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJaIfYf4XtQIxEMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1yZWJjN2x6YmY4cWY3MWtlLnVzLmF1dGgwLmNvbTAeFw0yNDEyMTMw
ODAzMDFaFw0zODA4MjIwODAMDFaMCwxKjAoBgNVBAMTIWRldi1yZWJjN2x6YmY4
cWY3MWtlLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAJTg3z49M6ELE5p/NRyfz/mgZm3IECHIJ1hds+eQSCEg2BspGMLyAaEMTK5k
KVHfNJ0Oe4nHLOhvwrkzxiUpnYBjH66LyFk9gsUSpgF3Gn5ChKM4goA8wJ5kIomz
zVg1opj0PcRfFJCRh/A043j/mzTA/FzfHHyvrbc4rxEPfL4cVbkIdcrPTcuR2JgU
awhzpXevNqG3y/hNl5uNw6VW96ll9Q2g9vycU7UItkguFtSaCxsy40RpnT9dSh+W
GVuePlGYyweXJgKucOjCbcB/UqlTq2Mn4I5SyUN7B4x+9edZmhzSp/vQFbUow7Pa
DN7Qwml7asfpGCRkZX7U1mdSwC8CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUKE6DGwk7WpIi/tCq95TPwiZrrvUwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBZkL3sIsVxwYO7LB6N+WVyUHFK9CF/cP2iTJHISeTr
oB0FDchWuhnI1rq+vdm9ghTwloVPVvvMRHICDzz3oXNhdzJXZIDhywKZbUuYK/on
dOZfuGsKVEeQ6IGBnK4GECEvhK6Hi7H6bVXhi8Zbxd9YNotlt2Qcw+gGAQrspkRv
uTIIAkgJPOOQ8FXiuNUmLL9b8MX2QV5xKVOXt792NUWPhLIOSoac5djwzZ4089I3
KeyoDGCmpZMZNxPoWVNQ6zYacIE9tL+jdIqr50jylEfWDRbN/bEshvxXYo+WRO9z
eH4OY4dxUC5ytjHBqrvu5wDdYKagSDy/GyDQqFifxAyi
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)

  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
