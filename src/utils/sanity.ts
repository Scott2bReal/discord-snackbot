import { logJSON } from "./helpers"

type SanityMutation =
  | 'create'
  | 'createOrReplace'
  | 'createIfNotExists'
  | 'delete'
  | 'patch'

export async function sanityAPI(
  docType: string,
  mutationData?: {
    mutationType: SanityMutation
    data?: Record<string, string>
  }
) {
  // We'll always need the project ID
  const id = process.env.SANITY_PROJECT_ID ?? ''
  const version = 'v2021-10-21'

  // If we are just querying for public docs, then no auth needed
  if (mutationData === undefined) {
    const url = generateSanityQueryURL(id, 'production', docType)

    return await fetch(url)
      .then((res) => res.json())
      .catch((e) => console.error(e))
  }

  // Mutations require auth, and a POST request
  // All will be to a url that looks like this
  const url = `https://${id}.api.sanity.io/${version}/data/mutate/production`
  const token = process.env.SANITY_API_TOKEN ?? ''
  const options: RequestInit = {}

  options.method = 'POST'
  options.headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  if (mutationData.mutationType === 'create') {
    options.body = JSON.stringify({
      mutations: [
        {
          create: {
            _type: docType,
            ...mutationData.data,
          },
        },
      ],
    })
  } else if (mutationData.mutationType === 'delete') {
    options.body = JSON.stringify({
      mutations: [
        {
          delete: {
            id: mutationData.data?.id
          }
        }
      ]
    })
  }

  return await fetch(url, options)
    .then((res) => res.json())
    .catch((e) => console.error(e))
}

export function generateSanityQueryURL(
  projectId: string,
  dataset: string,
  docType: string
) {
  const query = encodeURIComponent(`*[_type == "${docType}"]`)
  const version = 'v2021-10-21'

  return `https://${projectId}.api.sanity.io/${version}/data/query/${dataset}?query=${query}`
}
