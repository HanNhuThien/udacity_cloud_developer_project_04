import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import jwksClient from 'jwks-rsa'

const domain = process.env.REACT_APP_AUTH0_DOMAIN

const jwksUri = `https://${domain}/.well-known/jwks.json`

const logger = createLogger('auth0Authorizer')

export async function handler(event) {
  try {
    const token = await getToken(event.authorizationToken)
    const header = await getHeader(token)
    const publicKey = await getPublicKey(header.kid)
    const jwtToken = await verifyToken(token, publicKey)
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
    logger.error('User not authorized: ', {error: e})
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
const client = jwksClient({
  jwksUri: jwksUri
})

async function getPublicKey(kid) {
  try {
    const key = await client.getSigningKey(kid)
    return key.getPublicKey()
  } catch (err) {
    throw new Error(`getPublicKey error: ${err}`)
  }
}
async function getHeader(token) {
  const header = JSON.parse(
    Buffer.from(token.split('.')[0], 'base64').toString()
  )
  return header
}

async function verifyToken(token, publicKey) {
  return jsonwebtoken.verify(token, publicKey, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]
  return token
}
